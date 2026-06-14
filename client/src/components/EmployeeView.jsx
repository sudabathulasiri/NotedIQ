import { useState } from "react";
import NoteBlock from "./NoteBlock.jsx";
import { Briefcase, ListChecks, FileText, LayoutGrid } from "lucide-react";
import { COLORS, PRIORITY_META, FONT_IMPORT } from "./theme.js";
import { exportToPDF, exportToWord } from "../utils/exportUtils.js";

function todayLabel() {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function PanelHeader({ Icon, label, right }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        borderBottom: "0.5px solid rgba(255,255,255,0.07)",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon size={15} color="rgba(255,255,255,0.4)" />
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)",
          fontFamily: "'Inter', sans-serif",
        }}>
          {label}
        </span>
      </div>
      {right}
    </div>
  );
}

function EmptyPanelNote({ text }) {
  return (
    <p style={{
      fontSize: 15,
      textAlign: "center",
      marginTop: 40,
      color: "rgba(255,255,255,0.2)",
      fontFamily: "'Inter', sans-serif",
    }}>
      {text}
    </p>
  );
}

/* ── OVERVIEW: two-column dashboard ─────────────────────── */
function Overview({ decisions, tasks, checkedTasks, toggleTask, doneCnt, banner }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 20, background: "#000", position: "relative" }}>
      {/* Ambient grid */}
      {[33, 66].map(p => (
        <div key={p} style={{ position: "fixed", left: `${p}%`, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />
      ))}
      {[50].map(p => (
        <div key={p} style={{ position: "fixed", top: `${p}%`, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />
      ))}

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
        maxWidth: 1100,
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
        fontFamily: "'Inter', sans-serif",
      }}>
        {/* Left: Minutes of Meeting */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{
            borderRadius: 12,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            flex: 1,
            background: "rgba(255,255,255,0.03)",
            border: "0.5px solid rgba(255,255,255,0.08)",
          }}>
            <PanelHeader
              Icon={Briefcase}
              label={banner ? banner.content : "Minutes of meeting"}
              right={
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.28)", fontFamily: "'Inter', sans-serif" }}>{todayLabel()}</span>
                  <button className="emp-btn" onClick={() => exportToPDF(decisions, banner ? banner.content : "Minutes of Meeting")} title="Export PDF">📥 PDF</button>
                </div>
              }
            />
            <div style={{ padding: 16, overflowY: "auto", minHeight: 400 }}>
              {decisions.length === 0
                ? <EmptyPanelNote text="No decisions detected yet." />
                : decisions.map((block, i) => <NoteBlock key={i} block={block} />)}
            </div>
          </div>
        </div>

        {/* Right: Action items */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{
            borderRadius: 12,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            flex: 1,
            background: "rgba(255,255,255,0.03)",
            border: "0.5px solid rgba(255,255,255,0.08)",
          }}>
            <PanelHeader
              Icon={ListChecks}
              label="Action items"
              right={
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#60a5fa", fontFamily: "'Inter', sans-serif" }}>
                    {doneCnt}/{tasks.length} done
                  </span>
                  <button className="emp-btn" onClick={() => exportToPDF(tasks, banner ? `${banner.content} - Action Items` : "Action Items")} title="Export PDF">📥 PDF</button>
                </div>
              }
            />
            <div style={{ padding: 16, overflowY: "auto", minHeight: 400 }}>
              {tasks.length === 0
                ? <EmptyPanelNote text="No action items detected yet." />
                : tasks.map((block, i) => (
                  <NoteBlock
                    key={i}
                    block={block}
                    checked={checkedTasks.has(i)}
                    onToggle={() => toggleTask(i)}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── MINUTES: full-width formal record ──────────────────── */
function MinutesPanel({ decisions, banner }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px", background: "#000", position: "relative" }}>
      {/* Ambient grid */}
      {[25, 50, 75].map(p => (
        <div key={p} style={{ position: "fixed", left: `${p}%`, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />
      ))}

      <div style={{ maxWidth: 640, margin: "0 auto", fontFamily: "'Inter', sans-serif", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: "0.5px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <p style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)",
              marginBottom: 10,
              fontFamily: "'Inter', sans-serif",
            }}>
              Official record
            </p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: 38,
              color: "#fff",
              letterSpacing: "-0.5px",
              lineHeight: 1.1,
            }}>
              {banner ? banner.content : "Minutes of meeting"}
            </h1>
            <p style={{ fontSize: 15, marginTop: 8, color: "rgba(255,255,255,0.35)" }}>{todayLabel()}</p>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
            <button className="emp-btn" onClick={() => exportToPDF(decisions, banner ? banner.content : "Minutes of Meeting")}>
              <span>📥</span> Export PDF
            </button>
          </div>
        </div>

        {decisions.length === 0
          ? <EmptyPanelNote text="No decisions detected yet." />
          : decisions.map((block, i) => <NoteBlock key={i} block={block} />)}
      </div>
    </div>
  );
}

/* ── ACTIONS: priority-sorted matrix ────────────────────── */
function ActionMatrix({ tasks, checkedTasks, toggleTask, doneCnt, banner }) {
  const groups = { high: [], medium: [], low: [] };
  tasks.forEach((task, idx) => {
    const p = (task.priority || "medium").toLowerCase();
    (groups[p] || groups.medium).push({ task, idx });
  });

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 20, background: "#000", position: "relative" }}>
      {/* Ambient grid */}
      {[33, 66].map(p => (
        <div key={p} style={{ position: "fixed", left: `${p}%`, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />
      ))}

      <div style={{ maxWidth: 1100, margin: "0 auto", fontFamily: "'Inter', sans-serif", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <p style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)",
              marginBottom: 8,
              fontFamily: "'Inter', sans-serif",
            }}>
              Priority matrix
            </p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontWeight: 900,
              fontSize: 32,
              color: "#fff",
              letterSpacing: "-0.5px",
            }}>
              Action items
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {tasks.length > 0 && (
              <span style={{ fontSize: 15, fontWeight: 700, color: "#60a5fa", fontFamily: "'Inter', sans-serif" }}>
                {doneCnt}/{tasks.length} done
              </span>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="emp-btn" onClick={() => exportToPDF(tasks, banner ? `${banner.content} - Action Items` : "Action Items")}>
                <span>📥</span> Export PDF
              </button>
            </div>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div style={{ borderRadius: 12, padding: 40, background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
            <EmptyPanelNote text="No action items detected yet." />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {["high", "medium", "low"].map(level => {
              const meta = PRIORITY_META[level];
              const items = groups[level];
              return (
                <div
                  key={level}
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    background: "rgba(255,255,255,0.03)",
                    border: "0.5px solid rgba(255,255,255,0.08)",
                    minHeight: 240,
                  }}
                >
                  <div style={{
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                    borderBottom: "0.5px solid rgba(255,255,255,0.07)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: meta.accent, display: "inline-block" }} />
                      <span style={{
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: meta.accent,
                        fontFamily: "'Inter', sans-serif",
                      }}>
                        {meta.label}
                      </span>
                    </div>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.28)", fontFamily: "'Inter', sans-serif" }}>{items.length}</span>
                  </div>
                  <div style={{ padding: 12, flex: 1 }}>
                    {items.length === 0
                      ? <p style={{ fontSize: 14, textAlign: "center", marginTop: 32, color: "rgba(255,255,255,0.18)", fontFamily: "'Inter', sans-serif" }}>Nothing here</p>
                      : items.map(({ task, idx }) => (
                        <NoteBlock
                          key={idx}
                          block={task}
                          checked={checkedTasks.has(idx)}
                          onToggle={() => toggleTask(idx)}
                        />
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── EXPORT ──────────────────────────────────────────────── */
export default function EmployeeView({ notes, activeTab = "overview" }) {
  const [checkedTasks, setCheckedTasks] = useState(new Set());

  const banner = notes.find(b => b.type === "banner-title");
  const decisions = notes.filter(b => b.type === "decision");
  const tasks = notes.filter(b => b.type === "task-item");

  const toggleTask = (idx) => {
    setCheckedTasks(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const doneCnt = tasks.filter((_, i) => checkedTasks.has(i)).length;

  if (notes.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: "#000", position: "relative", overflow: "hidden" }}>
        <style>{`${FONT_IMPORT}`}</style>

        {/* Ambient grid */}
        {[25, 50, 75].map(p => (
          <div key={p} style={{ position: "absolute", left: `${p}%`, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />
        ))}
        {[33, 66].map(p => (
          <div key={p} style={{ position: "absolute", top: `${p}%`, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />
        ))}

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Briefcase size={26} style={{ color: "rgba(255,255,255,0.2)" }} />
          </div>
          <p style={{ fontSize: 17, fontWeight: 600, color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', sans-serif" }}>
            No meeting data yet
          </p>
          <p style={{ fontSize: 15, textAlign: "center", maxWidth: 320, lineHeight: 1.7, color: "rgba(255,255,255,0.22)", fontFamily: "'Inter', sans-serif" }}>
            Paste meeting notes, then hit{" "}
            <span style={{ color: "#60a5fa" }}>Generate smart notes</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        ${FONT_IMPORT}
        .emp-btn {
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 11px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .emp-btn:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
          border-color: rgba(255,255,255,0.25);
        }
      `}</style>
      {activeTab === "minutes" && <MinutesPanel decisions={decisions} banner={banner} />}
      {activeTab === "actions" && (
        <ActionMatrix tasks={tasks} checkedTasks={checkedTasks} toggleTask={toggleTask} doneCnt={doneCnt} banner={banner} />
      )}
      {(activeTab === "overview" || !activeTab) && (
        <Overview decisions={decisions} tasks={tasks} checkedTasks={checkedTasks} toggleTask={toggleTask} doneCnt={doneCnt} banner={banner} />
      )}
    </>
  );
}