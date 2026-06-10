'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dbOperations } from '@/lib/api';
import { Settings, FlaskConical, Users, Rocket, CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ServiciosPage() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const { data, error } = await dbOperations.getServicios();
        if (data) setServicios(data);
      } catch (err) {
        console.error('Error fetching servicios:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServicios();
  }, []);

  const getIcon = (index) => {
    const icons = [<Settings key="0" size={32} />, <FlaskConical key="1" size={32} />, <Users key="2" size={32} />, <Rocket key="3" size={32} />];
    return icons[index % icons.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray">
        <Loader2 className="animate-spin text-[#002A45]" size={48} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-brand-gray pt-32 pb-24">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Header Section - Estilo Profesional / Técnico */}
        <div className="relative mb-24">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-1 bg-[#9ABE00]" />
              <span className="text-[#002b45] font-display font-black text-[11px] tracking-[0.4em] uppercase">
                Soporte de Alto Nivel
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl text-[#002b45] font-display font-black uppercase tracking-tighter leading-none mb-8">
              SERVICIOS<br />
              <span className="text-[#9ABE00] italic">ESPECIALIZADOS</span>
            </h1>
            
            {/* Línea sutil con iconos relacionados - Mejorada */}
            <div className="flex items-center gap-6 mb-10 text-[#002A45]/20">
              <div className="h-[1px] flex-grow bg-brand-border" />
              <div className="flex gap-4">
                <Settings size={20} />
                <FlaskConical size={20} />
                <CheckCircle2 size={20} />
              </div>
              <div className="h-[1px] flex-grow bg-brand-border" />
            </div>

            <p className="text-xl text-gray-600 max-w-2xl font-sans leading-relaxed border-l-4 border-[#002A45] pl-8">
              Brindamos soporte especializado de alto nivel para la industria química, 
              garantizando resultados de calidad Internacional.
            </p>
          </motion.div>
        </div>

        {/* Services List - Hover Mejorado y Consistente */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          {servicios.length > 0 ? servicios.map((servicio, idx) => (
            <motion.div
              key={servicio.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white border-2 border-brand-navy/20 hover:border-[#002A45] shadow-soft hover:shadow-premium transition-all duration-500 flex flex-col h-full relative overflow-hidden"
            >
              {/* Decorative background element on hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light -mr-16 -mt-16 rounded-full group-hover:bg-brand-accent/5 group-hover:scale-150 transition-all duration-700" />
              
              <div className="p-10 flex-grow relative z-10">
                <div className="flex items-start justify-between mb-12">
                  <div className="w-16 h-16 bg-white border-2 border-[#002A45] flex items-center justify-center text-[#002A45] group-hover:bg-[#002A45] group-hover:text-white transition-all duration-500 shadow-sm group-hover:-translate-y-2">
                    {getIcon(idx)}
                  </div>
                  <span className="text-[10px] font-black text-slate-200 group-hover:text-[#9ABE00] uppercase tracking-[0.5em] transition-colors">SERVICIO 0{idx + 1}</span>
                </div>
                
                <h2 className="text-3xl font-display font-black text-[#002A45] uppercase mb-6 tracking-tight group-hover:text-[#002A45] transition-colors">
                  {servicio.titulo}
                </h2>
                <p className="text-slate-600 font-sans leading-relaxed mb-10 text-lg">
                  {servicio.descripcion}
                </p>
                
                <Link 
                  href="/#contacto"
                  className="inline-flex items-center gap-4 text-[11px] font-black tracking-widest uppercase text-[#9ABE00] hover:text-[#002A45] transition-colors border-b-2 border-transparent hover:border-[#9ABE00] pb-1"
                >
                  SOLICITAR COTIZACIÓN <MessageSquare size={16} />
                </Link>
              </div>
            </motion.div>
          )) : (
            <div className="md:col-span-2 text-center py-20 bg-white border-2 border-dashed border-brand-border">
              <p className="text-brand-muted uppercase font-black tracking-widest">No hay servicios registrados en este momento.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

