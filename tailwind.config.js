/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        stone: "#E4E0D9",     // background — soft greige
        stoneDeep: "#D8D2C7", // panel/section background
        ink: "#54514C",       // primary text — warm charcoal
        inkDeep: "#38352F",   // headings / emphasis
        line: "#C6C0B4",      // hairline rules & borders
        mist: "#EFECE6",      // card/input background
        clay: "#A99D8B",      // muted accent for tier 3
        umber: "#6B5E4E",     // deep accent for tier 4
      },
      fontFamily: {
        script: ["var(--font-script)", "cursive"],
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        nail: "40% 40% 8% 8% / 55% 55% 8% 8%",
      },
    },
  },
  plugins: [],
};
