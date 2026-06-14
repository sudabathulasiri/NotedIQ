/**
 * NotebookView.jsx
 * Black moleskine-style notebook — Playfair Display chapter titles,
 * Caveat handwriting for content, hairline ruled pages, spiral binding,
 * page-flip animation. Same shape as before, restyled onto the pure-black
 * NotedIQ canvas with the shared accent palette from theme.js.
 */

import { useState, useEffect, useRef } from "react";
import { COLORS, BLOCK_META, FONT_IMPORT, tint } from "./theme.js";
import { exportToPDF, exportToWord, triggerConfetti } from "../utils/exportUtils.js";

const BLOCKS_PER_PAGE = 2;

const BLOCK_CONFIG = {
  heading: { ...BLOCK_META.heading, icon: "✦", style: "banner" },
  definition: { ...BLOCK_META.definition, icon: "◆", style: "box" },
  example: { ...BLOCK_META.example, icon: "●", style: "box" },
  "exam-alert": { ...BLOCK_META["exam-alert"], icon: "▲", style: "alert" },
  riddle: { ...BLOCK_META.riddle, icon: "?", style: "box" },
  note: { ...BLOCK_META.note, icon: "–", style: "bullet" },
};

function paginateBlocks(blocks, perPage) {
  const pages = [];
  for (let i = 0; i < blocks.length; i += perPage) {
    pages.push(blocks.slice(i, i + perPage));
  }
  return pages.length > 0 ? pages : [[]];
}

function RiddleCard({ block, index }) {
  const match = block.content.match(/\[Answer:\s*(.*?)\]/i);
  const answer = match ? match[1].trim() : null;
  const question = answer ? block.content.replace(/\[Answer:.*?\]/gi, "").trim() : block.content;
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
    <div style={{ marginBottom: 14, animation: `fadeIn 0.3s ease ${index * 0.08}s both` }}>
      <div style={{
        fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
        color: "#f59e0b", marginBottom: 6, fontFamily: "'Inter', sans-serif"
      }}>
        ? riddle
      </div>
      <div style={{
        border: "1px solid #f59e0b",
        borderRadius: 8,
        padding: "10px 14px",
        background: "#f59e0b06",
      }}>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: "#1f2937", lineHeight: 1.45 }}>
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
                      fontFamily: "'Inter', sans-serif",
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
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Check
                  </button>
                </div>
                {feedback === "incorrect" && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>❌ Incorrect. Try again!</span>
                    <button
                      onClick={() => setRevealed(true)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#6b7280",
                        fontSize: 11,
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
                background: "rgba(16, 185, 129, 0.1)",
                border: "0.5px solid rgba(16, 185, 129, 0.25)",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 14,
                fontFamily: "'Caveat', cursive",
                color: "#065f46",
              }}>
                <b style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, textTransform: "uppercase", display: "block", color: "#10b981", marginBottom: 2 }}>Correct! 🎉</b>
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
                fontFamily: "'Caveat', cursive",
                color: "#b45309",
              }}>
                <b style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, textTransform: "uppercase", display: "block", color: "#f59e0b", marginBottom: 2 }}>Answer</b>
                {answer}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BlockCard({ block, index }) {
  const cfg = BLOCK_CONFIG[block.type] || BLOCK_CONFIG.note;

  // New Structured Block Types
  if (block.type === "banner-title") {
    const text = block.content || "";
    const words = text.split(" ");
    
    if (text.length <= 26) {
      return (
        <div style={{ marginBottom: 14, animation: `fadeIn 0.3s ease ${index * 0.08}s both` }}>
          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
            color: "#1a1a1a", marginBottom: 6, fontFamily: "'Inter', sans-serif"
          }}>
            ✦ banner-title
          </div>
          <svg viewBox="0 0 400 66" width="100%" style={{ display: "block", aspectRatio: "400 / 66", height: "auto" }}>
            <path d="M14,33 L36,6 L364,4 L388,30 L366,61 L20,62 Z" fill="#fff" stroke="#1a1a1a" strokeWidth="1.5" />
            <text x="200" y="38" textAnchor="middle" fontFamily="'Playfair Display', serif" fontStyle="italic" fontWeight="900" fontSize="16" fill="#1a1a1a" dominantBaseline="central">
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
        <div style={{ marginBottom: 14, animation: `fadeIn 0.3s ease ${index * 0.08}s both` }}>
          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
            color: "#1a1a1a", marginBottom: 6, fontFamily: "'Inter', sans-serif"
          }}>
            ✦ banner-title
          </div>
          <svg viewBox="0 0 400 96" width="100%" style={{ display: "block", aspectRatio: "400 / 96", height: "auto" }}>
            <path d="M14,48 L36,6 L364,4 L388,48 L366,91 L20,92 Z" fill="#fff" stroke="#1a1a1a" strokeWidth="1.5" />
            <text x="200" y="48" textAnchor="middle" fontFamily="'Playfair Display', serif" fontStyle="italic" fontWeight="900" fontSize={fontSize} fill="#1a1a1a" dominantBaseline="central">
              <tspan x="200" dy="-14">{line1}</tspan>
              <tspan x="200" dy="28">{line2}</tspan>
            </text>
          </svg>
        </div>
      );
    }
  }

  if (block.type === "bullet-list") {
    const listItems = Array.isArray(block.items) ? block.items : [];
    return (
      <div style={{ marginBottom: 14, animation: `fadeIn 0.3s ease ${index * 0.08}s both` }}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
          color: "#3b82f6", marginBottom: 6, fontFamily: "'Inter', sans-serif"
        }}>
          – bullet-list · "{block.heading}"
        </div>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, lineHeight: 1.75, color: "#1f2937", paddingLeft: 6 }}>
          {listItems.map((item, idx) => (
            <div key={idx}>
              <b style={{ color: "#3b82f6" }}>{item.term} →</b> {item.note}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "mindmap") {
    const branches = Array.isArray(block.branches) ? block.branches : [];
    const centerText = block.center || "Classification";
    const pos = [
      { cx: 200, cy: 42 },
      { cx: 293.5, cy: 96 },
      { cx: 293.5, cy: 204 },
      { cx: 200, cy: 258 },
      { cx: 106.5, cy: 204 },
      { cx: 106.5, cy: 96 }
    ];
    const colors = ["#94a3b8", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#06b6d4"];

    const centerWords = centerText.split(" ");
    const centerLine1 = centerWords.slice(0, Math.ceil(centerWords.length / 2)).join(" ");
    const centerLine2 = centerWords.slice(Math.ceil(centerWords.length / 2)).join(" ");
    const centerHasTwo = centerWords.length > 1 && centerText.length > 8;

    return (
      <div style={{ marginBottom: 14, animation: `fadeIn 0.3s ease ${index * 0.08}s both` }}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
          color: "#10b981", marginBottom: 6, fontFamily: "'Inter', sans-serif"
        }}>
          ◆ mindmap · "{centerText}"
        </div>
        <svg viewBox="0 0 400 300" width="100%" style={{ display: "block", overflow: "visible", aspectRatio: "400 / 300", height: "auto", maxHeight: 200, margin: "0 auto" }}>
          <g stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="2 3">
            {branches.map((_, idx) => {
              const p = pos[idx % pos.length];
              return <line key={idx} x1="200" y1="150" x2={p.cx} y2={p.cy} />;
            })}
          </g>
          {branches.map((branch, idx) => {
            const p = pos[idx % pos.length];
            const color = colors[idx % colors.length];
            const words = branch.split(" ");
            const hasBreak = branch.length > 8 && words.length > 1;
            const line1 = hasBreak ? words.slice(0, Math.ceil(words.length / 2)).join(" ") : branch;
            const line2 = hasBreak ? words.slice(Math.ceil(words.length / 2)).join(" ") : "";

            return (
              <g key={idx} className="mm-node">
                <circle cx={p.cx} cy={p.cy} r={38} fill={`${color}1f`} stroke={color} strokeWidth="1.5" />
                {hasBreak ? (
                  <text className="mm-label" x={p.cx} y={p.cy} dominantBaseline="central" textAnchor="middle" fontSize="10" style={{ fill: "#1f2937", fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>
                    <tspan x={p.cx} dy="-5.5">{line1}</tspan>
                    <tspan x={p.cx} dy="12">{line2}</tspan>
                  </text>
                ) : (
                  <text className="mm-label" x={p.cx} y={p.cy} dominantBaseline="central" textAnchor="middle" fontSize="10" style={{ fill: "#1f2937", fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>{branch}</text>
                )}
              </g>
            );
          })}
          <circle cx="200" cy="150" r="46" fill="#1a1a1a" />
          {centerHasTwo ? (
            <text x="200" y="150" textAnchor="middle" fontFamily="'Playfair Display', serif" fontStyle="italic" fontWeight="900" fontSize="13" fill="#fff" dominantBaseline="central">
              <tspan x="200" dy="-7">{centerLine1}</tspan>
              <tspan x="200" dy="14">{centerLine2}</tspan>
            </text>
          ) : (
            <text x="200" y="150" textAnchor="middle" fontFamily="'Playfair Display', serif" fontStyle="italic" fontWeight="900" fontSize="14" fill="#fff" dominantBaseline="central">{centerText}</text>
          )}
        </svg>
      </div>
    );
  }

  if (block.type === "flowchart") {
    const nodes = Array.isArray(block.nodes) ? block.nodes : [];
    const edges = Array.isArray(block.edges) ? block.edges : [];
    const boxPositions = [
      { x: 20, y: 20, labelX: 105, labelY: 49, noteX: 98, noteY: 127 },
      { x: 210, y: 20, labelX: 295, labelY: 49, noteX: 200, noteY: 38 },
      { x: 210, y: 170, labelX: 295, labelY: 199, noteX: 302, noteY: 127 },
      { x: 20, y: 170, labelX: 105, labelY: 199, noteX: 200, noteY: 212 }
    ];

    return (
      <div style={{ marginBottom: 14, animation: `fadeIn 0.3s ease ${index * 0.08}s both` }}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
          color: "#f59e0b", marginBottom: 6, fontFamily: "'Inter', sans-serif"
        }}>
          ↻ flowchart · cycle · "${block.heading || 'Life cycle'}"
        </div>
        <svg viewBox="0 0 400 260" width="100%" style={{ display: "block", overflow: "visible", aspectRatio: "400 / 260", height: "auto", maxHeight: 180, margin: "0 auto" }}>
          <defs>
            <marker id="fc-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L6,3 L0,6 Z" fill="#1a1a1a" />
            </marker>
          </defs>
          {edges.map((edge, idx) => {
            const fromIdx = nodes.findIndex(n => n.id === edge.from);
            const toIdx = nodes.findIndex(n => n.id === edge.to);
            if (fromIdx === -1 || toIdx === -1) return null;

            let d = "";
            let textAnchor = "middle";
            let labelX = 200;
            let labelY = 120;

            if (fromIdx === 0 && toIdx === 1) {
              d = "M192,48 L208,48";
              labelX = 200;
              labelY = 38;
              textAnchor = "middle";
            } else if (fromIdx === 1 && toIdx === 2) {
              d = "M295,80 L295,166";
              labelX = 302;
              labelY = 127;
              textAnchor = "start";
            } else if (fromIdx === 2 && toIdx === 3) {
              d = "M208,198 L192,198";
              labelX = 200;
              labelY = 212;
              textAnchor = "middle";
            } else if (fromIdx === 3 && toIdx === 0) {
              d = "M105,166 L105,80";
              labelX = 98;
              labelY = 127;
              textAnchor = "end";
            } else if (fromIdx === 1 && toIdx === 0) {
              d = "M208,58 L192,58";
              labelX = 200;
              labelY = 68;
              textAnchor = "middle";
            } else if (fromIdx === 0 && toIdx === 3) {
              d = "M105,80 L105,166";
              labelX = 98;
              labelY = 127;
              textAnchor = "end";
            }

            if (!d) return null;

            return (
              <g key={idx}>
                <path d={d} stroke="#1a1a1a" strokeWidth="2" fill="none" markerEnd="url(#fc-arrow)" />
              </g>
            );
          })}
          {nodes.map((node, idx) => {
            const pos = boxPositions[idx % boxPositions.length];
            const words = (node.label || "").split(" ");
            const hasBreak = (node.label || "").length > 11 && words.length > 1;
            const line1 = hasBreak ? words.slice(0, Math.ceil(words.length / 2)).join(" ") : node.label;
            const line2 = hasBreak ? words.slice(Math.ceil(words.length / 2)).join(" ") : "";

            return (
              <g key={idx} className="fc-box">
                <rect x={pos.x} y={pos.y} width="170" height="56" rx="8" fill="#fff" stroke="#1a1a1a" strokeWidth="1.5" />
                {hasBreak ? (
                  <>
                    <text className="fc-label" x={pos.labelX} y={pos.labelY - 8}>{line1}</text>
                    <text className="fc-label" x={pos.labelX} y={pos.labelY + 10}>{line2}</text>
                  </>
                ) : (
                  <text className="fc-label" x={pos.labelX} y={pos.labelY}>{node.label}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  if (block.type === "highlight-box") {
    return (
      <div style={{ marginBottom: 14, animation: `fadeIn 0.3s ease ${index * 0.08}s both` }}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
          color: "#ef4444", marginBottom: 6, fontFamily: "'Inter', sans-serif"
        }}>
          ▲ highlight-box
        </div>
        <div style={{ border: "1.5px dashed #ef4444", borderRadius: 8, padding: "10px 14px", background: "#ef44440a" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ef4444", marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>
            {block.term}
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: "#1f2937", lineHeight: 1.4 }}>
            {block.content}
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "structure-grid") {
    const gridItems = Array.isArray(block.items) ? block.items : [];
    const cardSvgs = [
      <svg width="38" height="38" viewBox="0 0 40 40" style={{ flexShrink: 0 }} key="0">
        <circle cx="10" cy="10" r="7" fill="#ef44441f" stroke="#ef4444" /><text x="10" y="13" fontSize="9" textAnchor="middle" fill="#ef4444" fontFamily="Inter">+</text>
        <circle cx="30" cy="10" r="7" fill="#3b82f61f" stroke="#3b82f6" /><text x="30" y="13" fontSize="9" textAnchor="middle" fill="#3b82f6" fontFamily="Inter">−</text>
        <circle cx="10" cy="30" r="7" fill="#3b82f61f" stroke="#3b82f6" /><text x="10" y="33" fontSize="9" textAnchor="middle" fill="#3b82f6" fontFamily="Inter">−</text>
        <circle cx="30" cy="30" r="7" fill="#ef44441f" stroke="#ef4444" /><text x="30" y="33" fontSize="9" textAnchor="middle" fill="#ef4444" fontFamily="Inter">+</text>
      </svg>,
      <svg width="38" height="38" viewBox="0 0 40 40" style={{ flexShrink: 0 }} key="1">
        <circle cx="14" cy="20" r="13" fill="none" stroke="#10b981" strokeWidth="1.5" />
        <circle cx="26" cy="20" r="13" fill="none" stroke="#10b981" strokeWidth="1.5" />
        <circle cx="18" cy="17" r="1.5" fill="#10b981" />
        <circle cx="22" cy="23" r="1.5" fill="#10b981" />
      </svg>,
      <svg width="38" height="38" viewBox="0 0 40 40" style={{ flexShrink: 0 }} key="2">
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
      </svg>,
      <svg width="38" height="38" viewBox="0 0 40 40" style={{ flexShrink: 0 }} key="3">
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
    ];
    const colors = ["#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

    return (
      <div style={{ marginBottom: 14, animation: `fadeIn 0.3s ease ${index * 0.08}s both` }}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
          color: "#06b6d4", marginBottom: 6, fontFamily: "'Inter', sans-serif"
        }}>
          ▦ structure-grid · "${block.heading || 'Comparison'}"
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {gridItems.map((item, idx) => {
            const color = colors[idx % colors.length];
            return (
              <div key={idx} className="sg-card" style={{
                border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 8, padding: "8px 10px",
                display: "flex", gap: 8, alignItems: "flex-start", background: "transparent",
                fontFamily: "'Inter', sans-serif"
              }}>
                {cardSvgs[idx % cardSvgs.length]}
                <div>
                  <div className="sg-title" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2, color: color }}>
                    {item.label}
                  </div>
                  <div className="sg-text" style={{ fontFamily: "'Caveat', cursive", fontSize: 13, color: "#1f2937", lineHeight: 1.3 }}>
                    {Array.isArray(item.points) ? item.points.join(", ") : item.points}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Legacy Student Blocks ──

  if (block.type === "heading") {
    return (
      <div style={{ marginBottom: 16, animation: `fadeIn 0.3s ease ${index * 0.08}s both` }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
          color: "rgba(0,0,0,0.45)", marginBottom: 5, fontFamily: "'Inter', sans-serif",
        }}>
          ✦ topic
        </div>
        <div style={{
          fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 900,
          fontSize: 22, color: "#1a1a1a", lineHeight: 1.25, paddingBottom: 10,
          borderBottom: "0.5px solid rgba(0,0,0,0.12)",
        }}>
          {block.content}
        </div>
      </div>
    );
  }

  if (block.type === "definition") {
    const colonIdx = block.content.indexOf(":");
    const term = colonIdx > -1 ? block.content.slice(0, colonIdx).trim() : null;
    const body = colonIdx > -1 ? block.content.slice(colonIdx + 1).trim() : block.content;

    return (
      <div style={{ marginBottom: 14, animation: `fadeIn 0.3s ease ${index * 0.08}s both` }}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
          color: "#10b981", marginBottom: 6, fontFamily: "'Inter', sans-serif"
        }}>
          ◆ definition
        </div>
        <div style={{
          border: "1px solid #10b981",
          borderRadius: 8,
          padding: "10px 14px",
          background: "#10b98106",
          borderLeft: "4px solid #10b981",
        }}>
          {term && (
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "#10b981", marginBottom: 4,
              fontFamily: "'Inter', sans-serif",
            }}>
              {term}
            </div>
          )}
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: "#1f2937", lineHeight: 1.45 }}>
            {body}
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "example") {
    return (
      <div style={{ marginBottom: 14, animation: `fadeIn 0.3s ease ${index * 0.08}s both` }}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
          color: "#3b82f6", marginBottom: 6, fontFamily: "'Inter', sans-serif"
        }}>
          ● example
        </div>
        <div style={{
          border: "1px solid rgba(59, 130, 246, 0.4)",
          borderRadius: 8,
          padding: "10px 14px",
          background: "#3b82f606",
        }}>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: "#1f2937", lineHeight: 1.45 }}>
            <span style={{ color: "#3b82f6", fontWeight: 700, marginRight: 6, fontFamily: "'Inter', sans-serif", fontSize: 11 }}>E.G.</span>
            {block.content}
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "riddle") {
    return <RiddleCard block={block} index={index} />;
  }

  if (block.type === "exam-alert") {
    return (
      <div style={{ marginBottom: 14, animation: `fadeIn 0.3s ease ${index * 0.08}s both` }}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
          color: "#ef4444", marginBottom: 6, fontFamily: "'Inter', sans-serif"
        }}>
          ▲ exam-alert
        </div>
        <div style={{
          border: "1.5px dashed #ef4444",
          borderRadius: 8,
          padding: "10px 14px",
          background: "#ef44440a",
        }}>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: "#1f2937", lineHeight: 1.45 }}>
            <span style={{ color: "#ef4444", fontWeight: 700, marginRight: 6, fontFamily: "'Inter', sans-serif", fontSize: 11 }}>⚠ EXAM ALERT:</span>
            {block.content}
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "note") {
    return (
      <div style={{ marginBottom: 14, animation: `fadeIn 0.3s ease ${index * 0.08}s both` }}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
          color: "#8b5cf6", marginBottom: 6, fontFamily: "'Inter', sans-serif"
        }}>
          – note
        </div>
        <div style={{
          border: "1px solid rgba(139, 92, 246, 0.3)",
          borderRadius: 8,
          padding: "10px 14px",
          background: "#8b5cf606",
        }}>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: "#1f2937", lineHeight: 1.45 }}>
            {block.content}
          </div>
        </div>
      </div>
    );
  }

  // Fallback for everything else
  return (
    <div style={{ marginBottom: 10, display: "flex", gap: 8, alignItems: "flex-start", animation: `fadeIn 0.3s ease ${index * 0.08}s both` }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%",
        background: tint(cfg.accent, 0.15), border: `0.5px solid ${tint(cfg.accent, 0.4)}`,
        flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ color: cfg.accent, fontSize: 10, fontWeight: 700 }}>–</span>
      </div>
      <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: "#1f2937", lineHeight: 1.5, paddingTop: 2 }}>
        {block.content}
      </div>
    </div>
  );
}

function NotebookPage({ blocks, pageNumber, totalPages, side }) {
  const holeCount = 9;

  return (
    <div style={{
      width: "100%",
      height: "100%",
      background: "#fffefb",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ruled lines */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: side === "left" ? 44 : 0,
          right: side === "right" ? 44 : 0,
          top: 60 + i * 28,
          height: 1,
          background: "rgba(147,197,253,0.3)",
          pointerEvents: "none",
        }} />
      ))}

      {/* Margin line */}
      <div style={{
        position: "absolute",
        top: 0, bottom: 0,
        [side === "left" ? "left" : "right"]: 42,
        width: 1,
        background: "rgba(239,68,68,0.25)",
        pointerEvents: "none",
      }} />

      {/* Spiral holes */}
      <div style={{
        position: "absolute",
        [side === "left" ? "left" : "right"]: 0,
        top: 0, bottom: 0,
        width: 42,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-evenly",
        alignItems: "center",
        pointerEvents: "none",
        background: "rgba(0,0,0,0.03)",
      }}>
        {Array.from({ length: holeCount }).map((_, i) => (
          <div key={i} style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#181818",
            border: "1px solid rgba(0,0,0,0.15)",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)",
          }} />
        ))}
      </div>

      {/* Page content */}
      <div style={{
        position: "absolute",
        top: 10,
        left: side === "left" ? 52 : 8,
        right: side === "right" ? 52 : 8,
        bottom: 28,
        overflowY: "auto",
        padding: "4px 6px",
      }}>
        {/* Header strip */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: "0.5px solid rgba(0,0,0,0.08)",
        }}>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: 14,
            fontWeight: 700,
            color: COLORS.accent,
            letterSpacing: "0.01em",
          }}>
            NotedIQ
          </span>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 10,
            color: "rgba(0,0,0,0.35)",
            fontWeight: 600,
            letterSpacing: "0.06em",
          }}>
            pg. {pageNumber}
          </span>
        </div>

        {blocks.length === 0 ? (
          <div style={{
            marginTop: 30,
            textAlign: "center",
            fontFamily: "'Caveat', cursive",
            fontSize: 16,
            color: "rgba(0,0,0,0.15)",
          }}>
            — —
          </div>
        ) : (
          blocks.map((block, i) => (
            <BlockCard key={i} block={block} index={i} />
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{
        position: "absolute",
        bottom: 6,
        left: side === "left" ? 52 : 8,
        right: side === "right" ? 52 : 8,
        textAlign: "center",
        fontFamily: "'Inter', sans-serif",
        fontSize: 9,
        color: "rgba(0,0,0,0.25)",
        letterSpacing: "0.05em",
      }}>
        {pageNumber} / {totalPages}
      </div>
    </div>
  );
}

export default function NotebookView({ notes }) {
  const nonRiddleNotes = notes.filter(b => b.type !== "riddle");
  const pages = paginateBlocks(nonRiddleNotes, BLOCKS_PER_PAGE);
  const totalPages = pages.length;
  const [spread, setSpread] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [dir, setDir] = useState(null);
  const prevLen = useRef(0);

  useEffect(() => {
    if (nonRiddleNotes.length > 0 && prevLen.current === 0) {
      setSpread(0);
    }
    prevLen.current = nonRiddleNotes.length;
  }, [nonRiddleNotes.length]);

  function goTo(target, direction) {
    if (flipping || target === spread) return;
    setDir(direction);
    setFlipping(true);
    setTimeout(() => {
      setSpread(target);
      setFlipping(false);
      setDir(null);
    }, 450);
  }

  const maxSpread = Math.floor((totalPages - 1) / 2);
  const leftBlocks = pages[spread * 2] || [];
  const rightBlocks = pages[spread * 2 + 1] || [];

  if (nonRiddleNotes.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, background: COLORS.bg }}>
        <style>{`${FONT_IMPORT}`}</style>
        <div style={{
          width: 280, height: 180,
          background: COLORS.surface,
          borderRadius: 14,
          border: `0.5px solid ${COLORS.border}`,
          display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8,
        }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 22, color: "#fff", fontWeight: 900 }}>
            Noted<span style={{ color: COLORS.accent }}>IQ</span>
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.4 }}>
            Your notes will appear here.<br />
            <span style={{ fontSize: 13 }}>Paste text or a YouTube link to begin.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 20px", gap: 16, overflow: "hidden", background: COLORS.bg }}>
      <style>{`
        ${FONT_IMPORT}
        @keyframes fadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        @keyframes flipFwd { 0%{transform:perspective(1400px) rotateY(0deg);opacity:1} 45%{transform:perspective(1400px) rotateY(-88deg);opacity:0.3} 100%{transform:perspective(1400px) rotateY(0deg);opacity:1} }
        @keyframes flipBck { 0%{transform:perspective(1400px) rotateY(0deg);opacity:1} 45%{transform:perspective(1400px) rotateY(88deg);opacity:0.3} 100%{transform:perspective(1400px) rotateY(0deg);opacity:1} }
        .nb-flip-fwd { animation: flipFwd 0.45s cubic-bezier(0.4,0,0.2,1) forwards; }
        .nb-flip-bck { animation: flipBck 0.45s cubic-bezier(0.4,0,0.2,1) forwards; }
        .nb-btn { background: rgba(255,255,255,0.04); border: 0.5px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); border-radius: 8px; padding: 7px 18px; font-size: 12px; font-family: 'Inter', sans-serif; font-weight: 600; letter-spacing: 0.04em; cursor: pointer; transition: all 0.15s; }
        .nb-btn:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: #fff; border-color: rgba(255,255,255,0.2); }
        .nb-btn:disabled { opacity: 0.25; cursor: not-allowed; }
        .nb-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.14); cursor: pointer; transition: background 0.15s, transform 0.15s; }
        .nb-dot.on { background: ${COLORS.accent}; transform: scale(1.4); }

        /* Prototype SVG interactive states */
        .mm-node { transition: transform 0.2s ease; transform-box: fill-box; transform-origin: center; cursor: pointer; }
        .mm-node:hover { transform: scale(1.07); }
        .fc-box { transition: filter 0.2s; cursor: pointer; }
        .fc-box rect { transition: fill 0.2s; }
        .fc-box:hover rect { fill: #fef3c7; }
        .sg-card { transition: background 0.2s; }
        .sg-card:hover { background: rgba(6,182,212,0.06); }
        .fc-label { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700; fill: #1a1a1a; text-anchor: middle; dominant-baseline: central; }
        .fc-note { font-family: 'Caveat', cursive; font-style: italic; font-size: 14px; fill: #6b7280; text-anchor: middle; }
      `}</style>

      {/* Notebook spread */}
      <div
        className={flipping ? (dir === "forward" ? "nb-flip-fwd" : "nb-flip-bck") : ""}
        style={{
          display: "flex",
          width: "min(900px, 100%)",
          height: "min(540px, calc(100vh - 190px))",
          borderRadius: 8,
          overflow: "hidden",
          border: `0.5px solid ${COLORS.border}`,
          boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.02)",
        }}
      >
        {/* Left page */}
        <div style={{ flex: 1, borderRight: "0.5px solid rgba(0,0,0,0.06)", position: "relative" }}>
          <NotebookPage blocks={leftBlocks} pageNumber={spread * 2 + 1} totalPages={totalPages} side="left" />
        </div>

        {/* Spine */}
        <div style={{
          width: 16,
          flexShrink: 0,
          background: "linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0.02) 35%, rgba(0,0,0,0.02) 65%, rgba(0,0,0,0.12))",
          borderLeft: "0.5px solid rgba(0,0,0,0.06)",
          borderRight: "0.5px solid rgba(0,0,0,0.06)",
          zIndex: 2,
        }} />

        {/* Right page */}
        <div style={{ flex: 1, borderLeft: "0.5px solid rgba(0,0,0,0.06)", position: "relative" }}>
          <NotebookPage blocks={rightBlocks} pageNumber={spread * 2 + 2} totalPages={totalPages} side="right" />
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button className="nb-btn" onClick={() => goTo(spread - 1, "back")} disabled={spread === 0 || flipping}>← Prev</button>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {Array.from({ length: maxSpread + 1 }).map((_, i) => (
            <div key={i} className={`nb-dot${i === spread ? " on" : ""}`} onClick={() => goTo(i, i > spread ? "forward" : "back")} />
          ))}
        </div>
        <button className="nb-btn" onClick={() => goTo(spread + 1, "forward")} disabled={spread >= maxSpread || flipping}>Next →</button>
      </div>

      {/* Export Options */}
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button className="nb-btn" onClick={() => exportToPDF(nonRiddleNotes, "NotedIQ Study Guide")} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span>📥</span> Export PDF
        </button>
      </div>

      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'Inter',sans-serif", letterSpacing: "0.04em" }}>
        Spread {spread + 1} of {maxSpread + 1} · {nonRiddleNotes.length} notes
      </div>
    </div>
  );
}