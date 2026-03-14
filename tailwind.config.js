/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        secondary: "#fbbf24",
        accent: "#ec4899",
        background: "#0f172a",
        surface: "#1e293b",
        "surface-light": "#334155",
        "text-primary": "#f8fafc",
        "text-secondary": "#94a3b8",
      },
    },
  },
  plugins: [],
};
