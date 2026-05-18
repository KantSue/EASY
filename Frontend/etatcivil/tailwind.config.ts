import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020c1b',
          900: '#060f1e',
          800: '#0a1830',
          700: '#0e2244',
          600: '#1a3a6b',
          500: '#2456a0',
        },
        gold: {
          300: '#fcd34d',
          400: '#f7c94b',
          500: '#f0b429',
          600: '#d97706',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
