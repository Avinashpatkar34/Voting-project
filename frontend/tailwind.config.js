/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    theme: {
      extend: {
        colors: {
          'primary': {
            50: '#e6f0fd',
            100: '#cce0fb',
            200: '#99c2f6',
            300: '#66a3f2',
            400: '#3385ed',
            500: '#0066e9',
            600: '#0052ba',
            700: '#003d8c',
            800: '#00295d',
            900: '#00142f',
          },
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
        boxShadow: {
          card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    plugins: [],
  }