/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base brand colors
        base: {
          blue: '#0052FF',
          'blue-dark': '#0041CC',
          'blue-light': '#336CFF',
        },
        // Dark mode colors
        dark: {
          bg: '#0A0B0D',
          surface: '#111214',
          'surface-hover': '#1A1B1F',
          border: '#2A2B2F',
          text: '#E5E7EB',
          'text-secondary': '#9CA3AF',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
