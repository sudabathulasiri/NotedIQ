/**
 * NotebookView.jsx
 * Bullet-journal style notebook — colorful headers, hand-drawn feel,
 * cream paper, spiral binding, mixed card layouts, page-flip animation.
 */

import { useState, useEffect, useRef } from "react";

const BLOCKS_PER_PAGE = 4;

const BLOCK_CONFIG = {
  heading: {
    label: "Topic",
    headerBg: "#f59e0b",
    headerText: "#fff",
    bodyBg: "#fffbf0",
    border: "#f59e0b",
    accent: "#f59e0b",
    icon: "★",
    style: "banner",
  },
  definition: {
    label: "Definition",
    headerBg: "#3b82f6",
    headerText: "#fff",
    bodyBg: "#eff6ff",
    border: "#3b82f6",
    accent: "#3b82f6",
    icon: "◆",
    style: "box",
  },
  example: {
    label: "Example",
    headerBg: "#8b5cf6",
    headerText: "#fff",
    bodyBg: "#f5f3ff",
    border: "#8b5cf6",
    accent: "#8b5cf6",
    icon: "●",
    style: "box",
  },
  "exam-alert": {
    label: "Exam Alert !!",
    headerBg: "#ef4444",
    headerText: "#fff",
    bodyBg: "#fef2f2",
    border: "#ef4444",
    accent: "#ef4444",
    icon: "⚡",
    style: "alert",
  },
  riddle: {
    label: "Think About It",
    headerBg: "#10b981",
    headerText: "#fff",
    bodyBg: "#ecfdf5",
    border: "#10b981",
    accent: "#10b981",
    icon: "?",
    style: "box",
  },
  note: {
    label: "Note",
    headerBg: "#6b7280",
    headerText: "#fff",
    bodyBg: "#f9fafb",
    border: "#d1d5db",
    accent: "#6b7280",
    icon: "–",
    style: "bullet",
  },
};

function paginateBlocks(blocks, perPage) {
  const pages = [];
  for (let i = 0; i < blocks.length; i += perPage) {
    pages.push(blocks.slice(i, i + perPage));
  }
  return pages.length > 0 ? pages : [[]];
}

function BlockCard({ block, index }) {
  const cfg = BLOCK_CONFIG[block.type] || BLOCK_CONFIG.note;

  if (cfg.style === "banner") {
    return (
      <div style={{
        marginBottom: 12,
        animation: `fadeIn 0.3s ease ${index * 0.08}s both`,
      }}>
        <div style={{
          background: cfg.headerBg,
          borderRadius: "8px 8px 0 0",
          padding: "6px 12px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          <span style={{ color: cfg.headerText, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
            {cfg.icon} {cfg.label}
          </span>
        </div>
        <div style={{
          background: cfg.bodyBg,
          border: `2px solid ${cfg.border}`,
          borderTop: "none",
          borderRadius: "0 0 8px 8px",
          padding: "8px 12px",
          fontFamily: "'Caveat', cursive",
          fontSize: 18,
          fontWeight: 700,
          color: "#1f2937",
          lineHeight: 1.3,
        }}>
          {block.content}
        </div>
      </div>
    );
  }

  if (cfg.style === "alert") {
    return (
      <div style={{
        marginBottom: 12,
        border: `2px solid ${cfg.border}`,
        borderRadius: 8,
        overflow: "hidden",
        animation: `fadeIn 0.3s ease ${index * 0.08}s both`,
      }}>
        <div style={{
          background: cfg.headerBg,
          padding: "4px 10px",
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}>
          <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
            {cfg.icon} {cfg.label}
          </span>
        </div>
        <div style={{
          background: cfg.bodyBg,
          padding: "8px 12px",
          fontFamily: "'Caveat', cursive",
          fontSize: 15,
          color: "#1f2937",
          lineHeight: 1.5,
          borderLeft: `4px solid ${cfg.border}`,
        }}>
          {block.content}
        </div>
      </div>
    );
  }

  if (cfg.style === "bullet") {
    return (
      <div style={{
        marginBottom: 10,
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        animation: `fadeIn 0.3s ease ${index * 0.08}s both`,
      }}>
        <div style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: cfg.accent,
          flexShrink: 0,
          marginTop: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>–</span>
        </div>
        <div style={{
          fontFamily: "'Caveat', cursive",
          fontSize: 15,
          color: "#374151",
          lineHeight: 1.5,
          paddingTop: 2,
        }}>
          {block.content}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      marginBottom: 12,
      border: `2px solid ${cfg.border}`,
      borderRadius: 8,
      overflow: "hidden",
      animation: `fadeIn 0.3s ease ${index * 0.08}s both`,
    }}>
      <div style={{
        background: cfg.headerBg,
        padding: "4px 10px",
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        width: "100%",
      }}>
        <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
          {cfg.icon} {cfg.label}
        </span>
      </div>
      <div style={{
        background: cfg.bodyBg,
        padding: "8px 12px",
        fontFamily: "'Caveat', cursive",
        fontSize: 15,
        color: "#1f2937",
        lineHeight: 1.5,
      }}>
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
      background: "#fdfaf4",
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
          background: "rgba(147,197,253,0.4)",
          pointerEvents: "none",
        }} />
      ))}

      {/* Margin line */}
      <div style={{
        position: "absolute",
        top: 0, bottom: 0,
        [side === "left" ? "left" : "right"]: 42,
        width: 2,
        background: "rgba(252,165,165,0.5)",
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
        background: side === "left" ? "rgba(0,0,0,0.03)" : "rgba(0,0,0,0.03)",
      }}>
        {Array.from({ length: holeCount }).map((_, i) => (
          <div key={i} style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#e8e0d4",
            border: "1.5px solid #c8bfb2",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.12)",
          }} />
        ))}
      </div>

      {/* Page content */}
      <div style={{
        position: "absolute",
        top: 10,
        left:  side === "left"  ? 52 : 8,
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
          marginBottom: 10,
          paddingBottom: 5,
          borderBottom: "2px solid #f59e0b",
        }}>
          <span style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 13,
            fontWeight: 700,
            color: "#f59e0b",
            letterSpacing: "0.04em",
          }}>
            NotedIQ
          </span>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 10,
            color: "#9ca3af",
            fontWeight: 600,
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
            color: "#d1d5db",
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
        color: "#c9bfb0",
        letterSpacing: "0.05em",
      }}>
        {pageNumber} / {totalPages}
      </div>
    </div>
  );
}

export default function NotebookView({ notes }) {
  const pages      = paginateBlocks(notes, BLOCKS_PER_PAGE);
  const totalPages = pages.length;
  const [spread,   setSpread]   = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [dir,      setDir]      = useState(null);
  const prevLen    = useRef(0);

  useEffect(() => {
    if (notes.length > prevLen.current && notes.length > 0) {
      const lastSpread = Math.floor((totalPages - 1) / 2);
      if (lastSpread !== spread) goTo(lastSpread, "forward");
    }
    prevLen.current = notes.length;
  }, [notes.length]);

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

  const maxSpread   = Math.floor((totalPages - 1) / 2);
  const leftBlocks  = pages[spread * 2]     || [];
  const rightBlocks = pages[spread * 2 + 1] || [];

  if (notes.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <div style={{
          width: 280, height: 180,
          background: "#fdfaf4",
          borderRadius: 8,
          border: "2px solid #e5ddd0",
          boxShadow: "4px 4px 20px rgba(0,0,0,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8,
        }}>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: "#f59e0b", fontWeight: 700 }}>NotedIQ</div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: "#9ca3af", textAlign: "center", lineHeight: 1.4 }}>
            Your notes will appear here.<br/>
            <span style={{ fontSize: 13 }}>Paste text or a YouTube link to begin.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 20px", gap: 16, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap');
        @keyframes fadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        @keyframes flipFwd { 0%{transform:perspective(1400px) rotateY(0deg);opacity:1} 45%{transform:perspective(1400px) rotateY(-88deg);opacity:0.3} 100%{transform:perspective(1400px) rotateY(0deg);opacity:1} }
        @keyframes flipBck { 0%{transform:perspective(1400px) rotateY(0deg);opacity:1} 45%{transform:perspective(1400px) rotateY(88deg);opacity:0.3} 100%{transform:perspective(1400px) rotateY(0deg);opacity:1} }
        .nb-flip-fwd { animation: flipFwd 0.45s cubic-bezier(0.4,0,0.2,1) forwards; }
        .nb-flip-bck { animation: flipBck 0.45s cubic-bezier(0.4,0,0.2,1) forwards; }
        .nb-btn { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.14); color:#c9d1d9; border-radius:8px; padding:7px 18px; font-size:12px; font-family:'Inter',sans-serif; cursor:pointer; transition:background 0.15s; }
        .nb-btn:hover:not(:disabled) { background:rgba(255,255,255,0.13); }
        .nb-btn:disabled { opacity:0.28; cursor:not-allowed; }
        .nb-dot { width:7px; height:7px; border-radius:50%; background:rgba(255,255,255,0.18); cursor:pointer; transition:background 0.15s,transform 0.15s; }
        .nb-dot.on { background:#f59e0b; transform:scale(1.4); }
      `}</style>

      {/* Notebook spread */}
      <div
        className={flipping ? (dir === "forward" ? "nb-flip-fwd" : "nb-flip-bck") : ""}
        style={{
          display: "flex",
          width: "min(900px, 100%)",
          height: "min(540px, calc(100vh - 190px))",
          borderRadius: 6,
          overflow: "hidden",
          border: "1.5px solid #c0b8ad",
          boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.3)",
        }}
      >
        {/* Left page */}
        <div style={{ flex: 1, borderRight: "1px solid #d4c9bc", position: "relative" }}>
          <NotebookPage blocks={leftBlocks}  pageNumber={spread*2+1}   totalPages={totalPages} side="left" />
        </div>

        {/* Spine */}
        <div style={{
          width: 16,
          flexShrink: 0,
          background: "linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0.03) 35%, rgba(0,0,0,0.03) 65%, rgba(0,0,0,0.12))",
          borderLeft: "1px solid #c0b8ad",
          borderRight: "1px solid #c0b8ad",
          zIndex: 2,
        }} />

        {/* Right page */}
        <div style={{ flex: 1, borderLeft: "1px solid #d4c9bc", position: "relative" }}>
          <NotebookPage blocks={rightBlocks} pageNumber={spread*2+2}   totalPages={totalPages} side="right" />
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button className="nb-btn" onClick={() => goTo(spread-1,"back")}    disabled={spread===0||flipping}>← Prev</button>
        <div style={{ display:"flex", gap:5, alignItems:"center" }}>
          {Array.from({ length: maxSpread+1 }).map((_,i) => (
            <div key={i} className={`nb-dot${i===spread?" on":""}`} onClick={() => goTo(i, i>spread?"forward":"back")} />
          ))}
        </div>
        <button className="nb-btn" onClick={() => goTo(spread+1,"forward")} disabled={spread>=maxSpread||flipping}>Next →</button>
      </div>

      <div style={{ fontSize:11, color:"#6e7681", fontFamily:"'Inter',sans-serif", letterSpacing:"0.04em" }}>
        Spread {spread+1} of {maxSpread+1} · {notes.length} notes
      </div>
    </div>
  );
}