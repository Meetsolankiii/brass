import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
          400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
          800: '#991b1b', 900: '#7f1d1d', DEFAULT: '#dc2626',
        },
        'primary-DEFAULT': '#dc2626',
        accent: {
          50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
          400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
          800: '#991b1b', 900: '#7f1d1d', DEFAULT: '#dc2626',
        },
        'accent-DEFAULT': '#dc2626',
        dark: { 900: '#0a0a0a', 800: '#141414', 700: '#1f1f1f', 600: '#2b2b2b' },
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease forwards',
        'slide-up': 'slideUp 0.6s ease forwards',
        'scale-in': 'scaleIn 0.4s ease forwards',
        shimmer: 'shimmer 1.5s infinite',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(30px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        scaleIn: { '0%': { transform: 'scale(0.95)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      boxShadow: {
        premium: '0 4px 30px rgba(0,0,0,0.10)',
        'premium-lg': '0 8px 60px rgba(0,0,0,0.15)',
        'glow-red': '0 0 30px rgba(220,38,38,0.35)',
        'glow-blue': '0 0 30px rgba(220,38,38,0.35)',
        'glow-gold': '0 0 30px rgba(220,38,38,0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
