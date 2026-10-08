// Near-black body text: ~16:1 on the off-white background (WCAG AAA ≥ 7:1).
const bodyText = '#1a1a1a'

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
        text: bodyText,
        // gray-400…800 are only used for body/secondary text on light backgrounds, so
        // they all map to the body text tone (global readability fix for elderly users).
        // gray-50…300 (backgrounds, borders, light text on navy) stay Tailwind's defaults.
        gray: {
          400: bodyText,
          500: bodyText,
          600: bodyText,
          700: bodyText,
          800: bodyText,
        },
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
