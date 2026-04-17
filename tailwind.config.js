/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#ff5722',
          light: '#ff8a65',
          dark: '#e64a19',
        },
        secondary: {
          DEFAULT: '#ffffff',
        },
        success: '#1A7A4A',
        danger: '#C0392B',
        warning: '#D35400',
        brand: {
          navy: '#ff5722',
          blue: '#ff8a65',
        },
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      animation: {
        'count-up': 'count-up 0.6s ease-out forwards',
        'pulse-ring': 'pulse-ring 2s infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
        'fade-in': 'fade-in 0.25s ease-out forwards',
      },
    },
  },
  plugins: [],
};