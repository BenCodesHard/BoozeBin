// tailwind.config.js
const {heroui} = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadowColor: {
        'custom-shadow': 'rgba(204,153,255,1)',
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};