'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dbOperations } from '@/lib/supabase';
import { Microscope, ScrollText, Lightbulb, Target, Award, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

const Estudiantes = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    header: null,
    investigaciones: [],
    papers: [],
    patentes: []
  });

  useEffect(() => {
    const fetchEstudiantesData = async () => {
      try {
        const [headerRes, invRes, papersRes, patRes] = await Promise.all([
          dbOperations.getEstudiantesHeader(),
          dbOperations.getInvestigaciones(),
          dbOperations.getPapers(),
          dbOperations.getPatentes()
        ]);
        
        setData({
          header: headerRes.data,
          investigaciones: invRes.data || [],
          papers: papersRes.data || [],
          patentes: patRes.data || []
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEstudiantesData();
  }, []);

  if (loading) return <div className="py-20 flex justify-center bg-white"><Loader2 className="animate-spin text-brand-navy" /></div>;
  
  const { header, investigaciones, papers, patentes } = data;
  if (!header) return null;

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
              {(header.titulo || '').split(' ')[0]} <span className="text-brand-teal italic">{(header.titulo || '').split(' ').slice(1).join(' ')}</span>
            </h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-xl text-brand-muted font-sans leading-relaxed max-w-2xl border-l-4 border-brand-navy pl-8"
            >
              {header.descripcion}
            </motion.p>
          </motion.div>
          <div className="lg:w-1/3 flex justify-end">
            <div className="text-right hidden lg:block opacity-5">
              <span className="block text-8xl font-display font-black text-brand-navy tracking-tighter uppercase leading-none">01</span>
              <span className="block text-2xl font-display font-black text-brand-navy tracking-[0.2em] uppercase mt-2">Investigación</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Left Column: Investigaciones */}
          <div className="lg:col-span-8 space-y-12">
            <div className="grid sm:grid-cols-2 gap-8">
              {investigaciones.map((inv, idx) => (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -10 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, type: "spring", stiffness: 300 }}
                  className="bg-white p-10 border border-brand-border hover:border-brand-navy shadow-sm hover:shadow-card-hover transition-all duration-300 group relative overflow-hidden rounded-sm"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-light/50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                  <div className="w-14 h-14 bg-brand-navy flex items-center justify-center text-white mb-8 group-hover:bg-brand-teal transition-colors relative z-10">
                    <Microscope size={28} />
                  </div>
                  <h4 className="text-xl font-display font-black text-brand-navy mb-4 uppercase tracking-tight relative z-10 leading-tight">{inv.titulo}</h4>
                  <p className="text-brand-muted text-sm leading-relaxed mb-8 relative z-10 line-clamp-3">{inv.descripcion}</p>
                  <Link href={inv.link || "#"} className="flex items-center gap-2 text-[11px] font-display font-black tracking-[0.2em] text-brand-navy uppercase group-hover:text-brand-teal transition-colors relative z-10">
                    Expediente Completo <ArrowRight size={14} />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Papers List */}
            {papers.length > 0 && (
              <div className="bg-brand-navy p-12 text-white shadow-premium relative overflow-hidden rounded-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-display font-black flex items-center gap-4 uppercase tracking-wider">
                    <ScrollText className="text-brand-accent" size={24} />
                    Publicaciones Científicas
                  </h3>
                  <Link href="/papers" className="text-[10px] font-black tracking-widest text-brand-accent hover:text-white transition-colors uppercase border-b border-brand-accent pb-1">
                    Ver Todo
                  </Link>
                </div>
                <div className="space-y-8">
                  {papers.map((paper) => (
                    <div key={paper.id} className="group border-b border-white/10 pb-8 last:border-0 last:pb-0">
                      <span className="text-brand-accent text-xs font-bold tracking-[0.3em] uppercase block mb-3">{paper.anio}</span>
                      <h4 className="text-xl font-display font-bold mb-3 group-hover:text-brand-accent transition-colors leading-tight">{paper.titulo}</h4>
                      <p className="text-white/60 text-sm italic mb-4 font-sans leading-relaxed">"{paper.resumen}"</p>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        <span>{paper.revista}</span>
                        <span className="w-1 h-1 bg-brand-accent rounded-full" />
                        <span>{paper.autores}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Patentes & Objetivos */}
          <div className="lg:col-span-4 space-y-10">
            {patentes.length > 0 && (
              <div className="bg-brand-navy p-10 shadow-premium text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
                <h3 className="text-2xl font-display font-black text-white mb-6 uppercase leading-tight relative z-10">Patentes y <br />Registros</h3>
                <div className="space-y-4 relative z-10">
                  {patentes.map((patente) => (
                    <div key={patente.id} className="flex items-start gap-3 border-b border-white/10 pb-4 last:border-0">
                      <Lightbulb className="text-brand-accent shrink-0 mt-1" size={18} />
                      <span className="text-sm font-sans font-bold text-white/80 leading-snug">{patente.titulo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-4 border-brand-navy p-10 bg-white shadow-premium">
              <Target className="text-brand-navy mb-6" size={40} strokeWidth={3} />
              <h3 className="text-xl font-display font-black text-brand-navy mb-4 uppercase">Objetivos 2026</h3>
              <p className="text-brand-muted text-sm leading-relaxed mb-6">
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
