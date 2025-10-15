/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0f0f',
        surface: '#1a1a1a',
        accent: '#e53935',
      },
      boxShadow: {
        neumorphic: '8px 8px 16px rgba(0,0,0,0.6), -8px -8px 16px rgba(30,30,30,0.3)',
      }
    },
  },
  plugins: [],
}