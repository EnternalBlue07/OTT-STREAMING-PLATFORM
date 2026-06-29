import type { Config } from "tailwindcss";

/**
 * Design tokens — the single source of truth for the OTT design language.
 * Dark-first, cinematic. Brand palette per product/steering.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core surfaces
        background: "#0A0A0A", // deep black (softer than pure black)
        surface: {
          DEFAULT: "#1a1a1a",
          raised: "#1f1f1f",
          glass: "rgba(255,255,255,0.05)",
        },
        foreground: "#E5E5E5",
        muted: {
          DEFAULT: "#8a8a8a",
          foreground: "#a3a3a3",
        },
        // Brand
        primary: {
          DEFAULT: "#E50914",
          hover: "#f6121d",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#564DFF",
          hover: "#6b63ff",
          foreground: "#ffffff",
        },
        border: "rgba(255,255,255,0.08)",
        ring: "#564DFF",
        success: "#22c55e",
        danger: "#ef4444",
        warning: "#f59e0b",
      },
      fontFamily: {
        display: ["var(--font-display)", "Inter Tight", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      fontSize: {
        "display-lg": ["clamp(2.5rem, 1.5rem + 4vw, 5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display": ["clamp(2rem, 1.2rem + 3vw, 3.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "heading": ["clamp(1.5rem, 1rem + 1.5vw, 2rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        "elevation-1": "0 1px 2px rgba(0,0,0,0.4)",
        "elevation-2": "0 4px 12px rgba(0,0,0,0.45)",
        "elevation-3": "0 10px 30px rgba(0,0,0,0.5)",
        "elevation-4": "0 24px 60px rgba(0,0,0,0.6)",
        "glow-primary": "0 0 40px rgba(229,9,20,0.35)",
        "glow-secondary": "0 0 40px rgba(86,77,255,0.35)",
      },
      transitionTimingFunction: {
        "ease-out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        "ease-spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      transitionDuration: {
        "50": "50ms",
        "250": "250ms",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "aurora-shift": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(2%, -2%, 0) scale(1.05)" },
        },
        "shimmer": {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s var(--ease-out-quart, cubic-bezier(0.25,1,0.5,1)) both",
        "aurora": "aurora-shift 18s ease-in-out infinite",
        "shimmer": "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
