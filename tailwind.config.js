/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6c63ff',
          dark: '#5a52d5',
          light: '#f3f2ff',
        },
        sidebar: '#1a1a2e',
        disc: {
          d: '#e74c3c',
          i: '#f39c12',
          s: '#27ae60',
          c: '#2980b9',
        },
      },
    },
  },
  plugins: [],
}
