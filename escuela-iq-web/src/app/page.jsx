import Hero from '@/components/Hero'; 
import Estudiantes from '@/components/Estudiantes'; 
import Profesionales from '@/components/Profesionales'; 
import Noticias from '@/components/Noticias';
import Contacto from '@/components/Contacto'; 

export default function Home() { 
  return ( 
    <> 
      <Hero /> 
      <Estudiantes /> 
      <Profesionales /> 
      <Noticias />
      <Contacto /> 
    </> 
  ); 
} 
