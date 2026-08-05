/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        text: 'var(--text)',
        background: 'var(--background)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        'on-primary': 'var(--on-primary)',
        surface: 'var(--surface)',
        error: 'var(--error)',
        'on-error': 'var(--on-error)',
        tertiary: 'var(--tertiary)',
        'on-tertiary': 'var(--on-tertiary)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}