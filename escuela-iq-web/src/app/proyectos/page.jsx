'use client';
import { motion } from 'framer-motion';
import { mockProyectosIndustriales } from '@/data/mockData';
import { Zap, ArrowUpRight, ShieldCheck, Factory, Globe } from 'lucide-react';
import Link from 'next/link';

export default function ProyectosPage() {
  return (
    <main className="min-h-screen bg-brand-navy pt-32 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="relative mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-1 bg-brand-teal" />
              <span className="text-brand-accent font-display font-black text-[11px] tracking-[0.4em] uppercase">
                Sector Industrial & Tecnológico
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-[0.9] mb-10">
              SOLUCIONES <br />
              <span className="text-brand-teal italic">DE ALTO IMPACTO</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl font-sans leading-relaxed border-l-4 border-brand-teal pl-8">
              Desarrollamos ingeniería de precisión para los procesos más exigentes del mercado, 
              optimizando recursos y maximizando la eficiencia operativa.
            </p>
          </motion.div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 border border-white/10">
          {mockProyectosIndustriales.map((proy, idx) => (
            <motion.div
              key={proy.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white text-brand-navy p-12 border-r border-b border-slate-100 last:border-r-0 hover:bg-brand-teal transition-all duration-500 group flex flex-col"
            >
              <div className="flex justify-between items-start mb-12">
                <div className="w-12 h-12 bg-brand-navy flex items-center justify-center text-white group-hover:bg-white group-hover:text-brand-navy transition-colors">
                  <Factory size={24} />
                </div>
                <ArrowUpRight className="text-brand-teal group-hover:text-brand-navy transition-colors" size={28} />
              </div>
              
              <div className="flex-grow">
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400 group-hover:text-brand-navy block mb-4">
                  CASO INDUSTRIAL 0{proy.id}
                </span>
                <h2 className="text-3xl font-display font-black uppercase leading-tight mb-6 group-hover:text-white transition-colors">
                  {proy.titulo}
                </h2>
                <p className="text-slate-600 group-hover:text-brand-navy text-sm leading-relaxed mb-8">
                  {proy.descripcion}
                </p>
              </div>

              <div className="pt-8 border-t border-slate-100 group-hover:border-brand-navy/20">
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-navy mb-1">
                  Cliente Partner
                </div>
                <div className="text-brand-navy font-display font-black text-lg uppercase">
                  {proy.cliente}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-32 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Proyectos Activos', value: '24', icon: Zap },
            { label: 'Países Operando', value: '08', icon: Globe },
            { label: 'Eficiencia Media', value: '+15%', icon: ShieldCheck },
            { label: 'Años de Experiencia', value: '15', icon: Factory },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center p-10 bg-white/5 border border-white/10 hover:border-brand-teal transition-colors"
            >
              <stat.icon className="mx-auto mb-6 text-brand-teal" size={32} />
              <div className="text-5xl font-display font-black text-white italic mb-2">{stat.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

      </div>
    </main>
  );
}
