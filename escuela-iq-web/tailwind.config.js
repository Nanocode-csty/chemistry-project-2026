/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      colors: {
        brand: {
          navy: '#003f5d',      // Azul acero personalizado (Principal)
          teal: '#005f73',      // Variación más profunda y elegante del navy
          accent: '#0a9396',    // Acento cian-petróleo profesional
          gray: '#f8fafc',      // Gris pizarra muy claro (Slate 50)
          dark: '#002a3f',      // Variante más oscura para contrastes
          border: '#15365c37',  // Borde suave azulado
          red: '#CF003D',       // Rojo de impacto
          yellow: '#FFB81C',    // Amarillo de resalte
        }
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #003f5d 0%, #0d9488 100%)',
      },
      boxShadow: {
        'premium': '0 25px 50px -12px rgba(0, 63, 93, 0.25)',
      }
    },
  },
  plugins: [],
};
