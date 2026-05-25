'use client';
import { motion } from 'framer-motion';
import { mockNoticias } from '@/data/mockData';
import { Calendar, ArrowRight, ChevronRight, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function NoticiasPage() {
  return (
    <main className="min-h-screen bg-brand-gray pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="relative mb-20 overflow-hidden bg-brand-navy p-12 lg:p-24 text-white shadow-premium">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-teal/5 -skew-x-12 translate-x-1/4" />
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative z-10"
          >
            <div className="w-20 h-2 bg-brand-teal mb-8" />
            <h1 className="text-5xl md:text-8xl font-display font-black uppercase tracking-tighter leading-none mb-8">
              CENTRO DE <br /><span className="text-brand-teal italic">NOTICIAS</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl font-sans leading-relaxed border-l-4 border-brand-teal pl-8">
              Explora las crónicas de innovación, investigación y excelencia que definen 
              el día a día de nuestra institución.
            </p>
          </motion.div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar noticias..." 
                className="w-full pl-12 pr-4 py-3 bg-brand-gray border-none focus:ring-2 focus:ring-brand-teal focus:outline-none text-sm font-bold"
              />
            </div>
          </div>
          <div className="flex items-center gap-6 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {['TODAS', 'INSTITUCIONAL', 'ACADEMIA', 'INDUSTRIA', 'INFRAESTRUCTURA'].map((cat) => (
              <button key={cat} className="text-[10px] font-black tracking-widest text-slate-400 hover:text-brand-navy transition-colors uppercase whitespace-nowrap">
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {mockNoticias.map((noticia, idx) => (
            <motion.div
              key={noticia.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white border border-slate-100 hover:border-brand-teal transition-all duration-500 shadow-soft hover:shadow-premium flex flex-col"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={noticia.imagen} 
                  alt={noticia.titulo} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-0 right-0 bg-brand-teal text-brand-navy text-[10px] font-black px-6 py-3 uppercase tracking-widest">
                  {noticia.categoria}
                </div>
              </div>

              <div className="p-10 flex-grow">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                  <Calendar size={14} className="text-brand-teal" /> {noticia.fecha}
                </div>
                <h2 className="text-2xl font-display font-black text-brand-navy mb-6 leading-tight group-hover:text-brand-teal transition-colors uppercase">
                  {noticia.titulo}
                </h2>
                <p className="text-gray-500 font-sans leading-relaxed mb-8">
                  {noticia.descripcion}
                </p>
                <Link 
                  href={`/noticias/${noticia.id}`}
                  className="inline-flex items-center gap-3 text-[11px] font-black tracking-[0.2em] text-brand-navy uppercase group-hover:gap-5 transition-all border-b-2 border-brand-teal pb-2"
                >
                  EXPANDIR NOTICIA <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-20 flex justify-center items-center gap-4">
          <button className="w-12 h-12 flex items-center justify-center border-2 border-brand-navy text-brand-navy font-bold hover:bg-brand-navy hover:text-white transition-all">1</button>
          <button className="w-12 h-12 flex items-center justify-center border-2 border-transparent text-slate-400 font-bold hover:border-brand-navy hover:text-brand-navy transition-all">2</button>
          <button className="w-12 h-12 flex items-center justify-center border-2 border-transparent text-slate-400 font-bold hover:border-brand-navy hover:text-brand-navy transition-all">3</button>
        </div>

      </div>
    </main>
  );
}
