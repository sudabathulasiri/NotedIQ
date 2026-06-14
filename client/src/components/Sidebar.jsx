import { useState, useRef, useEffect } from "react";
import { Brain, School, Briefcase, Pencil, Mic, Video, Zap, Sparkles, LogOut, User, Upload } from "lucide-react";
import { tint } from "./theme.js";

const PRESETS = {
  student: {
    icon: <School size={15} />,
    title: "Load MERN Lecture",
    sub: '"MERN stack Express routing..."',
    text: "MERN stack Express routing middleware connects HTTP verbs to handler functions. React hooks useState and useEffect manage component lifecycle. MongoDB codebase stores documents in collections.",
  },
  employee: {
    icon: <Briefcase size={15} />,
    title: "Load Alpha Meeting",
    sub: '"Project Alpha architecture..."',
    text: "The team decided to proceed with the microservices architecture. John will complete the API gateway design by end of week. Sarah should follow up on the KPI dashboard before Monday. We agreed the break even analysis shows positive ROI by Q4.",
  },
};

export default function Sidebar({
  mode, setMode,
  source, setSource,
  inputText, setInputText,
  youtubeUrl, setYoutubeUrl,
  onGenerate,
  onLoadPreset,
  generating,
  user,
  onLogout,
  onSwitchWorkspace,
  notes = [],
}) {
  const sources = [
    { key: "scribble", label: "Scribble", icon: <Pencil size={15} /> },
    { key: "audio", label: "Audio", icon: <Mic size={15} /> },
    ...(mode === "student" ? [{ key: "video", label: "Video", icon: <Video size={15} /> }] : []),
  ];

  // Scribble Upload State
  const scribbleInputRef = useRef(null);
  const [scribbleLoading, setScribbleLoading] = useState(false);

  // Audio Upload & Recorder State
  const audioInputRef = useRef(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      } catch (e) {
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || "audio/webm" });
        setAudioLoading(true);
        setInputText("");

        const file = new File([audioBlob], `recording_${Date.now()}.webm`, { type: audioBlob.type });
        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch("http://localhost:5000/api/upload/audio", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (res.ok && data.text) {
            setInputText(data.text);
          } else {
            alert(data.message || "Failed to transcribe recording.");
          }
        } catch (err) {
          console.error(err);
          alert("Error transcribing recording.");
        } finally {
          setAudioLoading(false);
        }
      };

      mediaRecorder.start(250);
      setRecording(true);
      setRecordTime(0);

      timerRef.current = setInterval(() => {
        setRecordTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleScribbleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScribbleLoading(true);
    setInputText("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/api/upload/scribble", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.text) {
        setInputText(data.text);
      } else {
        alert(data.message || "Failed to extract text from file.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file.");
    } finally {
      setScribbleLoading(false);
      if (scribbleInputRef.current) scribbleInputRef.current.value = "";
    }
  };

  const handleAudioFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioLoading(true);
    setInputText("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/api/upload/audio", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.text) {
        setInputText(data.text);
      } else {
        alert(data.message || "Failed to transcribe audio file.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading audio file.");
    } finally {
      setAudioLoading(false);
      if (audioInputRef.current) audioInputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const activeColor = mode === "student" ? "#10b981" : "#60a5fa";

  return (
    <aside
      style={{
        width: 380,
        minWidth: 380,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "24px 20px",
        background: "#000",
        borderRight: "0.5px solid rgba(255,255,255,0.08)",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Caveat:wght@400;600;700&display=swap');

        /* Grid lines ambient */
        .sb-grid-line { position: absolute; background: rgba(255,255,255,0.02); pointer-events: none; }

        .sb-section-label {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          margin-bottom: 10px;
          font-family: 'Inter', sans-serif;
        }
        .sb-source-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 8px;
          border-radius: 8px;
          font-size: 17px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          border: 0.5px solid transparent;
        }
        .sb-source-btn.active {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.14);
          color: #fff;
        }
        .sb-source-btn.inactive {
          background: transparent;
          border-color: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.35);
        }
        .sb-source-btn.inactive:hover {
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.65);
          border-color: rgba(255,255,255,0.1);
        }
        .sb-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 18px;
          color: #fff;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border 0.2s, background 0.2s;
          resize: none;
        }
        .sb-input::placeholder { color: rgba(255,255,255,0.2); }
        .sb-input:focus {
          border-color: rgba(255,255,255,0.28);
          background: rgba(255,255,255,0.06);
        }
        .sb-upload-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          color: rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.1);
          cursor: pointer;
          transition: all 0.15s;
        }
        .sb-upload-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.8);
          border-color: rgba(255,255,255,0.2);
        }
        .sb-upload-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .sb-record-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 17px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          border: 0.5px solid;
        }
        .sb-record-live {
          color: #f87171;
          background: rgba(239,68,68,0.06);
          border-color: rgba(239,68,68,0.2);
        }
        .sb-record-live:hover:not(:disabled) {
          background: rgba(239,68,68,0.12);
          border-color: rgba(239,68,68,0.35);
        }
        .sb-record-upload {
          color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.1);
        }
        .sb-record-upload:hover:not(:disabled) {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.8);
          border-color: rgba(255,255,255,0.2);
        }
        .sb-record-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .sb-switch-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 17px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.08);
          cursor: pointer;
          transition: all 0.15s;
          letter-spacing: 0.03em;
        }
        .sb-switch-btn:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.16);
          color: rgba(255,255,255,0.7);
        }

        .sb-generate-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px;
          border-radius: 10px;
          font-size: 18px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: #10b981;
          color: #000;
        }
        .sb-generate-btn:hover:not(:disabled) {
          background: #059669;
          box-shadow: 0 8px 24px rgba(16,185,129,0.25);
          transform: translateY(-1px);
        }
        .sb-generate-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .sb-stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 16px;
          color: rgba(255,255,255,0.4);
          padding: 4px 0;
          font-family: 'Inter', sans-serif;
        }

        .sb-logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          color: rgba(255,255,255,0.35);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'Inter', sans-serif;
        }
        .sb-logout-btn:hover {
          color: #f87171;
          background: rgba(239,68,68,0.06);
        }

        .sb-scrollable {
          overflow-y: auto;
          flex: 1;
          margin-bottom: 16px;
          padding-right: 2px;
        }
        .sb-scrollable::-webkit-scrollbar { width: 3px; }
        .sb-scrollable::-webkit-scrollbar-track { background: transparent; }
        .sb-scrollable::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
      `}</style>

      {/* Ambient grid lines */}
      <div className="sb-grid-line" style={{ left: "33%", top: 0, bottom: 0, width: 1 }} />
      <div className="sb-grid-line" style={{ left: "66%", top: 0, bottom: 0, width: 1 }} />
      <div className="sb-grid-line" style={{ top: "50%", left: 0, right: 0, height: 1 }} />

      {/* ── Scrollable top content ── */}
      <div className="sb-scrollable" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
          <div style={{ width: 38, height: 38, background: "#fff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#000", fontSize: 19, fontWeight: 900, fontFamily: "'Playfair Display', serif" }}>N</span>
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>NotedIQ</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.28)", fontWeight: 300 }}>Intelligence Layer</p>
          </div>
        </div>

        {/* Switch Workspace */}
        <div>
          <button className="sb-switch-btn" onClick={onSwitchWorkspace}>
            <span style={{ fontSize: 15, lineHeight: 1 }}>⇠</span>
            Switch Workspace
          </button>
        </div>

        {/* Input source */}
        <div>
          <p className="sb-section-label">Input source</p>
          <div style={{ display: "flex", gap: 6 }}>
            {sources.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setSource(key)}
                className={`sb-source-btn ${source === key ? "active" : "inactive"}`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Video URL */}
        {source === "video" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p className="sb-section-label">Video link</p>
            <input
              className="sb-input"
              placeholder="https://youtu.be/..."
              value={youtubeUrl}
              onChange={e => setYoutubeUrl(e.target.value)}
            />
          </div>
        )}

        {/* Scribble */}
        {source === "scribble" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p className="sb-section-label" style={{ marginBottom: 0 }}>Scribble notes</p>
              <button
                className="sb-upload-btn"
                onClick={() => scribbleInputRef.current?.click()}
                disabled={scribbleLoading}
              >
                <Upload size={12} />
                {scribbleLoading ? "Extracting..." : "Upload file"}
              </button>
              <input
                type="file"
                ref={scribbleInputRef}
                onChange={handleScribbleUpload}
                accept=".txt,.pdf,.jpg,.jpeg,.png"
                style={{ display: "none" }}
              />
            </div>
            <textarea
              className="sb-input"
              style={{ height: 120, fontFamily: "monospace" }}
              placeholder="Paste your handwritten / typed notes here..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              disabled={scribbleLoading}
            />
          </div>
        )}

        {/* Audio */}
        {source === "audio" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p className="sb-section-label" style={{ marginBottom: 0 }}>Audio input</p>
              {audioLoading && (
                <span style={{ fontSize: 12, color: "#10b981", display: "flex", alignItems: "center", gap: 5, fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, border: "1.5px solid #10b981", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                  Transcribing…
                </span>
              )}
            </div>

            {!recording ? (
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  className="sb-record-btn sb-record-live"
                  onClick={startRecording}
                  disabled={audioLoading}
                >
                  <Mic size={14} />
                  Record {mode === "student" ? "Class" : "Meeting"}
                </button>
                <button
                  className="sb-record-btn sb-record-upload"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={audioLoading}
                >
                  <Upload size={14} />
                  Upload
                </button>
                <input
                  type="file"
                  ref={audioInputRef}
                  onChange={handleAudioFileUpload}
                  accept="audio/*"
                  style={{ display: "none" }}
                />
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 8, background: "rgba(239,68,68,0.06)", border: "0.5px solid rgba(239,68,68,0.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "ping 1s ease-in-out infinite" }} />
                  <span style={{ fontSize: 13, color: "#f87171", fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
                    Recording: {formatTime(recordTime)}
                  </span>
                </div>
                <button
                  onClick={stopRecording}
                  style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 5, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
                >
                  Stop
                </button>
              </div>
            )}

            <textarea
              className="sb-input"
              style={{ height: 100, fontFamily: "monospace" }}
              placeholder={audioLoading ? "Transcribing audio content..." : "Transcription will appear here. You can also edit it before generating..."}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              disabled={audioLoading || recording}
            />
          </div>
        )}

        {/* Live Stats */}
        {notes.length > 0 && (
          <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
            <p className="sb-section-label" style={{ marginBottom: 10 }}>Live stats</p>
            {mode === "student" ? (
              <>
                <div className="sb-stat-row">
                  <span>Definitions</span>
                  <span style={{ color: "#10b981", fontWeight: 700, fontSize: 17 }}>{notes.filter(n => n.type === "definition").length}</span>
                </div>
                <div className="sb-stat-row">
                  <span>Examples</span>
                  <span style={{ color: "#3b82f6", fontWeight: 700, fontSize: 17 }}>{notes.filter(n => n.type === "example").length}</span>
                </div>
                <div className="sb-stat-row">
                  <span>Exam Alerts</span>
                  <span style={{ color: "#ef4444", fontWeight: 700, fontSize: 17 }}>{notes.filter(n => n.type === "exam-alert").length}</span>
                </div>
              </>
            ) : (
              <>
                <div className="sb-stat-row">
                  <span>Decisions Made</span>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>{notes.filter(n => n.type === "decision").length}</span>
                </div>
                <div className="sb-stat-row">
                  <span>Action Items</span>
                  <span style={{ color: "#3b82f6", fontWeight: 700, fontSize: 17 }}>{notes.filter(n => n.type === "task-item").length}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom sticky section ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Generate button */}
        <button
          className="sb-generate-btn"
          onClick={onGenerate}
          disabled={generating}
        >
          <Sparkles size={18} />
          {generating ? "Generating…" : "Generate smart notes"}
        </button>

        {/* User profile + logout */}
        {user && (
          <div style={{ paddingTop: 12, borderTop: "0.5px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>{user.name}</p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
              </div>
            </div>
            <button className="sb-logout-btn" onClick={onLogout} title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Keyframe for spin + ping */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ping { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
      `}</style>
    </aside>
  );
}