import { AlertTriangle, Info, CheckSquare, Square, FileText } from "lucide-react";

/* ── STUDENT BLOCKS ─────────────────────────────────────── */

function Heading({ content }) {
  return (
    <h2 className="font-caveat text-2xl mb-4 mt-2" style={{ color: "#f0f6fc" }}>
      {content}
    </h2>
  );
}

function Definition({ content }) {
  return (
    <div className="mb-2.5 px-3 py-2.5 rounded-r-lg animate-slide-in"
      style={{ background: "rgba(16,185,129,0.07)", borderLeft: "2px solid #10b981" }}>
      <p className="text-xs font-medium mb-1 tracking-widest uppercase" style={{ color: "#10b981" }}>
        Definition
      </p>
      <p className="text-sm leading-relaxed" style={{ color: "#c9d1d9" }}>{content}</p>
    </div>
  );
}

function Example({ content }) {
  return (
    <div className="mb-2.5 px-3 py-2.5 rounded-r-lg animate-slide-in"
      style={{ background: "rgba(55,138,221,0.07)", borderLeft: "2px solid #378add" }}>
      <p className="text-xs font-medium mb-1 tracking-widest uppercase" style={{ color: "#378add" }}>
        Example
      </p>
      <p className="text-sm leading-relaxed" style={{ color: "#c9d1d9" }}>{content}</p>
    </div>
  );
}

function ExamAlert({ content }) {
  return (
    <div className="mb-2.5 px-3 py-2.5 rounded-lg flex gap-2.5 animate-slide-in"
      style={{
        background: "rgba(239,159,39,0.07)",
        border:     "0.5px dashed rgba(239,159,39,0.4)",
      }}>
      <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" style={{ color: "#ef9f27" }} />
      <div>
        <p className="text-xs font-medium mb-1 tracking-widest uppercase" style={{ color: "#ef9f27" }}>
          Exam alert
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "#c9d1d9" }}>{content}</p>
      </div>
    </div>
  );
}

function Note({ content }) {
  return (
    <div className="mb-2.5 px-3 py-2.5 rounded-r-lg flex gap-2.5 animate-slide-in"
      style={{ background: "rgba(127,119,221,0.07)", borderLeft: "2px solid #7f77dd" }}>
      <Info size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#7f77dd" }} />
      <p className="text-sm leading-relaxed" style={{ color: "#c9d1d9" }}>{content}</p>
    </div>
  );
}

/* ── EMPLOYEE BLOCKS ─────────────────────────────────────── */

function Decision({ content }) {
  return (
    <div className="mb-3 p-3 rounded-lg animate-slide-in"
      style={{
        background:  "#f8fafc",
        border:      "1.5px solid #1e293b",
        boxShadow:   "2px 2px 0 #1e293b",
      }}>
      <p className="text-xs font-semibold mb-1 uppercase tracking-widest" style={{ color: "#64748b" }}>
        Decision
      </p>
      <p className="text-sm leading-relaxed text-slate-800">{content}</p>
    </div>
  );
}

function TaskItem({ content, assignee, checked, onToggle }) {
  return (
    <div
      className="mb-2 p-3 rounded-lg flex items-start gap-2.5 cursor-pointer animate-slide-in transition-all"
      style={{
        background:  checked ? "#f0fdf4" : "#fff",
        border:      `1px solid ${checked ? "#86efac" : "#e2e8f0"}`,
      }}
      onClick={onToggle}>
      {checked
        ? <CheckSquare size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#22c55e" }} />
        : <Square      size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#94a3b8" }} />}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${checked ? "line-through text-slate-400" : "text-slate-700"}`}>
          {content}
        </p>
        <span className="mt-1 inline-block text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: "#dbeafe", color: "#1d4ed8" }}>
          @{assignee || "TBD"}
        </span>
      </div>
    </div>
  );
}

/* ── EXPORT ──────────────────────────────────────────────── */

export default function NoteBlock({ block, checked, onToggle }) {
  switch (block.type) {
    case "heading":    return <Heading   content={block.content} />;
    case "definition": return <Definition content={block.content} />;
    case "example":    return <Example    content={block.content} />;
    case "exam-alert": return <ExamAlert  content={block.content} />;
    case "note":       return <Note       content={block.content} />;
    case "decision":   return <Decision   content={block.content} />;
    case "task-item":  return (
      <TaskItem
        content={block.content}
        assignee={block.assignee}
        checked={checked}
        onToggle={onToggle}
      />
    );
    default: return <Note content={block.content} />;
  }
}
