'use client';
import { motion } from 'framer-motion';
import { Rocket, Globe, Users, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TransferenciaPage() {
  return (
    <main className="min-h-screen bg-brand-gray pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="relative mb-24 overflow-hidden bg-brand-navy p-12 lg:p-24 text-white shadow-premium">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-teal/5 -skew-x-12 translate-x-1/4" />
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative z-10"
          >
            <div className="w-20 h-2 bg-brand-teal mb-8" />
            <h1 className="text-5xl md:text-8xl font-display font-black uppercase tracking-tighter leading-none mb-10">
              TRANSFERENCIA <br />
              <span className="text-brand-teal italic">TECNOLÓGICA</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl font-sans leading-relaxed border-l-4 border-brand-accent pl-8">
              Conectamos el conocimiento académico con el sector productivo para 
              generar valor económico y social a través de la innovación.
            </p>
          </motion.div>
        </div>

        {/* Core Pillars */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {[
            { 
              title: 'Licenciamiento', 
              desc: 'Transferimos derechos de explotación de nuestras patentes a empresas líderes.', 
              icon: Users 
            },
            { 
              title: 'Spin-offs', 
              desc: 'Apoyamos la creación de empresas de base tecnológica nacidas en la facultad.', 
              icon: Rocket 
            },
            { 
              title: 'Alianzas I+D', 
              desc: 'Desarrollamos investigación conjunta para resolver problemas específicos.', 
              icon: Globe 
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-12 shadow-soft hover:shadow-premium transition-all duration-500 border-t-4 border-brand-teal"
            >
              <item.icon className="text-brand-navy mb-8" size={40} />
              <h2 className="text-2xl font-display font-black text-brand-navy uppercase mb-6">{item.title}</h2>
              <p className="text-gray-600 mb-8">{item.desc}</p>
              <Link href="/#contacto" className="inline-flex items-center gap-2 text-[11px] font-black tracking-widest text-brand-teal uppercase hover:text-brand-navy transition-colors">
                MÁS INFORMACIÓN <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Impact Section */}
        <div className="bg-brand-teal p-12 lg:p-24 text-brand-navy flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter leading-tight mb-8">
              IMPULSANDO EL <br />ECOSISTEMA
            </h2>
            <p className="text-lg font-bold opacity-80 uppercase tracking-widest mb-10">
              Nuestra meta es convertirnos en el principal hub de innovación química de la región.
            </p>
            <div className="flex items-center gap-8">
              <div>
                <div className="text-5xl font-display font-black italic">12</div>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Empresas Aliadas</div>
              </div>
              <div className="w-[1px] h-12 bg-brand-navy/20" />
              <div>
                <div className="text-5xl font-display font-black italic">05</div>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Spin-offs 2026</div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 bg-brand-navy p-12 text-white">
            <TrendingUp size={48} className="text-brand-accent mb-8" />
            <h3 className="text-2xl font-display font-black uppercase mb-6 italic">Crecimiento Sostenido</h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Hemos incrementado un 40% la inversión privada en proyectos de investigación 
              aplicada durante el último bienio.
            </p>
            <button className="w-full py-4 border border-brand-accent text-brand-accent font-display font-black text-[11px] tracking-widest uppercase hover:bg-brand-accent hover:text-brand-navy transition-all">
              VER REPORTE DE IMPACTO
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
