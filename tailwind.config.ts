import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1a1b1e",
        clay: "#d9a26f",
        field: "#f4efe9",
        moss: "#2f5d50",
        sun: "#f3c85c",
        stone: "#8b857b"
      },
      fontFamily: {
        display: ["\"Fraunces\"", "serif"],
        body: ["\"Work Sans\"", "sans-serif"]
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: []
};

export default config;
