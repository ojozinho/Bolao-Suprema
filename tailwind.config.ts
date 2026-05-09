import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F5F1E8',
          deep: '#ECE6D6',
          white: '#FFFCF5',
        },
        ink: {
          DEFAULT: '#0D0D0D',
          2: '#2A2A2A',
          3: '#6B6B66',
          4: '#A9A89F',
        },
        line: '#1F1F1F',
        hairline: 'rgba(13,13,13,0.12)',
        yellow: '#FFCB05',
        green: {
          DEFAULT: '#00A651',
          deep: '#007A3E',
        },
        red: '#E63946',
        blue: '#1D3557',
        gold: '#C9A856',
        sky: '#6FB4FF',
      },
      fontFamily: {
        display: ['Anton', 'Bebas Neue', 'Impact', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '20px',
        full: '999px',
      },
      boxShadow: {
        btn: '4px 4px 0 #0D0D0D',
        'btn-hover': '5px 5px 0 #0D0D0D',
        'btn-active': '2px 2px 0 #0D0D0D',
        card: '4px 4px 0 #0D0D0D',
        'card-yellow': '8px 8px 0 #FFCB05',
        'card-live': '0 0 0 3px #E63946, 6px 6px 0 #0D0D0D',
        device: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      },
      letterSpacing: {
        eyebrow: '0.14em',
        display: '0.005em',
        mono: '-0.02em',
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'pulse-live': 'pulse-live 1.4s ease-in-out infinite',
        appear: 'appear 0.5s ease both',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-live': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.45', transform: 'scale(1.2)' },
        },
        appear: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'pitch-turf':
          'repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(0,0,0,.06) 24px, rgba(0,0,0,.06) 25px)',
        'paper-grain':
          'radial-gradient(ellipse at 20% 50%, rgba(120,72,0,.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(80,60,0,.05) 0%, transparent 40%), radial-gradient(ellipse at 50% 80%, rgba(100,80,20,.03) 0%, transparent 60%)',
        stripe:
          'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(0,0,0,.06) 4px, rgba(0,0,0,.06) 8px)',
      },
    },
  },
  plugins: [],
} satisfies Config
