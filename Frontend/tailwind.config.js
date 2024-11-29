/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts, scss}"],
  theme: {
    extend: {
      borderColor: {
        DEFAULT: "#d1d5db",
      },

      utility: {
        'bg-custom': {
          width: '100%',
          height: '100%',
          background: 'black !important',
          '--gap': '5em',
          '--line': '1px',
          '--color': 'rgba(255, 255, 255, 0.2)',
          backgroundImage: 'linear-gradient(-90deg, transparent calc(var(--gap) - var(--line)), var(--color) calc(var(--gap) - var(--line) + 1px), var(--color) var(--gap)), linear-gradient(0deg, transparent calc(var(--gap) - var(--line)), var(--color) calc(var(--gap) - var(--line) + 1px), var(--color) var(--gap)))',
          backgroundSize: 'var(--gap) var(--gap)',
        }
      },
      colors: {
        primary: "#a855f7",
        "gradient-from": "#a855f7",
        "gradient-to": "#ec4899",
      },
      boxShadow: {
        "primary-outline": "0 0 0 2px rgba(255, 255, 255, 0.5)", // Exemple de définition d'une ombre personnalisée
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
  plugins: [
    function ({ addComponents }) {
      addComponents({
        ".input-theme": {
          "@apply placeholder:text-gray-500 text-sm focus:ring-2 ring-offset-2 focus:ring-primary focus:border-primary outline-none leading-5 block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white bg-clip-padding py-2 px-3 font-normal text-gray-700 transition-all focus:bg-white focus:text-gray-700":
            {},
        },
      });
    },
  ],
};
