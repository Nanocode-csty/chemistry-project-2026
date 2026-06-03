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
            <div className="w-16 h-1.5 bg-[#002b45] mb-6" />
            <h2 className="text-5xl md:text-7xl font-display font-black text-[#002b45] leading-tight tracking-tight uppercase">
              {(header.titulo || '').split(' ')[0]} <span className="text-[#98C560] italic">{(header.titulo || '').split(' ').slice(1).join(' ')}</span>
            </h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-xl text-slate-500 font-sans font-medium leading-relaxed max-w-2xl border-l-4 border-[#002b45] pl-8"
            >
              {header.descripcion}
            </motion.p>
          </motion.div>
          <div className="lg:w-1/3 flex justify-end">
            <div className="text-right hidden lg:block opacity-10">
              <span className="block text-8xl font-display font-black text-[#002b45] tracking-tighter uppercase leading-none">01</span>
              <span className="block text-2xl font-display font-black text-[#002b45] tracking-[0.2em] uppercase mt-2">Investigación</span>
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
                  className="bg-white p-10 border border-gray-100 hover:border-[#002b45] shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden rounded-sm"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                  <div className="w-14 h-14 bg-[#002b45] flex items-center justify-center text-white mb-8 group-hover:bg-[#98C560] group-hover:text-[#002b45] transition-all duration-300 relative z-10 shadow-lg">
                    <Microscope size={28} />
                  </div>
                  <h4 className="text-xl font-display font-black text-[#002b45] mb-4 uppercase tracking-tight relative z-10 leading-tight group-hover:text-[#98C560] transition-colors">{inv.titulo}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8 relative z-10 line-clamp-3 font-medium">{inv.descripcion}</p>
                  <Link href={inv.link || "#"} className="flex items-center gap-3 text-[11px] font-display font-black tracking-[0.25em] text-[#002b45] uppercase group-hover:text-[#98C560] transition-all relative z-10">
                    EXPEDIENTE COMPLETO <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Papers List */}
            {papers.length > 0 && (
              <div className="bg-[#002b45] p-12 text-white shadow-2xl relative overflow-hidden rounded-sm border-t-8 border-[#98C560]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-8">
                  <h3 className="text-2xl font-display font-black flex items-center gap-4 uppercase tracking-widest">
                    <ScrollText className="text-[#98C560]" size={28} />
                    Publicaciones Científicas
                  </h3>
                  <Link href="/papers" className="text-[11px] font-black tracking-widest text-[#98C560] hover:text-white transition-colors uppercase border-b-2 border-[#98C560] pb-1">
                    Ver Todo
                  </Link>
                </div>
                <div className="space-y-10">
                  {papers.map((paper) => (
                    <div key={paper.id} className="group border-b border-white/5 pb-10 last:border-0 last:pb-0">
                      <span className="text-[#98C560] text-xs font-black tracking-[0.4em] uppercase block mb-4">{paper.anio}</span>
                      <h4 className="text-2xl font-display font-bold mb-4 group-hover:text-[#98C560] transition-colors leading-tight tracking-tight">{paper.titulo}</h4>
                      <p className="text-slate-400 text-[15px] italic mb-6 font-sans leading-relaxed font-medium">"{paper.resumen}"</p>
                      <div className="flex items-center gap-5 text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">
                        <span className="text-white/60">{paper.revista}</span>
                        <span className="w-1.5 h-1.5 bg-[#98C560] rounded-full" />
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
              <div className="bg-[#002b45] p-12 shadow-2xl text-white relative overflow-hidden rounded-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
                <h3 className="text-2xl font-display font-black text-white mb-8 uppercase leading-tight relative z-10 tracking-tight">Patentes y <br /><span className="text-[#98C560]">Registros</span></h3>
                <div className="space-y-6 relative z-10">
                  {patentes.map((patente) => (
                    <div key={patente.id} className="flex items-start gap-4 border-b border-white/5 pb-6 last:border-0">
                      <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center shrink-0">
                        <Lightbulb className="text-[#98C560]" size={18} />
                      </div>
                      <span className="text-sm font-sans font-bold text-slate-300 leading-snug group-hover:text-white transition-colors">{patente.titulo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-[6px] border-[#002b45] p-12 bg-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12" />
              <Target className="text-[#002b45] mb-8" size={48} strokeWidth={2.5} />
              <h3 className="text-2xl font-display font-black text-[#002b45] mb-6 uppercase tracking-tight">Objetivos 2026</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed mb-8 font-medium">
                Consolidar 15 nuevas patentes en procesos de biorremediación y 
                energías renovables aplicadas a la industria nacional.
              </p>
              <div className="space-y-5">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-slate-50 flex items-center justify-center text-[#98C560] group-hover:bg-[#98C560] group-hover:text-white transition-all duration-300 rounded-sm">
                    <Award size={22} />
                  </div>
                  <span className="text-xs font-black text-[#002b45] uppercase tracking-[0.2em]">Acreditación Internacional</span>
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
