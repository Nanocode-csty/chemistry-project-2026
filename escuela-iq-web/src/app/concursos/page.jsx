'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dbOperations } from '@/lib/supabase';
import { Trophy, Award, Target, Star, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ConcursosPage() {
  const [concursos, setConcursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConcursos = async () => {
      try {
        const { data, error } = await dbOperations.getConcursos();
        if (data) setConcursos(data);
      } catch (err) {
        console.error('Error fetching concursos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConcursos();
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
        
        {/* Header Section - Estilo Centrado / Excelencia */}
        <div className="relative mb-32 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-brand-navy mb-10 shadow-premium group">
              <Trophy size={48} className="text-brand-accent group-hover:scale-110 transition-transform" />
            </div>
            <h1 className="text-6xl md:text-9xl font-display font-black text-brand-navy uppercase tracking-tighter leading-none mb-10">
              MÉRITO & <br />
              <span className="text-brand-accent italic">EXCELENCIA</span>
            </h1>
            <div className="w-40 h-2 bg-brand-navy mx-auto mb-10" />
            <p className="text-xl text-gray-600 font-sans leading-relaxed italic">
              Reconocemos el esfuerzo y la innovación de nuestra comunidad a través de 
              certámenes que impulsan la competitividad académica e industrial.
            </p>
          </motion.div>
        </div>

        {/* Featured Section */}
        <div className="bg-brand-navy p-12 lg:p-24 text-white shadow-premium relative overflow-hidden mb-24 border-l-8 border-brand-accent">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-accent/5 -skew-x-12 translate-x-1/4" />
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 text-brand-accent text-[11px] font-black tracking-[0.4em] uppercase mb-8">
                <Star size={18} fill="currentColor" /> CONVOCATORIA ABIERTA 2026
              </div>
              <h2 className="text-4xl md:text-6xl font-display font-black text-white uppercase tracking-tighter leading-tight mb-8">
                PREMIO NACIONAL DE <br />INNOVACIÓN QUÍMICA
              </h2>
              <p className="text-lg text-slate-200 mb-12 font-sans leading-relaxed border-l-4 border-brand-accent pl-8">
                Participa con tu proyecto de tesis o investigación aplicada y gana 
                financiamiento para el escalamiento de tu prototipo.
              </p>
              <Link 
                href="/#contacto"
                className="inline-block bg-brand-accent text-brand-navy px-12 py-6 font-display font-black text-[12px] tracking-[0.3em] hover:bg-white transition-all uppercase shadow-2xl"
              >
                DESCARGAR BASES
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Proyectos', val: '150+' },
                { label: 'Premios', val: '$50k' },
                { label: 'Jurados', val: '12' },
                { label: 'Categorías', val: '04' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white/10 border border-white/10 p-8 text-center backdrop-blur-sm">
                  <div className="text-4xl font-display font-black text-brand-accent mb-2 italic">{item.val}</div>
                  <div className="text-[10px] font-bold text-white uppercase tracking-widest">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* History Grid - Hover Mejorado y Consistente */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {concursos.length > 0 ? concursos.map((concurso, idx) => (
            <motion.div
              key={concurso.id}
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
                    <Trophy size={32} />
                  </div>
                  <span className="font-display font-black text-2xl italic text-slate-200 group-hover:text-brand-navy transition-colors">
                    {concurso.anio}
                  </span>
                </div>
                <h3 className="text-lg font-display font-black text-brand-navy uppercase leading-tight group-hover:text-brand-navy transition-colors mb-6">
                  {concurso.titulo}
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 group-hover:text-brand-accent uppercase tracking-widest transition-colors">
                  <Award size={14} className="text-brand-accent" /> HISTORIAL DE ÉXITO
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="md:col-span-4 text-center py-20 bg-white border-2 border-dashed border-brand-border">
              <p className="text-brand-muted uppercase font-black tracking-widest">No hay concursos registrados en este momento.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

