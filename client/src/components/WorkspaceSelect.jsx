import React, { useState, useEffect, useRef } from "react";
import {
  School,
  Briefcase,
  Compass,
  History,
  User,
  LogOut,
  Search,
  Trash2,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Award,
  BookOpen,
  CheckSquare,
  Calendar,
  Sparkles,
  ArrowRight,
  Zap,
  Clock,
  FileText
} from "lucide-react";

const TIPS = [
  "💡 Student Tip: Upload your lecture PDFs directly in Scribble mode to extract key concepts and formulas instantly.",
  "💡 Work Tip: Record meetings live or upload audio files to generate a structured Minutes of Meeting with Action Matrices.",
  "💡 Student Tip: Test your understanding with logic riddles. The AI designs them to test key definitions.",
  "💡 Work Tip: Keep action item checkboxes checked to track progress across tasks.",
  "💡 Design Tip: Move your cursor across the cards. Enjoy the interactive 3D parallax tilt and floating layers!",
  "💡 Tip: You can switch workspaces seamlessly from the top bar or sidebar without losing your current progress."
];

/* ── Floating 3D Book Component (inspired by AuthPage BookTransition) ── */
function FloatingBook3D({ color = "#10b981", label = "Foundry IQ", sublabel = "Student" }) {
  const bookRef = useRef(null);
  const [rot, setRot] = useState({ x: -15, y: 25 });
  const rafRef = useRef(null);

  useEffect(() => {
    let t = 0;
    function animate() {
      t += 0.008;
      setRot({ x: -15 + Math.sin(t * 0.7) * 6, y: 25 + Math.sin(t) * 12 });
      rafRef.current = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div style={{ perspective: "800px", width: 120, height: 156, flexShrink: 0 }}>
      <div style={{
        width: "100%", height: "100%",
        transformStyle: "preserve-3d",
        transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
        transition: "transform 0.1s ease-out",
        position: "relative",
      }}>
        {/* Front cover */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(135deg, ${color}18, ${color}06)`,
          border: `0.5px solid ${color}40`,
          borderRadius: "3px 8px 8px 3px",
          backfaceVisibility: "hidden",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
          boxShadow: `inset -3px 0 8px rgba(0,0,0,0.2), 0 0 20px ${color}20`,
        }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 900, color: "#fff", textAlign: "center", lineHeight: 1.1 }}>
            Noted<em style={{ fontStyle: "italic", color }}>IQ</em>
          </div>
          <div style={{ width: 24, height: 0.5, background: color, opacity: 0.5 }} />
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>{sublabel}</div>
        </div>
        {/* Spine */}
        <div style={{
          position: "absolute", left: -14, top: 0, bottom: 0, width: 14,
          background: `linear-gradient(to right, #111, #1a1a1a)`,
          borderRadius: "3px 0 0 3px",
          transform: "rotateY(-90deg) translateZ(7px)",
          transformOrigin: "right center",
          backfaceVisibility: "hidden",
        }} />
        {/* Pages edge */}
        <div style={{
          position: "absolute", top: 3, bottom: 3, right: -8, width: 8,
          background: "repeating-linear-gradient(to bottom,#f0ede8 0px,#f0ede8 1px,#e8e4df 2px,#e8e4df 3px)",
          borderRadius: "0 2px 2px 0",
          transform: "rotateY(90deg) translateZ(113px)",
          transformOrigin: "left center",
          backfaceVisibility: "hidden",
        }} />
        {/* Back cover */}
        <div style={{
          position: "absolute", inset: 0,
          background: "#0a0a0a",
          border: "0.5px solid #222",
          borderRadius: "3px 8px 8px 3px",
          transform: "translateZ(-10px)",
          backfaceVisibility: "hidden",
        }} />
      </div>
    </div>
  );
}

/* ── Orbiting orb ring (3D decorative element) ── */
function OrbitRing({ color, size = 160, speed = 1, offset = 0 }) {
  const [angle, setAngle] = useState(offset);
  const rafRef = useRef(null);

  useEffect(() => {
    let t = offset;
    function animate() {
      t += 0.004 * speed;
      setAngle(t);
      rafRef.current = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed, offset]);

  const x = size / 2 + Math.cos(angle) * (size / 2 - 6);
  const y = size / 2 + Math.sin(angle) * (size / 4 - 4);
  const scale = 0.6 + 0.4 * ((Math.sin(angle) + 1) / 2);

  return (
    <div style={{ width: size, height: size / 2, position: "relative", pointerEvents: "none" }}>
      {/* Ellipse track */}
      <svg width={size} height={size / 2} style={{ position: "absolute", inset: 0 }}>
        <ellipse cx={size / 2} cy={size / 4} rx={size / 2 - 6} ry={size / 4 - 4}
          fill="none" stroke={`${color}18`} strokeWidth="1" strokeDasharray="3 5" />
      </svg>
      {/* Orb */}
      <div style={{
        position: "absolute",
        left: x - 4, top: y - 4,
        width: 8, height: 8,
        borderRadius: "50%",
        background: color,
        opacity: scale * 0.8,
        transform: `scale(${scale})`,
        boxShadow: `0 0 8px ${color}, 0 0 16px ${color}60`,
        transition: "none",
      }} />
    </div>
  );
}

export default function WorkspaceSelect({ user, backendUrl, onSelect, onResumeSession, onLogout }) {
  const name = user?.name || "Guest";

  const [activeTab, setActiveTab] = useState("launchpad");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [expandedSessions, setExpandedSessions] = useState({});
  const [tiltStyle1, setTiltStyle1] = useState({});
  const [tiltStyle2, setTiltStyle2] = useState({});
  const [tipIndex, setTipIndex] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const canvasRef = useRef(null);

  /* ── Particle canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const pts = Array.from({ length: 45 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 1.1 + 0.3, a: Math.random() * 0.22 + 0.04,
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
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${0.025 * (1 - d / 100)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  useEffect(() => {
    if (!user?.id || !backendUrl) { setLoading(false); return; }
    setLoading(true);
    fetch(`${backendUrl}/api/sessions/user/${user.id}`)
      .then(res => { if (!res.ok) throw new Error("Failed to fetch"); return res.json(); })
      .then(data => { setSessions(data || []); setLoading(false); })
      .catch(err => { console.error(err); setErrorMsg("Could not load your history. Please check your connection."); setLoading(false); });
  }, [user?.id, backendUrl]);

  useEffect(() => {
    const interval = setInterval(() => setTipIndex(prev => (prev + 1) % TIPS.length), 8500);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e, cardNum) => {
    const box = e.currentTarget.getBoundingClientRect();
    const rotX = -((e.clientY - box.top - box.height / 2) / (box.height / 2)) * 14;
    const rotY = ((e.clientX - box.left - box.width / 2) / (box.width / 2)) * 14;
    const style = {
      transform: `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03,1.03,1.03)`,
      boxShadow: cardNum === 1
        ? "0 30px 60px rgba(0,0,0,0.9), 0 0 30px rgba(16,185,129,0.1)"
        : "0 30px 60px rgba(0,0,0,0.9), 0 0 30px rgba(96,165,250,0.1)",
      borderColor: cardNum === 1 ? "rgba(16,185,129,0.25)" : "rgba(96,165,250,0.25)",
      transition: "transform 0.06s ease-out, box-shadow 0.06s, border-color 0.06s",
    };
    if (cardNum === 1) setTiltStyle1(style);
    else setTiltStyle2(style);
  };

  const handleMouseLeave = (cardNum) => {
    const style = {
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)",
      boxShadow: "none",
      borderColor: "rgba(255,255,255,0.08)",
      transition: "all 0.5s cubic-bezier(0.25,1,0.5,1)",
    };
    if (cardNum === 1) setTiltStyle1(style);
    else setTiltStyle2(style);
    setHoveredCard(null);
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm("Permanently delete this session?")) return;
    try {
      const res = await fetch(`${backendUrl}/api/sessions/${sessionId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setSessions(prev => prev.filter(s => s._id !== sessionId));
    } catch { alert("Failed to delete session."); }
  };

  const toggleExpand = (sessionId) => {
    setExpandedSessions(prev => ({ ...prev, [sessionId]: !prev[sessionId] }));
  };

  const getSessionTitle = (session) => {
    const h = (session.notes || []).find(n => n.type === "banner-title" || n.type === "heading");
    if (h?.content) return h.content;
    const dec = (session.notes || []).find(n => n.type === "decision");
    if (dec?.content) {
      return dec.content.length > 50 ? dec.content.substring(0, 47) + "..." : dec.content;
    }
    return "Untitled Session";
  };

  const getFormattedDate = (str) => {
    const d = new Date(str);
    return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const filteredSessions = sessions.filter(session => {
    if (filterMode !== "all" && session.role !== filterMode) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return getSessionTitle(session).toLowerCase().includes(q) ||
      (session.notes || []).some(n => (n.content || "").toLowerCase().includes(q));
  });

  const studentCount = sessions.filter(s => s.role === "student").length;
  const employeeCount = sessions.filter(s => s.role === "employee").length;
  const totalDefs = sessions.reduce((sum, s) => sum + (s.notes || []).filter(n => n.type === "definition").length, 0);
  const totalActions = sessions.reduce((sum, s) => sum + (s.notes || []).filter(n => n.type === "task-item").length, 0);

  const getSessionsThisWeek = () => {
    const week = 7 * 24 * 60 * 60 * 1000;
    return sessions.filter(s => Date.now() - new Date(s.createdAt).getTime() < week).length;
  };
  const sessionsThisWeek = getSessionsThisWeek();
  const goalProgress = Math.min(sessionsThisWeek / 5, 1);
  const ringCirc = 2 * Math.PI * 36;
  const ringOffset = ringCirc * (1 - goalProgress);

  const getLocalDate = (str) => {
    const d = new Date(str);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const daysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { dateString: getLocalDate(d.toISOString()), dayLabel: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()], count: 0 };
  });
  sessions.forEach(s => {
    if (!s.createdAt) return;
    const match = daysData.find(d => d.dateString === getLocalDate(s.createdAt));
    if (match) match.count++;
  });

  const cW = 500, cH = 180, pL = 35, pR = 15, pT = 25, pB = 30;
  const iW = cW - pL - pR, iH = cH - pT - pB;
  const chartMax = Math.max(...daysData.map(d => d.count), 3);
  const chartPts = daysData.map((d, i) => ({
    x: pL + (i / 6) * iW, y: cH - pB - (d.count / chartMax) * iH,
    count: d.count, day: d.dayLabel,
  }));
  const polyPts = chartPts.map(p => `${p.x},${p.y}`).join(" ");
  const polyArea = `${chartPts[0].x},${cH - pB} ${polyPts} ${chartPts[6].x},${cH - pB}`;
  const gridLines = [0, 0.5, 1].map(r => ({ y: cH - pB - r * iH, val: Math.round(r * chartMax) }));
  const initials = name.substring(0, 2).toUpperCase();

  // Recent sessions for quick-resume strip
  const recentSessions = [...sessions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", position: "relative", overflowX: "hidden" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Caveat:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ws-nav-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 7px;
          font-size: 18px; font-weight: 600; font-family: 'Inter', sans-serif;
          background: transparent; border: 0.5px solid transparent;
          color: rgba(255,255,255,0.35); cursor: pointer; transition: all 0.15s; letter-spacing: 0.01em;
        }
        .ws-nav-btn:hover:not(.ws-nav-active) { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.03); }
        .ws-nav-active { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); color: #fff; }

        .ws-card {
          background: rgba(255,255,255,0.02);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 42px 34px;
          width: 420px; display: flex; flex-direction: column; align-items: flex-start;
          cursor: pointer; position: relative; overflow: hidden;
          transform-style: preserve-3d;
          transition: transform 0.15s ease-out, box-shadow 0.15s, border-color 0.15s;
        }
        .ws-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent);
        }
        .ws-card::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.04), transparent);
        }
        .ws-icon-wrap {
          width: 52px; height: 52px; border-radius: 12px;
          background: rgba(255,255,255,0.04); border: 0.5px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 22px; transition: all 0.25s; transform: translateZ(30px);
        }
        .ws-card:hover .ws-icon-wrap { border-color: rgba(255,255,255,0.3); }
        .ws-cta-btn {
          width: 100%; background: none; border: 0.5px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.55); border-radius: 8px; padding: 12px;
          font-size: 16px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          font-family: 'Inter', sans-serif; cursor: pointer; text-align: center; margin-top: 28px;
          transition: all 0.25s; display: flex; align-items: center; justify-content: center; gap: 8px;
          transform: translateZ(35px);
        }
        .ws-cta-btn:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.3); color: #fff; }
        .ws-pill-tag {
          display: inline-block; padding: 3px 10px; border-radius: 5px;
          font-size: 15px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 18px; transform: translateZ(25px);
        }
        .ws-card-title {
          font-family: 'Playfair Display', serif; font-style: italic;
          font-size: 32px; font-weight: 900; margin-bottom: 10px;
          letter-spacing: -0.3px; color: #fff; transform: translateZ(20px);
        }
        .ws-card-desc {
          font-size: 18px; color: rgba(255,255,255,0.32); line-height: 1.75;
          font-weight: 300; margin-bottom: 20px; transform: translateZ(10px);
        }
        .ws-feature-row {
          display: flex; align-items: center; gap: 8px;
          font-size: 17px; color: rgba(255,255,255,0.38);
          margin-bottom: 7px; transform: translateZ(15px);
        }
        .ws-stat-card {
          background: rgba(255,255,255,0.025); border: 0.5px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 16px; position: relative; overflow: hidden;
        }
        .ws-stat-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent);
        }
        .ws-stat-eyebrow {
          display: block; font-size: 14px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: rgba(255,255,255,0.28); margin-bottom: 8px;
          font-family: 'Inter', sans-serif;
        }
        .ws-table-row { border-bottom: 0.5px solid rgba(255,255,255,0.05); transition: background 0.15s; cursor: pointer; }
        .ws-table-row:hover { background: rgba(255,255,255,0.025); }
        .ws-search-input {
          background: rgba(255,255,255,0.04); border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 7px 12px 7px 32px;
          font-size: 17px; color: #fff; font-family: 'Inter', sans-serif;
          outline: none; width: 200px; transition: border 0.2s, background 0.2s;
        }
        .ws-search-input::placeholder { color: rgba(255,255,255,0.18); }
        .ws-search-input:focus { border-color: rgba(255,255,255,0.22); background: rgba(255,255,255,0.06); }
        .ws-filter-pill {
          padding: 5px 12px; border-radius: 6px; font-size: 16px; font-weight: 600;
          font-family: 'Inter', sans-serif; cursor: pointer; transition: all 0.15s; border: none; background: transparent;
        }
        .ws-tip-box {
          max-width: 480px; width: 100%;
          background: rgba(251,191,36,0.04); border: 0.5px solid rgba(251,191,36,0.18);
          border-radius: 14px; padding: 16px 18px;
          display: flex; gap: 14px; align-items: flex-start;
          cursor: pointer; transition: background 0.2s, transform 0.2s; transform: rotate(-0.5deg);
        }
        .ws-tip-box:hover { background: rgba(251,191,36,0.07); transform: rotate(-0.5deg) scale(1.01); }
        .ws-tip-font { font-family: 'Caveat', cursive; font-size: 23px; color: #fbbf24; line-height: 1.45; }
        .ws-signout-btn {
          display: flex; align-items: center; gap: 6px; font-size: 16px; font-weight: 600;
          font-family: 'Inter', sans-serif; color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.03); border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 7px; padding: 7px 12px; cursor: pointer; transition: all 0.15s;
        }
        .ws-signout-btn:hover { color: #f87171; border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.05); }
        .ws-resume-btn {
          display: flex; align-items: center; gap: 5px; font-size: 16px; font-weight: 600;
          font-family: 'Inter', sans-serif; color: rgba(255,255,255,0.65);
          background: rgba(255,255,255,0.04); border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 7px; padding: 6px 12px; cursor: pointer; transition: all 0.15s;
        }
        .ws-resume-btn:hover { background: #fff; color: #000; border-color: #fff; }
        .ws-delete-btn {
          display: flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 7px; color: rgba(255,255,255,0.3);
          background: transparent; border: 0.5px solid rgba(255,255,255,0.08);
          cursor: pointer; transition: all 0.15s;
        }
        .ws-delete-btn:hover { color: #f87171; border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.05); }
        .history-scroll::-webkit-scrollbar { width: 4px; }
        .history-scroll::-webkit-scrollbar-track { background: transparent; }
        .history-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        .glow-chart { filter: drop-shadow(0 0 5px rgba(16,185,129,0.4)); }
        .chart-circle { transition: r 0.12s ease; }

        /* Quick-resume strip card */
        .ws-quick-card {
          background: rgba(255,255,255,0.02); border: 0.5px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 12px 14px;
          cursor: pointer; transition: all 0.2s; flex: 1; min-width: 180px;
          display: flex; flex-direction: column; gap: 6px;
        }
        .ws-quick-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.15); transform: translateY(-2px); }

        /* Notebook page preview */
        .notebook-preview {
          background: #fffef8; border-radius: 4px;
          border: 0.5px solid rgba(0,0,0,0.1);
          box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04);
          position: relative; overflow: hidden; width: 180px;
        }
        .notebook-preview::before {
          content: ''; position: absolute; top: 36px; left: 0; right: 0; bottom: 0;
          background: repeating-linear-gradient(transparent,transparent 22px,rgba(147,197,253,0.3) 22px,rgba(147,197,253,0.3) 23px);
          pointer-events: none;
        }
        .nb-holes { position: absolute; left: 0; top: 0; bottom: 0; width: 36px; display: flex; flex-direction: column; justify-content: space-evenly; align-items: center; pointer-events: none; background: rgba(0,0,0,0.02); }
        .nb-hole { width: 10px; height: 10px; border-radius: 50%; background: #181818; border: 0.5px solid rgba(0,0,0,0.1); box-shadow: inset 0 1px 3px rgba(0,0,0,0.5); }
        .nb-margin { position: absolute; left: 36px; top: 0; bottom: 0; width: 1px; background: rgba(239,68,68,0.2); pointer-events: none; }
        .nb-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px 7px; border-bottom: 0.5px solid rgba(0,0,0,0.08); position: relative; z-index: 2; background: rgba(255,254,248,0.97); }
        .nb-body { padding: 12px 12px 16px 46px; position: relative; z-index: 2; }

        /* Auth-matching or-line */
        .ws-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
        .ws-divider::before, .ws-divider::after { content: ''; flex: 1; height: 0.5px; background: rgba(255,255,255,0.08); }

        @keyframes ws-fade-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .ws-fade-in { animation: ws-fade-in 0.4s ease forwards; }
        @keyframes ws-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ws-glow-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
      `}</style>

      {/* Particle canvas */}
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.45 }} />

      {/* Grid lines (matching AuthPage) */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {[20, 40, 60, 80].map(p => <div key={p} style={{ position: "absolute", left: `${p}%`, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.02)" }} />)}
        {[33, 66].map(p => <div key={p} style={{ position: "absolute", top: `${p}%`, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.02)" }} />)}
      </div>

      {/* ── Header nav ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(0,0,0,0.88)", backdropFilter: "blur(24px) saturate(180%)",
        borderBottom: "0.5px solid rgba(255,255,255,0.07)",
        padding: "16px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Brand — same style as AuthPage */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "#fff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#000", fontSize: 18, fontWeight: 900, fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>N</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em", fontFamily: "'Playfair Display', serif" }}>
            Noted<em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.5)" }}>IQ</em>
          </span>
        </div>

        {/* Tab nav */}
        <nav style={{ display: "flex", gap: 6 }}>
          {[
            { key: "launchpad", label: "Launchpad", Icon: Compass },
            { key: "history", label: "History", Icon: History, badge: sessions.length > 0 ? sessions.length : null },
            { key: "profile", label: "Profile", Icon: User },
          ].map(({ key, label, Icon, badge }) => (
            <button key={key} className={`ws-nav-btn${activeTab === key ? " ws-nav-active" : ""}`} onClick={() => setActiveTab(key)}>
              <Icon size={18} />
              {label}
              {badge && <span style={{ fontSize: 13, fontWeight: 700, background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)", padding: "1px 6px", borderRadius: 100 }}>{badge}</span>}
            </button>
          ))}
        </nav>

        {/* User strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{name}</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.28)" }}>{user?.email}</p>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#000", boxShadow: "0 0 12px rgba(16,185,129,0.3)" }}>
            {initials}
          </div>
          <button className="ws-signout-btn" onClick={onLogout}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </header>

      {/* ── Main body ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", position: "relative", zIndex: 1 }}>

        {/* TAB 1: LAUNCHPAD */}
        {activeTab === "launchpad" && (
          <div className="ws-fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 940, width: "100%" }}>

            {/* ── Header section (AuthPage-matching tone) ── */}
            <div style={{ textAlign: "center", marginBottom: 52, position: "relative" }}>
              {/* Ambient glow behind headline */}
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 200, background: "radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(16,185,129,0.08)", border: "0.5px solid rgba(16,185,129,0.2)", borderRadius: 100, padding: "7px 18px", fontSize: 15, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#10b981", marginBottom: 22 }}>
                <Sparkles size={15} style={{ animation: "ws-bounce 2s ease-in-out infinite" }} />
                Workspace Director
              </div>

              <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 900, fontSize: "clamp(44px,6vw,70px)", letterSpacing: "-1.5px", lineHeight: 0.95, marginBottom: 16, color: "#fff", position: "relative", zIndex: 1 }}>
                Hello, {name}.
              </h1>
              <p style={{ fontSize: 19, color: "rgba(255,255,255,0.35)", fontWeight: 300, maxWidth: 540, margin: "0 auto", lineHeight: 1.75 }}>
                Select a workspace to load its custom notebook, AI models, and document intelligence layer.
              </p>
            </div>

            {/* ── 3D Hero strip: Books + cards side by side ── */}
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", marginBottom: 44, width: "100%" }}>

              {/* Student Card */}
              <div
                className="ws-card"
                style={{ ...tiltStyle1 }}
                onMouseMove={e => { handleMouseMove(e, 1); setHoveredCard(1); }}
                onMouseLeave={() => handleMouseLeave(1)}
                onClick={() => onSelect("student")}
              >
                {/* 3D Floating book + orbit ring inside card */}
                <div style={{ position: "absolute", right: -10, top: -20, opacity: 0.55, pointerEvents: "none", zIndex: 0 }}>
                  <OrbitRing color="#10b981" size={165} speed={0.8} offset={0} />
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20, position: "relative", zIndex: 1 }}>
                  <div className="ws-icon-wrap" style={{ marginBottom: 0 }}>
                    <School size={26} color="#10b981" />
                  </div>
                  <FloatingBook3D color="#10b981" label="Foundry IQ" sublabel="Student" />
                </div>

                <div className="ws-pill-tag" style={{ background: "rgba(16,185,129,0.08)", color: "#10b981", border: "0.5px solid rgba(16,185,129,0.18)", position: "relative", zIndex: 1 }}>
                  🎓 Student Mode
                </div>
                <h2 className="ws-card-title" style={{ position: "relative", zIndex: 1 }}>Foundry IQ</h2>
                <p className="ws-card-desc" style={{ position: "relative", zIndex: 1 }}>
                  Transform messy lecture scribbles and educational videos into neat study documents, terminology definitions, and interactive quizzes.
                </p>
                <div style={{ width: "100%", transform: "translateZ(15px)", position: "relative", zIndex: 1 }}>
                  {["Ruled notebook canvas", "Topic & concept catalogs", "Gamified logic riddles"].map(f => (
                    <div key={f} className="ws-feature-row">
                      <BookOpen size={16} style={{ color: "#10b981", flexShrink: 0 }} /> <span>{f}</span>
                    </div>
                  ))}
                </div>
                <button className="ws-cta-btn" style={{ borderColor: "rgba(16,185,129,0.25)", color: "#10b981", position: "relative", zIndex: 1 }}>
                  Launch Notebook <ArrowRight size={16} />
                </button>
              </div>

              {/* Corporate Card */}
              <div
                className="ws-card"
                style={{ ...tiltStyle2 }}
                onMouseMove={e => { handleMouseMove(e, 2); setHoveredCard(2); }}
                onMouseLeave={() => handleMouseLeave(2)}
                onClick={() => onSelect("employee")}
              >
                <div style={{ position: "absolute", right: -10, top: -20, opacity: 0.45, pointerEvents: "none", zIndex: 0 }}>
                  <OrbitRing color="#60a5fa" size={165} speed={1.2} offset={Math.PI} />
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20, position: "relative", zIndex: 1 }}>
                  <div className="ws-icon-wrap" style={{ marginBottom: 0 }}>
                    <Briefcase size={26} color="#60a5fa" />
                  </div>
                  <FloatingBook3D color="#60a5fa" label="Work IQ" sublabel="Corporate" />
                </div>

                <div className="ws-pill-tag" style={{ background: "rgba(96,165,250,0.08)", color: "#60a5fa", border: "0.5px solid rgba(96,165,250,0.18)", position: "relative", zIndex: 1 }}>
                  💼 Corporate Mode
                </div>
                <h2 className="ws-card-title" style={{ position: "relative", zIndex: 1 }}>Work IQ</h2>
                <p className="ws-card-desc" style={{ position: "relative", zIndex: 1 }}>
                  Ground identities automatically using corporate directories, generate minutes of meetings, and format priority action items.
                </p>
                <div style={{ width: "100%", transform: "translateZ(15px)", position: "relative", zIndex: 1 }}>
                  {["Automated name grounding", "Formal MoM transcriptions", "Action item checklists"].map(f => (
                    <div key={f} className="ws-feature-row">
                      <CheckSquare size={16} style={{ color: "#60a5fa", flexShrink: 0 }} /> <span>{f}</span>
                    </div>
                  ))}
                </div>
                <button className="ws-cta-btn" style={{ borderColor: "rgba(96,165,250,0.25)", color: "#60a5fa", position: "relative", zIndex: 1 }}>
                  Launch Dashboard <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* ── Notebook preview + Quick-resume strip ── */}
            <div style={{ display: "flex", gap: 24, width: "100%", maxWidth: 880, marginBottom: 36, flexWrap: "wrap", justifyContent: "center" }}>

              {/* Notebook page 3D preview (new element) */}
              <div style={{ perspective: "900px", flexShrink: 0 }}>
                <div style={{
                  transform: "rotateY(-8deg) rotateX(4deg)",
                  transition: "transform 0.5s ease",
                  transformStyle: "preserve-3d",
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = "rotateY(-2deg) rotateX(1deg) scale(1.03)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "rotateY(-8deg) rotateX(4deg)"}
                >
                  <div className="notebook-preview" style={{ height: 270, width: 260 }}>
                    <div className="nb-holes">
                      {[0, 1, 2, 3, 4].map(i => <div key={i} className="nb-hole" />)}
                    </div>
                    <div className="nb-margin" />
                    <div className="nb-header">
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#888", letterSpacing: "0.1em", textTransform: "uppercase" }}>NotedIQ · Preview</span>
                      <span style={{ fontSize: 12, color: "#bbb" }}>Today</span>
                    </div>
                    <div className="nb-body">
                      <div style={{ fontFamily: "'Caveat', cursive", fontSize: 19, color: "#222", fontWeight: 700, marginBottom: 8 }}>Welcome to NotedIQ</div>
                      <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: "#444", lineHeight: 1.5, marginBottom: 6 }}>Definition: NotedIQ is your interactive, AI-powered smart study partner.</div>
                      <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: "#666", lineHeight: 1.5 }}>→ Auto-generates mindmaps & flowcharts</div>
                      <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: "#666", lineHeight: 1.5 }}>→ Interactive logic quizzes & diagrams</div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, background: "#e8f5e9", borderRadius: 3, padding: "2px 7px" }}>
                        <span style={{ fontSize: 13, color: "#2e7d32", fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>✓ Smart notes ready</span>
                      </div>
                    </div>
                    {/* Spine shadow */}
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(to right,rgba(0,0,0,0.06),transparent)", zIndex: 4 }} />
                  </div>
                </div>
              </div>

              {/* Quick resume strip */}
              {recentSessions.length > 0 && (
                <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <Clock size={16} style={{ color: "rgba(255,255,255,0.3)" }} />
                    <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}>Quick Resume</span>
                  </div>
                  {recentSessions.map(s => (
                    <div key={s._id} className="ws-quick-card" onClick={() => onResumeSession(s)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: s.role === "student" ? "#10b981" : "#60a5fa" }}>
                          {s.role === "student" ? "🎓" : "💼"} {s.role}
                        </span>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", fontFamily: "'Inter', sans-serif" }}>{getFormattedDate(s.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 500, color: "rgba(255,255,255,0.75)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {getSessionTitle(s)}
                      </div>
                      <div style={{ fontSize: 15, color: "rgba(255,255,255,0.28)" }}>{(s.notes || []).length} blocks</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Stat bar (new feature) ── */}
            <div style={{ display: "flex", gap: 12, marginBottom: 36, flexWrap: "wrap", justifyContent: "center" }}>
              {[
                { label: "Sessions", value: sessions.length, icon: <FileText size={16} />, color: "#fff" },
                { label: "This week", value: sessionsThisWeek, icon: <Calendar size={16} />, color: "#10b981" },
                { label: "Definitions", value: totalDefs, icon: <BookOpen size={16} />, color: "#a78bfa" },
                { label: "Action items", value: totalActions, icon: <Zap size={16} />, color: "#60a5fa" },
              ].map(({ label, value, icon, color }) => (
                <div key={label} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,0.025)", border: "0.5px solid rgba(255,255,255,0.07)",
                  borderRadius: 10, padding: "10px 18px",
                }}>
                  <span style={{ color: "rgba(255,255,255,0.3)" }}>{icon}</span>
                  <span style={{ fontSize: 24, fontWeight: 900, color, fontFamily: "'Playfair Display', serif" }}>{value}</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Sticky tip — same style as AuthPage annotation tags */}
            <div className="ws-tip-box" onClick={() => setTipIndex(prev => (prev + 1) % TIPS.length)}>
              <div style={{ fontSize: 24, lineHeight: 1 }}>📝</div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 14, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: "rgba(251,191,36,0.55)", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>Pro-tip sticky</h4>
                <p className="ws-tip-font">{TIPS[tipIndex]}</p>
                <div style={{ fontSize: 13, color: "rgba(251,191,36,0.35)", textAlign: "right", marginTop: 8, fontFamily: "'Inter', sans-serif" }}>Click to skip tip ➔</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === "history" && (
          <div className="ws-fade-in" style={{ maxWidth: 900, width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <History size={18} style={{ color: "#10b981" }} />
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 22, fontWeight: 900, color: "#fff" }}>Activity History</h2>
                </div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)" }}>Manage, preview, and resume your note compilation history.</p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                <div style={{ position: "relative" }}>
                  <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
                  <input type="text" placeholder="Search titles or notes…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="ws-search-input" />
                </div>
                <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 3, gap: 2 }}>
                  {[["all", "All"], ["student", "Student"], ["employee", "Corporate"]].map(([key, label]) => (
                    <button key={key} className="ws-filter-pill" onClick={() => setFilterMode(key)}
                      style={{ color: filterMode === key ? "#fff" : "rgba(255,255,255,0.35)", background: filterMode === key ? key === "student" ? "rgba(16,185,129,0.12)" : key === "employee" ? "rgba(96,165,250,0.12)" : "rgba(255,255,255,0.06)" : "transparent" }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {errorMsg && <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.06)", border: "0.5px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 12, color: "#f87171" }}>⚠️ {errorMsg}</div>}

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 12, color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
                <div style={{ width: 22, height: 22, border: "2px solid #10b981", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Loading sessions…
              </div>
            ) : filteredSessions.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 14, color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center" }}>
                <div style={{ fontSize: 36 }}>📂</div>
                <div>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 18, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>No sessions yet.</p>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}>Generate your first set of notes from the Launchpad.</p>
                </div>
                <button onClick={() => setActiveTab("launchpad")} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#10b981", background: "rgba(16,185,129,0.08)", border: "0.5px solid rgba(16,185,129,0.2)", borderRadius: 7, padding: "8px 16px", cursor: "pointer" }}>
                  <Compass size={14} /> Go to Launchpad
                </button>
              </div>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
                <div className="history-scroll" style={{ maxHeight: 480, overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
                        {["Session Title", "Role", "Date", "Notes", ""].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSessions.map(session => (
                        <React.Fragment key={session._id}>
                          <tr className="ws-table-row" onClick={() => toggleExpand(session._id)}>
                            <td style={{ padding: "14px 16px", maxWidth: 280 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {expandedSessions[session._id] ? <ChevronUp size={14} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />}
                                <span style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{getSessionTitle(session)}</span>
                              </div>
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 4, background: session.role === "student" ? "rgba(16,185,129,0.08)" : "rgba(96,165,250,0.08)", color: session.role === "student" ? "#10b981" : "#60a5fa", border: `0.5px solid ${session.role === "student" ? "rgba(16,185,129,0.2)" : "rgba(96,165,250,0.2)"}` }}>
                                {session.role === "student" ? <><School size={11} /> Student</> : <><Briefcase size={11} /> Corp</>}
                              </span>
                            </td>
                            <td style={{ padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>{getFormattedDate(session.createdAt)}</td>
                            <td style={{ padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{(session.notes || []).length}</td>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                <button className="ws-resume-btn" onClick={e => { e.stopPropagation(); onResumeSession(session); }}><ArrowRight size={13} /> Resume</button>
                                <button className="ws-delete-btn" onClick={e => handleDeleteSession(e, session._id)}><Trash2 size={15} /></button>
                              </div>
                            </td>
                          </tr>
                          {expandedSessions[session._id] && (
                            <tr style={{ background: "rgba(255,255,255,0.015)" }}>
                              <td colSpan={5} style={{ padding: "12px 38px 16px" }}>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                  {(session.notes || []).slice(0, 6).map((note, i) => (
                                    <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 7, padding: "8px 12px", fontSize: 12, color: "rgba(255,255,255,0.5)", maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                      <span style={{ color: "rgba(255,255,255,0.3)", marginRight: 5, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 10 }}>{note.type}</span>{note.content}
                                    </div>
                                  ))}
                                  {(session.notes || []).length > 6 && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", padding: "8px 12px" }}>+{(session.notes || []).length - 6} more blocks</div>}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROFILE */}
        {activeTab === "profile" && (
          <div className="ws-fade-in" style={{ maxWidth: 900, width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Award size={21} style={{ color: "#10b981" }} />
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 26, fontWeight: 900, color: "#fff" }}>Account Profile</h2>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.28)" }}>Monitor your work trends, learning goals, and workspace balance metrics.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16 }}>
              {/* Account details */}
              <div className="ws-stat-card">
                <span className="ws-stat-eyebrow">Account metadata</span>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 14, background: "linear-gradient(135deg,#10b981,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#000", boxShadow: "0 0 20px rgba(16,185,129,0.25)" }}>
                    {initials}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 19, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{name}</h4>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.32)" }}>{user?.email}</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, borderTop: "0.5px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                  <div>
                    <span className="ws-stat-eyebrow">User identifier</span>
                    <code style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "monospace" }}>{user?.id || "N/A"}</code>
                  </div>
                  <div>
                    <span className="ws-stat-eyebrow">Access status</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#10b981", fontWeight: 600 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "ws-bounce 2s ease-in-out infinite" }} /> Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Weekly ring */}
              <div className="ws-stat-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minWidth: 180 }}>
                <span className="ws-stat-eyebrow">Weekly goal</span>
                <div style={{ position: "relative", width: 96, height: 96, margin: "8px 0" }}>
                  <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
                    <circle cx="40" cy="40" r="36" fill="none" stroke="url(#ringG)" strokeWidth="5" strokeDasharray={ringCirc} strokeDashoffset={ringOffset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
                    <defs><linearGradient id="ringG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs>
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 21, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{sessionsThisWeek}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>/ 5</span>
                  </div>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: goalProgress >= 1 ? "#10b981" : "rgba(255,255,255,0.55)", marginBottom: 4 }}>{goalProgress >= 1 ? "🎉 Goal hit!" : "Keep going!"}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", lineHeight: 1.5, maxWidth: 140 }}>5 sessions per week target</p>
              </div>
            </div>

            {/* Chart */}
            <div className="ws-stat-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <span className="ws-stat-eyebrow">Weekly note generation trend</span>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.22)" }}>Sessions logged per day</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#10b981", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                  <TrendingUp size={15} /> Active session flow
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <svg viewBox={`0 0 ${cW} ${cH}`} style={{ width: "100%", maxWidth: 560, overflow: "visible" }}>
                  <defs>
                    <linearGradient id="lineG2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#60a5fa" /></linearGradient>
                    <linearGradient id="areaG2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#10b981" stopOpacity="0.1" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></linearGradient>
                  </defs>
                  {gridLines.map((line, i) => (
                    <g key={i}>
                      <line x1={pL} y1={line.y} x2={cW - pR} y2={line.y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 4" />
                      <text x={pL - 7} y={line.y + 4} fill="rgba(255,255,255,0.22)" fontSize="11" textAnchor="end">{line.val}</text>
                    </g>
                  ))}
                  <polygon points={polyArea} fill="url(#areaG2)" />
                  <polyline points={polyPts} fill="none" stroke="url(#lineG2)" strokeWidth="2" className="glow-chart" strokeLinecap="round" strokeLinejoin="round" />
                  {chartPts.map((p, i) => (
                    <g key={i} style={{ cursor: "pointer" }}>
                      <circle cx={p.x} cy={p.y} r={12} fill="transparent"><title>{p.count} sessions on {p.day}</title></circle>
                      <circle cx={p.x} cy={p.y} r={6} fill="rgba(16,185,129,0.12)" />
                      <circle cx={p.x} cy={p.y} r={3} fill="#10b981" stroke="#fff" strokeWidth="1.5" className="chart-circle" />
                      <text x={p.x} y={cH - 12} fill="rgba(255,255,255,0.3)" fontSize="11" textAnchor="middle">{p.day}</text>
                    </g>
                  ))}
                  <line x1={pL} y1={pT} x2={pL} y2={cH - pB} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <line x1={pL} y1={cH - pB} x2={cW - pR} y2={cH - pB} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                </svg>
              </div>
            </div>

            {/* Bottom stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[
                { label: "Total Sessions", value: sessions.length, color: "#fff" },
                { label: "Definitions Created", value: totalDefs, color: "#10b981" },
                { label: "Action Items", value: totalActions, color: "#60a5fa" },
              ].map(({ label, value, color }) => (
                <div key={label} className="ws-stat-card">
                  <span className="ws-stat-eyebrow">{label}</span>
                  <span style={{ fontSize: 32, fontWeight: 900, color, fontFamily: "'Playfair Display', serif" }}>{value}</span>
                </div>
              ))}
              <div className="ws-stat-card">
                <span className="ws-stat-eyebrow">Workspace ratio</span>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>
                  <span style={{ color: "#10b981" }}>Student: {studentCount}</span>
                  <span style={{ color: "#60a5fa" }}>Corp: {employeeCount}</span>
                </div>
                <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden", display: "flex" }}>
                  <div style={{ background: "#10b981", height: "100%", width: `${sessions.length > 0 ? (studentCount / sessions.length) * 100 : 50}%`, transition: "width 0.4s ease" }} />
                  <div style={{ background: "#60a5fa", height: "100%", flex: 1 }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}