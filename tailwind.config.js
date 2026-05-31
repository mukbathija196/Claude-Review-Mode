/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          base: '#0d0d0d',
          sidebar: '#171717',
          panel: '#111111',
          input: '#1e1e1e',
          hover: '#242424',
          active: '#2e2e2e',
          border: '#2a2a2a',
        },
        content: {
          primary: '#ececec',
          secondary: '#a3a3a3',
          muted: '#666666',
          accent: '#c96442',
        }
      }
    },
  },
  plugins: [],
}
