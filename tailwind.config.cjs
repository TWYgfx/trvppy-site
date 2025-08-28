/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // add "./app/**/*.{js,ts,jsx,tsx}" if you use the app router
  ],
  theme: { extend: {} },
  plugins: [],
};
