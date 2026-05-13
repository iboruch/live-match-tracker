import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pitch: "#14532d",
        ink: "#111827",
        panel: "#f8fafc"
      }
    }
  },
  plugins: []
};

export default config;
