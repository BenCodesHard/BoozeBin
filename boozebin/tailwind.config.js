// tailwind.config.js
const {heroui} = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx,html}", 
  ],
  theme: {
    extend: {
      backgroundImage: {
        'boozebin-bg': 'url("/wineSymbol.png")', 
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};