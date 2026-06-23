import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: { DEFAULT: "#0078D4", dark: "#005A9E", light: "#EFF6FC" },
        success: { DEFAULT: "#107C10", light: "#DFF6DD" },
        warning: { DEFAULT: "#7A5200", light: "#FFF4CE" },
        danger: { DEFAULT: "#A4262C", light: "#FDE7E9" },
        surface: { DEFAULT: "#FFFFFF", subtle: "#FAF9F8", hover: "#F3F2F1" },
        border: "#EDEBE9",
        text: { DEFAULT: "#201F1E", muted: "#605E5C", faint: "#A19F9D" },
      },
      borderRadius: { DEFAULT: "3px" },
      fontFamily: {
        sans: ['"Segoe UI"', "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
