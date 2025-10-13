/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#e50914',
          foreground: '#ffffff',
        },
        surface: '#141414',
        muted: '#1f1f1f',
        accent: '#b81d24',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 30px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [typography, forms],
}

