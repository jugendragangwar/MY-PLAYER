import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    spacing: {
      '0': '0px',
      '1': '4px',
      '2': '8px',
      '3': '12px',
      '4': '16px',
      '6': '24px',
      '8': '32px',
      '12': '48px',
      '16': '64px',
    },
    extend: {
      fontFamily: {
        display: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        player: {
          bg: "hsl(var(--bg))",
          surface: "hsl(var(--surface))",
          'surface-2': "hsl(var(--surface-2))",
          border: "hsl(var(--border))",
          text: "hsl(var(--text-primary))",
          muted: "hsl(var(--text-muted))",
          accent: "hsl(var(--accent))",
          accent2: "hsl(var(--accent-2))",
        },
      },
      keyframes: {
      },
      animation: {
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
