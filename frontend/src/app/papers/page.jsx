'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dbOperations } from '@/lib/api';
import { ScrollText, ExternalLink, Download, BookOpen, Quote, Loader2 } from 'lucide-react';

export default function PapersPage() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const { data, error } = await dbOperations.getPapers();
        if (data) setPapers(data);
      } catch (err) {
        console.error('Error fetching papers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-brand-navy" size={48} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-2/3"
          >
            <div className="w-20 h-2 bg-brand-navy mb-8" />
            <h1 className="text-5xl md:text-7xl font-display font-black text-brand-navy uppercase tracking-tighter leading-none mb-8">
              PUBLICACIONES <br />
              <span className="text-brand-teal italic">CIENTÍFICAS</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl font-sans leading-relaxed">
              Nuestro repositorio de conocimiento revisado por pares, contribuyendo al 
              avance de la ingeniería química global.
            </p>
          </motion.div>
          
          <div className="hidden lg:block text-right">
            <span className="block text-[150px] font-display font-black text-slate-100 leading-none -mb-10 select-none">Q1</span>
            <span className="text-brand-navy font-display font-black text-2xl uppercase tracking-widest relative z-10">INDEXED JOURNALS</span>
          </div>
        </div>

        {/* Papers List */}
        <div className="space-y-12">
          {papers.length > 0 ? papers.map((paper, idx) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative bg-white p-12 lg:p-16 border-l-8 border-brand-gray hover:border-brand-teal transition-all duration-500 overflow-hidden shadow-soft hover:shadow-premium"
            >
              <div className="absolute top-0 right-0 p-12 text-slate-100 group-hover:text-brand-teal/20 group-hover:scale-150 transition-all duration-700">
                <Quote size={80} />
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-start">
                <div className="lg:w-1/4">
                  <div className="text-brand-teal font-display font-black text-5xl italic mb-4">{paper.anio}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-navy mb-8">
                    {paper.revista}
                  </div>
                  {paper.pdf_url && (
                    <a 
                      href={paper.pdf_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 text-[11px] font-black tracking-widest uppercase text-brand-navy hover:text-brand-teal transition-colors border-b-2 border-brand-teal pb-2"
                    >
                      <Download size={14} /> DOWNLOAD PDF
                    </a>
                  )}
                </div>

                <div className="lg:w-3/4">
                  <h2 className="text-2xl md:text-4xl font-display font-black text-brand-navy mb-8 uppercase leading-tight tracking-tight">
                    {paper.titulo}
                  </h2>
                  <p className="text-gray-600 font-sans leading-relaxed mb-10 text-lg italic">
                    "{paper.resumen}"
                  </p>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-3 text-brand-navy">
                      <BookOpen size={18} className="text-brand-teal" />
                      <span className="text-xs font-bold uppercase tracking-widest">{paper.autores}</span>
                    </div>
                    {paper.doi && (
                      <>
                        <div className="w-1.5 h-1.5 bg-brand-teal rounded-full hidden sm:block" />
                        <a 
                          href={`https://doi.org/${paper.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-brand-navy hover:text-brand-teal transition-colors"
                        >
                          <ExternalLink size={18} />
                          <span className="text-xs font-bold uppercase tracking-widest underline decoration-brand-teal/30 underline-offset-4">DOI: {paper.doi}</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-20 bg-brand-gray border-2 border-dashed border-brand-border">
              <p className="text-brand-muted uppercase font-black tracking-widest">No hay publicaciones disponibles en este momento.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

