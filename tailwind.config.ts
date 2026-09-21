import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F1B12",
        paper: "#F6F5EF",
        primary: {
          DEFAULT: "#0E7C4A",
          dark: "#0A5C37",
          light: "#E6F4EC",
        },
        accent: "#D9A441",
        danger: "#B3452C",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};
export default config;
