import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0082FA",
        "primary-soft": "#E5F2FF",
        success: "#22c55e",
        warning: "#f97316",
        danger: "#ef4444",
      },
    },
  },
  plugins: [],
};
export default config;
