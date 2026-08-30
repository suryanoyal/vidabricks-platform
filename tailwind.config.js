/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vb: {
          black: "#111111",
          dark: "#0a0e1a",
          navy: "#0d1322",
          card: "#141c2e",
          "card-hover": "#1a253c",
          border: "#1e2a42",
          "border-light": "#2a3b5c",
          gold: "#b5900a",
          "gold-light": "#c9a84c",
          "gold-champagne": "#e8c97a",
          "gold-dim": "#7a6230",
          "gold-muted": "rgba(201, 168, 76, 0.15)",
          offwhite: "#f8f8f6",
          "grey-light": "#f2f2f0",
          "grey-mid": "#e0e0dc",
          "grey-text": "#888880",
          "grey-dark": "#333330",
          whatsapp: "#25d366",
          "whatsapp-dark": "#1da851",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "gold-glow": "0 0 25px -5px rgba(201, 168, 76, 0.35)",
        "gold-subtle": "0 4px 20px -2px rgba(181, 144, 10, 0.2)",
        "luxury-card": "0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(201, 168, 76, 0.15)",
        "whatsapp-glow": "0 4px 20px rgba(37, 211, 102, 0.4)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: 0.8, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.03)" },
        },
        fadeIn: {
          from: { opacity: 0, transform: "translateY(8px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 2.5s infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};
