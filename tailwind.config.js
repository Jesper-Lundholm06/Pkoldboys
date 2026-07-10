/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1b3a5b',
        },
        accent: {
          DEFAULT: '#d9ac4e',
          dark: '#b3872f',
        },
        danger: {
          DEFAULT: '#b3261e',
          light: '#fbeceb',
        },
        background: '#f7f6f3',
        text: '#1a1a1a',
      },
      fontSize: {
        base: ['18px', '1.6'],
      },
      lineHeight: {
        relaxed: '1.6',
      },
    },
  },
  plugins: [],
}
