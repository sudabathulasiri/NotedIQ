/**
 * NoteBlock.jsx
 * Renders individual block types for NotedIQ's notebook canvas.
 * Supports all 6 new structured SVG block types plus legacy text blocks.
 */

import { useState } from "react";
import { AlertTriangle, Info, BookOpen, Lightbulb, HelpCircle, CheckSquare, Square } from "lucide-react";
import { COLORS, BLOCK_META, PRIORITY_META, tint } from "./theme.js";
import { triggerConfetti } from "../utils/exportUtils.js";

/* ── SHARED UTILITIES ──────────────────────────────────────── */

const FONT_STACK = "'Inter', sans-serif";
const CAVEAT = "'Caveat', cursive";
const PLAYFAIR = "'Playfair Display', serif";

function BlockTag({ color, children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 5,
      fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
      textTransform: "uppercase", color, fontFamily: FONT_STACK,
      marginBottom: 6,
    }}>
      {children}
    </div>
  );
}

/* ── NEW STRUCTURED BLOCK TYPES ────────────────────────────── */

/**
 * banner-title — Playfair Display italic headline inside a hex-path banner.
 * Schema: { type: "banner-title", content: string }
 */
function BannerTitle({ content }) {
  const text = content || "";
  const words = text.split(" ");
  
  if (text.length <= 26) {
    return (
      <div style={{ marginBottom: 14 }}>
        <BlockTag color="#1a1a1a">✦ banner-title</BlockTag>
        <svg viewBox="0 0 400 66" width="100%" style={{ display: "block" }}>
          <path
            d="M14,33 L36,6 L364,4 L388,30 L366,61 L20,62 Z"
            fill="#fff"
            stroke="#1a1a1a"
            strokeWidth="1.5"
          />
          <text
            x="200" y="38"
            textAnchor="middle"
            fontFamily={PLAYFAIR}
            fontStyle="italic"
            fontWeight="900"
            fontSize="16"
            fill="#1a1a1a"
            dominantBaseline="central"
          >
            {text}
          </text>
        </svg>
      </div>
    );
  } else {
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(" ");
    const line2 = words.slice(mid).join(" ");
    const longestLine = Math.max(line1.length, line2.length);
    const fontSize = Math.min(16, Math.floor(330 / (longestLine * 0.65)));

    return (
      <div style={{ marginBottom: 14 }}>
        <BlockTag color="#1a1a1a">✦ banner-title</BlockTag>
        <svg viewBox="0 0 400 96" width="100%" style={{ display: "block" }}>
          <path
            d="M14,48 L36,6 L364,4 L388,48 L366,91 L20,92 Z"
            fill="#fff"
            stroke="#1a1a1a"
            strokeWidth="1.5"
          />
          <text
            x="200" y="48"
            textAnchor="middle"
            fontFamily={PLAYFAIR}
            fontStyle="italic"
            fontWeight="900"
            fontSize={fontSize}
            fill="#1a1a1a"
            dominantBaseline="central"
          >
            <tspan x="200" dy="-14">{line1}</tspan>
            <tspan x="200" dy="28">{line2}</tspan>
          </text>
        </svg>
      </div>
    );
  }
}

/**
 * bullet-list — Caveat handwriting list with bolded terms.
 * Schema: { type: "bullet-list", heading: string, items: [{ term, note }] }
 */
function BulletList({ heading, items = [] }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <BlockTag color="#3b82f6">– bullet-list{heading ? ` · "${heading}"` : ""}</BlockTag>
      <div style={{
        background: "#fffefb",
        border: "0.5px solid rgba(0,0,0,0.12)",
        borderRadius: 8,
        padding: "12px 14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontFamily: CAVEAT,
        fontSize: 16,
        lineHeight: 1.6,
        color: "#1f2937"
      }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ marginBottom: idx === items.length - 1 ? 0 : 4 }}>
            <b style={{ color: "#3b82f6", fontFamily: FONT_STACK, fontSize: 13, textTransform: "uppercase", marginRight: 6 }}>{item.term} →</b> {item.note}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * mindmap — Interactive SVG radial graph.
 * Schema: { type: "mindmap", center: string, branches: string[] }
 */
function Mindmap({ center = "Core", branches = [] }) {
  const pos = [
    { cx: 200, cy: 42 },
    { cx: 293.5, cy: 96 },
    { cx: 293.5, cy: 204 },
    { cx: 200, cy: 258 },
    { cx: 106.5, cy: 204 },
    { cx: 106.5, cy: 96 },
  ];
  const colors = ["#94a3b8", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#06b6d4"];

  // Smart center text split for long labels
  const centerWords = center.split(" ");
  const centerLine1 = centerWords.slice(0, Math.ceil(centerWords.length / 2)).join(" ");
  const centerLine2 = centerWords.slice(Math.ceil(centerWords.length / 2)).join(" ");
  const centerHasTwo = centerWords.length > 1 && center.length > 8;

  return (
    <div style={{ marginBottom: 14 }}>
      <BlockTag color="#10b981">◆ mindmap · "{center}"</BlockTag>
      <svg
        viewBox="0 0 400 300"
        width="100%"
        style={{ display: "block", overflow: "visible" }}
      >
        <style>{`
          .mm-node { transition: transform 0.2s ease; transform-box: fill-box; transform-origin: center; cursor: pointer; }
          .mm-node:hover { transform: scale(1.07); }
          .mm-label { font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 700; fill: #1f2937; text-anchor: middle; dominant-baseline: central; }
        `}</style>

        {/* Dashed connector lines */}
        <g stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="2 3">
          {branches.slice(0, 6).map((_, idx) => {
            const p = pos[idx];
            return <line key={idx} x1="200" y1="150" x2={p.cx} y2={p.cy} />;
          })}
        </g>

        {/* Branch nodes */}
        {branches.slice(0, 6).map((branch, idx) => {
          const p = pos[idx];
          const color = colors[idx];
          const words = branch.split(" ");
          const hasBreak = branch.length > 9 && words.length > 1;
          const l1 = hasBreak ? words.slice(0, Math.ceil(words.length / 2)).join(" ") : branch;
          const l2 = hasBreak ? words.slice(Math.ceil(words.length / 2)).join(" ") : "";

          return (
            <g key={idx} className="mm-node">
              <circle cx={p.cx} cy={p.cy} r={38} fill={`${color}1f`} stroke={color} strokeWidth="1.5" />
              {hasBreak ? (
                <text className="mm-label" x={p.cx} y={p.cy} dominantBaseline="central" textAnchor="middle">
                  <tspan x={p.cx} dy="-5.5">{l1}</tspan>
                  <tspan x={p.cx} dy="12">{l2}</tspan>
                </text>
              ) : (
                <text className="mm-label" x={p.cx} y={p.cy} dominantBaseline="central" textAnchor="middle">{branch}</text>
              )}
            </g>
          );
        })}

        {/* Center node */}
        <circle cx="200" cy="150" r="46" fill="#1a1a1a" />
        {centerHasTwo ? (
          <text x="200" y="150" textAnchor="middle" fontFamily={PLAYFAIR} fontStyle="italic" fontWeight="900" fontSize="13" fill="#fff" dominantBaseline="central">
            <tspan x="200" dy="-7">{centerLine1}</tspan>
            <tspan x="200" dy="14">{centerLine2}</tspan>
          </text>
        ) : (
          <text x="200" y="150" textAnchor="middle" fontFamily={PLAYFAIR} fontStyle="italic" fontWeight="900" fontSize="14" fill="#fff" dominantBaseline="central">{center}</text>
        )}
      </svg>
    </div>
  );
}

/**
 * flowchart — Cycle diagram with 4 rounded rectangles and directional arrows.
 * Schema: { type: "flowchart", style: "cycle", heading: string,
 *           nodes: [{id,label}], edges: [{from,to,label}] }
 */
function Flowchart({ heading, nodes = [], edges = [] }) {
  // Fixed 4-corner layout for cycle style
  const boxLayout = [
    { x: 20, y: 20, w: 170, h: 56, labelX: 105, labelY: 49 },
    { x: 210, y: 20, w: 170, h: 56, labelX: 295, labelY: 49 },
    { x: 210, y: 170, w: 170, h: 56, labelX: 295, labelY: 199 },
    { x: 20, y: 170, w: 170, h: 56, labelX: 105, labelY: 199 },
  ];

  // Fixed arrow paths for a clockwise 4-node cycle
  const arrows = [
    { d: "M192,48 L208,48", note: edges[0]?.label, nx: 200, ny: 37, anchor: "middle" },
    { d: "M295,78 L295,168", note: edges[1]?.label, nx: 303, ny: 127, anchor: "start" },
    { d: "M208,198 L192,198", note: edges[2]?.label, nx: 200, ny: 213, anchor: "middle" },
    { d: "M105,168 L105,78", note: edges[3]?.label, nx: 97, ny: 127, anchor: "end" },
  ];

  return (
    <div style={{ marginBottom: 14 }}>
      <BlockTag color="#f59e0b">
        ↻ flowchart · cycle{heading ? ` · "${heading}"` : ""}
      </BlockTag>
      <svg viewBox="0 0 400 260" width="100%" style={{ display: "block", overflow: "visible" }}>
        <style>{`
          .fc-box { transition: filter 0.2s; cursor: pointer; }
          .fc-box rect { transition: fill 0.2s; }
          .fc-box:hover rect { fill: #fef3c7; }
          .fc-label { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700; fill: #1a1a1a; text-anchor: middle; dominant-baseline: central; }
          .fc-note  { font-family: 'Caveat', cursive; font-style: italic; font-size: 14px; fill: #6b7280; text-anchor: middle; }
        `}</style>

        <defs>
          <marker id="fc-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L6,3 L0,6 Z" fill="#1a1a1a" />
          </marker>
        </defs>

        {/* Arrows + labels */}
        {arrows.map((a, i) => (
          <g key={i}>
            <path d={a.d} stroke="#1a1a1a" strokeWidth="2" fill="none" markerEnd="url(#fc-arrow)" />
          </g>
        ))}

        {/* Boxes */}
        {nodes.slice(0, 4).map((node, idx) => {
          const b = boxLayout[idx];
          const words = node.label.split(" ");
          const needsSplit = node.label.length > 12 && words.length > 1;
          const l1 = needsSplit ? words.slice(0, Math.ceil(words.length / 2)).join(" ") : node.label;
          const l2 = needsSplit ? words.slice(Math.ceil(words.length / 2)).join(" ") : "";

          return (
            <g key={idx} className="fc-box">
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="8" fill="#fff" stroke="#1a1a1a" strokeWidth="1.5" />
              {needsSplit ? (
                <>
                  <text className="fc-label" x={b.labelX} y={b.labelY - 9}>{l1}</text>
                  <text className="fc-label" x={b.labelX} y={b.labelY + 9}>{l2}</text>
                </>
              ) : (
                <text className="fc-label" x={b.labelX} y={b.labelY}>{node.label}</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * highlight-box — Dashed alert callout for key definitions.
 * Schema: { type: "highlight-box", term: string, content: string }
 */
function HighlightBox({ term, content }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <BlockTag color="#ef4444">▲ highlight-box</BlockTag>
      <div style={{
        border: "1.5px dashed #ef4444",
        borderRadius: 8,
        padding: "12px 14px",
        background: "#fffefb",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}>
        {term && (
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#ef4444", marginBottom: 4,
            fontFamily: FONT_STACK,
          }}>
            {term}
          </div>
        )}
        <div style={{ fontFamily: CAVEAT, fontSize: 16, color: "#1f2937", lineHeight: 1.4 }}>
          {content}
        </div>
      </div>
    </div>
  );
}

/* ── Structure-grid sub-SVGs ── */

function IonicSVG() {
  return (
    <svg width="38" height="38" viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      <circle cx="10" cy="10" r="7" fill="#ef44441f" stroke="#ef4444" /><text x="10" y="13" fontSize="9" textAnchor="middle" fill="#ef4444" fontFamily="Inter">+</text>
      <circle cx="30" cy="10" r="7" fill="#3b82f61f" stroke="#3b82f6" /><text x="30" y="13" fontSize="9" textAnchor="middle" fill="#3b82f6" fontFamily="Inter">−</text>
      <circle cx="10" cy="30" r="7" fill="#3b82f61f" stroke="#3b82f6" /><text x="10" y="33" fontSize="9" textAnchor="middle" fill="#3b82f6" fontFamily="Inter">−</text>
      <circle cx="30" cy="30" r="7" fill="#ef44441f" stroke="#ef4444" /><text x="30" y="33" fontSize="9" textAnchor="middle" fill="#ef4444" fontFamily="Inter">+</text>
    </svg>
  );
}
function CovalentSVG() {
  return (
    <svg width="38" height="38" viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      <circle cx="14" cy="20" r="13" fill="none" stroke="#10b981" strokeWidth="1.5" />
      <circle cx="26" cy="20" r="13" fill="none" stroke="#10b981" strokeWidth="1.5" />
      <circle cx="18" cy="17" r="1.5" fill="#10b981" />
      <circle cx="22" cy="23" r="1.5" fill="#10b981" />
    </svg>
  );
}
function MetallicSVG() {
  return (
    <svg width="38" height="38" viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      <g fill="none" stroke="#f59e0b" strokeWidth="1.5">
        <circle cx="10" cy="10" r="6" /><circle cx="30" cy="10" r="6" />
        <circle cx="10" cy="30" r="6" /><circle cx="30" cy="30" r="6" />
        <circle cx="20" cy="20" r="6" />
      </g>
      <g fill="#f59e0b">
        <circle cx="17" cy="5" r="1" /><circle cx="25" cy="14" r="1" />
        <circle cx="5" cy="22" r="1" /><circle cx="35" cy="24" r="1" />
        <circle cx="20" cy="35" r="1" />
      </g>
    </svg>
  );
}
function MolecularSVG() {
  return (
    <svg width="38" height="38" viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      <g stroke="#8b5cf6" strokeWidth="1.5">
        <line x1="20" y1="20" x2="20" y2="6" />
        <line x1="20" y1="20" x2="33" y2="27" />
        <line x1="20" y1="20" x2="7" y2="27" />
      </g>
      <circle cx="20" cy="20" r="6" fill="#8b5cf61f" stroke="#8b5cf6" />
      <circle cx="20" cy="6" r="4" fill="#fff" stroke="#8b5cf6" />
      <circle cx="33" cy="27" r="4" fill="#fff" stroke="#8b5cf6" />
      <circle cx="7" cy="27" r="4" fill="#fff" stroke="#8b5cf6" />
    </svg>
  );
}

const STRUCTURE_SVGS = { Ionic: IonicSVG, Covalent: CovalentSVG, Metallic: MetallicSVG, Molecular: MolecularSVG };
const STRUCTURE_COLORS = { Ionic: "#ef4444", Covalent: "#10b981", Metallic: "#f59e0b", Molecular: "#8b5cf6" };

/**
 * structure-grid — 2×2 card grid with inline atomic SVGs.
 * Schema: { type: "structure-grid", heading: string, items: [{label, points: string[]}] }
 */
function StructureGrid({ heading, items = [] }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <BlockTag color="#06b6d4">▦ structure-grid{heading ? ` · "${heading}"` : ""}</BlockTag>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {items.map((item, idx) => {
          const SVGIcon = STRUCTURE_SVGS[item.label];
          const color = STRUCTURE_COLORS[item.label] || "#06b6d4";
          return (
            <div
              key={idx}
              className="sg-card"
              style={{
                border: "0.5px solid rgba(0,0,0,0.12)",
                borderRadius: 8,
                padding: "8px 10px",
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                transition: "background 0.2s",
                background: "#fff",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(6,182,212,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}
            >
              {SVGIcon && <SVGIcon />}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color, marginBottom: 2, fontFamily: FONT_STACK }}>
                  {item.label}
                </div>
                <div style={{ fontFamily: CAVEAT, fontSize: 13, color: "#1f2937", lineHeight: 1.3 }}>
                  {Array.isArray(item.points) ? item.points[0] : item.points}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── LEGACY STUDENT BLOCKS ─────────────────────────────────── */

function Heading({ content }) {
  return (
    <h2 style={{
      fontFamily: PLAYFAIR,
      fontStyle: "italic",
      fontWeight: 900,
      fontSize: 28,
      letterSpacing: "-0.5px",
      color: COLORS.text,
      margin: "6px 0 16px",
      paddingBottom: 12,
      borderBottom: `0.5px solid ${COLORS.divider}`,
    }}>
      {content}
    </h2>
  );
}

function DefinitionBlock({ content }) {
  const colonIdx = content.indexOf(":");
  const term = colonIdx > -1 ? content.slice(0, colonIdx).trim() : null;
  const body = colonIdx > -1 ? content.slice(colonIdx + 1).trim() : content;

  return (
    <div style={{ marginBottom: 14 }}>
      <BlockTag color="#10b981">◆ definition</BlockTag>
      <div style={{
        background: "#fffefb",
        border: "1px solid #10b981",
        borderLeft: "4px solid #10b981",
        borderRadius: 8,
        padding: "12px 14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}>
        {term && (
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "#10b981", marginBottom: 4,
            fontFamily: FONT_STACK,
          }}>
            {term}
          </div>
        )}
        <div style={{ fontFamily: CAVEAT, fontSize: 16, color: "#1f2937", lineHeight: 1.4 }}>
          {body}
        </div>
      </div>
    </div>
  );
}

function ExampleBlock({ content }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <BlockTag color="#3b82f6">● example</BlockTag>
      <div style={{
        background: "#fffefb",
        border: "1px solid rgba(59, 130, 246, 0.4)",
        borderRadius: 8,
        padding: "12px 14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}>
        <div style={{ fontFamily: CAVEAT, fontSize: 16, color: "#1f2937", lineHeight: 1.4 }}>
          <span style={{ color: "#3b82f6", fontWeight: 700, marginRight: 6, fontFamily: FONT_STACK, fontSize: 13 }}>e.g.</span>
          {content}
        </div>
      </div>
    </div>
  );
}

function RiddleBlock({ content }) {
  const match = content.match(/\[Answer:\s*(.*?)\]/i);
  const answer = match ? match[1].trim() : null;
  const question = answer ? content.replace(/\[Answer:.*?\]/gi, "").trim() : content;
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState(null); // null, 'correct', 'incorrect'
  const [revealed, setRevealed] = useState(false);

  function handleCheck() {
    if (!guess.trim()) return;
    const cleanGuess = guess.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    const cleanAnswer = (answer || "").toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

    if (cleanGuess === cleanAnswer || cleanAnswer.includes(cleanGuess) && cleanGuess.length > 2) {
      setFeedback("correct");
      triggerConfetti();
    } else {
      setFeedback("incorrect");
    }
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <BlockTag color="#f59e0b">? riddle</BlockTag>
      <div style={{
        background: "#fffefb",
        border: "1px solid #f59e0b",
        borderRadius: 8,
        padding: "12px 14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}>
        <div style={{ fontFamily: CAVEAT, fontSize: 16, color: "#1f2937", lineHeight: 1.45 }}>
          {question}
        </div>
        {answer && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
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
                      border: "1px solid rgba(0,0,0,0.15)",
                      borderRadius: 6,
                      padding: "4px 8px",
                      fontSize: 13,
                      fontFamily: FONT_STACK,
                      background: "#fff",
                      color: "#000",
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                  />
                  <button
                    onClick={handleCheck}
                    style={{
                      background: "#f59e0b",
                      border: "none",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      borderRadius: 6,
                      padding: "4px 12px",
                      cursor: "pointer",
                      fontFamily: FONT_STACK,
                    }}
                  >
                    Check
                  </button>
                </div>
                {feedback === "incorrect" && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, fontFamily: FONT_STACK }}>❌ Incorrect. Try again!</span>
                    <button
                      onClick={() => setRevealed(true)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#6b7280",
                        fontSize: 11,
                        textDecoration: "underline",
                        cursor: "pointer",
                        fontFamily: FONT_STACK,
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
                background: "rgba(16, 185, 129, 0.1)",
                border: "0.5px solid rgba(16, 185, 129, 0.25)",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 14,
                fontFamily: CAVEAT,
                color: "#065f46",
              }}>
                <b style={{ fontFamily: FONT_STACK, fontSize: 10, textTransform: "uppercase", display: "block", color: "#10b981", marginBottom: 2 }}>Correct! 🎉</b>
                Answer: {answer}
              </div>
            )}

            {revealed && feedback !== "correct" && (
              <div style={{
                background: "rgba(245, 158, 11, 0.1)",
                border: "0.5px solid rgba(245, 158, 11, 0.25)",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 14,
                fontFamily: CAVEAT,
                color: "#b45309",
              }}>
                <b style={{ fontFamily: FONT_STACK, fontSize: 10, textTransform: "uppercase", display: "block", color: "#f59e0b", marginBottom: 2 }}>Answer</b>
                {answer}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ExamAlertBlock({ content }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <BlockTag color="#ef4444">▲ exam-alert</BlockTag>
      <div style={{
        background: "#fffefb",
        border: "1.5px dashed #ef4444",
        borderRadius: 8,
        padding: "12px 14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}>
        <div style={{ fontFamily: CAVEAT, fontSize: 16, color: "#1f2937", lineHeight: 1.45 }}>
          <span style={{ color: "#ef4444", fontWeight: 700, marginRight: 6, fontFamily: FONT_STACK, fontSize: 12 }}>⚠ EXAM ALERT:</span>
          {content}
        </div>
      </div>
    </div>
  );
}

function NoteBlockCard({ content }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <BlockTag color="#8b5cf6">– note</BlockTag>
      <div style={{
        background: "#fffefb",
        border: "1px solid rgba(139, 92, 246, 0.3)",
        borderRadius: 8,
        padding: "12px 14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}>
        <div style={{ fontFamily: CAVEAT, fontSize: 16, color: "#1f2937", lineHeight: 1.45 }}>
          {content}
        </div>
      </div>
    </div>
  );
}

function Decision({ content }) {
  const meta = BLOCK_META.decision;
  return (
    <div className="mb-2.5 px-3.5 py-3 rounded-lg flex gap-3" style={{
      background: COLORS.surface,
      border: `0.5px solid ${COLORS.border}`,
    }}>
      <span className="flex-shrink-0 mt-0.5"
        style={{ color: meta.accent, fontSize: 16, fontFamily: PLAYFAIR }}>◆</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold mb-1 tracking-widest uppercase"
          style={{ color: meta.accent, fontFamily: FONT_STACK, fontSize: 14 }}>
          {meta.label}
        </p>
        <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.78)", fontSize: 16 }}>
          {content}
        </p>
      </div>
    </div>
  );
}

function TaskItem({ content, assignee, priority, deadline, checked, onToggle }) {
  const pri = PRIORITY_META[priority] || PRIORITY_META.medium;
  return (
    <div onClick={onToggle} className="mb-2.5 p-3.5 rounded-lg flex items-start gap-3 cursor-pointer transition-all"
      style={{
        background: checked ? "rgba(96,165,250,0.08)" : COLORS.surface,
        border: `0.5px solid ${checked ? "rgba(96,165,250,0.25)" : COLORS.border}`,
      }}
    >
      {checked
        ? <CheckSquare size={19} className="flex-shrink-0 mt-0.5" style={{ color: "#60a5fa" }} />
        : <Square size={19} className="flex-shrink-0 mt-0.5" style={{ color: "rgba(255,255,255,0.22)" }} />}
      <div className="flex-1 min-w-0">
        <p className="leading-snug" style={{
          color: checked ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.85)",
          textDecoration: checked ? "line-through" : "none",
          fontSize: 16,
        }}>
          {content}
        </p>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="font-medium px-2.5 py-0.5 rounded-full" style={{
            background: "rgba(59,130,246,0.1)", border: "0.5px solid rgba(59,130,246,0.25)",
            color: "#60a5fa", fontSize: 13,
          }}>
            @{assignee || "TBD"}
          </span>
          {priority && (
            <span className="font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
              style={{ background: tint(pri.accent, 0.12), color: pri.accent, fontSize: 13 }}>
              {pri.label}
            </span>
          )}
          {deadline && (
            <span style={{ color: "rgba(255,255,255,0.32)", fontSize: 13 }}>Due {deadline}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── MAIN EXPORT ───────────────────────────────────────────── */

export default function NoteBlock({ block, checked, onToggle }) {
  switch (block.type) {
    case "banner-title": return <BannerTitle content={block.content} />;
    case "bullet-list": return <BulletList heading={block.heading} items={block.items} />;
    case "mindmap": return <Mindmap center={block.center} branches={block.branches} />;
    case "flowchart": return <Flowchart heading={block.heading} nodes={block.nodes} edges={block.edges} />;
    case "highlight-box": return <HighlightBox term={block.term} content={block.content} />;
    case "structure-grid": return <StructureGrid heading={block.heading} items={block.items} />;
    // ── Legacy types ──
    case "heading": return <Heading content={block.content} />;
    case "definition": return <DefinitionBlock content={block.content} />;
    case "example": return <ExampleBlock content={block.content} />;
    case "exam-alert": return <ExamAlertBlock content={block.content} />;
    case "note": return <NoteBlockCard content={block.content} />;
    case "riddle": return <RiddleBlock content={block.content} />;
    case "decision": return <Decision content={block.content} />;
    case "task-item":
      return (
        <TaskItem
          content={block.content}
          assignee={block.assignee}
          priority={block.priority}
          deadline={block.deadline}
          checked={checked}
          onToggle={onToggle}
        />
      );
    default:
      return <NoteBlockCard content={block.content} />;
  }
}