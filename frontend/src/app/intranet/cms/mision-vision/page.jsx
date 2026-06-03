'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/supabase';
import { FormInput, Button } from '@/components/intranet/Forms';
import { Save, Loader2, ArrowLeft, Target, Eye } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CMSMisionVision() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    id: null,
    mision: '',
    vision: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: result, error } = await dbOperations.getMisionVision();
      if (result) setData(result);
      if (error) console.error(error);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await dbOperations.actualizarMisionVision(data);
      if (error) alert('Error al guardar: ' + error);
      else alert('Contenido actualizado correctamente');
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setSaving(false);
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
        <h1 className="text-4xl font-display font-black text-brand-navy uppercase tracking-tighter">
          MISIÓN Y VISIÓN
        </h1>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} 
        className="bg-white p-10 shadow-premium rounded-sm border border-brand-border"
      >
        <div className="space-y-12">
          <div>
            <h3 className="flex items-center gap-3 text-lg font-display font-black text-brand-navy uppercase mb-6">
              <Target className="text-brand-teal" size={24} /> NUESTRA MISIÓN
            </h3>
            <FormInput
              label="CONTENIDO DE LA MISIÓN"
              name="mision"
              value={data.mision}
              onChange={(e) => setData({...data, mision: e.target.value})}
              placeholder="Describe la misión del laboratorio..."
              textarea
              required
            />
          </div>

          <div className="border-t border-brand-border pt-10">
            <h3 className="flex items-center gap-3 text-lg font-display font-black text-brand-navy uppercase mb-6">
              <Eye className="text-brand-teal" size={24} /> NUESTRA VISIÓN
            </h3>
            <FormInput
              label="CONTENIDO DE LA VISIÓN"
              name="vision"
              value={data.vision}
              onChange={(e) => setData({...data, vision: e.target.value})}
              placeholder="Describe la visión a futuro del laboratorio..."
              textarea
              required
            />
          </div>
        </div>

        <div className="mt-12 flex justify-end">
          <Button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-3"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save size={20} />
            )}
            {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
