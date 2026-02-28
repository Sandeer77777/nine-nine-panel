
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          800: '#1a1a1e',
          900: '#0e0e10',
          950: '#000000',
        },
        emerald: { // Custom Emerald Premium palette
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efad',
          400: '#4ade80',
          500: '#10b981', // Deep Emerald
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b', // Darker background use
          950: '#022c22',
        },
        profit: {
          DEFAULT: '#10b981',
          glow: 'rgba(16, 185, 129, 0.4)',
        },
        loss: {
          DEFAULT: '#ef4444',
          glow: 'rgba(239, 68, 68, 0.4)',
        },
        // Cores para o tema claro e escuro
        background: {
          light: '#f8fafc', // slate-50
          dark: '#000000', // Deep Black
        },
        text: {
          light: '#1e293b', // slate-800
          dark: '#e2e8f0', // slate-200
        },
        glassBorder: {
          dark: 'rgba(255, 255, 255, 0.05)',
          light: 'rgba(0, 0, 0, 0.1)',
        },
        glassBg: {
          dark: 'rgba(14, 14, 16, 0.8)', // Deep Charcoal
          light: 'rgba(255, 255, 255, 0.6)',
        },
        neonPrimary: {
          dark: '#10b981',
          light: '#0ea5e9',
        },
        neonSecondary: {
          dark: '#0ea5e9',
          light: '#10b981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Add Inter to sans-serif stack
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        slideUpFade: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'breathe': 'breathe 3s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'slideUpFade': 'slideUpFade 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      }
    },
  },
  plugins: [],
}
