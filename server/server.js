/**
 * NotedIQ — server.js
 * Express + Socket.io + MongoDB
 * PORT: 5000
 */

require("dotenv").config();
const express    = require("express");
const http       = require("http");
const { Server } = require("socket.io");
const mongoose   = require("mongoose");
const cors       = require("cors");

const { processStudent }   = require("./studentProcessor");
const { processCorporate } = require("./corporateProcessor");
const { getTranscript }    = require("./youtubeProcessor");

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const fs = require("fs");
const path = require("path");
const { extractTextFromFile } = require("./fileExtractor");

const PORT = process.env.PORT || 5000;

// ── App init ──────────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors({ origin: "*" }));
app.use(express.json());

// ── MongoDB ───────────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/notediq";

let mongoConnected = false;
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    mongoConnected = true;
  })
  .catch(err => {
    console.warn("⚠️  MongoDB skipped:", err.message);
    console.log("💾 Using in-memory fallback storage");
  });

const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const User     = require("./userModel");

const sessionSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  socketId:  String,
  role:      String,
  notes:     [mongoose.Schema.Types.Mixed],
  createdAt: { type: Date, default: Date.now },
});
const Session = mongoose.model("Session", sessionSchema);

// ── In-memory fallback storage ────────────────────────────────────────────────
const inMemoryUsers = new Map(); // email -> { name, email, password, resetPasswordOTP, resetPasswordExpires }
const inMemorySessions = new Map();

// ── REST ──────────────────────────────────────────────────────────────────────
app.get("/", (_, res) => res.json({ status: "NotedIQ API running", port: PORT }));

// Normalize email addresses to handle common typos like gmmail.com
function normalizeEmail(email) {
  if (!email) return "";
  let normalized = email.trim().toLowerCase();
  // Replace common typos in gmail.com
  normalized = normalized.replace(/@(gmmail|gamil|gmal|gmial|gmaill)\.co(m)?$/, "@gmail.com");
  return normalized;
}

// ── Helper functions for user operations ──────────────────────────────────────
async function findUserByEmail(email) {
  if (mongoConnected) {
    try {
      return await User.findOne({ email });
    } catch (err) {
      console.error("MongoDB query error:", err);
      return inMemoryUsers.get(email) || null;
    }
  }
  return inMemoryUsers.get(email) || null;
}

async function createUser(userData) {
  if (mongoConnected) {
    try {
      const user = new User(userData);
      await user.save();
      return user;
    } catch (err) {
      console.error("MongoDB save error:", err);
      inMemoryUsers.set(userData.email, userData);
      return userData;
    }
  }
  inMemoryUsers.set(userData.email, userData);
  return userData;
}

async function updateUser(email, updates) {
  if (mongoConnected) {
    try {
      return await User.findOneAndUpdate({ email }, updates, { new: true });
    } catch (err) {
      console.error("MongoDB update error:", err);
      const user = inMemoryUsers.get(email);
      if (user) {
        Object.assign(user, updates);
        inMemoryUsers.set(email, user);
        return user;
      }
      return null;
    }
  }
  const user = inMemoryUsers.get(email);
  if (user) {
    Object.assign(user, updates);
    inMemoryUsers.set(email, user);
    return user;
  }
  return null;
}

// User Registration
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email: rawEmail, password } = req.body;
    if (!name || !rawEmail || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const email = normalizeEmail(rawEmail);
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
      resetPasswordOTP: null,
      resetPasswordExpires: null,
    };

    const user = await createUser(userData);

    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id ? user._id.toString() : user.email,
        name: name,
        email: email,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// User Sign In
app.post("/api/auth/signin", async (req, res) => {
  try {
    const { email: rawEmail, password } = req.body;
    if (!rawEmail || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const email = normalizeEmail(rawEmail);

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id ? user._id.toString() : user.email,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// OAuth Login/Signup (Google, GitHub, etc.)
app.post("/api/auth/oauth", async (req, res) => {
  try {
    const { email: rawEmail, name, provider } = req.body;
    if (!rawEmail || !name || !provider) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const email = normalizeEmail(rawEmail);

    let user = await findUserByEmail(email);
    
    if (!user) {
      // Create new user for OAuth
      const salt = await bcrypt.genSalt(10);
      const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      const userData = {
        name,
        email,
        password: hashedPassword,
        provider: provider,
        resetPasswordOTP: null,
        resetPasswordExpires: null,
      };

      user = await createUser(userData);
      console.log(`👤 New ${provider} user created: ${email}`);
    } else {
      console.log(`✅ ${provider} user signed in: ${email}`);
    }

    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id ? user._id.toString() : user.email,
        name: user.name,
        email: user.email,
        provider: provider,
      },
    });
  } catch (err) {
    console.error("OAuth error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

const nodemailer = require("nodemailer");

// Forgot Password - Generate & Send OTP
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email: rawEmail } = req.body;
    if (!rawEmail) {
      return res.status(400).json({ message: "Email is required" });
    }
    const email = normalizeEmail(rawEmail);

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    // Generate a 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 10 minutes from now
    const resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await updateUser(email, {
      resetPasswordOTP: otp,
      resetPasswordExpires: resetPasswordExpires,
    });

    console.log(`🔑 OTP generated for ${email}: ${otp}`);

    // Try sending email (using port 587 with STARTTLS to bypass local ISP firewall blocks on port 465)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER || "v.bhanusri235@gmail.com",
        pass: process.env.SMTP_PASS || "",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"NotedIQ Support" <${process.env.SMTP_USER || "v.bhanusri235@gmail.com"}>`,
      to: email,
      subject: "NotedIQ Password Reset Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #10b981; font-family: 'Playfair Display', serif;">NotedIQ Password Reset</h2>
          <p>Hello,</p>
          <p>We received a request to reset the password for your NotedIQ account. Use the verification code below to proceed:</p>
          <div style="background-color: #f3f4f6; border: 1px solid #e5e7eb; padding: 12px 24px; border-radius: 6px; display: inline-block; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #111827; margin: 16px 0;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 13px;">This code is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 11px;">NotedIQ Smart Study & Meeting Intelligence Layer</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✉️ Email sent successfully to ${email}`);
      res.json({ message: "Verification code sent to your email" });
    } catch (mailErr) {
      console.warn("⚠️ SMTP failed, falling back to console output:", mailErr.message);
      res.json({ 
        message: "Verification code generated (check your server console log for the code)",
        fallback: true 
      });
    }
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Reset Password - Verify OTP & Update Password
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email: rawEmail, otp, newPassword } = req.body;
    if (!rawEmail || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const email = normalizeEmail(rawEmail);
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    // Check if OTP matches and hasn't expired
    if (user.resetPasswordOTP !== otp || !user.resetPasswordExpires || Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password and clear OTP fields
    await updateUser(email, {
      password: hashedPassword,
      resetPasswordOTP: null,
      resetPasswordExpires: null,
    });

    console.log(`✅ Password successfully updated for ${email}`);
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ── SESSIONS ENDPOINTS ────────────────────────────────────────────────────────

// Save a session (notes + metadata)
app.post("/api/sessions", async (req, res) => {
  try {
    const { userId, role, notes, source } = req.body;
    if (!userId || !role || !notes) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const sessionData = {
      userId: userId,
      role: role,
      notes: notes,
      source: source || "unknown",
      createdAt: new Date(),
    };

    if (mongoConnected) {
      try {
        const session = new Session(sessionData);
        await session.save();
        return res.status(201).json({ _id: session._id, ...sessionData });
      } catch (err) {
        console.error("MongoDB save error:", err);
        // Fall through to in-memory
      }
    }

    // In-memory fallback
    const sessionId = "session-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
    const sessionObj = { _id: sessionId, ...sessionData };
    inMemorySessions.set(sessionId, sessionObj);
    res.status(201).json(sessionObj);
  } catch (err) {
    console.error("Create session error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all sessions (up to 20 for debugging)
app.get("/api/sessions", async (_, res) => {
  if (mongoConnected) {
    try {
      const sessions = await Session.find().sort({ createdAt: -1 }).limit(20);
      return res.json(sessions);
    } catch (err) {
      console.error("MongoDB query error:", err);
      // Fall through to in-memory
    }
  }
  // In-memory fallback
  const sessions = Array.from(inMemorySessions.values())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20);
  res.json(sessions);
});

// Get all sessions for a user
app.get("/api/sessions/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    if (mongoConnected) {
      try {
        let queryId = userId;
        // If the userId parameter is not a valid ObjectId, check if it's an email
        if (!mongoose.isValidObjectId(userId)) {
          const emailUser = await User.findOne({ email: userId });
          if (emailUser) {
            queryId = emailUser._id;
          } else {
            // Not a valid ObjectId and not a registered email, return empty list
            return res.json([]);
          }
        }
        const sessions = await Session.find({ userId: queryId }).sort({ createdAt: -1 });
        return res.json(sessions || []);
      } catch (err) {
        console.error("MongoDB query error:", err);
        // Fall through to in-memory
      }
    }

    // In-memory fallback
    const sessions = Array.from(inMemorySessions.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sessions);
  } catch (err) {
    console.error("Get sessions error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get a single session
app.get("/api/sessions/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ message: "Session ID required" });
    }

    if (mongoConnected) {
      try {
        const session = await Session.findById(sessionId);
        if (!session) {
          return res.status(404).json({ message: "Session not found" });
        }
        return res.json(session);
      } catch (err) {
        console.error("MongoDB query error:", err);
        // Fall through to in-memory
      }
    }

    // In-memory fallback
    const session = inMemorySessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.json(session);
  } catch (err) {
    console.error("Get session error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a session
app.delete("/api/sessions/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ message: "Session ID required" });
    }

    if (mongoConnected) {
      try {
        await Session.findByIdAndDelete(sessionId);
        return res.json({ success: true });
      } catch (err) {
        console.error("MongoDB delete error:", err);
        // Fall through to in-memory
      }
    }

    // In-memory fallback
    inMemorySessions.delete(sessionId);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete session error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// File Upload and text extraction for Scribble
app.post("/api/upload/scribble", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const text = await extractTextFromFile(req.file.buffer, req.file.mimetype, req.file.originalname);
    res.json({ text });
  } catch (err) {
    console.error("Scribble extraction error:", err);
    res.status(500).json({ message: err.message || "Failed to extract text from file" });
  }
});

// Audio Upload and transcription via Groq Whisper
app.post("/api/upload/audio", upload.single("file"), async (req, res) => {
  let tempFilePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const ext = req.file.originalname.split(".").pop().toLowerCase() || "wav";
    const tempDir = path.join(__dirname, "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    tempFilePath = path.join(tempDir, `temp_upload_${Date.now()}.${ext}`);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    console.log(`🎙️ Transcribing audio file with Groq Whisper: ${tempFilePath}`);
    const Groq = require("groq-sdk");
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-large-v3",
      language: "en",
    });

    const text = transcription.text || "";
    console.log(`✅ Transcription completed: ${text.length} characters`);

    res.json({ text });
  } catch (err) {
    console.error("Audio transcription error:", err);
    res.status(500).json({ message: err.message || "Failed to transcribe audio file" });
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (unlinkErr) {
        console.warn("Failed to delete temp file:", unlinkErr.message);
      }
    }
  }
});

// ── Socket.io ─────────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`🔌 Connected: ${socket.id}`);
  let clientRole   = null;
  let clientUserId = null;

  // Event 1 — role selection
  socket.on("select-role", (payload) => {
    const role   = typeof payload === "string" ? payload : payload?.role;
    const userId = typeof payload === "string" ? null : payload?.userId;

    const valid = ["student", "employee"];
    if (!valid.includes(role)) {
      socket.emit("error", { message: `Invalid role: ${role}` });
      return;
    }
    clientRole   = role;
    clientUserId = userId;
    console.log(`👤 ${socket.id} → ${role} (user: ${userId || "guest"})`);
    socket.emit("role-confirmed", { role });
  });

  // Event 2 — incoming audio/text stream
  socket.on("incoming-audio-stream", async (payload) => {
    if (!clientRole) {
      socket.emit("error", { message: "No role selected. Emit select-role first." });
      return;
    }

    let rawText = (typeof payload === "string" ? payload : payload?.text || "").trim();
    const isYouTube  = payload?.isYoutube === true;
    const youtubeUrl = payload?.youtubeUrl || "";

    if (!rawText && !youtubeUrl) return;

    // ── YouTube transcript extraction ──────────────────────────────────────
    if (isYouTube && youtubeUrl) {
      try {
        console.log(`🎬 Fetching transcript for: ${youtubeUrl}`);
        socket.emit("transcript-status", {
          status: "fetching",
          message: "Fetching YouTube transcript...",
        });

        const { transcript, truncated, wordCount } = await getTranscript(youtubeUrl);
        rawText = transcript;

        console.log(`✅ Transcript fetched: ${wordCount} words${truncated ? " (truncated to 3000)" : ""}`);
        socket.emit("transcript-status", {
          status: "processing",
          message: `Transcript fetched (${wordCount} words). Processing with AI...`,
        });
      } catch (err) {
        console.error("YouTube transcript error:", err.message);
        socket.emit("error", { message: err.message });
        return;
      }
    }

    await new Promise(r => setTimeout(r, 200));

    const result = clientRole === "student"
      ? await processStudent(rawText)
      : await processCorporate(rawText);

    const blocks = Array.isArray(result.blocks) ? result.blocks : [];

    socket.emit("processed-notes-stream", {
      role:      clientRole,
      original:  rawText,
      corrected: result.corrected,
      blocks,
      timestamp: new Date().toISOString(),
    });

    if (mongoose.connection.readyState === 1 && blocks.length > 0) {
      (async () => {
        try {
          let dbUserId = clientUserId;
          if (dbUserId && !mongoose.isValidObjectId(dbUserId)) {
            const userDoc = await User.findOne({ email: dbUserId });
            if (userDoc) {
              dbUserId = userDoc._id;
            } else {
              dbUserId = null;
            }
          }
          await Session.create({
            socketId: socket.id,
            role: clientRole,
            userId: dbUserId || null,
            notes: blocks,
          });
        } catch (e) {
          console.warn("DB write skipped:", e.message);
        }
      })();
    }
  });

  socket.on("disconnect", () => console.log(`❌ Disconnected: ${socket.id}`));
});

// ── Start ─────────────────────────────────────────────────────────────────────
server.listen(PORT, () => console.log(`🚀 NotedIQ server → http://localhost:${PORT}`));