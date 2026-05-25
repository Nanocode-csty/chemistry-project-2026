'use client';
import { motion } from 'framer-motion';
import { mockInvestigaciones, mockPapers, mockPatentes } from '@/data/mockData';
import { Microscope, ScrollText, Lightbulb, ArrowRight, Target, Award } from 'lucide-react';
import Link from 'next/link';

const Estudiantes = () => {
  return (
    <section id="estudiantes" className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header - Professional Style */}
        <div className="flex flex-col lg:flex-row items-end gap-10 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:w-2/3"
          >
            <div className="w-16 h-1.5 bg-brand-navy mb-6" />
            <h2 className="text-5xl md:text-7xl font-display font-black text-brand-navy leading-tight tracking-tight uppercase">
              COMUNIDAD <span className="text-brand-teal italic">ACADÉMICA</span>
            </h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-xl text-gray-500 font-sans leading-relaxed max-w-2xl border-l-4 border-brand-teal pl-8"
            >
              Nuestros estudiantes lideran la investigación científica, transformando 
              teoría avanzada en soluciones de impacto global y sostenible.
            </motion.p>
          </motion.div>
          <div className="lg:w-1/3 flex justify-end">
            <div className="text-right hidden lg:block opacity-10">
              <span className="block text-8xl font-display font-black text-brand-navy tracking-tighter uppercase leading-none">01</span>
              <span className="block text-2xl font-display font-black text-brand-navy tracking-[0.2em] uppercase mt-2">Investigación</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Left Column: Investigaciones */}
          <div className="lg:col-span-8 space-y-12">
            <div className="grid sm:grid-cols-2 gap-8">
              {mockInvestigaciones.map((inv, idx) => (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, type: "spring", stiffness: 300 }}
                  className="bg-brand-gray p-10 border-b-8 border-brand-teal shadow-soft hover:shadow-premium transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                  <div className="w-14 h-14 bg-brand-navy flex items-center justify-center text-white mb-8 group-hover:bg-brand-teal group-hover:text-brand-navy transition-colors relative z-10">
                    <Microscope size={28} />
                  </div>
                  <h4 className="text-xl font-display font-black text-brand-navy mb-4 uppercase tracking-tight relative z-10">{inv.titulo}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed mb-8 relative z-10">{inv.descripcion}</p>
                  <Link href={`/investigaciones/${inv.id}`} className="flex items-center gap-2 text-[11px] font-display font-black tracking-[0.2em] text-brand-navy uppercase group-hover:text-brand-teal transition-colors relative z-10">
                    Expediente Completo <ArrowRight size={14} />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Papers List */}
            <div className="bg-brand-navy p-12 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-display font-black flex items-center gap-4 uppercase tracking-wider">
                  <ScrollText className="text-brand-teal" size={24} />
                  Publicaciones Científicas
                </h3>
                <Link href="/papers" className="text-[10px] font-black tracking-widest text-brand-teal hover:text-white transition-colors uppercase border-b border-brand-teal">
                  Ver Todo
                </Link>
              </div>
              <div className="space-y-8">
                {mockPapers.map((paper) => (
                  <div key={paper.id} className="group border-b border-white/10 pb-8 last:border-0 last:pb-0">
                    <span className="text-brand-teal text-xs font-bold tracking-[0.3em] uppercase block mb-3">{paper.anio}</span>
                    <h4 className="text-xl font-display font-bold mb-3 group-hover:text-brand-teal transition-colors">{paper.titulo}</h4>
                    <p className="text-slate-300 text-sm italic mb-4">"{paper.resumen}"</p>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-white/50 uppercase tracking-widest">
                      <span>{paper.revista}</span>
                      <span className="w-1 h-1 bg-brand-teal rounded-full" />
                      <span>{paper.autores}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar Style Info */}
          <div className="lg:col-span-4 space-y-10">
            <div className="bg-brand-teal p-10 shadow-lg text-white">
              <h3 className="text-2xl font-display font-black text-brand-navy mb-6 uppercase leading-tight">Patentes y <br />Registros</h3>
              <div className="space-y-4">
                {mockPatentes.map((patente) => (
                  <div key={patente.id} className="flex items-start gap-3 border-b border-brand-navy/10 pb-4 last:border-0">
                    <Lightbulb className="text-brand-navy shrink-0 mt-1" size={18} />
                    <span className="text-sm font-sans font-bold text-brand-navy leading-snug">{patente.titulo}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-4 border-brand-navy p-10">
              <Target className="text-brand-teal mb-6" size={40} strokeWidth={3} />
              <h3 className="text-xl font-display font-black text-brand-navy mb-4 uppercase">Objetivos 2026</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Consolidar 15 nuevas patentes en procesos de biorremediación y 
                energías renovables aplicadas a la industria nacional.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Award className="text-brand-teal" size={20} />
                  <span className="text-xs font-bold text-brand-navy uppercase tracking-widest">Acreditación Internacional</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Estudiantes;
