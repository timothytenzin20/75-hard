import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-strong": "rgb(var(--color-surface-strong) / <alpha-value>)",
        "surface-muted": "rgb(var(--color-surface-muted) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        outline: "rgb(var(--color-outline) / <alpha-value>)",
        orange: "rgb(var(--color-accent) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        blue: "rgb(var(--color-secondary) / <alpha-value>)"
      },
      fontFamily: {
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        hard: "4px 4px 0 0 rgb(var(--color-primary))",
        "hard-orange": "4px 4px 0 0 rgb(var(--color-accent))"
      }
    }
  },
  plugins: []
} satisfies Config;
