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
        /* ── Sampler semantic tokens — all driven by CSS vars ── */
        background:    'var(--bg)',
        chrome:        'var(--chrome)',
        inset:         'var(--inset)',
        surface:       'var(--surface)',
        surface2:      'var(--surface2)',
        border:        'var(--border)',
        line:          'var(--line)',
        'border-soft': 'var(--soft)',
        'accent-tint': 'var(--accent-tint)',
        'off-white':   'var(--ink)',
        ink:           'var(--ink)',
        'text-2':      'var(--text2)',
        silver:        'var(--text2)',
        'gray-light':  'var(--gray)',
        gray:          'var(--muted)',
        dim:           'var(--dim)',

        /* Accent — rgb channel vars enable /opacity modifier support */
        gold:          'rgb(var(--accent-rgb) / <alpha-value>)',
        'gold-light':  'var(--accent-hi)',
        'gold-dim':    'var(--accent-dim)',
        accent:        'rgb(var(--accent-rgb) / <alpha-value>)',
        'border-gold': 'var(--border-gold)',

        /* Status — rgb channel vars enable /opacity modifier support */
        green:         'rgb(var(--green-rgb) / <alpha-value>)',
        amber:         'rgb(var(--amber-rgb) / <alpha-value>)',
        red:           'rgb(var(--red-rgb) / <alpha-value>)',
        blue:          'rgb(var(--blue-rgb) / <alpha-value>)',

        /* ── OS legacy aliases (backward compat) ── */
        bg:            'var(--bg)',
        surf:          'var(--surface)',
        surf2:         'var(--surface2)',
        bord:          'var(--border)',
        vgold:         'rgb(var(--accent-rgb) / <alpha-value>)',
        'vgold-hi':    'var(--accent-hi)',
        'vgold-dim':   'var(--accent-dim)',
        muted:         'var(--muted)',
        'grade-a':     'rgb(var(--green-rgb) / <alpha-value>)',
        'grade-b':     'rgb(var(--amber-rgb) / <alpha-value>)',
        'grade-c':     'rgb(var(--red-rgb) / <alpha-value>)',
        'grade-a-dim': 'var(--ra-dim)',
        'grade-b-dim': 'var(--rb-dim)',
        'grade-c-dim': 'var(--rc-dim)',
      },
      fontFamily: {
        syne:    ['var(--font-syne)', 'sans-serif'],
        sans:    ['var(--font-dm-sans)', 'sans-serif'],
        mono:    ['var(--font-dm-mono)', 'monospace'],
        display: ['var(--font-cg)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
