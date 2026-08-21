/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f5f1e8",
        ink: "#10251d",
        moss: "#45604f",
        acid: "#c9f56a",
        line: "#cfd4c9",
        coral: "#f06d4f",
      },
      fontFamily: {
        sans: ["Inter", "PingFang SC", "Microsoft YaHei", "sans-serif"],
        serif: ["Source Han Serif SC", "Songti SC", "SimSun", "serif"],
      },
      boxShadow: {
        card: "0 18px 60px rgba(16, 37, 29, 0.09)",
      },
    },
  },
  plugins: [],
};
