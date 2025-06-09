module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}" // Ensure all components are scanned
  ],
  theme: {
    extend: {
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        progressFill: {
          from: { width: "0%", boxShadow: "none" },
          to: {
            width: "var(--progress-width)",
            boxShadow: "0 0 20px rgba(59, 130, 246, 0.6)"
          }
        },
        electricPulse: {
          "0%, 100%": { boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" },
          "50%": { boxShadow: "0 0 25px rgba(59, 130, 246, 0.8)" }
        }
      },
      animation: {
        fadeInUp: "fadeInUp 1s ease-out forwards",
        progressFill: "progressFill 2s ease-out forwards",
        electricPulse: "electricPulse 2s infinite ease-in-out"
      }
    }
  },
  plugins: []
};
