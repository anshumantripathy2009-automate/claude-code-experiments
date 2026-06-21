import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:   { DEFAULT: '#0A1628', 800: '#0D1F38', 700: '#122647', 600: '#1A3461' },
        ivory:  { DEFAULT: '#F8F5F0', 100: '#FFFFFF', 200: '#FAF8F4', 300: '#F0EBE3' },
        gold:   { DEFAULT: '#C9A961', 400: '#D4B878', 300: '#E0C98A', 200: '#EAD9A8', dark: '#A88940' },
        mint:   { DEFAULT: '#9FD8C7', 400: '#B5E3D6', 300: '#CBF0E8', dark: '#6EBDAA' },
        // alias
        brand:  '#C9A961',
      },
      fontFamily: {
        serif:  ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans:   ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono:   ['var(--font-geist-mono)', 'monospace'],
      },
      fontSize: {
        // Fluid type scale using clamp
        'display':   ['clamp(3rem, 8vw, 7.5rem)', { lineHeight: '1.0', letterSpacing: '-0.04em' }],
        'headline':  ['clamp(2rem, 5vw, 4.5rem)',  { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'title':     ['clamp(1.5rem, 3vw, 2.5rem)', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'body-lg':   ['clamp(1rem, 1.5vw, 1.25rem)', { lineHeight: '1.7' }],
      },
      animation: {
        'spotlight':      'spotlight 2s ease .75s 1 forwards',
        'float':          'float 6s ease-in-out infinite',
        'float-delayed':  'float 6s ease-in-out 2s infinite',
        'fade-up':        'fadeUp 0.8s ease forwards',
        'cursor-expand':  'cursorExpand 0.3s ease forwards',
        'loading-bar':    'loadingBar 2s ease forwards',
        'marquee':        'marquee 30s linear infinite',
        'marquee-rev':    'marquee 30s linear infinite reverse',
        'grain':          'grain 0.5s steps(1) infinite',
      },
      keyframes: {
        spotlight: {
          '0%':   { opacity: '0', transform: 'translate(-72%, -62%) scale(0.5)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -40%) scale(1)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-16px)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        loadingBar: {
          from: { width: '0%' },
          to:   { width: '100%' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        grain: {
          '0%,100%': { transform: 'translate(0,0)' },
          '10%': { transform: 'translate(-2%,-3%)' },
          '20%': { transform: 'translate(2%,1%)' },
          '30%': { transform: 'translate(-1%,3%)' },
          '40%': { transform: 'translate(3%,-1%)' },
          '50%': { transform: 'translate(-2%,2%)' },
          '60%': { transform: 'translate(1%,-2%)' },
          '70%': { transform: 'translate(-3%,1%)' },
          '80%': { transform: 'translate(2%,3%)' },
          '90%': { transform: 'translate(-1%,-1%)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'gold':    '0 0 0 1px #C9A961, 0 8px 32px rgba(201,169,97,0.25)',
        'glow':    '0 0 60px rgba(201,169,97,0.15), 0 0 120px rgba(201,169,97,0.08)',
        'navy':    '0 32px 80px rgba(10,22,40,0.6)',
      },
    },
  },
  plugins: [],
}

export default config
