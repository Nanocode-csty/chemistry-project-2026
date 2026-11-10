import './globals.css'; 
import Providers from '@/components/Providers';
import LayoutWrapper from '@/components/LayoutWrapper';

export const metadata = { 
  title: 'INVENTA | roo Soluciones Digitales - Gestión de Laboratorios', 
  description: 'INVENTA - Sistema de Gestión de Inventarios, Reactivos y Consumo por roo Soluciones Digitales.', 
}; 

export default function RootLayout({ children }) { 
  return ( 
    <html lang="es"> 
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-steel-800 font-sans antialiased"> 
        <Providers> 
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers> 
      </body> 
    </html> 
  ); 
} 
