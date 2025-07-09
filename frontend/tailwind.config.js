// tailwind.config.js
import daisyui from "daisyui";

module.exports = {
  content: [
    "./index.html",               // ✅ For root-level HTML
    "./src/**/*.{js,ts,jsx,tsx}", // ✅ For React/Vite components
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")], // if using daisyUI
}
