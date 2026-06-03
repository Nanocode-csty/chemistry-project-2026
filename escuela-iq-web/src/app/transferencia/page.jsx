'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dbOperations } from '@/lib/supabase';
import { Rocket, Globe, Users, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function TransferenciaPage() {
  const [transferencia, setTransferencia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransferencia = async () => {
      try {
        const { data, error } = await dbOperations.getTransferencia();
        if (data) setTransferencia(data);
      } catch (err) {
        console.error('Error fetching transferencia:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransferencia();
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
        
        {/* Header Section - Estilo Consistente */}
        <div className="relative mb-24">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-1 bg-brand-accent" />
              <span className="text-brand-navy font-display font-black text-[11px] tracking-[0.4em] uppercase">
                Innovación & Productividad
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-black text-brand-navy uppercase tracking-tighter leading-[0.85] mb-8">
              TRANSFERENCIA <br />
              <span className="text-brand-navy italic opacity-80">TECNOLÓGICA</span>
            </h1>
            
            {/* Línea sutil con iconos relacionados */}
            <div className="flex items-center gap-6 mb-10 text-brand-muted">
              <div className="h-[1px] flex-grow bg-brand-border" />
              <Rocket size={20} className="opacity-40" />
              <Globe size={20} className="opacity-40" />
              <TrendingUp size={20} className="opacity-40" />
              <div className="h-[1px] flex-grow bg-brand-border" />
            </div>

            <p className="text-xl text-gray-600 max-w-2xl font-sans leading-relaxed border-l-4 border-brand-accent pl-8">
              Conectamos el conocimiento académico con el sector productivo para 
              generar valor económico y social a través de la innovación aplicada.
            </p>
          </motion.div>
        </div>

        {/* Dynamic Transferencia List - Hover Mejorado y Consistente */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {transferencia.length > 0 ? transferencia.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white border border-brand-border hover:border-brand-navy/20 shadow-soft hover:shadow-premium transition-all duration-500 flex flex-col h-full relative overflow-hidden"
            >
              {/* Decorative background element on hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light -mr-16 -mt-16 rounded-full group-hover:bg-brand-accent/5 group-hover:scale-150 transition-all duration-700" />
              
              <div className="p-10 flex-grow relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 bg-white border-2 border-brand-navy flex items-center justify-center text-brand-navy group-hover:bg-brand-navy group-hover:text-white transition-all duration-500 shadow-sm group-hover:-translate-y-2">
                    <Rocket size={32} />
                  </div>
                  <span className="text-[10px] font-black text-slate-300 group-hover:text-brand-accent uppercase tracking-widest transition-colors">{item.tecnologia}</span>
                </div>
                <h2 className="text-2xl font-display font-black text-brand-navy uppercase mb-6 group-hover:text-brand-navy transition-colors">{item.titulo}</h2>
                <p className="text-gray-600 mb-8 flex-grow">{item.descripcion}</p>
                {item.impacto && (
                  <div className="mb-8 p-4 bg-brand-light border-l-2 border-brand-accent italic text-sm text-brand-navy group-hover:bg-brand-accent/10 transition-colors">
                    Impacto: {item.impacto}
                  </div>
                )}
                <Link href="/#contacto" className="inline-flex items-center gap-2 text-[11px] font-black tracking-widest text-brand-accent uppercase hover:text-brand-navy transition-colors border-b-2 border-transparent hover:border-brand-accent pb-1">
                  MÁS INFORMACIÓN <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          )) : (
            <>
              {/* Fallback Core Pillars con estilo consistente */}
              {[
                { 
                  title: 'Licenciamiento', 
                  desc: 'Transferimos derechos de explotación de nuestras patentes a empresas líderes.', 
                  icon: Users 
                },
                { 
                  title: 'Spin-offs', 
                  desc: 'Apoyamos la creación de empresas de base tecnológica nacidas en la facultad.', 
                  icon: Rocket 
                },
                { 
                  title: 'Alianzas I+D', 
                  desc: 'Desarrollamos investigación conjunta para resolver problemas específicos.', 
                  icon: Globe 
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="group bg-white border border-brand-border hover:border-brand-navy/20 shadow-soft hover:shadow-premium transition-all duration-500 flex flex-col h-full relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light -mr-16 -mt-16 rounded-full group-hover:bg-brand-accent/5 group-hover:scale-150 transition-all duration-700" />
                  <div className="p-10 flex-grow relative z-10">
                    <div className="w-16 h-16 bg-white border-2 border-brand-navy flex items-center justify-center text-brand-navy group-hover:bg-brand-navy group-hover:text-white transition-all duration-500 shadow-sm group-hover:-translate-y-2 mb-8">
                      <item.icon size={32} />
                    </div>
                    <h2 className="text-2xl font-display font-black text-brand-navy uppercase mb-6">{item.title}</h2>
                    <p className="text-gray-600 mb-8">{item.desc}</p>
                    <Link href="/#contacto" className="inline-flex items-center gap-2 text-[11px] font-black tracking-widest text-brand-accent uppercase hover:text-brand-navy transition-colors border-b-2 border-transparent hover:border-brand-accent pb-1">
                      MÁS INFORMACIÓN <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>

        {/* Impact Section - Estilo Consistente */}
        <div className="bg-brand-navy p-12 lg:p-24 text-white shadow-premium relative overflow-hidden flex flex-col lg:flex-row items-center gap-16 border-l-8 border-brand-accent mb-24">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-accent/5 -skew-x-12 translate-x-1/4" />
          <div className="lg:w-1/2 relative z-10">
            <h2 className="text-4xl md:text-6xl font-display font-black text-white uppercase tracking-tighter leading-tight mb-8">
              IMPULSANDO EL <br />ECOSISTEMA
            </h2>
            <p className="text-lg font-bold text-brand-accent uppercase tracking-widest mb-10">
              Nuestra meta es convertirnos en el principal hub de innovación química de la región.
            </p>
            <div className="flex items-center gap-8">
              <div>
                <div className="text-5xl font-display font-black text-white italic">12</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Empresas Aliadas</div>
              </div>
              <div className="w-[1px] h-12 bg-white/10" />
              <div>
                <div className="text-5xl font-display font-black text-white italic">05</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Spin-offs 2026</div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 bg-white/5 backdrop-blur-sm p-12 border border-white/10 relative z-10">
            <TrendingUp size={48} className="text-brand-accent mb-8" />
            <h3 className="text-2xl font-display font-black text-white uppercase mb-6 italic">Crecimiento Sostenido</h3>
            <p className="text-slate-300 mb-8 leading-relaxed">
              Hemos incrementado un 40% la inversión privada en proyectos de investigación 
              aplicada durante el último bienio.
            </p>
            <button className="w-full py-4 border border-brand-accent text-brand-accent font-display font-black text-[11px] tracking-widest uppercase hover:bg-brand-accent hover:text-brand-navy transition-all shadow-2xl">
              VER REPORTE DE IMPACTO
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}

