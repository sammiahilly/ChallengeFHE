import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        calmGreen: "#1E8E7E",
        energyOrange: "#FF8A3D",
        neutralBg: "#F7F8FA"
      }
    },
  },
  plugins: [],
} satisfies Config;


