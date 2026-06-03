import Hero from '@/components/Hero'; 
import Nosotros from '@/components/Nosotros';
import Estudiantes from '@/components/Estudiantes'; 
import Profesionales from '@/components/Profesionales'; 
import Noticias from '@/components/Noticias';
import Contacto from '@/components/Contacto'; 

export default function Home() { 
  return ( 
    <> 
      <Hero /> 
      <Nosotros />
      <Estudiantes /> 
      <Profesionales /> 
      <Noticias />
      <Contacto /> 
    </> 
  ); 
} 
