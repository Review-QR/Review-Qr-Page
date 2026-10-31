import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#0c1324",
        "on-surface": "#dce1fb",
        primary: "#4edea3",
        "primary-container": "#10b981",
        "on-primary": "#003824",
        "on-primary-container": "#00422b",
        secondary: "#ffb95f",
        "secondary-container": "#ee9800",
        "on-secondary": "#472a00",
        tertiary: "#7bd0ff",
        "tertiary-container": "#19aee8",
        background: "#0c1324",
        "on-background": "#dce1fb",
        "surface-container-lowest": "#070d1f",
        "surface-container-low": "#151b2d",
        "surface-container": "#191f31",
        "surface-container-high": "#23293c",
        "surface-container-highest": "#2e3447",
        "surface-variant": "#2e3447",
        "on-surface-variant": "#bbcabf",
        "surface-bright": "#33394c",
        "surface-dim": "#0c1324",
        outline: "#86948a",
        "outline-variant": "#3c4a42",
        error: "#ffb4ab",
        "error-container": "#93000a",
      },
    },
  },
  plugins: [],
};

export default config;
