import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-geist)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-instrument)', 'Georgia', 'serif'],
        mono: ['var(--font-geist-mono)', 'JetBrains Mono', 'monospace'],
        // legacy aliases
        syne: ['var(--font-geist)', 'system-ui', 'sans-serif'],
        inter: ['var(--font-geist)', 'system-ui', 'sans-serif'],
        editorial: ['var(--font-instrument)', 'Georgia', 'serif'],
      },
      colors: {
        // Layered dark canvas (Linear/Vercel inspired)
        bg: {
          DEFAULT: '#0A0A0B',
          sub: '#0E0E10',
          surface: '#131316',
          card: '#17171B',
          elevated: '#1C1C21',
          hover: '#222228',
        },
        // Borders / strokes
        line: {
          DEFAULT: '#26262B',
          soft: '#1D1D22',
          strong: '#34343A',
          accent: '#3A3A42',
        },
        // Text
        fg: {
          DEFAULT: '#FAFAFA',
          dim: '#A1A1AA',
          muted: '#71717A',
          faint: '#52525B',
        },
        // Signature emerald (refined growth-mint)
        accent: {
          DEFAULT: '#3FE0B0',
          hover: '#34CBA0',
          dim: '#2BA889',
          tint: 'rgba(63,224,176,0.10)',
          glow: 'rgba(63,224,176,0.20)',
        },
        // Data signal colors (soft, refined — not garish)
        signal: {
          go: '#3FE0B0',
          kill: '#FB7185',
          pivot: '#FBBF24',
          insight: '#7DD3FC',
          violet: '#A78BFA',
          rose: '#FB7185',
        },
        // Legacy aliases kept so any straggler still renders
        canvas: '#0A0A0B',
        paper: '#131316',
        cream: '#17171B',
        ink: {
          DEFAULT: '#FAFAFA',
          soft: '#A1A1AA',
          mute: '#71717A',
          faint: '#52525B',
        },
        gold: { DEFAULT: '#3FE0B0', hover: '#34CBA0', muted: 'rgba(63,224,176,0.10)' },
        forest: { DEFAULT: '#3FE0B0', hover: '#34CBA0', tint: 'rgba(63,224,176,0.10)' },
        umber: { DEFAULT: '#FBBF24', hover: '#F59E0B', tint: 'rgba(251,191,36,0.10)' },
        oxblood: { DEFAULT: '#FB7185', tint: 'rgba(251,113,133,0.10)' },
        rule: { DEFAULT: '#26262B', soft: '#1D1D22', strong: '#34343A' },
        surface: '#131316',
        elevated: '#1C1C21',
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.025em',
        wider: '0.04em',
        widest: '0.1em',
        caps: '0.16em',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'rise': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'reveal-up': {
          '0%': { opacity: '0', transform: 'translateY(28px)', filter: 'blur(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        'cursor-blink': {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'pulse-dot': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.4)', opacity: '0.7' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'ticker': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'spark': {
          '0%': { strokeDashoffset: '400' },
          '100%': { strokeDashoffset: '0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5', filter: 'blur(40px)' },
          '50%': { opacity: '0.8', filter: 'blur(50px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.7s cubic-bezier(0.22,1,0.36,1) forwards',
        'fade-in-down': 'fade-in-down 0.5s cubic-bezier(0.22,1,0.36,1) forwards',
        'rise': 'rise 0.9s cubic-bezier(0.22,1,0.36,1) forwards',
        'reveal-up': 'reveal-up 1s cubic-bezier(0.22,1,0.36,1) forwards',
        'cursor-blink': 'cursor-blink 1s steps(2) infinite',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 12s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'ticker': 'ticker 60s linear infinite',
        'spin-slow': 'spin-slow 30s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'spark': 'spark 1.6s cubic-bezier(0.22,1,0.36,1) forwards',
        'glow-pulse': 'glow-pulse 8s ease-in-out infinite',
      },
      backgroundImage: {
        'grid': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' fill='none'%3E%3Cpath d='M0 .5H40M.5 0V40' stroke='rgba(255,255,255,0.04)'/%3E%3C/svg%3E\")",
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'glow-accent': '0 0 40px -10px rgba(63,224,176,0.4)',
        'glow-strong': '0 0 80px -20px rgba(63,224,176,0.5)',
        'card': '0 1px 0 rgba(255,255,255,0.04) inset, 0 0 0 1px #26262B, 0 12px 32px -16px rgba(0,0,0,0.6)',
        'card-hover': '0 1px 0 rgba(255,255,255,0.06) inset, 0 0 0 1px #34343A, 0 20px 40px -16px rgba(0,0,0,0.7)',
      },
    },
  },
  plugins: [],
}

export default config
