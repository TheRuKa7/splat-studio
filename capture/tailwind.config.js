/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        surface: "#111111",
        border: "#222222",
        primary: "#f59e0b",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        muted: "#8b8b8b",
      },
    },
  },
};
