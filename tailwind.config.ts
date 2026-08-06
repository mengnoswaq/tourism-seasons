import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#2791F5",
          600: "#2791F5",
          700: "#1b73c7",
          900: "#0f4c87",
        },
        primaryBlue: "#2791F5",
      },
    },
  },
  plugins: [],
};
export default config;
