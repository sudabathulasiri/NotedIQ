import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

import LandingPage from "./components/LandingPage.jsx";
import AuthPage from "./components/AuthPage.jsx";
import WorkspaceSelect from "./components/WorkspaceSelect.jsx";
import Sidebar from "./components/Sidebar.jsx";
import TopBar from "./components/TopBar.jsx";
import StudentView from "./components/StudentView.jsx";
import EmployeeView from "./components/EmployeeView.jsx";

const BACKEND = "http://localhost:5000";

export default function App() {
  // ── Router state ──────────────────────────────────────────
  // "landing" | "login" | "signup" | "app"
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);

  // ── UI state ──────────────────────────────────────────────
  const [mode, setMode] = useState("student");
  const [source, setSource] = useState("video");
  const [activeTab, setActiveTab] = useState("study");
  const [inputText, setInputText] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  // ── Notes state ───────────────────────────────────────────
  const [notes, setNotes] = useState([]);

  // ── Socket ref ────────────────────────────────────────────
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(BACKEND, { autoConnect: false });
    socketRef.current = socket;

    socket.on("connect", () => { setConnected(true); setError(null); });
    socket.on("disconnect", () => setConnected(false));

    socket.on("transcript-status", (data) => setStatusMsg(data.message));

    socket.on("processed-notes-stream", (payload) => {
      const blocks = Array.isArray(payload?.blocks) ? payload.blocks : [];
      if (blocks.length === 0) {
        setError("AI returned no blocks. Check your Groq API key or try again.");
      } else {
        setError(null);
      }
      setNotes(prev => [...prev, ...blocks]);
      setGenerating(false);
      setStatusMsg(null);
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
      setError(err?.message || "Something went wrong.");
      setGenerating(false);
      setStatusMsg(null);
    });

    socket.connect();
    return () => socket.disconnect();
  }, []);

  // ── Auth handler ──────────────────────────────────────────
  function handleAuth(userData) {
    setUser(userData);
    setPage("workspace-select");
  }

  function handleLogout() {
    socketRef.current?.disconnect();
    setUser(null);
    setPage("landing");
    setNotes([]);
  }

  // ── Preset loader ─────────────────────────────────────────
  const handleLoadPreset = useCallback((text, roleKey) => {
    setMode(roleKey === "student" ? "student" : "employee");
    setSource("scribble");
    setInputText(text);
  }, []);

  // ── Generate ──────────────────────────────────────────────
  const handleGenerate = useCallback(() => {
    const socket = socketRef.current;
    setNotes([]);
    setError(null);
    setStatusMsg(null);
    setGenerating(true);

    const emit = () => {
      socket.emit("select-role", { role: mode, userId: user?.id });
      if (source === "video") {
        if (!youtubeUrl.trim()) { setError("Please enter a YouTube URL."); setGenerating(false); return; }
        setTimeout(() => socket.emit("incoming-audio-stream", { text: "", isYoutube: true, youtubeUrl: youtubeUrl.trim() }), 150);
      } else {
        const text = inputText.trim();
        if (!text) { setError("Please enter some text."); setGenerating(false); return; }
        setTimeout(() => socket.emit("incoming-audio-stream", { text }), 150);
      }
    };

    if (!socket.connected) { socket.connect(); socket.once("connect", emit); }
    else emit();
  }, [mode, source, inputText, youtubeUrl, user]);

  // ── Page router ───────────────────────────────────────────
  if (page === "landing") return <LandingPage onNavigate={setPage} />;
  if (page === "login" || page === "signup") return <AuthPage mode={page} onNavigate={setPage} onAuth={handleAuth} backendUrl={BACKEND} />;
  if (page === "workspace-select") return (
    <WorkspaceSelect
      user={user}
      backendUrl={BACKEND}
      onSelect={(selectedMode) => {
        setMode(selectedMode);
        if (selectedMode === "employee") {
          setSource("scribble");
        }
        setNotes([]);
        setInputText("");
        setYoutubeUrl("");
        setPage("app");
      }}
      onResumeSession={(session) => {
        setMode(session.role);
        setNotes(session.notes || []);
        if (session.role === "employee") {
          setSource("scribble");
        }
        setInputText("");
        setYoutubeUrl("");
        setPage("app");
      }}
      onLogout={handleLogout}
    />
  );

  // ── Main app ──────────────────────────────────────────────
  const eyebrow = mode === "student" ? "General lecture notes" : "Meeting summary";

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Caveat:wght@400;600;700&display=swap');
      `}</style>

      <Sidebar
        mode={mode} setMode={setMode}
        source={source} setSource={setSource}
        inputText={inputText} setInputText={setInputText}
        youtubeUrl={youtubeUrl} setYoutubeUrl={setYoutubeUrl}
        onGenerate={handleGenerate}
        onLoadPreset={handleLoadPreset}
        generating={generating}
        user={user}
        onLogout={handleLogout}
        onSwitchWorkspace={() => setPage("workspace-select")}
        notes={notes}
      />

      <main className="flex flex-col flex-1 overflow-hidden">
        <TopBar mode={mode} activeTab={activeTab} setActiveTab={setActiveTab} connected={connected} />

        <div className="px-6 pt-5 pb-1 flex-shrink-0">
          <p className="text-xs font-medium tracking-widest uppercase flex items-center gap-1.5"
            style={{ color: mode === "student" ? "#ffffff" : "#60a5fa" }}>
            <span style={{ fontSize: 14 }}>◈</span>
            {eyebrow}
          </p>
        </div>

        {statusMsg && !error && (
          <div className="mx-6 mt-2 px-4 py-3 rounded-lg text-sm flex-shrink-0 flex items-center gap-2"
            style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}>
            <span className="animate-pulse">⏳</span> {statusMsg}
          </div>
        )}

        {error && (
          <div className="mx-6 mt-2 px-4 py-3 rounded-lg text-sm flex-shrink-0"
            style={{ background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
            ⚠️ {error}
          </div>
        )}

        <div className="flex flex-col flex-1 overflow-hidden">
          {mode === "student"
            ? <StudentView notes={notes} activeTab={activeTab} />
            : <EmployeeView notes={notes} activeTab={activeTab} />
          }
        </div>
      </main>
    </div>
  );
}