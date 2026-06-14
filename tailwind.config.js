/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ff6c60", // FlatLab Red
        secondary: "#f1c40f", // FlatLab Yellow
        success: "#a9d86e", // FlatLab Green
        info: "#41cac0", // FlatLab Teal
        dark: "#35404d", // FlatLab Sidebar Dark
        light: "#f1f2f7", // FlatLab Background
        danger: "#ff6c60",
        warning: "#f1c40f",
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      }
    },
  },
  plugins: [],
}
