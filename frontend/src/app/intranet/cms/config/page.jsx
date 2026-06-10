'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/api';
import { FormInput, Button } from '@/components/intranet/Forms';
import { Save, Loader2, ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CMSConfig() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    noticias_limite: 3,
    investigaciones_limite: 4,
    servicios_limite: 4
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await dbOperations.getConfig();
      if (data) {
        setFormData({
          id: data.id,
          noticias_limite: data.noticias_limite,
          investigaciones_limite: data.investigaciones_limite,
          servicios_limite: data.servicios_limite
        });
      }
      if (error) console.error(error);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await dbOperations.actualizarConfig(formData);
      alert('Configuración actualizada correctamente');
    } catch (err) {
      console.error(err);
      alert('Error al actualizar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-brand-navy animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link 
        href="/intranet/cms" 
        className="flex items-center gap-2 text-brand-muted hover:text-brand-navy mb-8 transition-colors group text-sm font-bold uppercase tracking-widest"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver al CMS
      </Link>

      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-display font-black text-brand-navy uppercase tracking-tighter flex items-center gap-4">
            <Settings size={36} className="text-brand-accent" />
            AJUSTES DE PANTALLA
          </h1>
          <p className="text-brand-muted mt-2 uppercase text-xs font-bold tracking-widest">Configura cuántos elementos mostrar en la página de inicio</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-sm shadow-premium border border-slate-100"
      >
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid md:grid-cols-1 gap-10">
            <div className="space-y-8">
              <div className="p-6 bg-slate-50 border-l-4 border-brand-accent">
                <h3 className="text-brand-navy font-display font-black text-sm uppercase tracking-widest mb-2">Límites de Visualización</h3>
                <p className="text-brand-muted text-[10px] uppercase font-bold">Define el número máximo de elementos que se verán en cada sección del Home.</p>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                <FormInput
                  label="NOTICIAS (HOME)"
                  name="noticias_limite"
                  type="number"
                  value={formData.noticias_limite}
                  onChange={(e) => setFormData({ ...formData, noticias_limite: parseInt(e.target.value) })}
                  placeholder="Ej: 3"
                  required
                />
                <FormInput
                  label="INVESTIGACIONES"
                  name="investigaciones_limite"
                  type="number"
                  value={formData.investigaciones_limite}
                  onChange={(e) => setFormData({ ...formData, investigaciones_limite: parseInt(e.target.value) })}
                  placeholder="Ej: 4"
                  required
                />
                <FormInput
                  label="SERVICIOS"
                  name="servicios_limite"
                  type="number"
                  value={formData.servicios_limite}
                  onChange={(e) => setFormData({ ...formData, servicios_limite: parseInt(e.target.value) })}
                  placeholder="Ej: 4"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
            <Link href="/intranet/cms">
              <Button type="button" variant="secondary">
                CANCELAR
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center gap-3 px-12"
            >
              {isSaving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  GUARDANDO...
                </>
              ) : (
                <>
                  <Save size={20} />
                  GUARDAR CONFIGURACIÓN
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>

      <div className="mt-12 p-6 bg-brand-navy text-white rounded-sm shadow-xl">
        <h4 className="font-display font-black text-xs uppercase tracking-[0.2em] mb-4 text-brand-accent italic">Nota Informativa</h4>
        <p className="text-[11px] leading-relaxed text-white  font-medium opacity-100 uppercase tracking-wider">
          Estos límites solo afectan a la página de inicio (Home). Las páginas dedicadas (como /noticias o /investigaciones) seguirán mostrando el contenido completo con sus respectivos sistemas de paginación.
        </p>
      </div>
    </div>
  );
}
