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
          navy: '#005180',      // Azul Corporativo (Principal) - Más profesional
          teal: '#003d61',      // Azul profundo para contrastes serios
          accent: '#98C560',    // Verde Natural - Solo para acentos mínimos
          gray: '#FFFFFF',      // Blanco puro
          dark: '#1e293b',      // Slate 800 para texto principal
          muted: '#64748b',     // Slate 500 para textos secundarios
          light: '#f1f5f9',     // Slate 100 para fondos sutiles
          border: '#e2e8f0',    // Slate 200 para bordes limpios
          red: '#be123c',       // Rojo profesional
          yellow: '#eab308',    // Amarillo profesional
        }
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #005180 0%, #003d61 100%)',
        'gradient-subtle': 'linear-gradient(to bottom, #f8fafc, #f1f5f9)',
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 81, 128, 0.1), 0 2px 10px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 20px 25px -5px rgba(0, 81, 128, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
};
