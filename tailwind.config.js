/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-gray': '#EFEFF0',
        'custom-red': '#D02222',
        'custom-button-red': '#E97F7F',
      },
      // fontFamily: {
      //   sans: ['Roboto', 'sans-serif'],
      // },
      gridTemplateColumns: {
        'auto-fill-400': 'repeat(auto-fill, minmax(336px, 1fr))',
        'auto-fit-400': 'repeat(auto-fit, minmax(336px, 1fr))',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}
