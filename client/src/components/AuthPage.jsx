import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────
   BookTransition — UNCHANGED workflow, enhanced visuals only
───────────────────────────────────────────────────────────── */
function BookTransition({ isSignup, userName, onDone }) {
    const [phase, setPhase] = useState("idle");
    const [linesVisible, setLinesVisible] = useState([]);
    const [showBtn, setShowBtn] = useState(false);
    const doneRef = useRef(false);
    const canvasRef = useRef(null);

    const firstName = userName ? userName.split(" ")[0] : "";

    // Particle background for the transition screen
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let animId;
        let W = canvas.width = window.innerWidth;
        let H = canvas.height = window.innerHeight;
        const pts = Array.from({ length: 40 }, () => ({
            x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
            r: Math.random() * 1 + 0.3, a: Math.random() * 0.2 + 0.04,
        }));
        function draw() {
            ctx.clearRect(0, 0, W, H);
            pts.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
                if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${p.a})`; ctx.fill();
            });
            animId = requestAnimationFrame(draw);
        }
        draw();
        return () => cancelAnimationFrame(animId);
    }, []);

    useEffect(() => {
        const t1 = setTimeout(() => {
            setPhase("lunge");
            const t2 = setTimeout(() => {
                setPhase("open");
                [0, 350, 680, 1010, 1340].forEach((delay, i) => {
                    setTimeout(() => setLinesVisible(prev => [...prev, i]), delay + 100);
                });
                setTimeout(() => setShowBtn(true), 2000);
            }, 900);
            return () => clearTimeout(t2);
        }, 750);
        return () => clearTimeout(t1);
    }, []);

    function handleContinue() {
        if (doneRef.current) return;
        doneRef.current = true;
        onDone();
    }

    const welcomeText = isSignup
        ? `Welcome to NotedIQ${firstName ? `, ${firstName}` : ""}.`
        : `Welcome back${firstName ? `, ${firstName}` : ""}.`;

    const lines = isSignup
        ? ["Your workspace is ready.", "", "Every lecture, every meeting —", "transformed into structured intelligence.", "— your notes begin here."]
        : ["Good to see you again.", "", "Your notes are waiting.", "Pick up right where you left off.", "— let's get back to it."];

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
            <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.5 }} />
            {/* Grid */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                {[20, 40, 60, 80].map(p => <div key={p} style={{ position: "absolute", left: `${p}%`, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.02)" }} />)}
                {[33, 66].map(p => <div key={p} style={{ position: "absolute", top: `${p}%`, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.02)" }} />)}
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Caveat:wght@400;600;700&display=swap');
        .bt-book-wrap { perspective: 1200px; }
        .bt-book-3d { position: relative; width: 160px; height: 210px; transform-style: preserve-3d; }
        .bt-cover { position: absolute; inset: 0; background: #fff; border-radius: 3px 10px 10px 3px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; box-shadow: inset -3px 0 8px rgba(0,0,0,0.12), 0 0 40px rgba(255,255,255,0.08); }
        .bt-spine { position: absolute; left: -18px; top: 0; bottom: 0; width: 18px; background: #111; border-radius: 3px 0 0 3px; transform: rotateY(-90deg) translateZ(9px); transform-origin: right center; }
        .bt-back { position: absolute; inset: 0; background: #0a0a0a; border-radius: 3px 10px 10px 3px; border: 1px solid #222; transform: translateZ(-8px); }
        .bt-pages { position: absolute; top: 4px; bottom: 4px; right: -5px; width: 9px; background: repeating-linear-gradient(to bottom,#f0ede8 0px,#f0ede8 1px,#e8e4df 2px,#e8e4df 3px); border-radius: 0 2px 2px 0; }
        @keyframes bt-idle { 0%,100%{transform:rotateY(-25deg) rotateX(8deg) translateY(0)} 50%{transform:rotateY(-25deg) rotateX(8deg) translateY(-10px)} }
        .bt-idle .bt-book-3d { animation: bt-idle 2.8s ease-in-out infinite; }
        @keyframes bt-lunge { 0%{transform:rotateY(-25deg) rotateX(8deg) scale(1) translateZ(0px);opacity:1} 100%{transform:rotateY(0deg) rotateX(0deg) scale(3.2) translateZ(500px);opacity:0} }
        .bt-lunge .bt-book-3d { animation: bt-lunge 0.75s cubic-bezier(0.4,0,0.6,1) forwards; }
        .bt-open-page { width: 520px; background: #fffef8; border-radius: 4px; border: 0.5px solid rgba(0,0,0,0.1); box-shadow: 0 28px 90px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04); position: relative; overflow: hidden; }
        .bt-open-page::before { content:''; position:absolute; top:48px; left:0; right:0; bottom:0; background:repeating-linear-gradient(transparent,transparent 25px,rgba(147,197,253,0.28) 25px,rgba(147,197,253,0.28) 26px); pointer-events:none; }
        .bt-holes { position:absolute; left:0; top:0; bottom:0; width:42px; display:flex; flex-direction:column; justify-content:space-evenly; align-items:center; pointer-events:none; background:rgba(0,0,0,0.025); }
        .bt-hole { width:14px; height:14px; border-radius:50%; background:#181818; border:0.5px solid rgba(0,0,0,0.1); box-shadow:inset 0 1px 3px rgba(0,0,0,0.5); }
        .bt-red-margin { position:absolute; left:42px; top:0; bottom:0; width:1px; background:rgba(239,68,68,0.22); pointer-events:none; }
        .bt-open-header { display:flex; justify-content:space-between; align-items:center; padding:10px 14px 9px; border-bottom:0.5px solid rgba(0,0,0,0.08); position:relative; z-index:2; background:rgba(255,254,248,0.96); }
        .bt-open-body { padding:20px 24px 28px 56px; position:relative; z-index:2; }
        .bt-spine-shadow { position:absolute; left:0; top:0; bottom:0; width:3px; background:linear-gradient(to right,rgba(0,0,0,0.07),transparent); z-index:4; }
        @keyframes bt-write { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        .bt-stamp { display:block; font-family:'Playfair Display',serif; font-style:italic; font-weight:900; font-size:28px; color:#1a1a1a; margin-bottom:12px; line-height:1.2; }
        .bt-line { display:block; font-family:'Caveat',cursive; font-size:19px; color:#1f2937; line-height:1.55; opacity:0; }
        .bt-line.vis { animation:bt-write 0.4s ease forwards; }
        .bt-line.dim { font-size:16px; color:rgba(0,0,0,0.4); margin-top:6px; }
        .bt-continue { display:inline-block; margin-top:16px; padding:8px 20px; border-radius:6px; background:#10b981; color:#fff; font-family:'Inter',sans-serif; font-size:11px; font-weight:700; letter-spacing:0.07em; text-transform:uppercase; border:none; cursor:pointer; opacity:0; transform:translateY(4px); transition:opacity 0.4s ease,transform 0.4s ease,background 0.15s; }
        .bt-continue.vis { opacity:1; transform:translateY(0); }
        .bt-continue:hover { background:#059669; }
        @keyframes bt-fadein { from{opacity:0} to{opacity:1} }
        .bt-root-inner { animation:bt-fadein 0.5s ease; }
      `}</style>

            <div className="bt-root-inner" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", position: "relative", zIndex: 1 }}>
                {(phase === "idle" || phase === "lunge") && (
                    <div className={phase === "idle" ? "bt-idle" : "bt-lunge"}>
                        <div className="bt-book-wrap">
                            <div className="bt-book-3d">
                                <div className="bt-back" />
                                <div className="bt-pages" />
                                <div className="bt-spine" />
                                <div className="bt-cover">
                                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, color: "#000", textAlign: "center", lineHeight: 1.1 }}>
                                        Noted<em style={{ fontStyle: "italic" }}>IQ</em>
                                    </div>
                                    <div style={{ width: 24, height: 1, background: "#000", margin: "3px 0" }} />
                                    <div style={{ fontSize: 7, color: "#888", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>Intelligence Layer</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {phase === "open" && (
                    <div className="bt-open-page">
                        <div className="bt-holes">
                            {Array.from({ length: 7 }).map((_, i) => <div key={i} className="bt-hole" />)}
                        </div>
                        <div className="bt-red-margin" />
                        <div className="bt-spine-shadow" />
                        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(0,0,0,0.08)", zIndex: 4 }} />
                        <div className="bt-open-header">
                            <span style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 12, fontWeight: 700, color: "#10b981" }}>NotedIQ</span>
                            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: "rgba(0,0,0,0.3)", fontWeight: 600, letterSpacing: "0.05em" }}>pg. 1</span>
                        </div>
                        <div className="bt-open-body">
                            <span className="bt-stamp">{welcomeText}</span>
                            {lines.map((line, i) => (
                                <span key={i} className={`bt-line${i === 4 ? " dim" : ""}${linesVisible.includes(i) ? " vis" : ""}`} style={{ animationDelay: "0s" }}>
                                    {line || "\u00A0"}
                                </span>
                            ))}
                            <button className={`bt-continue${showBtn ? " vis" : ""}`} onClick={handleContinue}>
                                Continue to workspace →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


/* ─────────────────────────────────────────────────────────────
   AuthPage — UNCHANGED workflow, enhanced left panel visuals
───────────────────────────────────────────────────────────── */
export default function AuthPage({ mode = "login", onNavigate, onAuth, backendUrl }) {
    const [isLogin, setIsLogin] = useState(mode === "login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [animating, setAnimating] = useState(false);
    const [pendingUser, setPendingUser] = useState(null);
    const [wasSignup, setWasSignup] = useState(false);
    const canvasRef = useRef(null);
    const [bookRot, setBookRot] = useState({ x: 10, y: -30 });

    // Interactive mock states
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState("");
    const [recoveryStatus, setRecoveryStatus] = useState("idle"); // "idle" | "sending" | "sent" | "otp-verification" | "updating"
    const [otpCode, setOtpCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [oauthLoading, setOauthLoading] = useState(null); // null | "google" | "github"
    const [isFallbackMode, setIsFallbackMode] = useState(false); // true if email service failed

    function handleOAuth(provider) {
        setOauthLoading(provider);
        setError("");
        setTimeout(async () => {
            try {
                const email = "user-" + Date.now() + "@" + provider + ".com";
                const name = provider === "google" ? "Google User" : "GitHub User";
                
                const res = await fetch(`${backendUrl}/api/auth/oauth`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, name, provider }),
                });
                
                const data = await res.json();
                if (res.ok) {
                    setPendingUser(data.user);
                    setWasSignup(true);
                    setAnimating(true);
                } else {
                    setError(data.message || "OAuth failed");
                    setOauthLoading(null);
                }
            } catch (err) {
                console.error("OAuth error:", err);
                setError("Network error. Please check your connection.");
                setOauthLoading(null);
            }
        }, 1200);
    }

    async function handleRecoverySubmit(e) {
        e.preventDefault();
        setError("");
        if (!recoveryEmail) {
            setError("Please enter your email address.");
            return;
        }
        setRecoveryStatus("sending");
        try {
            const res = await fetch(`${backendUrl}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: recoveryEmail }),
            });
            const data = await res.json();
            if (res.ok) {
                if (data.fallback) {
                    setIsFallbackMode(true);
                    setError("⚠️ Email service is unavailable. Check the server console for your verification code (6 digits).");
                } else {
                    setIsFallbackMode(false);
                }
                setRecoveryStatus("otp-verification");
            } else {
                setError(data.message || "Failed to initiate recovery.");
                setRecoveryStatus("idle");
            }
        } catch (err) {
            console.error(err);
            setError("Network error. Please check your connection.");
            setRecoveryStatus("idle");
        }
    }

    async function handleResetPasswordSubmit(e) {
        e.preventDefault();
        setError("");
        if (!otpCode || !newPassword) {
            setError("Please enter both the verification code and your new password.");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        setRecoveryStatus("updating");
        try {
            const res = await fetch(`${backendUrl}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: recoveryEmail,
                    otp: otpCode,
                    newPassword: newPassword
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setRecoveryStatus("sent");
            } else {
                setError(data.message || "Failed to reset password.");
                setRecoveryStatus("otp-verification");
            }
        } catch (err) {
            console.error(err);
            setError("Network error. Please check your connection.");
            setRecoveryStatus("otp-verification");
        }
    }

    // Particle canvas on left panel
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let animId;
        const rect = canvas.getBoundingClientRect();
        let W = canvas.width = canvas.offsetWidth;
        let H = canvas.height = canvas.offsetHeight;
        const pts = Array.from({ length: 30 }, () => ({
            x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
            r: Math.random() * 0.9 + 0.2, a: Math.random() * 0.2 + 0.04,
        }));
        function draw() {
            ctx.clearRect(0, 0, W, H);
            pts.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
                if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${p.a})`; ctx.fill();
            });
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 90) {
                        ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
                        ctx.strokeStyle = `rgba(255,255,255,${0.03 * (1 - dist / 90)})`; ctx.lineWidth = 0.5; ctx.stroke();
                    }
                }
            }
            animId = requestAnimationFrame(draw);
        }
        draw();
        return () => cancelAnimationFrame(animId);
    }, []);

    // Book follows mouse on left panel
    useEffect(() => {
        const handler = (e) => {
            const cx = window.innerWidth * 0.35, cy = window.innerHeight / 2;
            const dx = (e.clientX - cx) / cx;
            const dy = (e.clientY - cy) / cy;
            setBookRot({ x: 10 - dy * 8, y: -30 + dx * 10 });
        };
        window.addEventListener("mousemove", handler);
        return () => window.removeEventListener("mousemove", handler);
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        if (!email || !password) { setError("Please fill in all fields."); return; }
        if (!isLogin && !name) { setError("Please enter your name."); return; }

        setLoading(true);
        try {
            const url = `${backendUrl}/api/auth/${isLogin ? "signin" : "signup"}`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: isLogin ? undefined : name, email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Authentication failed");
            setWasSignup(!isLogin);
            setPendingUser(data.user);
            setAnimating(true);
        } catch (err) {
            console.error("Auth error:", err);
            setError(err.message || "Failed to connect to backend server.");
        } finally {
            setLoading(false);
        }
    }

    function handleAnimationDone() {
        setAnimating(false);
        onAuth(pendingUser);
    }

    return (
        <>
            {animating && (
                <BookTransition isSignup={wasSignup} userName={pendingUser?.name || ""} onDone={handleAnimationDone} />
            )}

            {oauthLoading && (
                <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 20,
                        padding: 32,
                        borderRadius: 16,
                        background: "rgba(255,255,255,0.03)",
                        border: "0.5px solid rgba(255,255,255,0.08)",
                        backdropFilter: "blur(20px)",
                        boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
                    }}>
                        <div className="oauth-spinner" style={{
                            width: 50,
                            height: 50,
                            borderRadius: "50%",
                            border: "2px solid rgba(255,255,255,0.05)",
                            borderTopColor: oauthLoading === "google" ? "#4285F4" : "#fff",
                            animation: "oauth-spin 1s linear infinite"
                        }} />
                        <p style={{ fontSize: 16, fontWeight: 500, color: "#fff", letterSpacing: "0.02em" }}>
                            Connecting to {oauthLoading === "google" ? "Google" : "GitHub"}...
                        </p>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                            Securing your authentication handshake
                        </p>
                    </div>
                    <style>{`
                        @keyframes oauth-spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            )}

            <div style={{ minHeight: "100vh", background: "#000", display: "flex", fontFamily: "'Inter', sans-serif", color: "#fff", visibility: animating ? "hidden" : "visible" }}>
                <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Playfair+Display:wght@700;900&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          .auth-input { width: 100%; background: rgba(255,255,255,0.04); border: 0.5px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 14px 16px; font-size: 14px; color: #fff; font-family: inherit; outline: none; transition: border 0.2s,background 0.2s; }
          .auth-input::placeholder { color: rgba(255,255,255,0.25); }
          .auth-input:focus { border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.06); }
          .auth-btn { width: 100%; background: #fff; color: #000; border: none; border-radius: 8px; padding: 15px; font-size: 14px; font-weight: 700; letter-spacing: 0.04em; cursor: pointer; transition: all 0.2s; font-family: inherit; }
          .auth-btn:hover:not(:disabled) { background: #e5e5e5; box-shadow: 0 8px 24px rgba(255,255,255,0.1); }
          .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
          .switch-link { color: rgba(255,255,255,0.5); font-size: 13px; cursor: pointer; text-decoration: underline; transition: color 0.2s; background: none; border: none; font-family: inherit; }
          .switch-link:hover { color: #fff; }
          .left-panel { flex: 1; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; padding: 48px; border-right: 0.5px solid rgba(255,255,255,0.06); }
          .book-anim { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-55%); width: 200px; height: 260px; perspective: 900px; }
          .cover-front { position: absolute; inset: 0; background: #fff; border-radius: 3px 14px 14px 3px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; box-shadow: inset -3px 0 8px rgba(0,0,0,0.12), 0 0 30px rgba(255,255,255,0.06); }
          .cover-back  { position: absolute; inset: 0; background: #0a0a0a; border: 0.5px solid #222; border-radius: 3px 14px 14px 3px; transform: translateZ(-10px); }
          .cover-spine { position: absolute; left: -22px; top: 0; bottom: 0; width: 22px; background: #111; border-radius: 3px 0 0 3px; border: 0.5px solid #222; }
          .cover-pages { position: absolute; top: 5px; bottom: 5px; right: -7px; width: 12px; background: repeating-linear-gradient(to bottom,#f5f2ed 0px,#f5f2ed 1px,#ede9e3 2px,#ede9e3 3px); border-radius: 0 3px 3px 0; }
          .tab-btn { background: none; border: none; font-family: inherit; font-size: 13px; font-weight: 600; padding: 8px 0; cursor: pointer; transition: color 0.2s; letter-spacing: 0.02em; }
          .tab-active { color: #fff; border-bottom: 1.5px solid #fff; }
          .tab-inactive { color: rgba(255,255,255,0.3); border-bottom: 1.5px solid transparent; }
          .logo-back { display: flex; align-items: center; gap: 8px; cursor: pointer; }
          .logo-back:hover span { opacity: 1; }
          .logo-back span { opacity: 0.4; transition: opacity 0.2s; font-size: 12px; color: #fff; letter-spacing: 0.04em; }
          .err-box { background: rgba(239,68,68,0.1); border: 0.5px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 12px 14px; font-size: 13px; color: #f87171; }
          .social-btn { width: 100%; background: rgba(255,255,255,0.04); border: 0.5px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 13px; font-size: 13px; color: rgba(255,255,255,0.7); cursor: pointer; transition: all 0.2s; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .social-btn:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.2); }
          .or-line { display: flex; align-items: center; gap: 12px; }
          .or-line::before,.or-line::after { content:''; flex:1; height:0.5px; background:rgba(255,255,255,0.1); }
          .floating-tag { position: absolute; background: rgba(255,255,255,0.03); backdrop-filter: blur(12px); border: 0.5px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 14px; font-size: 12px; }
          @keyframes bookIdle { 0%,100%{transform:rotateY(var(--ry,-30deg)) rotateX(var(--rx,10deg)) translateY(0)} 50%{transform:rotateY(var(--ry,-30deg)) rotateX(var(--rx,10deg)) translateY(-14px)} }
          @keyframes floatTag { 0%,100%{transform:translateY(0) rotate(var(--rot,0deg))} 50%{transform:translateY(-7px) rotate(var(--rot,0deg))} }
          .float-tag { animation: floatTag 3.5s ease-in-out infinite; }
          .auth-glow { position: absolute; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%); pointer-events: none; }
        `}</style>

                {/* ── Left visual panel ── */}
                <div className="left-panel">
                    {/* Particle canvas */}
                    <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.6 }} />

                    {/* Grid lines */}
                    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                        {[25, 50, 75].map(p => <div key={p} style={{ position: "absolute", left: `${p}%`, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.025)" }} />)}
                        {[33, 66].map(p => <div key={p} style={{ position: "absolute", top: `${p}%`, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.025)" }} />)}
                    </div>

                    {/* Ambient glow */}
                    <div className="auth-glow" style={{ top: "20%", left: "30%" }} />

                    {/* Noise overlay */}
                    <div style={{ position: "absolute", inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")", pointerEvents: "none", opacity: 0.4 }} />

                    {/* Logo / back */}
                    <div style={{ position: "absolute", top: 32, left: 40, zIndex: 2 }}>
                        <div className="logo-back" onClick={() => onNavigate("landing")}>
                            <div style={{ width: 26, height: 26, background: "#fff", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ color: "#000", fontSize: 13, fontWeight: 900, fontFamily: "'Playfair Display',serif" }}>N</span>
                            </div>
                            <span>← Back to home</span>
                        </div>
                    </div>

                    {/* 3D Book — mouse reactive */}
                    <div className="book-anim">
                        <div style={{
                            position: "absolute", inset: 0,
                            transformStyle: "preserve-3d",
                            transform: `rotateY(${bookRot.y}deg) rotateX(${bookRot.x}deg)`,
                            transition: "transform 0.12s ease-out",
                        }}>
                            <div className="cover-back" />
                            <div className="cover-pages" />
                            <div className="cover-spine" />
                            <div className="cover-front">
                                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: "#000", textAlign: "center", lineHeight: 1.1 }}>Noted<em style={{ fontStyle: "italic" }}>IQ</em></div>
                                <div style={{ width: 28, height: 1, background: "#000" }} />
                                <div style={{ fontSize: 8, color: "#888", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>Intelligence Layer</div>
                            </div>
                        </div>

                        {/* Floating annotation tags */}
                        <div className="floating-tag float-tag" style={{ top: -40, right: -90, "--rot": "-2deg", animationDelay: "0.3s" }}>
                            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>📌 Definition</div>
                            <div style={{ color: "#fff", fontFamily: "'Caveat',cursive", fontSize: 13 }}>NotedIQ is active...</div>
                        </div>
                        <div className="floating-tag float-tag" style={{ bottom: -30, left: -100, "--rot": "1.5deg", animationDelay: "0.8s" }}>
                            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>✅ Task</div>
                            <div style={{ color: "#fff", fontFamily: "'Caveat',cursive", fontSize: 13 }}>Srinivas → fix DB EOD</div>
                        </div>
                    </div>

                    {/* Bottom copy */}
                    <div style={{ position: "relative", zIndex: 2 }}>
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 900, letterSpacing: "-0.5px", lineHeight: 1.1, marginBottom: 12 }}>
                            Your notes,<br /><em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.4)" }}>elevated.</em>
                        </h2>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.7, maxWidth: 320, fontWeight: 300 }}>
                            Join students and professionals turning raw notes into structured intelligence.
                        </p>
                    </div>
                </div>

                {/* ── Right auth form — completely unchanged ── */}
                <div style={{ width: 480, display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 56px" }}>
                    {isForgotPassword ? (
                        <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
                            <div style={{ marginBottom: 40 }}>
                                <button className="switch-link" onClick={() => { setIsForgotPassword(false); setRecoveryStatus("idle"); setOtpCode(""); setNewPassword(""); setError(""); setIsFallbackMode(false); }} style={{ fontSize: 13, marginBottom: 24, display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
                                    ← Back to sign in
                                </button>
                                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 8 }}>
                                    Reset Password.
                                </h1>
                                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 300, lineHeight: 1.6 }}>
                                    {recoveryStatus === "otp-verification" || recoveryStatus === "updating"
                                        ? "Enter the 6-digit code sent to your email to set a new password."
                                        : "Enter your email address below, and we'll send you a verification code to reset your password."}
                                </p>
                            </div>

                            {recoveryStatus === "sent" ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                    <div style={{
                                        background: "rgba(16,185,129,0.08)",
                                        border: "0.5px solid rgba(16,185,129,0.3)",
                                        borderRadius: 8,
                                        padding: "16px",
                                        fontSize: 14,
                                        color: "#34d399",
                                        lineHeight: 1.6
                                    }}>
                                        <p style={{ fontWeight: 600, marginBottom: 4 }}>Password Updated!</p>
                                        Your password has been successfully reset. You can now log in with your new credentials.
                                    </div>
                                    <button className="auth-btn" onClick={() => { setIsForgotPassword(false); setRecoveryStatus("idle"); setOtpCode(""); setNewPassword(""); setError(""); setIsFallbackMode(false); }}>
                                        Return to Sign In
                                    </button>
                                </div>
                            ) : recoveryStatus === "otp-verification" || recoveryStatus === "updating" ? (
                                <form onSubmit={handleResetPasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                    {error && <div className="err-box">⚠️ {error}</div>}
                                    <div>
                                        <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Verification Code</label>
                                        <input
                                            className="auth-input"
                                            type="text"
                                            placeholder="6-digit code"
                                            value={otpCode}
                                            onChange={e => setOtpCode(e.target.value)}
                                            maxLength={6}
                                            required
                                            disabled={recoveryStatus === "updating"}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>New Password</label>
                                        <input
                                            className="auth-input"
                                            type="password"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            required
                                            disabled={recoveryStatus === "updating"}
                                        />
                                    </div>
                                    <button className="auth-btn" type="submit" disabled={recoveryStatus === "updating"}>
                                        {recoveryStatus === "updating" ? "Updating..." : "Update Password →"}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleRecoverySubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                    {error && <div className="err-box">⚠️ {error}</div>}
                                    <div>
                                        <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Email Address</label>
                                        <input
                                            className="auth-input"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={recoveryEmail}
                                            onChange={e => setRecoveryEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button className="auth-btn" type="submit" disabled={recoveryStatus === "sending"}>
                                        {recoveryStatus === "sending" ? "Sending Code..." : "Send Verification Code →"}
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: 40 }}>
                                <div style={{ display: "flex", gap: 28, marginBottom: 32, borderBottom: "0.5px solid rgba(255,255,255,0.08)", paddingBottom: 0 }}>
                                    <button className={`tab-btn ${isLogin ? "tab-active" : "tab-inactive"}`} onClick={() => { setIsLogin(true); setError(""); }}>Sign in</button>
                                    <button className={`tab-btn ${!isLogin ? "tab-active" : "tab-inactive"}`} onClick={() => { setIsLogin(false); setError(""); }}>Create account</button>
                                </div>
                                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 6 }}>
                                    {isLogin ? "Welcome back." : "Get started."}
                                </h1>
                                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>
                                    {isLogin ? "Sign in to your NotedIQ workspace." : "Create your free NotedIQ account."}
                                </p>
                            </div>

                            {error && <div className="err-box" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

                            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {!isLogin && (
                                    <div>
                                        <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Full name</label>
                                        <input className="auth-input" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
                                    </div>
                                )}
                                <div>
                                    <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Email</label>
                                    <input className="auth-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                        <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Password</label>
                                        {isLogin && <button type="button" className="switch-link" style={{ fontSize: 11 }} onClick={() => { setIsForgotPassword(true); setError(""); setRecoveryStatus("idle"); setRecoveryEmail(""); setIsFallbackMode(false); }}>Forgot password?</button>}
                                    </div>
                                    <input className="auth-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                                </div>
                                <button className="auth-btn" type="submit" disabled={loading} style={{ marginTop: 8 }}>
                                    {loading ? "Processing..." : isLogin ? "Sign in →" : "Create account →"}
                                </button>
                            </form>

                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 24 }}>
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button className="switch-link" onClick={() => { setIsLogin(!isLogin); setError(""); }}>
                                    {isLogin ? "Sign up free" : "Sign in"}
                                </button>
                            </p>
                        </>
                    )}
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", textAlign: "center", marginTop: 32, lineHeight: 1.6 }}>
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </>
    );
}