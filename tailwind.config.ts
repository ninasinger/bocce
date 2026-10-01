import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Majolica: cobalt and lemon hand-painted tiles on white stucco.
      colors: {
        ink: "#14284B",
        cobalt: { DEFAULT: "#1E4E9C", deep: "#163B77" },
        lemon: { DEFAULT: "#F2C230", deep: "#6B5200" },
        leaf: { DEFAULT: "#4C7A34", deep: "#2F4F1F" },
        terracotta: { DEFAULT: "#C4623A", deep: "#7A3315" },
        stucco: "#FBF8F1",
        slate: "#56688A",
        tile: "#DCE3EF"
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"]
      },
      boxShadow: {
        soft: "0 6px 20px rgba(20, 40, 75, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
