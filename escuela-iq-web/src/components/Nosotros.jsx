'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dbOperations } from '@/lib/supabase';
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
        <section className="py-32 border-b border-brand-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-1.5 bg-brand-navy mb-8" />
                <h2 className="text-4xl font-display font-black text-brand-navy uppercase tracking-tighter mb-8">
                  {nosotros.titulo}
                </h2>
                <p className="text-2xl font-display font-bold text-brand-teal italic mb-10 leading-tight">
                  {nosotros.subtitulo}
                </p>
                <p className="text-brand-muted text-lg leading-relaxed mb-12 border-l-4 border-brand-navy pl-8">
                  {nosotros.descripcion}
                </p>
                <div className="bg-brand-light p-10 rounded-sm flex items-center gap-8 border border-brand-border shadow-sm">
                  <div className="bg-brand-navy p-4 rounded-sm text-white">
                    <Users size={32} />
                  </div>
                  <div>
                    <span className="block text-4xl font-display font-black text-brand-navy tracking-tighter">
                      {nosotros.miembros_conteo}
                    </span>
                    <span className="text-xs font-bold text-brand-muted uppercase tracking-widest leading-loose">
                      {nosotros.miembros_descripcion}
                    </span>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative aspect-square lg:aspect-auto lg:h-[600px] overflow-hidden rounded-sm shadow-premium"
              >
                <img 
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200" 
                  alt="Equipo de Investigación" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-brand-navy/10" />
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Misión y Visión */}
      {misionVision && (
        <section className="py-32 bg-brand-light/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white p-12 border border-brand-border shadow-premium relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-navy/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                <Target className="text-brand-navy mb-8" size={48} />
                <h3 className="text-3xl font-display font-black text-brand-navy uppercase tracking-tighter mb-6">Misión</h3>
                <p className="text-brand-muted text-lg leading-relaxed relative z-10">
                  {misionVision.mision}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-brand-navy p-12 shadow-premium relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                <Eye className="text-brand-accent mb-8" size={48} />
                <h3 className="text-3xl font-display font-black text-white uppercase tracking-tighter mb-6">Visión</h3>
                <p className="text-white/80 text-lg leading-relaxed relative z-10">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
            <div className="w-16 h-1.5 bg-brand-navy mx-auto mb-8" />
            <h2 className="text-4xl font-display font-black text-brand-navy uppercase tracking-tighter mb-6">Nuestros Valores</h2>
            <p className="text-brand-muted max-w-2xl mx-auto font-sans leading-relaxed">
              Reflejamos principios esenciales de ética y compromiso, que guían nuestra marca hacia la excelencia.
            </p>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {valores.map((valor, idx) => (
                <motion.div
                  key={valor.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-10 border border-brand-border hover:border-brand-navy hover:shadow-card-hover transition-all duration-300 rounded-sm group"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-brand-light flex items-center justify-center text-brand-navy rounded-sm group-hover:bg-brand-navy group-hover:text-white transition-colors">
                      <Award size={24} />
                    </div>
                    <h4 className="text-xl font-display font-black text-brand-navy uppercase tracking-tight">{valor.titulo}</h4>
                  </div>
                  <p className="text-brand-muted text-sm leading-relaxed">
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
        <section className="py-32 bg-brand-navy text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 -skew-x-12 translate-x-1/2" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <div className="w-16 h-1.5 bg-brand-accent mx-auto mb-8" />
              <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter">Nuestro Círculo Dorado</h2>
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
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-20">
              <div className="lg:w-2/3">
                <div className="w-16 h-1.5 bg-brand-navy mb-8" />
                <h2 className="text-4xl font-display font-black text-brand-navy uppercase tracking-tighter mb-6">Nuestra Evolución</h2>
                <p className="text-brand-muted text-lg max-w-xl font-sans leading-relaxed border-l-4 border-brand-navy pl-8">
                  Un recorrido a través de los años, desde nuestros inicios hasta la proyección de un futuro sostenible.
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
              {evolucion.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative group"
                >
                  <div className="mb-8">
                    <span className="text-brand-navy font-display font-black text-xl italic group-hover:text-brand-teal transition-colors">
                      {item.periodo}
                    </span>
                    <div className="w-full h-1 bg-brand-light mt-4 relative overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: idx * 0.2 }}
                        className="absolute inset-0 bg-brand-navy"
                      />
                    </div>
                  </div>
                  <h4 className="text-sm font-display font-black text-brand-navy uppercase mb-4 tracking-tight leading-tight">
                    {item.titulo}
                  </h4>
                  <p className="text-brand-muted text-xs leading-relaxed font-sans">
                    {item.descripcion}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
