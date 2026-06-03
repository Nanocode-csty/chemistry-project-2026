'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dbOperations } from '@/lib/supabase';
import { Lightbulb, ShieldCheck, Award, FileCheck, Search, Loader2 } from 'lucide-react';

export default function PatentesPage() {
  const [patentes, setPatentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatentes = async () => {
      try {
        const { data, error } = await dbOperations.getPatentes();
        if (data) setPatentes(data);
      } catch (err) {
        console.error('Error fetching patentes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatentes();
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="relative mb-24 overflow-hidden bg-white p-12 lg:p-24 shadow-premium border-t-8 border-brand-teal">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-teal/5 rounded-full -mr-32 -mt-32" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
          >
            <div className="flex items-center gap-4 mb-8">
              <Lightbulb className="text-brand-teal" size={40} strokeWidth={2.5} />
              <span className="text-brand-navy font-display font-black text-[12px] tracking-[0.4em] uppercase">
                Propiedad Intelectual & Activos Tecnológicos
              </span>
            </div>
            <h1 className="text-5xl md:text-8xl font-display font-black text-brand-navy uppercase tracking-tighter leading-none mb-10">
              PATENTES <br />
              <span className="text-brand-teal">REGISTRADAS</span>
            </h1>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <p className="text-xl text-gray-600 font-sans leading-relaxed">
                Protegemos la innovación generada en nuestros laboratorios para asegurar 
                una transferencia tecnológica efectiva y segura a la industria.
              </p>
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-5xl font-display font-black text-brand-navy italic">{patentes.length}+</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Registros Totales</div>
                </div>
                <div className="w-[1px] h-16 bg-slate-100" />
                <div className="text-center">
                  <div className="text-5xl font-display font-black text-brand-teal italic">12</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">En Proceso</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Patentes Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {patentes.length > 0 ? patentes.map((patente, idx) => (
            <motion.div
              key={patente.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-10 lg:p-14 border border-slate-100 hover:border-brand-teal transition-all duration-500 shadow-soft group"
            >
              <div className="flex justify-between items-start mb-10">
                <div className="bg-brand-gray p-4 group-hover:bg-brand-navy group-hover:text-white transition-colors">
                  <FileCheck size={32} />
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">CÓDIGO REGISTRO</div>
                  <div className="text-brand-navy font-display font-black italic tracking-tight">PE-2026-00{patente.id}</div>
                </div>
              </div>
              
              <h2 className="text-2xl font-display font-black text-brand-navy uppercase leading-tight mb-8 group-hover:text-brand-teal transition-colors">
                {patente.titulo}
              </h2>

              <div className="space-y-6">
                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <ShieldCheck className="text-brand-teal" size={18} />
                  PROTECCIÓN INTERNACIONAL ACTIVA
                </div>
                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <Award className="text-brand-teal" size={18} />
                  TITULARIDAD: UNIVERSIDAD EIQ
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-50">
                <button className="w-full py-4 border-2 border-brand-navy text-brand-navy font-display font-black text-[11px] tracking-widest uppercase hover:bg-brand-navy hover:text-white transition-all flex items-center justify-center gap-3">
                  <Search size={14} /> CONSULTAR DETALLES TÉCNICOS
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="md:col-span-2 text-center py-20 bg-white border-2 border-dashed border-brand-border">
              <p className="text-brand-muted uppercase font-black tracking-widest">No hay patentes registradas en este momento.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

