'use client';

import { motion } from 'framer-motion';
import { 
  Info, 
  Target, 
  Award, 
  History, 
  Newspaper, 
  Image as ImageIcon,
  Compass,
  Users,
  Mail,
  Settings
} from 'lucide-react';
import Link from 'next/link';

const cmsSections = [
  { 
    id: 'hero', 
    title: 'Hero / Banner', 
    description: 'Gestión del banner principal, títulos y botones de la página de inicio.',
    icon: ImageIcon,
    href: '/intranet/cms/hero'
  },
  { 
    id: 'nosotros', 
    title: 'Nosotros', 
    description: 'Gestión de la sección Acerca de Nosotros y miembros del equipo.',
    icon: Info,
    href: '/intranet/cms/nosotros'
  },
  { 
    id: 'estudiantes', 
    title: 'Estudiantes', 
    description: 'Gestión de investigaciones, papers y patentes de la comunidad.',
    icon: Users,
    href: '/intranet/cms/estudiantes'
  },
  { 
    id: 'profesionales', 
    title: 'Profesionales', 
    description: 'Gestión de liderazgo industrial, servicios y estadísticas.',
    icon: Award,
    href: '/intranet/cms/profesionales'
  },
  { 
    id: 'mision-vision', 
    title: 'Misión y Visión', 
    description: 'Actualización de la misión, visión y valores institucionales.',
    icon: Target,
    href: '/intranet/cms/mision-vision'
  },
  { 
    id: 'valores', 
    title: 'Nuestros Valores', 
    description: 'Administración de los valores éticos del laboratorio.',
    icon: Award,
    href: '/intranet/cms/valores'
  },
  { 
    id: 'circulo-dorado', 
    title: 'Círculo Dorado', 
    description: 'Propósito (¿Por qué?), Proceso (¿Cómo?) y Resultados (¿Qué?).',
    icon: Compass,
    href: '/intranet/cms/circulo-dorado'
  },
  { 
    id: 'evolucion', 
    title: 'Nuestra Evolución', 
    description: 'Línea de tiempo histórica del laboratorio y proyecciones.',
    icon: History,
    href: '/intranet/cms/evolucion'
  },
  { 
    id: 'noticias', 
    title: 'Noticias y Actualidad', 
    description: 'Publicación de novedades, eventos e hitos importantes.',
    icon: Newspaper,
    href: '/intranet/cms/noticias'
  },
  { 
    id: 'contacto', 
    title: 'Contacto', 
    description: 'Actualización de datos de contacto y redes sociales.',
    icon: Mail,
    href: '/intranet/cms/contacto'
  },
  { 
    id: 'multimedia', 
    title: 'Galería Multimedia', 
    description: 'Gestión de imágenes para banners, noticias y publicaciones.',
    icon: ImageIcon,
    href: '/intranet/cms/multimedia'
  },
  { 
    id: 'config', 
    title: 'Ajustes de Pantalla', 
    description: 'Configuración de límites de visualización en la página de inicio.',
    icon: Settings,
    href: '/intranet/cms/config'
  },
];

export default function CMSPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-display font-black text-brand-navy uppercase tracking-tighter mb-4">
          GESTIÓN DE CONTENIDO WEB
        </h1>
        <p className="text-brand-muted text-lg max-w-2xl font-sans">
          Administra toda la información pública del sitio web. Los cambios realizados aquí 
          se reflejarán inmediatamente en el portal principal.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cmsSections.map((section, idx) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link 
              href={section.href}
              className="group block bg-white p-8 border border-brand-border hover:border-brand-navy shadow-sm hover:shadow-card-hover transition-all duration-300 rounded-sm h-full"
            >
              <div className="w-14 h-14 bg-brand-light flex items-center justify-center text-brand-navy mb-6 group-hover:bg-brand-navy group-hover:text-white transition-colors">
                <section.icon size={28} />
              </div>
              <h3 className="text-xl font-display font-black text-brand-navy mb-4 uppercase tracking-tight group-hover:text-brand-teal transition-colors">
                {section.title}
              </h3>
              <p className="text-brand-muted text-sm leading-relaxed">
                {section.description}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
