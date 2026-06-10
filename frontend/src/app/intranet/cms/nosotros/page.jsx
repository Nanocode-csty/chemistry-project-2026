'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/api';
import { FormInput, Button } from '@/components/intranet/Forms';
import { Save, Loader2, ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CMSNosotros() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nosotros, setNosotros] = useState({
    id: null,
    titulo: '',
    subtitulo: '',
    descripcion: '',
    miembros_conteo: '',
    miembros_descripcion: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data, error } = await dbOperations.getNosotros();
      if (data) setNosotros(data);
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
      const { error } = await dbOperations.actualizarNosotros(nosotros);
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
          EDITAR NOSOTROS
        </h1>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} 
        className="bg-white p-10 shadow-premium rounded-sm border border-brand-border"
      >
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <FormInput
            label="TÍTULO PRINCIPAL"
            name="titulo"
            value={nosotros.titulo}
            onChange={(e) => setNosotros({...nosotros, titulo: e.target.value})}
            placeholder="Ej: Acerca de Nosotros"
            required
          />
          <FormInput
            label="SUBTÍTULO"
            name="subtitulo"
            value={nosotros.subtitulo}
            onChange={(e) => setNosotros({...nosotros, subtitulo: e.target.value})}
            placeholder="Frase de impacto inicial"
            required
          />
        </div>

        <FormInput
          label="DESCRIPCIÓN GENERAL"
          name="descripcion"
          value={nosotros.descripcion}
          onChange={(e) => setNosotros({...nosotros, descripcion: e.target.value})}
          placeholder="Escribe aquí la historia y propósito del laboratorio..."
          textarea
          required
        />

        <div className="border-t border-brand-border pt-10 mt-10">
          <h3 className="flex items-center gap-3 text-lg font-display font-black text-brand-navy uppercase mb-8">
            <Users className="text-brand-teal" size={24} /> SECCIÓN DE MIEMBROS
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <FormInput
              label="CONTEO DE MIEMBROS"
              name="miembros_conteo"
              value={nosotros.miembros_conteo}
              onChange={(e) => setNosotros({...nosotros, miembros_conteo: e.target.value})}
              placeholder="Ej: +45 Miembros"
              required
            />
            <FormInput
              label="DESCRIPCIÓN DE MIEMBROS"
              name="miembros_descripcion"
              value={nosotros.miembros_descripcion}
              onChange={(e) => setNosotros({...nosotros, miembros_descripcion: e.target.value})}
              placeholder="Ej: Investigadores, Tesistas, Pasantes..."
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
