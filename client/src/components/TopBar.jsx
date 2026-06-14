import { useEffect } from "react";
import { BookOpen, Lightbulb, Puzzle, LayoutGrid, FileText, ListChecks } from "lucide-react";

/**
 * Each mode gets its own tab set — Student and Corporate workspaces
 * show fundamentally different artifacts, so they no longer share tabs.
 */
const TABS_STUDENT = [
  { key: "study", label: "Study guide", Icon: BookOpen },
  { key: "concepts", label: "Core concepts", Icon: Lightbulb },
  { key: "riddles", label: "Logic riddles", Icon: Puzzle },
];

const TABS_EMPLOYEE = [
  { key: "overview", label: "Overview", Icon: LayoutGrid },
  { key: "minutes", label: "Minutes of meeting", Icon: FileText },
  { key: "actions", label: "Action items", Icon: ListChecks },
];

export default function TopBar({ mode, activeTab, setActiveTab, connected }) {
  const TABS = mode === "employee" ? TABS_EMPLOYEE : TABS_STUDENT;

  // If the mode switches and the current tab doesn't exist in the new
  // mode's tab set, fall back to that mode's first tab.
  useEffect(() => {
    if (!TABS.some(t => t.key === activeTab)) {
      setActiveTab(TABS[0].key);
    }
  }, [mode]);

  const modeColor = mode === "employee" ? "#60a5fa" : "#10b981";

  return (
    <header
      style={{
        height: 72,
        borderBottom: "0.5px solid rgba(255,255,255,0.07)",
        background: "#000",
        display: "flex",
        alignItems: "center",
        paddingLeft: 24,
        paddingRight: 24,
        gap: 8,
        flexShrink: 0,
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&display=swap');

        .tb-mode-label {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          padding-right: 18px;
          margin-right: 8px;
          border-right: 0.5px solid rgba(255,255,255,0.08);
          font-family: 'Inter', sans-serif;
          flex-shrink: 0;
        }

        .tb-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 600;
          letter-spacing: 0.01em;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          border: 0.5px solid transparent;
          background: transparent;
          color: rgba(255,255,255,0.32);
        }
        .tb-tab:hover:not(.tb-tab-active) {
          color: rgba(255,255,255,0.65);
          background: rgba(255,255,255,0.03);
        }
        .tb-tab-active {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.12);
          color: #fff;
        }

        /* Subtle glow line on bottom of active tab */
        .tb-tab-active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 1px;
          background: var(--tb-accent, #10b981);
          opacity: 0.6;
          border-radius: 1px;
        }
        .tb-tab { position: relative; }
      `}</style>

      {/* Mode eyebrow label */}
      <span className="tb-mode-label" style={{ "--tb-accent": modeColor }}>
        {mode === "employee" ? "Corporate" : "Student"}
      </span>

      {/* Tabs */}
      {TABS.map(({ key, label, Icon }) => {
        const active = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`tb-tab${active ? " tb-tab-active" : ""}`}
            style={{ "--tb-accent": modeColor }}
          >
            <Icon size={19} color={active ? "#fff" : "rgba(255,255,255,0.32)"} />
            {label}
          </button>
        );
      })}
    </header>
  );
}