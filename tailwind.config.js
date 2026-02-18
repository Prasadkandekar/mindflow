module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Core Palette (Inspiration: Warm Orange & Peach)
        primary: '#FF7B1B',       // Bold Orange
        secondary: '#FFD1B0',     // Soft Peach
        accent: '#FFAB73',        // Accent Orange
        background: '#FFF9F5',    // Warm Cream Background
        surface: '#FFFFFF',       // Pure White for cards
        textPrimary: '#2D1E17',   // Deep Coffee Brown
        textSecondary: '#8E7E77', // Muted Earthy Gray

        // Mood Colors (Updated to match warmer palette)
        mood: {
          happy: '#FFAB73',       // Warm Peach
          calm: '#A8D5BA',        // Sage Green (Softened)
          sad: '#9BB8D3',         // Dust Blue (Softened)
          stressed: '#E8A0A0',    // Soft Terracotta
          neutral: '#D4C5BD',     // Warm Gray
        },

        // Gradient Colors
        gradStart: '#FF7B1B',
        gradEnd: '#FFAB73',
        glass: 'rgba(255, 255, 255, 0.7)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3.2rem',
      },
      boxShadow: {
        soft: '0px 8px 30px rgba(255, 123, 27, 0.12)',
        card: '0px 4px 20px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};



