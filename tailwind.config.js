const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ['./pages/**/*.{ts,tsx,js,jsx}', './app/**/*.{ts,tsx,js,jsx}'],
  theme: {
    fontFamily:{
      serif: ['"Playfair Display"', ...defaultTheme.fontFamily.serif],
      sans:['"Josefin Sans"', ...defaultTheme.fontFamily.sans],
    },
    extend: {
      
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
