import type { Config } from "tailwindcss";
const defaultTheme = require("tailwindcss/defaultTheme");

const config: Config = {
  content: ["./src/presentation/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    fontFamily: {
      serif: ['"Playfair Display"', ...defaultTheme.fontFamily.serif],
      sans: ['"Josefin Sans"', ...defaultTheme.fontFamily.sans],
    },
    extend: {},
  },
  plugins: [],
};
export default config;
