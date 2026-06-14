import { Brain, School, Briefcase, Pencil, Mic, Video, Zap, Sparkles } from "lucide-react";

const PRESETS = {
  student: {
    icon: <School size={13} />,
    title: "Load MERN Lecture",
    sub: '"MERN stack Express routing..."',
    text: "MERN stack Express routing middleware connects HTTP verbs to handler functions. React hooks useState and useEffect manage component lifecycle. MongoDB codebase stores documents in collections.",
  },
  employee: {
    icon: <Briefcase size={13} />,
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
}) {
  const sources = [
    { key: "scribble", label: "Scribble", icon: <Pencil size={13} /> },
    { key: "audio",    label: "Audio",    icon: <Mic size={13} />    },
    { key: "video",    label: "Video",    icon: <Video size={13} />   },
  ];

  return (
    <aside className="w-64 min-w-64 flex flex-col gap-5 p-4"
      style={{ background: "#111620", borderRight: "0.5px solid rgba(255,255,255,0.07)" }}>

      {/* Brand */}
      <div className="flex items-center gap-3 pb-4"
        style={{ borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "#10b981" }}>
          <Brain size={18} color="#fff" />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: "#f0f6fc" }}>NotedIQ</p>
          <p className="text-xs" style={{ color: "#6e7681" }}>Microsoft IQ Intelligence Layer</p>
        </div>
      </div>

      {/* Mode toggle */}
      <div>
        <p className="text-xs font-medium mb-2 tracking-widest uppercase" style={{ color: "#6e7681" }}>Mode</p>
        <div className="flex p-0.5 rounded-lg gap-0.5" style={{ background: "#0d1117" }}>
          {[
            { key: "student",   label: "Student",   Icon: School    },
            { key: "employee",  label: "Corporate", Icon: Briefcase },
          ].map(({ key, label, Icon }) => (
            <button key={key}
              onClick={() => setMode(key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{
                background: mode === key ? "#10b981" : "transparent",
                color:      mode === key ? "#fff"    : "#6e7681",
                border: "none", cursor: "pointer",
              }}>
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Input source */}
      <div>
        <p className="text-xs font-medium mb-2 tracking-widest uppercase" style={{ color: "#6e7681" }}>Input source</p>
        <div className="flex gap-1">
          {sources.map(({ key, label, icon }) => (
            <button key={key}
              onClick={() => setSource(key)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{
                background:  source === key ? "rgba(16,185,129,0.12)" : "transparent",
                color:       source === key ? "#10b981"               : "#6e7681",
                border:      source === key ? "0.5px solid rgba(16,185,129,0.35)" : "0.5px solid rgba(255,255,255,0.08)",
                cursor: "pointer",
              }}>
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* URL input (video mode) */}
      {source === "video" && (
        <input
          className="w-full text-xs rounded-lg px-3 py-2 outline-none"
          style={{
            background:  "#0d1117",
            border:      "0.5px solid rgba(255,255,255,0.1)",
            color:       "#c9d1d9",
          }}
          placeholder="https://youtu.be/..."
          value={youtubeUrl}
          onChange={e => setYoutubeUrl(e.target.value)}
        />
      )}

      {/* Text area (scribble / audio) */}
      {source !== "video" && (
        <textarea
          className="w-full text-xs rounded-lg px-3 py-2 outline-none resize-none font-mono"
          style={{
            background: "#0d1117",
            border:     "0.5px solid rgba(255,255,255,0.1)",
            color:      "#c9d1d9",
            height:     100,
          }}
          placeholder={source === "audio"
            ? "Paste transcript or speak using microphone..."
            : "Paste your handwritten / typed notes here..."}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
        />
      )}

      {/* Presets */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Zap size={11} color="#ef9f27" />
          <p className="text-xs font-medium tracking-widest uppercase" style={{ color: "#6e7681" }}>
            Hackathon demo presets
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button key={key}
              onClick={() => onLoadPreset(preset.text, key)}
              className="text-left rounded-lg px-3 py-2 transition-all"
              style={{
                background: "#0d1117",
                border:     "0.5px solid rgba(255,255,255,0.07)",
                cursor:     "pointer",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(16,185,129,0.3)";
                e.currentTarget.style.background  = "rgba(16,185,129,0.04)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.background  = "#0d1117";
              }}>
              <div className="flex items-center gap-2 mb-0.5">
                <span style={{ color: "#10b981" }}>{preset.icon}</span>
                <span className="text-xs font-medium" style={{ color: "#c9d1d9" }}>{preset.title}</span>
              </div>
              <p className="text-xs font-mono truncate pl-5" style={{ color: "#484f58" }}>{preset.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={onGenerate}
        disabled={generating}
        className="mt-auto flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
        style={{
          background: generating ? "#0d9e72aa" : "#10b981",
          color:      "#fff",
          border:     "none",
          cursor:     generating ? "not-allowed" : "pointer",
        }}>
        <Sparkles size={15} />
        {generating ? "Generating..." : "Generate smart notes via Microsoft IQ"}
      </button>
    </aside>
  );
}
