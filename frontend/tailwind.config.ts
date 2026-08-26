import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f4fd', 100: '#c5e1f9', 200: '#9ecef5', 300: '#71b9f0',
          400: '#50a7ec', 500: '#3496e8', 600: '#2d88dc', 700: '#2477cd',
          800: '#1c66be', 900: '#0f4c75', DEFAULT: '#1a6ea8',
        },
        'primary-DEFAULT': '#1a6ea8',
        accent: {
          50: '#fdf8e7', 100: '#f9edc1', 200: '#f5e298', 300: '#f0d66e',
          400: '#eccb4d', 500: '#c9a227', 600: '#b8921f', 700: '#a27f15',
          800: '#8c6c0c', 900: '#755800', DEFAULT: '#c9a227',
        },
        'accent-DEFAULT': '#c9a227',
        dark: { 900: '#0d1b2a', 800: '#162032', 700: '#1c2940', 600: '#243450' },
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
        'glow-blue': '0 0 30px rgba(26,110,168,0.35)',
        'glow-gold': '0 0 30px rgba(201,162,39,0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
