'use client';
import { motion } from 'framer-motion';
import { mockProyectosIndustriales } from '@/data/mockData';
import { ArrowLeft, Play, Factory, ShieldCheck, Zap, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ProyectoDetailPage() {
  const { id } = useParams();
  const proyecto = mockProyectosIndustriales.find(p => p.id === parseInt(id));

  if (!proyecto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-navy text-white">
        <div className="text-center">
          <h1 className="text-4xl font-display font-black mb-4 uppercase">PROYECTO NO ENCONTRADO</h1>
          <Link href="/proyectos" className="text-brand-teal font-bold uppercase tracking-widest border-b-2 border-brand-teal pb-1">Volver al catálogo</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-brand-navy text-white pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <Link 
          href="/proyectos" 
          className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-slate-400 hover:text-brand-teal transition-colors mb-12 uppercase"
        >
          <ArrowLeft size={14} /> VOLVER AL CATÁLOGO INDUSTRIAL
        </Link>

        <div className="grid lg:grid-cols-12 gap-16">
          
          {/* Main Content */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-20 h-2 bg-brand-teal mb-8" />
              <div className="flex items-center gap-4 mb-6">
                <span className="bg-brand-teal text-brand-navy px-4 py-1 text-[10px] font-black uppercase tracking-widest">CASO DE ÉXITO 0{proyecto.id}</span>
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Partner: {proyecto.cliente}</span>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black uppercase leading-[0.9] tracking-tighter mb-10">
                {proyecto.titulo}
              </h1>
              
              {/* Video Section */}
              <div className="relative aspect-video bg-black/40 mb-16 shadow-premium overflow-hidden border border-white/10 group">
                <iframe 
                  className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
                  src={proyecto.videoUrl}
                  title={proyecto.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="space-y-12">
                <div className="border-l-4 border-brand-teal pl-8">
                  <h3 className="text-brand-teal font-display font-black text-sm tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
                    <Factory size={20} /> Alcance del Proyecto
                  </h3>
                  <p className="text-xl text-slate-300 font-sans leading-relaxed italic">
                    "{proyecto.contenidoDetallado}"
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 pt-8">
                  <div className="bg-white/5 p-10 border border-white/10">
                    <h3 className="text-brand-teal font-display font-black text-sm tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
                      <TrendingUp size={20} /> Resultados Obtenidos
                    </h3>
                    <p className="text-slate-300 leading-relaxed">{proyecto.resultados}</p>
                  </div>
                  <div className="bg-white/5 p-10 border border-white/10">
                    <h3 className="text-brand-teal font-display font-black text-sm tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
                      <ShieldCheck size={20} /> Certificaciones
                    </h3>
                    <ul className="text-slate-300 space-y-3">
                      <li className="flex items-center gap-2">• Norma ISO 14001:2015</li>
                      <li className="flex items-center gap-2">• Estándares de Seguridad Industrial</li>
                      <li className="flex items-center gap-2">• Auditoría de Eficiencia Energética</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-12 text-brand-navy shadow-premium">
              <h3 className="text-brand-navy font-display font-black text-[11px] tracking-[0.3em] uppercase mb-8 border-b border-slate-100 pb-4">FICHA TÉCNICA</h3>
              <div className="space-y-8">
                <SidebarItem label="CLIENTE" value={proyecto.cliente} />
                <SidebarItem label="SECTOR" value="Minería / Energía" />
                <SidebarItem label="DURACIÓN" value="18 Meses" />
                <SidebarItem label="UBICACIÓN" value="Planta Central, Lima" />
              </div>
              <button className="w-full mt-12 py-5 bg-brand-navy text-white font-display font-black text-[11px] tracking-[0.4em] uppercase hover:bg-brand-teal hover:text-brand-navy transition-all shadow-xl">
                SOLICITAR CASO PDF
              </button>
            </div>
            
            <div className="p-10 border border-white/10 bg-white/5 text-center">
              <Zap className="text-brand-teal mx-auto mb-6" size={40} />
              <h3 className="text-white font-display font-black text-lg uppercase mb-4 tracking-tight italic">Optimización Activa</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">Este proyecto se encuentra bajo monitoreo de eficiencia para el periodo 2026.</p>
              <Link href="/servicios" className="text-brand-teal font-black text-[10px] tracking-widest uppercase hover:text-white transition-colors">Ver servicios relacionados</Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

const SidebarItem = ({ label, value }) => (
  <div className="group cursor-default">
    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 group-hover:text-brand-teal transition-colors">{label}</div>
    <div className="text-lg font-display font-black uppercase tracking-tight leading-none">{value}</div>
  </div>
);
