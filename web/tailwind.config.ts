import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB", // blue-600
          light: "#3B82F6", // blue-500
          dark: "#1E40AF", // blue-800
        },
        secondary: {
          DEFAULT: "#64748B", // slate-500
          light: "#94A3B8", // slate-400
          dark: "#475569", // slate-600
        },
        background: {
          DEFAULT: "#F8FAFC", // light background
          card: "#FFFFFF", // white cards
          sidebar: "#F1F5F9", // slightly gray sidebar
          accent: "#E2E8F0", // accent panels
        },
        border: {
          DEFAULT: "#E5E7EB",
          strong: "#CBD5E1",
        },
        text: {
          DEFAULT: "#1E293B",
          light: "#475569",
          muted: "#94A3B8",
        },
        success: "#22C55E",
        warning: "#FACC15",
        danger: "#EF4444",
        info: "#3B82F6",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 6px rgba(0,0,0,0.05)",
        card: "0 4px 10px rgba(0,0,0,0.08)",
      },
      backgroundImage: {
        "gradient-main": "linear-gradient(135deg, #2563EB 0%, #1E3A8A 100%)",
        "gradient-sidebar":
          "linear-gradient(to bottom, #F1F5F9 0%, #E2E8F0 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
