'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mockProyectosIndustriales, mockConcursos } from '@/data/mockData';
import { dbOperations } from '@/lib/supabase';
import { Trophy, ArrowUpRight, Zap, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Profesionales = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    header: null,
    servicios: [],
    stats: []
  });

  useEffect(() => {
    const fetchProfesionalesData = async () => {
      try {
        const [headerRes, servRes, statsRes] = await Promise.all([
          dbOperations.getProfesionalesHeader(),
          dbOperations.getServicios(),
          dbOperations.getStats()
        ]);
        
        setData({
          header: headerRes.data,
          servicios: servRes.data || [],
          stats: statsRes.data || []
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfesionalesData();
  }, []);

  if (loading) return <div className="py-20 flex justify-center bg-brand-navy"><Loader2 className="animate-spin text-white" /></div>;
  
  const { header, servicios, stats } = data;
  if (!header) return null;

  return (
    <section id="profesionales" className="bg-white text-brand-navy overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Intro Grid */}
        <div className="grid lg:grid-cols-2 gap-20 mb-20 items-center">
          <div>
            <div className="w-16 h-1.5 bg-brand-navy mb-8" />
            <h2 className="text-4xl md:text-6xl font-display font-black leading-tight uppercase tracking-tighter mb-8 text-brand-navy">
              {(header.titulo || '').split(' ')[0]} <br />
              <span className="text-brand-teal italic">{(header.titulo || '').split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="text-xl text-brand-muted font-sans leading-relaxed mb-12 border-l-4 border-brand-navy pl-8">
              {header.descripcion}
            </p>
            <div className="grid grid-cols-2 gap-12">
              {stats.map((stat, idx) => (
                <div key={idx} className="border-l-4 border-brand-border pl-6 py-2">
                  <span className="block text-5xl font-display font-black text-brand-navy italic tracking-tighter">{stat.valor}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-muted">{stat.etiqueta}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {servicios.slice(0, 4).map((servicio, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Link href={servicio.link || "/servicios"} className="block bg-white p-10 border border-brand-border hover:border-brand-navy hover:shadow-card-hover transition-all duration-300 group h-full rounded-sm">
                  <Zap className="text-brand-navy group-hover:scale-110 transition-transform mb-6" size={28} />
                  <h4 className="font-display font-black text-sm uppercase tracking-wider leading-tight text-brand-navy">{servicio.titulo}</h4>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Banner - Moved below intro */}
      <div className="relative h-[500px] w-full mb-32">
        <img 
          src="https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&q=80&w=1600" 
          alt="Sector Industrial" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-navy/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-transparent z-20" />
        <div className="absolute inset-0 flex items-center z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl"
            >
              <div className="w-20 h-2 bg-brand-accent mb-8" />
              <h2 className="text-5xl md:text-8xl font-display font-black leading-tight uppercase tracking-tighter text-white">
                {(header.alianza_titulo || '').split(' ')[0]} <br />
                <span className="text-brand-accent italic">{(header.alianza_titulo || '').split(' ').slice(1).join(' ')}</span>
              </h2>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">

        {/* Industrial Projects Carousel-like Grid */}
        <div className="mb-32">
          <div className="flex items-center justify-between mb-16">
            <h3 className="text-3xl font-display font-black uppercase tracking-tight text-brand-navy">PROYECTOS DE IMPACTO</h3>
            <div className="flex gap-4">
              <Link href="/proyectos" className="text-[10px] font-black tracking-widest text-brand-accent hover:text-brand-navy transition-colors uppercase border-b border-brand-accent">
                Ver Catálogo Completo
              </Link>
            </div>
          </div>
          
          <div className="relative group/carousel">
            <div className="grid md:grid-cols-3 gap-0 border border-brand-gray shadow-premium overflow-hidden">
              {mockProyectosIndustriales.map((proy, idx) => (
                <motion.div
                  key={proy.id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  whileHover={{ zIndex: 10, scale: 1.02 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6, ease: "easeOut" }}
                  className="bg-brand-gray text-brand-navy p-10 border-r border-b border-slate-100 last:border-r-0 hover:bg-brand-navy hover:text-white transition-all duration-500 group cursor-pointer relative"
                  onClick={() => router.push(`/proyectos/${proy.id}`)}
                >
                  <div className="flex justify-between items-start mb-10">
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400 group-hover:text-brand-teal">Estudio de Caso</span>
                    <ArrowUpRight className="text-brand-teal group-hover:rotate-45 transition-transform" size={24} />
                  </div>
                  <h4 className="text-2xl font-display font-black uppercase leading-tight mb-6">{proy.titulo}</h4>
                  <p className="text-slate-600 group-hover:text-slate-300 text-sm leading-relaxed mb-8 line-clamp-3">
                    {proy.descripcion}
                  </p>
                  <div className="text-[11px] font-black uppercase tracking-widest border-t border-slate-100 group-hover:border-white/10 pt-6">
                    Partner: <span className="text-brand-teal font-bold">{proy.cliente}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Recognition Section */}
        <div className="bg-brand-teal p-16 lg:p-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/3 text-brand-navy">
              <Trophy size={80} className="mb-8" strokeWidth={1.5} />
              <h3 className="text-4xl font-display font-black uppercase leading-none mb-4">LOGROS Y <br />PREMIOS</h3>
              <p className="font-bold uppercase text-xs tracking-widest opacity-70">Excelencia Reconocida</p>
            </div>
            <div className="lg:w-2/3 grid sm:grid-cols-2 gap-6 w-full">
              {mockConcursos.map((concurso) => (
                <Link key={concurso.id} href="/concursos" className="bg-white p-8 flex items-center justify-between group hover:scale-105 transition-transform text-brand-navy border border-slate-100 shadow-soft">
                  <span className="font-display font-black text-sm uppercase tracking-wider">{concurso.nombre}</span>
                  <span className="text-brand-teal font-black text-lg italic">{concurso.anio}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Profesionales;
