/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./site/**/*.html', './site/assets/js/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
}
