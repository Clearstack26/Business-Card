/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(220 22% 7.5%)",
        card: "hsl(220 16% 11%)",
        foreground: "hsl(0 0% 98%)",
        primary: "hsl(185 100% 55%)",
        muted: "hsl(200 8% 78%)",
        border: "hsl(200 18% 22%)",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        metrics: ["Space Grotesk", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
