import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#141313",
        surface: "#1c1b1b",
        "surface-strong": "#2a2a2a",
        "surface-muted": "#353434",
        primary: "#ffffff",
        muted: "#c4c7c8",
        outline: "#444748",
        orange: "#ff5f1f",
        success: "#00ff41",
        danger: "#ff3b30",
        blue: "#007aff"
      },
      fontFamily: {
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        hard: "4px 4px 0 0 #ffffff",
        "hard-orange": "4px 4px 0 0 #ff5f1f"
      }
    }
  },
  plugins: []
} satisfies Config;
