import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          750: '#2d3748',
        },
        // Brand / interactive identity → slate (minimalist, trustworthy)
        brand: colors.slate,
        // Financial "positive" semantics (income/gains/success) → emerald
        positive: colors.emerald,
      },
    },
  },
  plugins: [],
};
