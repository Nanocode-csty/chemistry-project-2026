'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/api';
import { FormInput, Button } from '@/components/intranet/Forms';
import { Save, Loader2, ArrowLeft, Compass, Zap, Target } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CMSCirculoDorado() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    id: null,
    proposito_titulo: '',
    proposito_descripcion: '',
    proceso_titulo: '',
    proceso_descripcion: '',
    resultados_titulo: '',
    resultados_descripcion: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: result, error } = await dbOperations.getCirculoDorado();
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
      const { error } = await dbOperations.actualizarCirculoDorado(data);
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
          CÍRCULO DORADO
        </h1>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} 
        className="bg-white p-10 shadow-premium rounded-sm border border-brand-border"
      >
        <div className="space-y-12">
          {/* Propósito */}
          <div>
            <h3 className="flex items-center gap-3 text-lg font-display font-black text-brand-navy uppercase mb-6">
              <Target className="text-brand-teal" size={24} /> NUESTRO PROPÓSITO (¿POR QUÉ?)
            </h3>
            <div className="grid gap-6">
              <FormInput
                label="TÍTULO"
                name="proposito_titulo"
                value={data.proposito_titulo}
                onChange={(e) => setData({...data, proposito_titulo: e.target.value})}
                placeholder="Ej: ¿Por qué lo hacemos?"
                required
              />
              <FormInput
                label="DESCRIPCIÓN"
                name="proposito_descripcion"
                value={data.proposito_descripcion}
                onChange={(e) => setData({...data, proposito_descripcion: e.target.value})}
                placeholder="Explica el propósito fundamental..."
                textarea
                required
              />
            </div>
          </div>

          {/* Proceso */}
          <div className="border-t border-brand-border pt-10">
            <h3 className="flex items-center gap-3 text-lg font-display font-black text-brand-navy uppercase mb-6">
              <Compass className="text-brand-teal" size={24} /> NUESTRO PROCESO (¿CÓMO?)
            </h3>
            <div className="grid gap-6">
              <FormInput
                label="TÍTULO"
                name="proceso_titulo"
                value={data.proceso_titulo}
                onChange={(e) => setData({...data, proceso_titulo: e.target.value})}
                placeholder="Ej: ¿Cómo lo hacemos?"
                required
              />
              <FormInput
                label="DESCRIPCIÓN"
                name="proceso_descripcion"
                value={data.proceso_descripcion}
                onChange={(e) => setData({...data, proceso_descripcion: e.target.value})}
                placeholder="Explica la metodología y procesos..."
                textarea
                required
              />
            </div>
          </div>

          {/* Resultados */}
          <div className="border-t border-brand-border pt-10">
            <h3 className="flex items-center gap-3 text-lg font-display font-black text-brand-navy uppercase mb-6">
              <Zap className="text-brand-teal" size={24} /> NUESTROS RESULTADOS (¿QUÉ?)
            </h3>
            <div className="grid gap-6">
              <FormInput
                label="TÍTULO"
                name="resultados_titulo"
                value={data.resultados_titulo}
                onChange={(e) => setData({...data, resultados_titulo: e.target.value})}
                placeholder="Ej: ¿Qué hacemos?"
                required
              />
              <FormInput
                label="DESCRIPCIÓN"
                name="resultados_descripcion"
                value={data.resultados_descripcion}
                onChange={(e) => setData({...data, resultados_descripcion: e.target.value})}
                placeholder="Explica los resultados y productos..."
                textarea
                required
              />
            </div>
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
