module.exports = {
  content: ["./src/**/*.{html,js,hbs}"],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/aspect-ratio'), require('@tailwindcss/forms'), require('@tailwindcss/typography')],
  darkMode: 'class',
}
