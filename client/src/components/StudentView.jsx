import NoteBlock from "./NoteBlock.jsx";
import { Book, Brain, Puzzle } from "lucide-react";
import NotebookView from "./NotebookView.jsx";
import { useState } from "react";

export default function StudentView({ notes, activeTab }) {

  // ── Empty state ───────────────────────────────────────────
  if (notes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3"
        style={{ color: "#484f58" }}>
        <Book size={36} />
        <p className="text-sm font-medium" style={{ color: "#6e7681" }}>No notes yet</p>
        <p className="text-xs text-center max-w-xs leading-relaxed" style={{ color: "#484f58" }}>
          Load a preset or paste your own transcript, then hit{" "}
          <span style={{ color: "#10b981" }}>Generate smart notes</span>.
        </p>
      </div>
    );
  }

  // ── Study Guide tab: notebook canvas ─────────────────────
  if (activeTab === "study") {
    return <NotebookView notes={notes} activeTab={activeTab} />;
  }

  // ── Core Concepts tab ─────────────────────────────────────
  if (activeTab === "concepts") {
    const headings    = notes.filter(b => b.type === "heading");
    const definitions = notes.filter(b => b.type === "definition");
    const examples    = notes.filter(b => b.type === "example");

    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-8">

          {/* Topics */}
          {headings.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: "#378add", fontSize: 16 }}>📌</span>
                <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#378add" }}>
                  Topics Covered
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {headings.map((block, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{
                      background: "rgba(55,138,221,0.12)",
                      border: "1px solid rgba(55,138,221,0.3)",
                      color: "#378add",
                    }}>
                    {block.content}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Definitions */}
          {definitions.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span style={{ fontSize: 16 }}>📖</span>
                <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#10b981" }}>
                  Key Definitions
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                {definitions.map((block, i) => {
                  // Try to split "Term: definition" format
                  const colonIdx = block.content.indexOf(":");
                  const term = colonIdx > -1 ? block.content.slice(0, colonIdx).trim() : null;
                  const body = colonIdx > -1 ? block.content.slice(colonIdx + 1).trim() : block.content;

                  return (
                    <div key={i} className="rounded-lg p-4"
                      style={{
                        background: "#111620",
                        border: "1px solid rgba(16,185,129,0.2)",
                      }}>
                      {term && (
                        <p className="text-xs font-bold uppercase tracking-widest mb-1"
                          style={{ color: "#10b981" }}>
                          {term}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed" style={{ color: "#c9d1d9" }}>
                        {body}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Examples */}
          {examples.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span style={{ fontSize: 16 }}>💡</span>
                <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#7f77dd" }}>
                  Examples
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                {examples.map((block, i) => (
                  <div key={i} className="rounded-lg p-4"
                    style={{
                      background: "#111620",
                      border: "1px solid rgba(127,119,221,0.2)",
                    }}>
                    <p className="text-sm leading-relaxed" style={{ color: "#c9d1d9" }}>
                      {block.content}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {definitions.length === 0 && headings.length === 0 && (
            <p className="text-sm text-center mt-8" style={{ color: "#6e7681" }}>
              No concepts found. Generate notes first.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Logic Riddles tab: interactive quiz ───────────────────
  if (activeTab === "riddles") {
    return <RiddleQuiz notes={notes} />;
  }

  return null;
}

// ── Riddle Quiz component ─────────────────────────────────────────────────────
function RiddleQuiz({ notes }) {
  const riddles   = notes.filter(b => b.type === "riddle");
  const examAlerts = notes.filter(b => b.type === "exam-alert");

  const [revealed,  setRevealed]  = useState({});
  const [score,     setScore]     = useState(0);
  const [answered,  setAnswered]  = useState({});

  function extractAnswer(content) {
    const match = content.match(/\[Answer:\s*(.*?)\]/i);
    return match ? match[1].trim() : null;
  }

  function extractQuestion(content) {
    return content.replace(/\[Answer:.*?\]/gi, "").trim();
  }

  function handleReveal(i) {
    if (!answered[i]) {
      setScore(s => s + 1);
      setAnswered(prev => ({ ...prev, [i]: true }));
    }
    setRevealed(prev => ({ ...prev, [i]: true }));
  }

  const total = riddles.length;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* Score bar */}
        {total > 0 && (
          <div className="rounded-xl p-4 flex items-center justify-between"
            style={{
              background: "#111620",
              border: "1px solid rgba(255,255,255,0.07)",
            }}>
            <div className="flex items-center gap-2">
              <Brain size={16} style={{ color: "#7f77dd" }} />
              <span className="text-sm font-medium" style={{ color: "#c9d1d9" }}>
                Quiz Progress
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full overflow-hidden h-2 w-32"
                style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${total > 0 ? (score / total) * 100 : 0}%`,
                    background: "linear-gradient(to right, #7f77dd, #10b981)",
                  }} />
              </div>
              <span className="text-xs font-bold" style={{ color: "#10b981" }}>
                {score}/{total}
              </span>
            </div>
          </div>
        )}

        {/* Riddle cards */}
        {riddles.length === 0 ? (
          <p className="text-sm text-center mt-8" style={{ color: "#6e7681" }}>
            No riddles found. Generate notes from a longer topic to get quiz questions.
          </p>
        ) : (
          riddles.map((block, i) => {
            const answer   = extractAnswer(block.content);
            const question = extractQuestion(block.content);
            const isOpen   = revealed[i];

            return (
              <div key={i} className="rounded-xl overflow-hidden"
                style={{
                  border: isOpen
                    ? "1px solid rgba(16,185,129,0.35)"
                    : "1px solid rgba(255,255,255,0.07)",
                  background: "#111620",
                  transition: "border 0.3s",
                }}>

                {/* Question */}
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">🧩</span>
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase tracking-widest mb-2"
                        style={{ color: "#7f77dd" }}>
                        Riddle {i + 1}
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: "#c9d1d9" }}>
                        {question}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reveal button / Answer */}
                <div className="px-5 pb-5">
                  {!isOpen ? (
                    <button
                      onClick={() => handleReveal(i)}
                      className="w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                      style={{
                        background: "rgba(127,119,221,0.12)",
                        border: "1px solid rgba(127,119,221,0.3)",
                        color: "#7f77dd",
                        cursor: "pointer",
                      }}>
                      Reveal Answer ✨
                    </button>
                  ) : (
                    <div className="rounded-lg px-4 py-3"
                      style={{
                        background: "rgba(16,185,129,0.08)",
                        border: "1px solid rgba(16,185,129,0.25)",
                      }}>
                      <p className="text-xs font-bold uppercase tracking-widest mb-1"
                        style={{ color: "#10b981" }}>
                        Answer
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: "#c9d1d9" }}>
                        {answer || "See explanation above."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Exam Alerts section */}
        {examAlerts.length > 0 && (
          <section className="mt-2">
            <div className="flex items-center gap-2 mb-3">
              <span style={{ fontSize: 16 }}>⚠️</span>
              <h2 className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#ef9f27" }}>
                Exam Alerts
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {examAlerts.map((block, i) => (
                <div key={i} className="rounded-lg p-4"
                  style={{
                    background: "rgba(239,159,39,0.07)",
                    border: "1px solid rgba(239,159,39,0.25)",
                  }}>
                  <p className="text-sm leading-relaxed" style={{ color: "#c9d1d9" }}>
                    {block.content}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Perfect score celebration */}
        {total > 0 && score === total && (
          <div className="rounded-xl p-5 text-center"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.3)",
            }}>
            <p className="text-2xl mb-1">🎉</p>
            <p className="text-sm font-bold" style={{ color: "#10b981" }}>
              Perfect score! You nailed all {total} riddles.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}