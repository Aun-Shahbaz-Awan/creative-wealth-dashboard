/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#023859",
        secondary: "#2D5873",
        primary_light: "#91BDD9",
        primary_gray: "#7C96A6",
        primary_cream: "#F2F2F2",
      },
    },
  },
  plugins: [],
};
