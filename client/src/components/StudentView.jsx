import NoteBlock from "./NoteBlock.jsx";
import { Book, Brain } from "lucide-react";
import NotebookView from "./NotebookView.jsx";
import { useState } from "react";
import { COLORS, BLOCK_META, FONT_IMPORT } from "./theme.js";
import { triggerConfetti } from "../utils/exportUtils.js";

export default function StudentView({ notes, activeTab }) {

  // ── Empty state ───────────────────────────────────────────
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
            <Book size={26} style={{ color: "rgba(255,255,255,0.2)" }} />
          </div>
          <p style={{ fontSize: 17, fontWeight: 600, color: "rgba(255,255,255,0.45)", fontFamily: "'Inter', sans-serif" }}>
            No notes yet
          </p>
          <p style={{ fontSize: 15, textAlign: "center", maxWidth: 320, lineHeight: 1.7, color: "rgba(255,255,255,0.22)", fontFamily: "'Inter', sans-serif" }}>
            Paste your notes or a transcript, then hit{" "}
            <span style={{ color: COLORS.accent }}>Generate smart notes</span>.
          </p>
        </div>
      </div>
    );
  }

  // ── Study Guide tab: notebook canvas ─────────────────────
  if (activeTab === "study") {
    return <NotebookView notes={notes} activeTab={activeTab} />;
  }

  // ── Core Concepts tab ─────────────────────────────────────
  if (activeTab === "concepts") {
    const headings = notes.filter(b => b.type === "heading" || b.type === "banner-title");
    const definitions = notes.filter(b => b.type === "definition");
    const examples = notes.filter(b => b.type === "example");

    return (
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px", background: "#000", position: "relative" }}>
        <style>{`
          ${FONT_IMPORT}
          .sv-section-eyebrow {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 14px;
          }
          .sv-section-label {
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            font-family: 'Inter', sans-serif;
          }
          .sv-card {
            border-radius: 10px;
            padding: 16px;
            border-left-width: 2px;
            border-left-style: solid;
            border-top: 0.5px solid rgba(255,255,255,0.07);
            border-right: 0.5px solid rgba(255,255,255,0.07);
            border-bottom: 0.5px solid rgba(255,255,255,0.07);
            background: rgba(255,255,255,0.03);
            transition: background 0.15s;
          }
          .sv-card:hover {
            background: rgba(255,255,255,0.05);
          }
        `}</style>

        {/* Ambient grid */}
        {[25, 50, 75].map(p => (
          <div key={p} style={{ position: "fixed", left: `${p}%`, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.02)", pointerEvents: "none", zIndex: 0 }} />
        ))}

        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 36, fontFamily: "'Inter', sans-serif", position: "relative", zIndex: 1 }}>

          {/* Topics */}
          {headings.length > 0 && (
            <section>
              <div className="sv-section-eyebrow">
                <span style={{ color: "#fff", fontSize: 14, fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>✦</span>
                <span className="sv-section-label" style={{ color: "rgba(255,255,255,0.35)" }}>Topics covered</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {headings.map((block, i) => (
                  <span
                    key={i}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 100,
                      fontSize: 16,
                      fontWeight: 500,
                      background: "rgba(255,255,255,0.04)",
                      border: "0.5px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                      fontFamily: "'Playfair Display', serif",
                      fontStyle: "italic",
                    }}
                  >
                    {block.content}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Definitions */}
          {definitions.length > 0 && (
            <section>
              <div className="sv-section-eyebrow">
                <span style={{ color: BLOCK_META.definition.accent, fontSize: 12 }}>◆</span>
                <span className="sv-section-label" style={{ color: BLOCK_META.definition.accent }}>Key definitions</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {definitions.map((block, i) => {
                  const colonIdx = block.content.indexOf(":");
                  const term = colonIdx > -1 ? block.content.slice(0, colonIdx).trim() : null;
                  const body = colonIdx > -1 ? block.content.slice(colonIdx + 1).trim() : block.content;

                  return (
                    <div key={i} className="sv-card" style={{ borderLeftColor: BLOCK_META.definition.accent }}>
                      {term && (
                        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: BLOCK_META.definition.accent, marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
                          {term}
                        </p>
                      )}
                      <p style={{ fontSize: 16, lineHeight: 1.7, color: "rgba(255,255,255,0.7)" }}>
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
              <div className="sv-section-eyebrow">
                <span style={{ color: BLOCK_META.example.accent, fontSize: 12 }}>●</span>
                <span className="sv-section-label" style={{ color: BLOCK_META.example.accent }}>Examples</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {examples.map((block, i) => (
                  <div key={i} className="sv-card" style={{ borderLeftColor: BLOCK_META.example.accent }}>
                    <p style={{ fontSize: 16, lineHeight: 1.7, color: "rgba(255,255,255,0.7)" }}>
                      {block.content}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {definitions.length === 0 && headings.length === 0 && examples.length === 0 && (
            <p style={{ fontSize: 16, textAlign: "center", marginTop: 32, color: "rgba(255,255,255,0.28)" }}>
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

// ── Riddle Card component ─────────────────────────────────────────────────────
function StudentRiddleCard({ block, index, riddleAccent, extractQuestion, extractAnswer, onCorrectAnswer }) {
  const answer = extractAnswer(block.content);
  const question = extractQuestion(block.content);

  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState(null); // null, 'correct', 'incorrect'
  const [revealed, setRevealed] = useState(false);

  function handleCheck() {
    if (!guess.trim()) return;
    const cleanGuess = guess.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    const cleanAnswer = (answer || "").toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

    if (cleanGuess === cleanAnswer || cleanAnswer.includes(cleanGuess) && cleanGuess.length > 2) {
      setFeedback("correct");
      onCorrectAnswer();
      triggerConfetti();
    } else {
      setFeedback("incorrect");
    }
  }

  const isOpen = feedback === "correct" || revealed;

  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: isOpen
          ? `0.5px solid ${feedback === "correct" ? "#10b981" : "#f59e0b"}`
          : "0.5px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        transition: "border 0.3s",
      }}
    >
      {/* Question */}
      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 22, color: riddleAccent, marginTop: 1, lineHeight: 1 }}>?</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: riddleAccent, marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>
              Riddle {index + 1}
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "rgba(255,255,255,0.75)" }}>
              {question}
            </p>
          </div>
        </div>
      </div>

      {/* Input / Guess / Answer */}
      <div style={{ padding: "0 18px 16px" }}>
        {answer && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {feedback !== "correct" && !revealed ? (
              <>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="Type your guess..."
                    style={{
                      flex: 1,
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 8,
                      padding: "8px 12px",
                      fontSize: 14,
                      fontFamily: "'Inter', sans-serif",
                      background: "rgba(0,0,0,0.2)",
                      color: "#fff",
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                  />
                  <button
                    onClick={handleCheck}
                    style={{
                      background: "#f59e0b",
                      border: "none",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                      borderRadius: 8,
                      padding: "8px 16px",
                      cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                      transition: "opacity 0.15s",
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = "0.85"}
                    onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
                  >
                    Check
                  </button>
                </div>
                {feedback === "incorrect" && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                    <span style={{ fontSize: 13, color: "#ef4444", fontWeight: 600 }}>❌ Incorrect. Try again!</span>
                    <button
                      onClick={() => {
                        setRevealed(true);
                        onCorrectAnswer();
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(255,255,255,0.4)",
                        fontSize: 12,
                        textDecoration: "underline",
                        cursor: "pointer",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      Give up & Reveal
                    </button>
                  </div>
                )}
              </>
            ) : null}

            {feedback === "correct" && (
              <div style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "0.5px solid rgba(16, 185, 129, 0.25)",
                borderRadius: 8,
                padding: "12px 14px",
              }}>
                <b style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, textTransform: "uppercase", display: "block", color: "#10b981", marginBottom: 4 }}>Correct! 🎉</b>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: "rgba(255,255,255,0.75)" }}>
                  {answer}
                </p>
              </div>
            )}

            {revealed && feedback !== "correct" && (
              <div style={{
                background: "rgba(245, 158, 11, 0.08)",
                border: "0.5px solid rgba(245, 158, 11, 0.25)",
                borderRadius: 8,
                padding: "12px 14px",
              }}>
                <b style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, textTransform: "uppercase", display: "block", color: "#f59e0b", marginBottom: 4 }}>Answer</b>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: "rgba(255,255,255,0.75)" }}>
                  {answer}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Riddle Quiz component ─────────────────────────────────────────────────────
function RiddleQuiz({ notes }) {
  const riddles = notes.filter(b => b.type === "riddle");
  const examAlerts = notes.filter(b => b.type === "exam-alert" || b.type === "highlight-box");

  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState({});

  const riddleAccent = BLOCK_META.riddle.accent;
  const alertAccent = BLOCK_META["exam-alert"].accent;

  function extractAnswer(content) {
    const match = content.match(/\[Answer:\s*(.*?)\]/i);
    return match ? match[1].trim() : null;
  }

  function extractQuestion(content) {
    return content.replace(/\[Answer:.*?\]/gi, "").trim();
  }

  function handleCorrectAnswer(i) {
    if (!answered[i]) {
      setScore(s => s + 1);
      setAnswered(prev => ({ ...prev, [i]: true }));
    }
  }

  const total = riddles.length;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px", background: "#000", position: "relative" }}>
      <style>{`
        ${FONT_IMPORT}
      `}</style>

      {/* Ambient grid */}
      {[25, 50, 75].map(p => (
        <div key={p} style={{ position: "fixed", left: `${p}%`, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.02)", pointerEvents: "none", zIndex: 0 }} />
      ))}

      <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16, fontFamily: "'Inter', sans-serif", position: "relative", zIndex: 1 }}>

        {/* Score bar */}
        {total > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Brain size={16} style={{ color: BLOCK_META.note.accent }} />
              <span style={{ fontSize: 16, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>Quiz progress</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 120, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${total > 0 ? (score / total) * 100 : 0}%`,
                  background: `linear-gradient(to right, ${BLOCK_META.note.accent}, ${COLORS.accent})`,
                  borderRadius: 2,
                  transition: "width 0.5s ease",
                }} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.accent }}>{score}/{total}</span>
            </div>
          </div>
        )}

        {/* Riddle cards */}
        {riddles.length === 0 ? (
          <p style={{ fontSize: 13, textAlign: "center", marginTop: 32, color: "rgba(255,255,255,0.28)" }}>
            No riddles found. Generate notes from a longer topic to get quiz questions.
          </p>
        ) : (
          riddles.map((block, i) => (
            <StudentRiddleCard
              key={i}
              block={block}
              index={i}
              riddleAccent={riddleAccent}
              extractQuestion={extractQuestion}
              extractAnswer={extractAnswer}
              onCorrectAnswer={() => handleCorrectAnswer(i)}
            />
          ))
        )}

        {/* Exam Alerts section */}
        {examAlerts.length > 0 && (
          <section style={{ marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ color: alertAccent, fontSize: 15 }}>▲</span>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: alertAccent, fontFamily: "'Inter', sans-serif" }}>
                Exam alerts
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {examAlerts.map((block, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 10,
                    padding: "12px 14px",
                    background: "rgba(255,255,255,0.03)",
                    border: `0.5px dashed rgba(239,68,68,0.3)`,
                  }}
                >
                  <p style={{ fontSize: 16, lineHeight: 1.7, color: "rgba(255,255,255,0.75)" }}>
                    {block.content}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Perfect score celebration */}
        {total > 0 && score === total && (
          <div style={{ borderRadius: 12, padding: "20px", textAlign: "center", background: COLORS.accentSoft, border: `0.5px solid ${COLORS.accentBorder}` }}>
            <p style={{ fontSize: 28, marginBottom: 6 }}>🎉</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.accent }}>
              Perfect score! You nailed all {total} riddles.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}