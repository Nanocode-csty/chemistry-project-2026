'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dbOperations } from '@/lib/supabase';
import { Calendar, ArrowRight, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

const Noticias = () => {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const [noticiasRes, configRes] = await Promise.all([
          dbOperations.getNoticiasCMS(),
          dbOperations.getConfig()
        ]);

        const limit = configRes.data?.noticias_limite || 3;
        
        if (noticiasRes.data) {
          setNoticias(noticiasRes.data.slice(0, limit));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNoticias();
  }, []);

  if (loading) {
    return (
      <div className="py-32 flex justify-center">
        <Loader2 className="w-10 h-10 text-brand-navy animate-spin" />
      </div>
    );
  }

  if (noticias.length === 0) return null;

  return (
    <section id="noticias" className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-24 border-b border-gray-100 pb-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-2/3"
          >
            <div className="w-16 h-1.5 bg-[#002b45] mb-6" />
            <h2 className="text-5xl md:text-7xl font-display font-black text-[#002b45] leading-tight tracking-tight uppercase">
              NOTICIAS & <br /><span className="text-[#98C560] italic">ACTUALIDAD</span>
            </h2>
            <p className="mt-8 text-xl text-slate-500 font-sans font-medium leading-relaxed max-w-2xl border-l-4 border-[#002b45] pl-8">
              Mantente al día con los últimos avances, convenios e hitos de nuestra 
              comunidad científica e industrial.
            </p>
          </motion.div>
          <div className="lg:w-1/3 flex justify-end">
            <Link 
              href="/noticias" 
              className="group flex items-center gap-4 text-[11px] font-black tracking-[0.3em] text-[#002b45] uppercase border-b-2 border-[#98C560] pb-2 hover:text-[#98C560] transition-all"
            >
              VER TODAS LAS NOTICIAS <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-3 gap-10">
          {noticias.map((noticia, idx) => (
            <motion.div
              key={noticia.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white border border-gray-100 hover:border-[#002b45] transition-all duration-500 shadow-sm hover:shadow-2xl flex flex-col rounded-sm relative overflow-hidden"
            >
              {/* Image Container */}
              <div className="relative h-72 overflow-hidden">
                <img 
                  src={noticia.imagen_url || 'https://via.placeholder.com/800x600?text=Noticia'} 
                  alt={noticia.titulo} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] grayscale group-hover:grayscale-0"
                />
                <div className="absolute top-0 left-0 bg-[#002b45] text-white text-[10px] font-black px-5 py-3 uppercase tracking-widest shadow-xl border-b border-r border-white/10">
                  {noticia.categoria}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#002b45]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Content */}
              <div className="p-10 flex-grow">
                <div className="flex items-center gap-3 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-6">
                  <Calendar size={16} className="text-[#98C560]" /> {new Date(noticia.fecha).toLocaleDateString()}
                </div>
                <h3 className="text-2xl font-display font-black text-[#002b45] mb-6 leading-tight group-hover:text-[#98C560] transition-colors uppercase tracking-tight">
                  {noticia.titulo}
                </h3>
                <p className="text-slate-500 text-[15px] leading-relaxed mb-8 line-clamp-3 font-medium">
                  {noticia.descripcion}
                </p>
              </div>

              {/* Footer Link */}
              <div className="p-10 pt-0 mt-auto">
                <Link 
                  href={`/noticias/${noticia.id}`}
                  className="inline-flex items-center gap-3 text-[11px] font-black tracking-[0.25em] text-[#002b45] uppercase group-hover:text-[#98C560] transition-all"
                >
                  LEER MÁS <ChevronRight size={18} className="text-[#98C560] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Noticias;
