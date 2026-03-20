/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff3eb',
          100: '#ffe3d1',
          200: '#ffc49f',
          300: '#ffa66d',
          400: '#ff893a',
          500: '#ff6b00',
          600: '#e85f00',
          700: '#cc5400',
          800: '#a44600',
          900: '#7a3400',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'Inter', 'sans-serif'],
        body: ['Inter', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 14px 38px rgba(21, 30, 49, 0.10)',
      },
      borderRadius: {
        xl2: '1.1rem',
      },
    },
  },
  plugins: [],
};
