import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        surface:    '#0F0F1A',
        surface2:   '#161622',
        gold:       '#C9A84C',
        'gold-light':'#E8D5A3',
        'gold-dim': '#8B7035',
        'off-white':'#F0EEE8',
        silver:     '#C8C8D8',
        gray:       '#6B6B88',
        'gray-light':'#9090AA',
        border:     '#1E1E2E',
        'border-soft':'#2A2A3E',
        'border-gold':'#3A3020',
        green:      '#2ECC71',
        amber:      '#F39C12',
        red:        '#E74C3C',
        blue:       '#3498DB',
      },
      fontFamily: {
        syne: ['var(--font-syne)', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
