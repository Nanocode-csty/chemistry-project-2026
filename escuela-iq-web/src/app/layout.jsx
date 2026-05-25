import './globals.css'; 
import Navbar from '@/components/Navbar'; 
import Footer from '@/components/Footer'; 
import Providers from '@/components/Providers';

export const metadata = { 
  title: 'Escuela de Ingeniería Química - Investigación e Innovación', 
  description: 'Proyectos, patentes, papers y servicios de la Escuela de Ingeniería Química.', 
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
          <Navbar /> 
          <main>{children}</main> 
          <Footer /> 
        </Providers> 
      </body> 
    </html> 
  ); 
} 
