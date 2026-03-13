/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        'sidebar-bg': '#0d0d14',
        'card-bg': '#13131f',
        border: '#1e1e2e',
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#8b5cf6',
          foreground: '#ffffff',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
        'text-muted': '#475569',
        muted: {
          DEFAULT: '#1e1e2e',
          foreground: '#94a3b8',
        },
        popover: {
          DEFAULT: '#13131f',
          foreground: '#f1f5f9',
        },
        card: {
          DEFAULT: '#13131f',
          foreground: '#f1f5f9',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        ring: '#6366f1',
        input: '#1e1e2e',
        foreground: '#f1f5f9',
        'secondary': {
          DEFAULT: '#1e1e2e',
          foreground: '#f1f5f9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Geist', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      keyframes: {
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'border-beam': {
          '100%': { 'offset-distance': '100%' },
        },
        'number-ticker': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'meteor': {
          '0%': { transform: 'rotate(215deg) translateX(0)', opacity: '1' },
          '70%': { opacity: '1' },
          '100%': { transform: 'rotate(215deg) translateX(-500px)', opacity: '0' },
        },
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
        'number-ticker': 'number-ticker 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'meteor': 'meteor 5s linear infinite',
      },
    },
  },
  plugins: [],
}
