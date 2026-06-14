import { BookOpen, Lightbulb, Puzzle } from "lucide-react";

const TABS = [
  { key: "study",    label: "Study guide",   Icon: BookOpen  },
  { key: "concepts", label: "Core concepts", Icon: Lightbulb },
  { key: "riddles",  label: "Logic riddles", Icon: Puzzle    },
];

export default function TopBar({ activeTab, setActiveTab, connected }) {
  return (
    <header
      className="flex items-center px-5 gap-1 flex-shrink-0"
      style={{
        height:       52,
        borderBottom: "0.5px solid rgba(255,255,255,0.07)",
        background:   "#0d1117",
      }}>
      {TABS.map(({ key, label, Icon }) => {
        const active = activeTab === key;
        return (
          <button key={key}
            onClick={() => setActiveTab(key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            style={{
              background:  active ? "rgba(16,185,129,0.12)" : "transparent",
              color:       active ? "#10b981"               : "#6e7681",
              border:      active ? "0.5px solid rgba(16,185,129,0.25)" : "0.5px solid transparent",
              cursor:      "pointer",
            }}>
            <Icon size={13} />
            {label}
          </button>
        );
      })}

      {/* Status pill */}
      <div className="ml-auto flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: connected ? "#10b981" : "#e24b4a" }}
        />
        <span className="text-xs font-mono" style={{ color: "#6e7681" }}>
          {connected ? "backend:5000" : "disconnected"}
        </span>
      </div>
    </header>
  );
}
