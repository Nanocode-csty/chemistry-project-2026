'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/api';
import { FormInput, Button, Modal } from '@/components/intranet/Forms';
import { Save, Loader2, ArrowLeft, Layout, Image as ImageIcon, Check } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CMSHero() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [multimedia, setMultimedia] = useState([]);
  const [hero, setHero] = useState({
    id: null,
    titulo_linea1: '',
    titulo_linea2: '',
    titulo_linea3: '',
    descripcion: '',
    cta_primario_texto: '',
    cta_primario_link: '',
    cta_secundario_texto: '',
    cta_secundario_link: '',
    imagen_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [heroRes, multimediaRes] = await Promise.all([
        dbOperations.getHero(),
        dbOperations.getMultimedia()
      ]);
      if (heroRes.data) setHero(heroRes.data);
      if (multimediaRes.data) setMultimedia(multimediaRes.data);
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
      const { error } = await dbOperations.actualizarHero(hero);
      if (error) alert('Error al guardar: ' + (error.message || error));
      else alert('Hero actualizado correctamente');
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectImage = (url) => {
    setHero({ ...hero, imagen_url: url });
    // NO cerrar automáticamente para que el usuario confirme
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
          EDITAR HERO (BANNER)
        </h1>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} 
        className="bg-white p-10 shadow-premium rounded-sm border border-brand-border"
      >
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <FormInput
            label="TÍTULO LÍNEA 1"
            name="titulo_linea1"
            value={hero.titulo_linea1}
            onChange={(e) => setHero({...hero, titulo_linea1: e.target.value})}
            required
          />
          <FormInput
            label="TÍTULO LÍNEA 2"
            name="titulo_linea2"
            value={hero.titulo_linea2}
            onChange={(e) => setHero({...hero, titulo_linea2: e.target.value})}
            required
          />
          <FormInput
            label="TÍTULO LÍNEA 3"
            name="titulo_linea3"
            value={hero.titulo_linea3}
            onChange={(e) => setHero({...hero, titulo_linea3: e.target.value})}
            required
          />
        </div>

        <FormInput
          label="DESCRIPCIÓN DE BIENVENIDA"
          name="descripcion"
          value={hero.descripcion}
          onChange={(e) => setHero({...hero, descripcion: e.target.value})}
          textarea
          required
        />

        <div className="mb-10">
          <label className="block font-display font-bold text-sm text-brand-navy tracking-widest mb-3 uppercase">IMAGEN DE FONDO</label>
          <div className="flex gap-4">
            <div className="flex-1 border-2 border-brand-border p-3 rounded-sm bg-brand-light text-xs truncate">
              {hero.imagen_url || 'Ninguna imagen seleccionada'}
            </div>
            <Button type="button" variant="secondary" onClick={() => setIsGalleryOpen(true)} className="!py-2">
              <ImageIcon size={18} />
            </Button>
          </div>
          {hero.imagen_url && (
            <div className="mt-4 aspect-video w-full max-w-md overflow-hidden rounded-sm border border-brand-border">
              <img src={hero.imagen_url} alt="Vista previa" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-10 border-t border-brand-border pt-10 mt-10">
          <div>
            <h3 className="text-lg font-display font-black text-brand-navy uppercase mb-6 flex items-center gap-3">
              <Layout className="text-brand-teal" size={20} /> BOTÓN PRIMARIO
            </h3>
            <FormInput
              label="TEXTO"
              name="cta_primario_texto"
              value={hero.cta_primario_texto}
              onChange={(e) => setHero({...hero, cta_primario_texto: e.target.value})}
              required
            />
            <FormInput
              label="LINK"
              name="cta_primario_link"
              value={hero.cta_primario_link}
              onChange={(e) => setHero({...hero, cta_primario_link: e.target.value})}
              required
            />
          </div>
          <div>
            <h3 className="text-lg font-display font-black text-brand-navy uppercase mb-6 flex items-center gap-3">
              <Layout className="text-brand-muted" size={20} /> BOTÓN SECUNDARIO
            </h3>
            <FormInput
              label="TEXTO"
              name="cta_secundario_texto"
              value={hero.cta_secundario_texto}
              onChange={(e) => setHero({...hero, cta_secundario_texto: e.target.value})}
              required
            />
            <FormInput
              label="LINK"
              name="cta_secundario_link"
              value={hero.cta_secundario_link}
              onChange={(e) => setHero({...hero, cta_secundario_link: e.target.value})}
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

      {/* Galería de Selección de Imágenes usando Modal estándar */}
      <Modal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        title="SELECCIONAR IMAGEN DE FONDO"
        maxWidth="max-w-4xl"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto p-2 custom-scrollbar">
          {multimedia.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => handleSelectImage(img.url)}
              className={`group relative aspect-video bg-brand-light overflow-hidden border-4 transition-all rounded-sm ${
                hero.imagen_url === img.url ? 'border-brand-accent' : 'border-transparent hover:border-brand-navy'
              }`}
            >
              <img src={img.url} alt={img.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-brand-navy/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-[10px] font-black uppercase tracking-widest">Click para seleccionar</span>
              </div>
              {hero.imagen_url === img.url && (
                <div className="absolute top-2 right-2 bg-brand-accent text-brand-navy p-1 rounded-full">
                  <Check size={12} />
                </div>
              )}
            </button>
          ))}
          {multimedia.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-brand-border bg-brand-light">
              <ImageIcon className="mx-auto text-brand-muted mb-4" size={48} />
              <p className="text-brand-muted uppercase text-xs font-black tracking-widest">No hay imágenes en la galería aún.</p>
              <Link href="/intranet/cms/multimedia" className="text-brand-navy text-[10px] font-black underline mt-4 inline-block">IR A GALERÍA</Link>
            </div>
          )}
        </div>
        <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-slate-100">
          <Button variant="secondary" onClick={() => setIsGalleryOpen(false)}>
            CERRAR GALERÍA
          </Button>
        </div>
      </Modal>
    </div>
  );
}
