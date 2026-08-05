import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          50: "#fdf8fb",
          100: "#faeef5",
          200: "#f3d9e8",
          300: "#ebb1cb",
          400: "#e098bc",
          500: "#d483ad",
          600: "#bc6b95",
          700: "#a0557c",
        },
        lavender: {
          50: "#f8f6fc",
          100: "#f0ecf8",
          200: "#ddd4f0",
          300: "#c4b5e3",
          400: "#a892d4",
          500: "#8b6fc4",
          600: "#7358a8",
          700: "#5c4588",
        },
        turquoise: {
          50: "#f0faf9",
          100: "#d9f2ef",
          200: "#b3e5de",
          300: "#7dd3c8",
          400: "#4db8aa",
          500: "#2d9a8c",
          700: "#1f7a6e",
        },
        cream: {
          50: "#fefdfb",
          100: "#faf8f4",
          200: "#f5f0e8",
        },
        sage: {
          50: "#f4f7f4",
          100: "#e4ebe4",
          200: "#c8d6c8",
          300: "#9fb89f",
          400: "#7a9a7a",
          700: "#4a6b4a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(139, 111, 196, 0.08), 0 4px 6px -4px rgba(235, 177, 203, 0.08)",
        card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(139, 111, 196, 0.05), 0 1px 0 rgba(235, 177, 203, 0.14)",
        rose: "0 2px 12px -2px rgba(235, 177, 203, 0.22), 0 4px 8px -4px rgba(139, 111, 196, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
