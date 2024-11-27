/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts, scss}"],
  theme: {
    extend: {
      colors: {
        "gradient-from": "#a855f7",
        "gradient-to": "#ec4899",
      },
    },
    screens: {
      sm: "576px",
      "sm-max": { max: "576px" },
      md: "768px",
      "md-max": { max: "768px" },
      lg: "992px",
      "lg-max": { max: "992px" },
      xl: "1200px",
      "xl-max": { max: "1200px" },
      "2xl": "1320px",
      "2xl-max": { max: "1320px" },
    },
    animation: {
      none: "none",
      spin: "spin 1s linear infinite",
      ping: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
      pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      bounce: "bounce 1s infinite",
      "fade-up": "fade-up 1.5s both",
    },
  },
  plugins: [],
};
