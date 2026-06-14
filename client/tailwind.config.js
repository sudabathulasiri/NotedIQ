/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ds: {
          bg:       "#0d1117",
          surface:  "#111620",
          border:   "rgba(255,255,255,0.07)",
          green:    "#10b981",
          blue:     "#378add",
          purple:   "#7f77dd",
          amber:    "#ef9f27",
          muted:    "#6e7681",
          dim:      "#484f58",
          text:     "#c9d1d9",
          heading:  "#f0f6fc",
        },
      },
      fontFamily: {
        caveat: ["Caveat", "cursive"],
        anton:  ["Anton", "sans-serif"],
      },
    },
  },
  plugins: [],
};
