import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0e0e0e",
        surface: "#1a1a1a",
        surface2: "#222222",
        border: "#2e2e2e",
        text: "#f0f0f0",
        muted: "#777777",
        accent: "#f5c842",
        accent2: "#ff6b6b",
        accent3: "#6bcfff",
        accent4: "#a8ff78",
        accent5: "#ff9f43",
        accent6: "#d97bff",
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        body: ["var(--font-dmsans)", "sans-serif"],
      },
      maxWidth: {
        app: "480px",
      },
    },
  },
  plugins: [],
};

export default config;
