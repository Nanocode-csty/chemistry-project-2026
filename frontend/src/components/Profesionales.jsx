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
        const [headerRes, servRes, statsRes, configRes] = await Promise.all([
          dbOperations.getProfesionalesHeader(),
          dbOperations.getServicios(),
          dbOperations.getStats(),
          dbOperations.getConfig()
        ]);
        
        const limit = configRes.data?.servicios_limite || 4;
        
        setData({
          header: headerRes.data,
          servicios: (servRes.data || []).slice(0, limit),
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
    <section id="profesionales" className="bg-white text-[#002b45] overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {/* Intro Grid */}
        <div className="grid lg:grid-cols-2 gap-20 mb-20 items-center">
          <div>
            <div className="w-16 h-1.5 bg-[#002b45] mb-8" />
            <h2 className="text-4xl md:text-6xl font-display font-black leading-tight uppercase tracking-tighter mb-8 text-[#002b45]">
              {(header.titulo || '').split(' ')[0]} <br />
              <span className="text-[#98C560] italic">{(header.titulo || '').split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="text-xl text-slate-500 font-sans font-medium leading-relaxed mb-12 border-l-4 border-[#002b45] pl-8">
              {header.descripcion}
            </p>
            <div className="grid grid-cols-2 gap-12">
              {stats.map((stat, idx) => (
                <div key={idx} className="border-l-4 border-slate-100 pl-6 py-2">
                  <span className="block text-5xl font-display font-black text-[#002b45] italic tracking-tighter">{stat.valor}</span>
                  <span className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 mt-1 block">{stat.etiqueta}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {servicios.map((servicio, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Link href={servicio.link || "/servicios"} className="block bg-white p-10 border border-gray-100 hover:border-[#002b45] hover:shadow-2xl transition-all duration-500 group h-full rounded-sm shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700" />
                  <Zap className="text-[#002b45] group-hover:text-[#98C560] group-hover:scale-110 transition-all duration-300 mb-6 relative z-10" size={32} />
                  <h4 className="font-display font-black text-[13px] uppercase tracking-wider leading-tight text-[#002b45] relative z-10 group-hover:text-[#98C560] transition-colors">{servicio.titulo}</h4>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Banner - Professional Style */}
      <div className="relative h-[600px] w-full mb-32 border-y-[10px] border-[#98C560]">
        <img 
          src="https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&q=80&w=1600" 
          alt="Sector Industrial" 
          className="w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-[#002b45]/70 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#002b45] via-transparent to-transparent z-20" />
        <div className="absolute inset-0 flex items-center z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl"
            >
              <div className="w-20 h-2 bg-[#98C560] mb-8 shadow-lg" />
              <h2 className="text-5xl md:text-8xl font-display font-black leading-tight uppercase tracking-tighter text-white drop-shadow-2xl">
                {(header.alianza_titulo || '').split(' ')[0]} <br />
                <span className="text-[#98C560] italic">{(header.alianza_titulo || '').split(' ').slice(1).join(' ')}</span>
              </h2>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">

        {/* Industrial Projects Carousel-like Grid */}
        <div className="mb-32">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-20 border-b border-gray-100 pb-12">
            <h3 className="text-4xl font-display font-black uppercase tracking-tight text-[#002b45]">PROYECTOS DE IMPACTO</h3>
            <Link href="/proyectos" className="text-[11px] font-black tracking-[0.3em] text-[#98C560] hover:text-[#002b45] transition-all uppercase border-b-2 border-[#98C560] pb-1">
              Ver Catálogo Completo
            </Link>
          </div>
          
          <div className="relative group/carousel">
            <div className="grid md:grid-cols-3 gap-0 border border-gray-100 shadow-2xl overflow-hidden rounded-sm">
              {mockProyectosIndustriales.map((proy, idx) => (
                <motion.div
                  key={proy.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className="bg-white text-[#002b45] p-12 border-r border-b border-gray-50 last:border-r-0 hover:bg-[#002b45] hover:text-white transition-all duration-500 group cursor-pointer relative"
                  onClick={() => router.push(`/proyectos/${proy.id}`)}
                >
                  <div className="flex justify-between items-start mb-12">
                    <span className="text-[11px] font-black tracking-[0.3em] uppercase text-slate-400 group-hover:text-[#98C560] transition-colors">Estudio de Caso</span>
                    <ArrowUpRight className="text-[#98C560] group-hover:rotate-45 transition-transform duration-500" size={28} />
                  </div>
                  <h4 className="text-2xl font-display font-black uppercase leading-tight mb-6 tracking-tight">{proy.titulo}</h4>
                  <p className="text-slate-500 group-hover:text-slate-300 text-[15px] leading-relaxed mb-10 line-clamp-3 font-medium">
                    {proy.descripcion}
                  </p>
                  <div className="text-[12px] font-black uppercase tracking-[0.2em] border-t border-gray-50 group-hover:border-white/10 pt-8 flex items-center gap-3">
                    <span className="text-slate-400 group-hover:text-white/40">Partner:</span>
                    <span className="text-[#98C560] font-black">{proy.cliente}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Recognition Section */}
        <div className="bg-[#002b45] p-16 lg:p-24 relative overflow-hidden rounded-sm shadow-2xl border-l-[12px] border-[#98C560]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/3 text-white">
              <div className="bg-[#98C560] w-20 h-20 flex items-center justify-center text-[#002b45] rounded-sm mb-10 shadow-xl">
                <Trophy size={48} strokeWidth={2} />
              </div>
              <h3 className="text-4xl font-display font-black uppercase leading-[1.1] mb-6 tracking-tight">LOGROS Y <br /><span className="text-[#98C560]">PREMIOS</span></h3>
              <p className="font-black uppercase text-[11px] tracking-[0.3em] text-[#98C560] opacity-80">Excelencia Reconocida Internacionalmente</p>
            </div>
            <div className="lg:w-2/3 grid sm:grid-cols-2 gap-8 w-full">
              {mockConcursos.map((concurso) => (
                <Link key={concurso.id} href="/concursos" className="bg-white/5 border border-white/10 p-10 flex items-center justify-between group hover:bg-white hover:text-[#002b45] transition-all duration-500 rounded-sm">
                  <span className="font-display font-black text-sm uppercase tracking-[0.15em] group-hover:translate-x-2 transition-transform duration-300">{concurso.nombre}</span>
                  <span className="text-[#98C560] font-black text-2xl italic tracking-tighter">{concurso.anio}</span>
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
