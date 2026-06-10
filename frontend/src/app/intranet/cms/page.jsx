'use client';

import { useState, useEffect } from 'react';
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
  Settings,
  ShieldCheck,
  Globe,
  Layout
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CMSPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !loading) {
      if (!user) {
        router.replace('/intranet/login');
      } else if (user.rol?.toLowerCase() !== 'admin') {
        router.replace('/intranet/dashboard');
      }
    }
  }, [user, loading, router, isMounted]);

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
      icon: ShieldCheck,
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

  if (!isMounted || loading || !user) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-border border-t-brand-navy rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-display font-black text-[#002b45] uppercase tracking-tighter mb-4 italic">
          GESTIÓN DE CONTENIDO WEB
        </h1>
        <div className="h-1.5 w-24 bg-[#98C560] mb-6 rounded-full"></div>
        <p className="text-slate-500 text-lg max-w-2xl font-sans font-medium">
          Administra toda la información pública del sitio web. Los cambios realizados aquí 
          se reflejarán inmediatamente en el portal principal.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cmsSections.map((section, idx) => {
          const SectionIcon = section.icon || Globe;
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link 
                href={section.href}
                className="group block bg-white p-8 border border-slate-100 hover:border-[#002b45] shadow-sm hover:shadow-2xl transition-all duration-300 rounded-sm h-full relative overflow-hidden"
              >
                {/* Background Decoration */}
                <div className="absolute -right-4 -bottom-4 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:scale-110">
                  <SectionIcon size={120} />
                </div>

                <div className="w-14 h-14 bg-slate-50 flex items-center justify-center text-[#002b45] mb-6 group-hover:bg-[#002b45] group-hover:text-white transition-all duration-300 shadow-inner rounded-sm relative z-10">
                  <SectionIcon size={28} />
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-display font-black text-[#002b45] mb-4 uppercase tracking-tight group-hover:text-[#98C560] transition-colors leading-tight">
                    {section.title}
                  </h3>
                  <p className="text-slate-400 text-xs font-bold leading-relaxed uppercase tracking-wider">
                    {section.description}
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-2 text-[#98C560] font-black text-[10px] tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0">
                  Gestionar Sección <Layout size={12} />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
