/**
 * DualSpace — server.js
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
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dualspace";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.warn("⚠️  MongoDB skipped:", err.message));

const sessionSchema = new mongoose.Schema({
  socketId:  String,
  role:      String,
  notes:     [mongoose.Schema.Types.Mixed],
  createdAt: { type: Date, default: Date.now },
});
const Session = mongoose.model("Session", sessionSchema);

// ── REST ──────────────────────────────────────────────────────────────────────
app.get("/", (_, res) => res.json({ status: "DualSpace API running", port: PORT }));
app.get("/api/sessions", async (_, res) => {
  const sessions = await Session.find().sort({ createdAt: -1 }).limit(20);
  res.json(sessions);
});

// ── Socket.io ─────────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`🔌 Connected: ${socket.id}`);
  let clientRole = null;

  // Event 1 — role selection
  socket.on("select-role", (role) => {
    const valid = ["student", "employee"];
    if (!valid.includes(role)) {
      socket.emit("error", { message: `Invalid role: ${role}` });
      return;
    }
    clientRole = role;
    console.log(`👤 ${socket.id} → ${role}`);
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
      Session.findOneAndUpdate(
        { socketId: socket.id },
        { $push: { notes: { $each: blocks } }, role: clientRole },
        { upsert: true }
      ).catch(e => console.warn("DB write skipped:", e.message));
    }
  });

  socket.on("disconnect", () => console.log(`❌ Disconnected: ${socket.id}`));
});

// ── Start ─────────────────────────────────────────────────────────────────────
server.listen(PORT, () => console.log(`🚀 DualSpace server → http://localhost:${PORT}`));