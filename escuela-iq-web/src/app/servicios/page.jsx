'use client';
import { motion } from 'framer-motion';
import { mockServicios } from '@/data/mockData';
import { Settings, FlaskConical, Users, Rocket, CheckCircle2, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function ServiciosPage() {
  return (
    <main className="min-h-screen bg-brand-navy pt-32 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-20 h-2 bg-brand-teal mb-8" />
            <h1 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-[0.9] mb-10">
              SERVICIOS <br />
              <span className="text-brand-teal italic">TÉCNICOS</span>
            </h1>
            <p className="text-xl text-slate-300 font-sans leading-relaxed border-l-4 border-brand-teal pl-8 mb-12">
              Brindamos soporte especializado de alto nivel para la industria química, 
              garantizando resultados bajo estándares internacionales de calidad.
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="bg-white/5 px-6 py-4 border border-white/10 flex items-center gap-3">
                <CheckCircle2 className="text-brand-teal" size={20} />
                <span className="text-[10px] font-bold uppercase tracking-widest">ISO 9001:2015</span>
              </div>
              <div className="bg-white/5 px-6 py-4 border border-white/10 flex items-center gap-3">
                <CheckCircle2 className="text-brand-teal" size={20} />
                <span className="text-[10px] font-bold uppercase tracking-widest">ACREDITACIÓN INACAL</span>
              </div>
            </div>
          </motion.div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-brand-teal/20 blur-[120px] rounded-full" />
            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-64 bg-slate-800 rounded-sm overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800" alt="Service 1" className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" />
                </div>
                <div className="h-40 bg-brand-teal rounded-sm flex items-center justify-center p-8">
                  <Rocket size={48} className="text-brand-navy" />
                </div>
              </div>
              <div className="space-y-4 pt-12">
                <div className="h-40 bg-white rounded-sm flex items-center justify-center p-8">
                  <FlaskConical size={48} className="text-brand-navy" />
                </div>
                <div className="h-64 bg-slate-800 rounded-sm overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800" alt="Service 2" className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="grid md:grid-cols-2 gap-8">
          {mockServicios.map((servicio, idx) => (
            <motion.div
              key={servicio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 p-12 lg:p-16 border border-white/10 hover:border-brand-teal transition-all duration-500 group"
            >
              <div className="flex items-start justify-between mb-12">
                <div className="p-5 bg-brand-teal text-brand-navy rotate-3 group-hover:rotate-0 transition-transform">
                  {idx === 0 && <Settings size={32} />}
                  {idx === 1 && <FlaskConical size={32} />}
                  {idx === 2 && <Users size={32} />}
                  {idx === 3 && <Rocket size={32} />}
                </div>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">SERVICE 0{servicio.id}</span>
              </div>
              
              <h2 className="text-3xl font-display font-black uppercase mb-6 tracking-tight group-hover:text-brand-teal transition-colors">
                {servicio.titulo}
              </h2>
              <p className="text-slate-400 font-sans leading-relaxed mb-10 text-lg">
                {servicio.descripcion}
              </p>
              
              <Link 
                href="/#contacto"
                className="inline-flex items-center gap-4 text-[11px] font-black tracking-widest uppercase text-brand-teal hover:text-white transition-colors"
              >
                SOLICITAR COTIZACIÓN <MessageSquare size={16} />
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </main>
  );
}
