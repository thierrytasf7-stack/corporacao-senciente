const { defineConfig } = require('tailwindcss');
const { tailwindExtractor } = require('tailwindcss/lib/lib/purgecss');

module.exports = defineConfig({
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/@synkra/ui/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        background: {
          default: 'var(--background)',
          paper: 'var(--paper)',
        },
        surface: {
          default: 'var(--surface)',
          paper: 'var(--surface-paper)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
      spacing: {
        18: '4.5rem',
        20: '5rem',
      },
    },
  },
  plugins: [],
});