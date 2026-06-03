'use client';
import { motion } from 'framer-motion';
import { mockInvestigaciones } from '@/data/mockData';
import { ArrowLeft, Play, Beaker, Target, Award, Info } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function InvestigacionDetailPage() {
  const { id } = useParams();
  const investigacion = mockInvestigaciones.find(inv => inv.id === parseInt(id));

  if (!investigacion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray">
        <div className="text-center">
          <h1 className="text-4xl font-display font-black text-brand-navy mb-4">NOT FOUND</h1>
          <Link href="/investigaciones" className="text-brand-teal font-bold uppercase tracking-widest border-b-2 border-brand-teal pb-1">Volver al listado</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <Link 
          href="/investigaciones" 
          className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-slate-400 hover:text-brand-navy transition-colors mb-12 uppercase"
        >
          <ArrowLeft size={14} /> VOLVER A INVESTIGACIONES
        </Link>

        <div className="grid lg:grid-cols-12 gap-16">
          
          {/* Main Content */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-2 bg-brand-teal mb-8" />
              <h1 className="text-4xl md:text-6xl font-display font-black text-brand-navy uppercase leading-tight tracking-tighter mb-10">
                {investigacion.titulo}
              </h1>
              
              {/* Video Section */}
              <div className="relative aspect-video bg-brand-navy mb-16 shadow-premium group overflow-hidden border-b-8 border-brand-teal">
                <iframe 
                  className="w-full h-full"
                  src={investigacion.videoUrl}
                  title={investigacion.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="prose prose-lg max-w-none text-gray-600 font-sans leading-relaxed space-y-8">
                <div className="bg-brand-gray p-10 border-l-8 border-brand-navy">
                  <h3 className="text-brand-navy font-display font-black text-sm tracking-[0.2em] uppercase mb-4 flex items-center gap-3">
                    <Info size={18} className="text-brand-teal" /> Resumen Ejecutivo
                  </h3>
                  <p className="text-xl italic font-medium">{investigacion.contenidoDetallado}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 mt-16">
                  <div>
                    <h3 className="text-brand-navy font-display font-black text-sm tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
                      <Target size={18} className="text-brand-teal" /> Metodología Aplicada
                    </h3>
                    <p>{investigacion.metodologia}</p>
                  </div>
                  <div>
                    <h3 className="text-brand-navy font-display font-black text-sm tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
                      <Award size={18} className="text-brand-teal" /> Impacto Proyectado
                    </h3>
                    <p>{investigacion.impacto}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-brand-navy p-10 text-white shadow-premium">
              <h3 className="text-brand-teal font-display font-black text-[11px] tracking-[0.3em] uppercase mb-8">DATOS DEL EXPEDIENTE</h3>
              <div className="space-y-6">
                <SidebarItem label="ESTADO" value="En Proceso de Patente" />
                <SidebarItem label="LABORATORIO" value="Nanotecnología & Procesos" />
                <SidebarItem label="FACULTAD" value="Ingeniería Química" />
                <SidebarItem label="AÑO INICIO" value="2024" />
              </div>
              <button className="w-full mt-10 py-4 bg-brand-teal text-brand-navy font-display font-black text-[11px] tracking-widest uppercase hover:bg-white transition-all">
                DESCARGAR REPORTE PDF
              </button>
            </div>
            
            <div className="p-10 border border-slate-100 bg-brand-gray">
              <h3 className="text-brand-navy font-display font-black text-[11px] tracking-[0.3em] uppercase mb-6">INVESTIGADORES</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-300 rounded-full" />
                <div>
                  <div className="text-sm font-black text-brand-navy uppercase">Dr. Ricardo Palma</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Líder de Proyecto</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

const SidebarItem = ({ label, value }) => (
  <div>
    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</div>
    <div className="text-sm font-display font-black uppercase tracking-tight">{value}</div>
  </div>
);
