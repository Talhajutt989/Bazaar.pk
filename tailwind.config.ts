import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#061b14",
        },
        obsidian: {
          800: "#1e293b",
          900: "#0f172a",
          950: "#090d16",
        },
        champagne: {
          200: "#fef08a",
          300: "#fde047",
          400: "#facc15",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        accent: {
          300: "#fde047",
          400: "#facc15",
          500: "#f59e0b",
          600: "#d97706",
        },
        surface: {
          DEFAULT: "#f8fafc",
          card: "#ffffff",
          muted: "#f1f5f9",
          pearl: "#fafafa",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Outfit", "Inter", "sans-serif"],
      },
      boxShadow: {
        'brand': '0 4px 20px -2px rgba(16, 185, 129, 0.25)',
        'brand-lg': '0 12px 35px -3px rgba(6, 78, 59, 0.3)',
        'gold': '0 4px 20px -2px rgba(245, 158, 11, 0.35)',
        'luxe': '0 10px 40px -10px rgba(15, 23, 42, 0.08)',
        'luxe-hover': '0 20px 45px -10px rgba(16, 185, 129, 0.18)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'glow-pulse': 'glowPulse 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
