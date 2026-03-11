import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          700: "#1f6a52",
          800: "#155741"
        }
      }
    }
  },
  plugins: []
};

export default config;
