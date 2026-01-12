export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        clay: "#C85428", // Rust/Orange
        soil: "#442D1C", // Dark Brown
        sand: "#EDD8B4", // Beige/Cream
        stone: "#652810", // Medium Brown
        wood: "#8E5022", // Light Brown
        ink: "#1F1F1F",
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
