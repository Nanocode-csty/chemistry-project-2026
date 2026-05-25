'use client';
import { motion } from 'framer-motion';
import { mockConcursos } from '@/data/mockData';
import { Trophy, Award, Target, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ConcursosPage() {
  return (
    <main className="min-h-screen bg-brand-gray pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-24 h-2 bg-brand-teal mx-auto mb-10" />
            <h1 className="text-6xl md:text-9xl font-display font-black text-brand-navy uppercase tracking-tighter leading-none mb-8">
              MÉRITO & <br />
              <span className="text-brand-teal">EXCELENCIA</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans leading-relaxed italic">
              Reconocemos el esfuerzo y la innovación de nuestra comunidad a través de 
              certámenes que impulsan la competitividad académica e industrial.
            </p>
          </motion.div>
        </div>

        {/* Featured Section */}
        <div className="bg-brand-navy p-12 lg:p-24 text-white shadow-premium relative overflow-hidden mb-24">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-teal/5 -skew-x-12 translate-x-1/4" />
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 text-brand-accent text-[11px] font-black tracking-[0.4em] uppercase mb-8">
                <Star size={18} fill="currentColor" /> CONVOCATORIA ABIERTA 2026
              </div>
              <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter leading-tight mb-8">
                PREMIO NACIONAL DE <br />INNOVACIÓN QUÍMICA
              </h2>
              <p className="text-lg text-slate-300 mb-12 font-sans leading-relaxed">
                Participa con tu proyecto de tesis o investigación aplicada y gana 
                financiamiento para el escalamiento de tu prototipo.
              </p>
              <Link 
                href="/#contacto"
                className="inline-block bg-brand-teal text-brand-navy px-12 py-6 font-display font-black text-[12px] tracking-[0.3em] hover:bg-white transition-all uppercase shadow-2xl"
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
                <div key={idx} className="bg-white/5 border border-white/10 p-8 text-center">
                  <div className="text-4xl font-display font-black text-brand-teal mb-2 italic">{item.val}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* History Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockConcursos.map((concurso, idx) => (
            <motion.div
              key={concurso.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-10 shadow-soft border-b-4 border-brand-navy hover:border-brand-teal transition-all duration-500 group"
            >
              <div className="flex justify-between items-start mb-8">
                <Trophy size={32} className="text-brand-navy group-hover:text-brand-teal transition-colors" />
                <span className="font-display font-black text-2xl italic text-slate-200 group-hover:text-brand-navy transition-colors">
                  {concurso.anio}
                </span>
              </div>
              <h3 className="text-lg font-display font-black text-brand-navy uppercase leading-tight group-hover:text-brand-teal transition-colors mb-6">
                {concurso.nombre}
              </h3>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Award size={14} className="text-brand-teal" /> HISTORIAL DE ÉXITO
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </main>
  );
}
