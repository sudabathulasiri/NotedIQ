/**
 * theme.js
 * Shared design tokens for the NotedIQ workspace.
 *
 * Derived directly from LandingPage.jsx / AuthPage.jsx so every screen of
 * the app shares one identity: a pure-black canvas, Playfair Display for
 * display type, Inter for everything functional, and Caveat for the
 * "handwritten" notebook moments. One signature accent (emerald) marks
 * anything live / AI-generated; note types and priorities get their own
 * restrained accent colors so the workspace stays readable and scannable.
 */

export const FONT_IMPORT =
    "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Caveat:wght@400;600;700&display=swap');";

export const COLORS = {
    bg: "#000000",

    surface: "rgba(255,255,255,0.03)",
    surfaceHover: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.08)",
    borderHover: "rgba(255,255,255,0.18)",
    divider: "rgba(255,255,255,0.07)",

    text: "#ffffff",
    textSecondary: "rgba(255,255,255,0.55)",
    textTertiary: "rgba(255,255,255,0.32)",
    textFaint: "rgba(255,255,255,0.18)",

    // signature "live / AI" accent — used sparingly for active states,
    // connection status, and primary highlights
    accent: "#10b981",
    accentSoft: "rgba(16,185,129,0.08)",
    accentBorder: "rgba(16,185,129,0.25)",
};

// Per note-type accent + label — shared by NoteBlock, NotebookView and
// StudentView so every surface agrees on what a "Definition" or
// "Exam alert" looks like.
export const BLOCK_META = {
    heading: { label: "Topic", accent: "#ffffff" },
    definition: { label: "Definition", accent: "#10b981" },
    example: { label: "Example", accent: "#3b82f6" },
    "exam-alert": { label: "Exam alert", accent: "#ef4444" },
    riddle: { label: "Think about it", accent: "#f59e0b" },
    note: { label: "Note", accent: "#8b5cf6" },
    decision: { label: "Decision", accent: "#94a3b8" },
    "task-item": { label: "Action item", accent: "#3b82f6" },
};

// Priority accents for the Corporate action-item matrix.
export const PRIORITY_META = {
    high: { label: "High", accent: "#ef4444" },
    medium: { label: "Medium", accent: "#f59e0b" },
    low: { label: "Low", accent: "#10b981" },
};

// Small helper: take a 6-digit hex accent and return an rgba() string at
// the given alpha — used to build tinted card backgrounds on black.
export function tint(hex, alpha) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}