import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#14171C",
          soft: "#1E222B",
          line: "#2A2F3A",
        },
        paper: {
          DEFAULT: "#F6F3EA",
          dim: "#ECE6D6",
          card: "#FFFFFF",
        },
        stamp: {
          DEFAULT: "#A63328",
          dark: "#7E241C",
          light: "#F1DAD6",
        },
        brass: {
          DEFAULT: "#B08D46",
          light: "#E7DAB8",
          dark: "#8A6C33",
        },
        ok: {
          DEFAULT: "#3E6E52",
          light: "#DCE9E0",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,23,28,0.06), 0 8px 24px rgba(20,23,28,0.06)",
      },
      backgroundImage: {
        grain: "radial-gradient(circle at 1px 1px, rgba(20,23,28,0.05) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
export default config;
