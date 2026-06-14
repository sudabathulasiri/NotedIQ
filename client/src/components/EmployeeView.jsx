import { useState } from "react";
import NoteBlock from "./NoteBlock.jsx";
import { Briefcase, ListChecks } from "lucide-react";

export default function EmployeeView({ notes }) {
  const [checkedTasks, setCheckedTasks] = useState(new Set());

  const decisions = notes.filter(b => b.type === "decision");
  const tasks     = notes.filter(b => b.type === "task-item");

  const toggleTask = (idx) => {
    setCheckedTasks(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  if (notes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3"
        style={{ color: "#484f58" }}>
        <Briefcase size={36} />
        <p className="text-sm font-medium" style={{ color: "#6e7681" }}>No meeting data yet</p>
        <p className="text-xs text-center max-w-xs leading-relaxed" style={{ color: "#484f58" }}>
          Load the Alpha Meeting preset or paste meeting notes, then hit{" "}
          <span style={{ color: "#10b981" }}>Generate smart notes</span>.
        </p>
      </div>
    );
  }

  const doneCnt = tasks.filter((_, i) => checkedTasks.has(i)).length;

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="grid grid-cols-2 gap-5 max-w-5xl mx-auto h-full">

        {/* ── Left: Minutes of Meeting ── */}
        <div className="flex flex-col" style={{ minHeight: 0 }}>
          <div className="rounded-xl overflow-hidden flex flex-col"
            style={{ border: "1.5px solid #1e293b", boxShadow: "4px 4px 0 #1e293b" }}>
            <div className="px-4 py-2.5 flex items-center justify-between flex-shrink-0"
              style={{ background: "#0f172a" }}>
              <div className="flex items-center gap-2">
                <Briefcase size={13} color="#94a3b8" />
                <span className="text-xs font-semibold uppercase tracking-widest text-white">
                  Minutes of Meeting
                </span>
              </div>
              <span className="text-xs" style={{ color: "#64748b" }}>
                {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            <div className="p-4 overflow-y-auto" style={{ background: "#fff", minHeight: 400 }}>
              {decisions.length === 0
                ? <p className="text-xs text-center mt-10" style={{ color: "#94a3b8" }}>
                    No decisions detected yet.
                  </p>
                : decisions.map((block, i) => <NoteBlock key={i} block={block} />)
              }
            </div>
          </div>
        </div>

        {/* ── Right: Kanban Tasks ── */}
        <div className="flex flex-col" style={{ minHeight: 0 }}>
          <div className="rounded-xl overflow-hidden flex flex-col"
            style={{ border: "1.5px solid #1e293b", boxShadow: "4px 4px 0 #1e293b" }}>
            <div className="px-4 py-2.5 flex items-center justify-between flex-shrink-0"
              style={{ background: "#1e3a5f" }}>
              <div className="flex items-center gap-2">
                <ListChecks size={13} color="#93c5fd" />
                <span className="text-xs font-semibold uppercase tracking-widest text-white">
                  Action items
                </span>
              </div>
              <span className="text-xs" style={{ color: "#93c5fd" }}>
                {doneCnt}/{tasks.length} done
              </span>
            </div>
            <div className="p-4 overflow-y-auto" style={{ background: "#f8fafc", minHeight: 400 }}>
              {tasks.length === 0
                ? <p className="text-xs text-center mt-10" style={{ color: "#94a3b8" }}>
                    No action items detected yet.
                  </p>
                : tasks.map((block, i) => (
                    <NoteBlock
                      key={i}
                      block={block}
                      checked={checkedTasks.has(i)}
                      onToggle={() => toggleTask(i)}
                    />
                  ))
              }
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
