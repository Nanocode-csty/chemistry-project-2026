'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dbOperations } from '@/lib/supabase';
import { Calendar, ArrowRight, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('TODAS');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const categories = ['TODAS', 'INSTITUCIONAL', 'ACADEMIA', 'INDUSTRIA', 'INVESTIGACIÓN'];

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const { data, error } = await dbOperations.getNoticiasCMS();
        if (data) setNoticias(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNoticias();
  }, []);

  const filteredNoticias = noticias.filter(noticia => {
    const matchesSearch = noticia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         noticia.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'TODAS' || noticia.categoria === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredNoticias.length / itemsPerPage);
  const currentNoticias = filteredNoticias.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-12 h-12 text-[#002b45] animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="relative mb-20 overflow-hidden bg-[#002b45] p-12 lg:p-24 text-white shadow-2xl rounded-sm border-b-[10px] border-[#98C560]">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/[0.02] -skew-x-12 translate-x-1/4" />
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative z-10"
          >
            <div className="w-20 h-2 bg-[#98C560] mb-10 shadow-lg" />
            <h1 className="text-5xl md:text-8xl font-display font-black uppercase tracking-tighter leading-[0.85] mb-10">
              CENTRO DE <br /><span className="text-[#98C560] italic">NOTICIAS</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl font-sans font-medium leading-relaxed border-l-4 border-[#98C560] pl-8 italic">
              Explora las crónicas de innovación, investigación y excelencia que definen 
              el día a día de nuestra institución.
            </p>
          </motion.div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-10 mb-16 bg-white p-8 shadow-xl rounded-sm border border-gray-100">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#98C560] transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Buscar por título o contenido..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-[#98C560] focus:outline-none text-sm font-bold text-[#002b45] rounded-sm transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 overflow-x-auto w-full lg:w-auto pb-4 lg:pb-0 scrollbar-hide">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                className={`px-6 py-3 text-[11px] font-black tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-300 rounded-sm ${
                  activeCategory === cat 
                    ? 'bg-[#002b45] text-white shadow-lg' 
                    : 'text-slate-400 hover:text-[#002b45] hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 min-h-[600px]">
          <AnimatePresence mode='wait'>
            {currentNoticias.length > 0 ? (
              currentNoticias.map((noticia, idx) => (
                <motion.div
                  key={noticia.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-white border border-gray-100 hover:border-[#002b45] transition-all duration-500 shadow-lg hover:shadow-2xl flex flex-col rounded-sm relative overflow-hidden"
                >
                  <div className="relative h-72 overflow-hidden">
                    <img 
                      src={noticia.imagen_url || 'https://via.placeholder.com/800x600?text=Noticia'} 
                      alt={noticia.titulo} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute top-0 left-0 bg-[#002b45] text-white text-[10px] font-black px-6 py-3 uppercase tracking-widest shadow-xl border-b border-r border-white/10">
                      {noticia.categoria}
                    </div>
                  </div>

                  <div className="p-10 flex-grow">
                    <div className="flex items-center gap-3 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-6">
                      <Calendar size={16} className="text-[#98C560]" /> {new Date(noticia.fecha).toLocaleDateString()}
                    </div>
                    <h2 className="text-2xl font-display font-black text-[#002b45] mb-6 leading-tight group-hover:text-[#98C560] transition-colors uppercase tracking-tight">
                      {noticia.titulo}
                    </h2>
                    <p className="text-slate-500 font-sans font-medium leading-relaxed mb-8 line-clamp-3">
                      {noticia.descripcion}
                    </p>
                    <Link 
                      href={`/noticias/${noticia.id}`}
                      className="inline-flex items-center gap-3 text-[11px] font-black tracking-[0.25em] text-[#002b45] uppercase group-hover:text-[#98C560] transition-all border-b-2 border-[#98C560] pb-2 mt-auto"
                    >
                      EXPANDIR NOTICIA <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center">
                <h3 className="text-2xl font-display font-black text-[#002b45] uppercase tracking-tight">No se encontraron noticias</h3>
                <p className="text-slate-400 mt-4">Intenta con otros filtros o términos de búsqueda.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-24 flex justify-center items-center gap-6">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="w-14 h-14 flex items-center justify-center border-2 border-gray-200 text-[#002b45] rounded-full hover:bg-[#002b45] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex items-center gap-4">
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-14 h-14 flex items-center justify-center font-display font-black text-sm rounded-full transition-all shadow-md ${
                    currentPage === i + 1 
                      ? 'bg-[#002b45] text-white scale-110 shadow-xl' 
                      : 'bg-white text-slate-400 hover:bg-slate-50 border border-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="w-14 h-14 flex items-center justify-center border-2 border-gray-200 text-[#002b45] rounded-full hover:bg-[#002b45] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
