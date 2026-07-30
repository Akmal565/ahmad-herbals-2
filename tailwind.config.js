/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        primary: { 50:'#fef9f0',100:'#fdf0d9',200:'#fae0b3',300:'#f5c980',400:'#eeab4a',500:'#e8901f',600:'#d17110',700:'#a8560f',800:'#874414',900:'#6e3915',950:'#3d1c08' },
        secondary: { 50:'#f6f7f0',100:'#eceee0',200:'#d8dcc2',300:'#bbc497',400:'#9bab69',500:'#7e8f4a',600:'#637135',700:'#4d572b',800:'#404726',900:'#373d22',950:'#1d2110' },
        accent: { 50:'#fef2f0',100:'#fde4e0',200:'#fccec6',300:'#faaaa0',400:'#f4796b',500:'#ec5243',600:'#dc3829',700:'#b82a1f',800:'#982720',900:'#7c251f',950:'#430f0c' },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%':{ opacity:'0' }, '100%':{ opacity:'1' } },
        slideUp: { '0%':{ transform:'translateY(20px)', opacity:'0' }, '100%':{ transform:'translateY(0)', opacity:'1' } },
        slideDown: { '0%':{ transform:'translateY(-20px)', opacity:'0' }, '100%':{ transform:'translateY(0)', opacity:'1' } },
        scaleIn: { '0%':{ transform:'scale(0.95)', opacity:'0' }, '100%':{ transform:'scale(1)', opacity:'1' } },
        shimmer: { '0%':{ backgroundPosition:'-1000px 0' }, '100%':{ backgroundPosition:'1000px 0' } },
      },
    },
  },
  plugins: [],
};
