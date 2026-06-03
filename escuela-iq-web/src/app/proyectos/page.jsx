'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dbOperations } from '@/lib/supabase';
import { Zap, ArrowUpRight, ShieldCheck, Factory, Globe, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const { data, error } = await dbOperations.getProyectos();
        if (data) setProyectos(data);
      } catch (err) {
        console.error('Error fetching proyectos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProyectos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray">
        <Loader2 className="animate-spin text-brand-navy" size={48} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-brand-gray pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section - Estilo Profesional / Industrial */}
        <div className="relative mb-24">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-1 bg-brand-navy" />
              <span className="text-brand-navy font-display font-black text-[11px] tracking-[0.4em] uppercase">
                Sector Industrial & Tecnológico
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-black text-brand-navy uppercase tracking-tighter leading-[0.85] mb-8">
              PROYECTOS <br />
              <span className="text-brand-navy italic opacity-80">INDUSTRIALES</span>
            </h1>
            
            {/* Línea sutil con iconos relacionados - Mejorada */}
            <div className="flex items-center gap-6 mb-10 text-brand-navy/20">
              <div className="h-[1px] flex-grow bg-brand-border" />
              <div className="flex gap-4">
                <Factory size={20} />
                <Zap size={20} />
                <Globe size={20} />
              </div>
              <div className="h-[1px] flex-grow bg-brand-border" />
            </div>

            <p className="text-xl text-gray-600 max-w-2xl font-sans leading-relaxed border-l-4 border-brand-navy pl-8">
              Desarrollamos ingeniería de precisión para los procesos más exigentes del mercado, 
              optimizando recursos y maximizando la eficiencia operativa.
            </p>
          </motion.div>
        </div>

        {/* Projects Grid - Hover Mejorado y Consistente */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {proyectos.length > 0 ? proyectos.map((proy, idx) => (
            <motion.div
              key={proy.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white border border-brand-border hover:border-brand-navy/20 shadow-soft hover:shadow-premium transition-all duration-500 flex flex-col h-full relative overflow-hidden"
            >
              {/* Decorative background element on hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light -mr-16 -mt-16 rounded-full group-hover:bg-brand-accent/5 group-hover:scale-150 transition-all duration-700" />
              
              <div className="p-10 flex-grow relative z-10">
                <div className="w-16 h-16 bg-white border-2 border-brand-navy flex items-center justify-center text-brand-navy mb-8 group-hover:bg-brand-navy group-hover:text-white transition-all duration-500 shadow-sm group-hover:-translate-y-2">
                  <Factory size={32} />
                </div>
                
                <div className="flex-grow">
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400 group-hover:text-brand-accent block mb-4 transition-colors">
                    CASO INDUSTRIAL {proy.anio || '2024'}
                  </span>
                  <h2 className="text-2xl font-display font-black text-brand-navy uppercase leading-tight mb-6 group-hover:text-brand-navy transition-colors">
                    {proy.titulo}
                  </h2>
                  <p className="text-gray-600 font-sans leading-relaxed mb-8">
                    {proy.descripcion}
                  </p>
                </div>

                <div className="pt-8 border-t border-slate-100 group-hover:border-brand-accent/20 transition-colors">
                  <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    Cliente Partner
                  </div>
                  <div className="text-brand-navy font-display font-black text-lg uppercase">
                    {proy.empresa}
                  </div>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="md:col-span-3 text-center py-20 bg-white border-2 border-dashed border-brand-border">
              <p className="text-brand-muted uppercase font-black tracking-widest">No hay proyectos industriales registrados.</p>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="mt-32 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Proyectos Activos', value: '24', icon: Zap },
            { label: 'Países Operando', value: '08', icon: Globe },
            { label: 'Eficiencia Media', value: '+15%', icon: ShieldCheck },
            { label: 'Años de Experiencia', value: '15', icon: Factory },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center p-10 bg-white border border-brand-border hover:border-brand-teal transition-all shadow-soft"
            >
              <stat.icon className="mx-auto mb-6 text-brand-teal" size={32} />
              <div className="text-5xl font-display font-black text-brand-navy italic mb-2">{stat.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-muted">{stat.label}</div>
            </motion.div>
          ))}
        </div>

      </div>
    </main>
  );
}

