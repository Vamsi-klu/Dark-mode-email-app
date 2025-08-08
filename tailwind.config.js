/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'Apple Color Emoji', 'Segoe UI Emoji']
      },
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#ddeefe',
          200: '#bfe0fd',
          300: '#93cafa',
          400: '#61aef6',
          500: '#3a90ee',
          600: '#2372da',
          700: '#1b58b3',
          800: '#1b4a8e',
          900: '#1b3f74'
        }
      },
      boxShadow: {
        premium: '0 10px 30px -12px rgba(0,0,0,0.6), 0 18px 24px -18px rgba(0,0,0,0.6)'
      }
    }
  },
  plugins: [forms]
}


