'use client';
import { motion } from 'framer-motion';
import { mockNoticias } from '@/data/mockData';
import { Calendar, ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const Noticias = () => {
  return (
    <section id="noticias" className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-2/3"
          >
            <div className="w-16 h-1.5 bg-brand-teal mb-6" />
            <h2 className="text-5xl md:text-7xl font-display font-black text-brand-navy leading-tight tracking-tight uppercase">
              NOTICIAS & <br /><span className="text-brand-teal italic">ACTUALIDAD</span>
            </h2>
            <p className="mt-8 text-xl text-gray-500 font-sans leading-relaxed max-w-2xl border-l-4 border-brand-teal pl-8">
              Mantente al día con los últimos avances, convenios e hitos de nuestra 
              comunidad científica e industrial.
            </p>
          </motion.div>
          <div className="lg:w-1/3 flex justify-end">
            <Link 
              href="/noticias" 
              className="group flex items-center gap-3 text-[11px] font-black tracking-[0.3em] text-brand-navy uppercase border-b-2 border-brand-teal pb-2 hover:text-brand-teal transition-all"
            >
              VER TODAS LAS NOTICIAS <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {mockNoticias.map((noticia, idx) => (
            <motion.div
              key={noticia.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-brand-gray border border-brand-gray hover:bg-white hover:border-brand-teal transition-all duration-500 shadow-soft hover:shadow-premium flex flex-col"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={noticia.imagen} 
                  alt={noticia.titulo} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-brand-navy text-white text-[10px] font-black px-4 py-2 uppercase tracking-widest">
                  {noticia.categoria}
                </div>
              </div>

              {/* Content */}
              <div className="p-8 flex-grow">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                  <Calendar size={14} className="text-brand-teal" /> {noticia.fecha}
                </div>
                <h3 className="text-xl font-display font-black text-brand-navy mb-4 leading-tight group-hover:text-brand-teal transition-colors uppercase">
                  {noticia.titulo}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3">
                  {noticia.descripcion}
                </p>
              </div>

              {/* Footer Link */}
              <div className="p-8 pt-0 mt-auto">
                <Link 
                  href={`/noticias/${noticia.id}`}
                  className="inline-flex items-center gap-2 text-[11px] font-black tracking-widest text-brand-navy uppercase group-hover:gap-4 transition-all"
                >
                  LEER MÁS <ChevronRight size={14} className="text-brand-teal" />
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
