/** @type {import('tailwindcss').Config} */
import PrimeUI from 'tailwindcss-primeui';

export default {
  darkMode: ['selector', '[class="app-dark"]'],
  content: ['./src/**/*.{html,ts,scss,css}', './index.html'],
  plugins: [PrimeUI],
  theme: {
    screens: {
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
      '2xl': '1920px',
    },
  },

  extend: {
    colors: {
      primary: {
        DEFAULT: '#006D77',
        dark: '#004f57',
        light: '#2a9d9f',
      },
      secondary: {
        DEFAULT: '#FFB703',
        dark: '#e0a100',
        light: '#ffd166',
      },
      accent: {
        DEFAULT: '#E29578',
        dark: '#c86b52',
        light: '#f4b8a2',
      },
      background: {
        DEFAULT: '#F8F9FA',
        dark: '#e9ecef',
      },
      text: {
        DEFAULT: '#1E1E1E',
        light: '#6c757d',
      },
    },
  },
};
