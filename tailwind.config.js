/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1f2937',
        fog: '#f3f4f6',
        sea: '#0f766e',
        ember: '#b45309'
      }
    }
  },
  plugins: []
};
