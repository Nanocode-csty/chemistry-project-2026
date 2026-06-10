'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dbOperations } from '@/lib/api';
import { 
  Users, 
  Target, 
  Eye, 
  Award, 
  Compass, 
  Zap, 
  History, 
  Loader2,
  ChevronRight
} from 'lucide-react';

export default function Nosotros() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    nosotros: null,
    misionVision: null,
    valores: [],
    circuloDorado: null,
    evolucion: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nosotros, mv, val, cd, evo] = await Promise.all([
          dbOperations.getNosotros(),
          dbOperations.getMisionVision(),
          dbOperations.getValores(),
          dbOperations.getCirculoDorado(),
          dbOperations.getEvolucion()
        ]);
        
        setData({
          nosotros: nosotros.data,
          misionVision: mv.data,
          valores: val.data || [],
          circuloDorado: cd.data,
          evolucion: evo.data || []
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center bg-white">
        <Loader2 className="w-10 h-10 text-brand-navy animate-spin" />
      </div>
    );
  }

  const { nosotros, misionVision, valores, circuloDorado, evolucion } = data;

  return (
    <div id="nosotros" className="bg-white">
      {/* 1. Acerca de Nosotros */}
      {nosotros && (
        <section className="py-32 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-1.5 bg-[#002b45] mb-8" />
                <h2 className="text-4xl md:text-5xl font-display font-black text-[#002b45] uppercase tracking-tighter mb-8 leading-tight">
                  {nosotros.titulo}
                </h2>
                <p className="text-2xl font-display font-bold text-[#98C560] italic mb-10 leading-tight">
                  {nosotros.subtitulo}
                </p>
                <p className="text-slate-500 text-lg leading-relaxed mb-12 border-l-4 border-[#002b45] pl-8 font-medium">
                  {nosotros.descripcion}
                </p>
                <div className="bg-slate-50 p-10 rounded-sm flex items-center gap-8 border border-gray-100 shadow-sm">
                  <div className="bg-[#002b45] p-5 rounded-sm text-white shadow-lg">
                    <Users size={32} />
                  </div>
                  <div>
                    <span className="block text-5xl font-display font-black text-[#002b45] tracking-tighter italic">
                      {nosotros.miembros_conteo}
                    </span>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 block">
                      {nosotros.miembros_descripcion}
                    </span>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative aspect-square lg:aspect-auto lg:h-[650px] overflow-hidden rounded-sm shadow-2xl border-b-[10px] border-[#98C560]"
              >
                <img 
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200" 
                  alt="Equipo de Investigación" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-[#002b45]/10" />
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Misión y Visión */}
      {misionVision && (
        <section className="py-32 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white p-16 border border-gray-100 shadow-xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#002b45]/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                <Target className="text-[#002b45] mb-8" size={56} strokeWidth={1.5} />
                <h3 className="text-3xl font-display font-black text-[#002b45] uppercase tracking-tighter mb-6">Misión</h3>
                <p className="text-slate-500 text-lg leading-relaxed relative z-10 font-medium">
                  {misionVision.mision}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-[#002b45] p-16 shadow-2xl relative overflow-hidden group border-t-8 border-[#98C560]"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                <Eye className="text-[#98C560] mb-8" size={56} strokeWidth={1.5} />
                <h3 className="text-3xl font-display font-black text-white uppercase tracking-tighter mb-6">Visión</h3>
                <p className="text-slate-300 text-lg leading-relaxed relative z-10 font-medium">
                  {misionVision.vision}
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Valores */}
      {valores.length > 0 && (
        <section className="py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-24">
            <div className="w-16 h-1.5 bg-[#98C560] mx-auto mb-8" />
            <h2 className="text-4xl md:text-5xl font-display font-black text-[#002b45] uppercase tracking-tighter mb-6">Nuestros Valores</h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-sans font-medium leading-relaxed text-lg">
              Reflejamos principios esenciales de ética y compromiso que guían nuestra marca hacia la excelencia científica.
            </p>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {valores.map((valor, idx) => (
                <motion.div
                  key={valor.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-12 border border-gray-100 hover:border-[#002b45] hover:shadow-2xl transition-all duration-500 rounded-sm group bg-white"
                >
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-14 h-14 bg-slate-50 flex items-center justify-center text-[#002b45] rounded-sm group-hover:bg-[#002b45] group-hover:text-white transition-all duration-300 shadow-inner">
                      <Award size={28} />
                    </div>
                    <h4 className="text-xl font-display font-black text-[#002b45] uppercase tracking-tight leading-tight">{valor.titulo}</h4>
                  </div>
                  <p className="text-slate-500 text-[15px] leading-relaxed font-medium">
                    {valor.descripcion}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Círculo Dorado */}
      {circuloDorado && (
        <section className="py-32 bg-[#002b45] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/[0.02] -skew-x-12 translate-x-1/2" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-24">
              <div className="w-16 h-1.5 bg-[#98C560] mx-auto mb-8" />
              <h2 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tighter">Nuestro Círculo Dorado</h2>
            </div>
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="bg-white/5 p-12 border border-white/10 hover:bg-white/10 transition-colors">
                <Target className="text-brand-accent mb-8" size={40} />
                <h3 className="text-2xl font-display font-black uppercase mb-6">{circuloDorado.proposito_titulo}</h3>
                <p className="text-white/70 leading-relaxed font-sans">{circuloDorado.proposito_descripcion}</p>
              </div>
              <div className="bg-white/5 p-12 border border-white/10 hover:bg-white/10 transition-colors">
                <Compass className="text-brand-accent mb-8" size={40} />
                <h3 className="text-2xl font-display font-black uppercase mb-6">{circuloDorado.proceso_titulo}</h3>
                <p className="text-white/70 leading-relaxed font-sans">{circuloDorado.proceso_descripcion}</p>
              </div>
              <div className="bg-white/5 p-12 border border-white/10 hover:bg-white/10 transition-colors">
                <Zap className="text-brand-accent mb-8" size={40} />
                <h3 className="text-2xl font-display font-black uppercase mb-6">{circuloDorado.resultados_titulo}</h3>
                <p className="text-white/70 leading-relaxed font-sans">{circuloDorado.resultados_descripcion}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Evolución (Timeline) */}
      {evolucion.length > 0 && (
        <section className="py-32 bg-slate-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-24">
              <div className="w-16 h-1.5 bg-[#98C560] mx-auto mb-8" />
              <h2 className="text-4xl md:text-5xl font-display font-black text-[#002b45] uppercase tracking-tighter mb-8">Nuestra Evolución</h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto font-sans font-medium leading-relaxed">
                Un recorrido a través de los años, desde nuestros inicios hasta la proyección de un futuro sostenible y tecnológico.
              </p>
            </div>
            
            <div className="relative">
              {/* Central Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 hidden lg:block" />
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 relative z-10">
                {evolucion.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.15, duration: 0.6 }}
                    className="relative group"
                  >
                    {/* Node Dot */}
                    <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border-4 border-gray-200 rounded-full group-hover:border-[#98C560] group-hover:scale-125 transition-all duration-500 z-20 items-center justify-center">
                      <div className="w-2 h-2 bg-gray-200 group-hover:bg-[#98C560] rounded-full transition-colors" />
                    </div>

                    <div className={`flex flex-col ${idx % 2 === 0 ? 'lg:mb-40' : 'lg:mt-40 lg:flex-col-reverse'}`}>
                      <div className={`p-8 bg-white shadow-xl rounded-sm border-t-4 border-[#002b45] group-hover:border-[#98C560] transition-all duration-500 group-hover:-translate-y-2 relative ${idx % 2 === 0 ? 'mb-8' : 'mt-8 lg:mb-0 lg:mt-8'}`}>
                        {/* Triangle Arrow */}
                        <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-gray-100 hidden lg:block ${idx % 2 === 0 ? '-bottom-2' : '-top-2'}`} />
                        
                        <span className="text-3xl font-display font-black text-[#002b45] italic tracking-tighter mb-4 block group-hover:text-[#98C560] transition-colors">
                          {item.periodo}
                        </span>
                        <h4 className="text-sm font-display font-black text-[#002b45] uppercase mb-4 tracking-wider leading-tight">
                          {item.titulo}
                        </h4>
                        <p className="text-slate-500 text-xs leading-relaxed font-medium">
                          {item.descripcion}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
