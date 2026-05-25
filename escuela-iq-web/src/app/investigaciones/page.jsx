'use client';
import { motion } from 'framer-motion';
import { mockInvestigaciones } from '@/data/mockData';
import { Microscope, ArrowRight, Beaker, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function InvestigacionesPage() {
  return (
    <main className="min-h-screen bg-brand-gray pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="relative mb-20 overflow-hidden bg-brand-navy p-12 lg:p-20 text-white shadow-premium">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-teal/10 -skew-x-12 translate-x-1/2" />
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <div className="w-20 h-2 bg-brand-teal mb-8" />
            <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter leading-none mb-6">
              PROGRAMA DE <br />
              <span className="text-brand-teal">INVESTIGACIÓN</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl font-sans leading-relaxed italic border-l-4 border-brand-accent pl-8">
              Lideramos la frontera del conocimiento químico para resolver los desafíos 
              más críticos de la industria y el medio ambiente.
            </p>
          </motion.div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {mockInvestigaciones.map((inv, idx) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white border-b-8 border-brand-teal shadow-soft hover:shadow-premium transition-all duration-500 flex flex-col h-full"
            >
              <div className="p-10 flex-grow">
                <div className="w-16 h-16 bg-brand-navy flex items-center justify-center text-white mb-8 group-hover:bg-brand-teal group-hover:text-brand-navy transition-all duration-500 rotate-3 group-hover:rotate-0">
                  <Microscope size={32} />
                </div>
                <h2 className="text-2xl font-display font-black text-brand-navy mb-6 uppercase tracking-tight leading-tight group-hover:text-brand-teal transition-colors">
                  {inv.titulo}
                </h2>
                <p className="text-gray-600 font-sans leading-relaxed mb-8">
                  {inv.descripcion}
                </p>
              </div>
              
              <div className="p-10 pt-0">
                <Link 
                  href={`/investigaciones/${inv.id}`}
                  className="inline-flex items-center gap-3 text-[12px] font-display font-black tracking-[0.2em] text-brand-navy uppercase group-hover:gap-5 transition-all"
                >
                  EXPEDIENTE COMPLETO <ArrowRight size={16} className="text-brand-teal" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-24 bg-brand-teal p-12 lg:p-20 text-brand-navy shadow-2xl relative overflow-hidden"
        >
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full -mb-32 -mr-32 blur-3xl" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-2/3">
              <h3 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter leading-none mb-6">
                ¿TIENES UN PROYECTO <br />DE INVESTIGACIÓN?
              </h3>
              <p className="text-lg font-bold opacity-80 uppercase tracking-widest">
                Buscamos talentos y alianzas estratégicas para el 2026.
              </p>
            </div>
            <Link 
              href="/#contacto"
              className="bg-brand-navy text-white px-12 py-6 font-display font-black text-[12px] tracking-[0.3em] hover:bg-white hover:text-brand-navy transition-all shadow-2xl uppercase"
            >
              POSTULAR PROYECTO
            </Link>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
