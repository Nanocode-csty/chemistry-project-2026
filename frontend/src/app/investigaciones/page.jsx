'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dbOperations } from '@/lib/api';
import { Microscope, ArrowRight, Beaker, FileText, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function InvestigacionesPage() {
  const [investigaciones, setInvestigaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestigaciones = async () => {
      try {
        const { data, error } = await dbOperations.getInvestigaciones();
        if (data) setInvestigaciones(data);
      } catch (err) {
        console.error('Error fetching investigaciones:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvestigaciones();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray">
        <Loader2 className="animate-spin text-brand-navy" size={48} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-brand-gray pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4  py-12 sm:px-6 lg:px-8">

        {/* Header Section - Rediseñado sin la figura lateral */}
        <div className="relative mb-24">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-1 bg-[#9ABE00]" />
              <span className="text-[#002b45] font-display font-black text-[11px] tracking-[0.4em] uppercase">
                Excelencia Científica
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl text-[#002b45] font-display font-black uppercase tracking-tighter leading-none mb-8">
              CENTRO DE <br />
              <span className="text-[#9ABE00] italic">INVESTIGACIONES</span>
            </h1>

            {/* Línea sutil con iconos relacionados */}
            <div className="flex items-center gap-6 mb-8 text-brand-muted">
              <div className="h-[1px] flex-grow bg-brand-border" />
              <Microscope size={20} className="opacity-40" />
              <Beaker size={20} className="opacity-40" />
              <FileText size={20} className="opacity-40" />
              <div className="h-[1px] flex-grow bg-brand-border" />
            </div>

          </motion.div>
        </div>

        {/* Content Grid - Hover corregido */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {investigaciones.length > 0 ? investigaciones.map((inv, idx) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white border border-brand-border hover:border-brand-navy/20 shadow-soft hover:shadow-premium transition-all duration-500 flex flex-col h-full relative overflow-hidden"
            >
              {/* Decorative background element on hover - Sutil */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light -mr-16 -mt-16 rounded-full group-hover:bg-brand-accent/5 group-hover:scale-150 transition-all duration-700" />

              <div className="p-10 flex-grow relative z-10">
                <div className="w-16 h-16 bg-white border-2 border-brand-navy flex items-center justify-center text-brand-navy mb-8 group-hover:bg-brand-navy group-hover:text-white transition-all duration-500 shadow-sm group-hover:-translate-y-2">
                  <Microscope size={32} />
                </div>
                <h2 className="text-2xl font-display font-black text-brand-navy mb-6 uppercase tracking-tight leading-tight group-hover:text-brand-navy transition-colors">
                  {inv.titulo}
                </h2>
                <p className="text-gray-600 font-sans leading-relaxed mb-8">
                  {inv.descripcion}
                </p>
              </div>

              <div className="p-10 pt-0 relative z-10">
                <Link
                  href={inv.link || `/investigaciones/${inv.id}`}
                  className="inline-flex items-center gap-3 text-[11px] font-display font-black tracking-[0.2em] text-brand-navy uppercase group-hover:gap-5 transition-all border-b-2 border-transparent hover:border-brand-accent pb-1"
                >
                  EXPEDIENTE COMPLETO <ArrowRight size={16} className="text-brand-accent" />
                </Link>
              </div>
            </motion.div>
          )) : (
            <div className="lg:col-span-3 text-center py-20 bg-white border-2 border-dashed border-brand-border">
              <p className="text-brand-muted uppercase font-black tracking-widest">No hay investigaciones disponibles en este momento.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

