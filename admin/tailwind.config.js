/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#D4AF37',
        ink: '#0D0D0D',
        surface: '#1A1A1A',
      },
    },
  },
  plugins: [],
};
