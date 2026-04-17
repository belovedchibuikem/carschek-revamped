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
          DEFAULT: '#1E3A5F',
          light: '#2E75B6',
        },
        success: '#1A7A4A',
        danger: '#C0392B',
        warning: '#D35400',
        brand: {
          navy: '#1E3A5F',
          blue: '#2E75B6',
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