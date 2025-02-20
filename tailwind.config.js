/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        'auto-fill-400': 'repeat(auto-fill, minmax(336px, 1fr))',
        'auto-fit-400': 'repeat(auto-fit, minmax(336px, 1fr))',
      }
    },
  },
  plugins: [],
}
