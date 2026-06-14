import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

import Sidebar      from "./components/Sidebar.jsx";
import TopBar       from "./components/TopBar.jsx";
import StudentView  from "./components/StudentView.jsx";
import EmployeeView from "./components/EmployeeView.jsx";

const BACKEND = "http://localhost:5000";

export default function App() {
  // ── UI state ──────────────────────────────────────────────
  const [mode,         setMode]         = useState("student");
  const [source,       setSource]       = useState("video");
  const [activeTab,    setActiveTab]    = useState("study");
  const [inputText,    setInputText]    = useState("");
  const [youtubeUrl,   setYoutubeUrl]   = useState("");
  const [generating,   setGenerating]   = useState(false);
  const [connected,    setConnected]    = useState(false);
  const [error,        setError]        = useState(null);
  const [statusMsg,    setStatusMsg]    = useState(null);

  // ── Notes state ───────────────────────────────────────────
  const [notes, setNotes] = useState([]);

  // ── Socket ref ────────────────────────────────────────────
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(BACKEND, { autoConnect: false });
    socketRef.current = socket;

    socket.on("connect",    () => { setConnected(true); setError(null); });
    socket.on("disconnect", () => setConnected(false));

    // Transcript status updates (YouTube)
    socket.on("transcript-status", (data) => {
      setStatusMsg(data.message);
    });

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

  // ── Load a demo preset ────────────────────────────────────
  const handleLoadPreset = useCallback((text, roleKey) => {
    setMode(roleKey === "student" ? "student" : "employee");
    setSource("scribble");
    setInputText(text);
  }, []);

  // ── Generate notes ────────────────────────────────────────
  const handleGenerate = useCallback(() => {
    const socket = socketRef.current;

    setNotes([]);
    setError(null);
    setStatusMsg(null);
    setGenerating(true);

    const emit = () => {
      socket.emit("select-role", mode);

      if (source === "video") {
        if (!youtubeUrl.trim()) {
          setError("Please enter a YouTube URL.");
          setGenerating(false);
          return;
        }
        setTimeout(() => socket.emit("incoming-audio-stream", {
          text:       "",
          isYoutube:  true,
          youtubeUrl: youtubeUrl.trim(),
        }), 150);
      } else {
        const text = inputText.trim();
        if (!text) {
          setError("Please enter some text.");
          setGenerating(false);
          return;
        }
        setTimeout(() => socket.emit("incoming-audio-stream", { text }), 150);
      }
    };

    if (!socket.connected) {
      socket.connect();
      socket.once("connect", emit);
    } else {
      emit();
    }
  }, [mode, source, inputText, youtubeUrl]);

  // ── Eyebrow label ─────────────────────────────────────────
  const eyebrow = mode === "student"
    ? "General lecture notes"
    : "Meeting summary";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0d1117" }}>

      {/* ── Sidebar ────────────────────────────────────────── */}
      <Sidebar
        mode={mode}             setMode={setMode}
        source={source}         setSource={setSource}
        inputText={inputText}   setInputText={setInputText}
        youtubeUrl={youtubeUrl} setYoutubeUrl={setYoutubeUrl}
        onGenerate={handleGenerate}
        onLoadPreset={handleLoadPreset}
        generating={generating}
      />

      {/* ── Main panel ─────────────────────────────────────── */}
      <main className="flex flex-col flex-1 overflow-hidden">
        <TopBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          connected={connected}
        />

        {/* Eyebrow */}
        <div className="px-6 pt-5 pb-1 flex-shrink-0">
          <p className="text-xs font-medium tracking-widest uppercase flex items-center gap-1.5"
            style={{ color: "#10b981" }}>
            <span style={{ fontSize: 14 }}>◈</span>
            {eyebrow}
          </p>
        </div>

        {/* ── Status banner (YouTube transcript progress) ───── */}
        {statusMsg && !error && (
          <div className="mx-6 mt-2 px-4 py-3 rounded-lg text-sm flex-shrink-0 flex items-center gap-2"
            style={{ background: "rgba(55,138,221,0.1)", border: "1px solid rgba(55,138,221,0.3)", color: "#378add" }}>
            <span className="animate-pulse">⏳</span>
            {statusMsg}
          </div>
        )}

        {/* ── Error banner ───────────────────────────────────── */}
        {error && (
          <div className="mx-6 mt-2 px-4 py-3 rounded-lg text-sm flex-shrink-0"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {mode === "student"
            ? <StudentView  notes={notes} activeTab={activeTab} />
            : <EmployeeView notes={notes} />
          }
        </div>
      </main>

    </div>
  );
}