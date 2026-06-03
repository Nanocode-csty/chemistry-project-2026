'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/supabase';
import { Button, Modal, FormInput } from '@/components/intranet/Forms';
import { Plus, Trash2, Loader2, ArrowLeft, Image as ImageIcon, Link as LinkIcon, FileText } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CMSMultimedia() {
  const [multimedia, setMultimedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    titulo: '',
    tipo: 'publicacion'
  });

  useEffect(() => {
    fetchMultimedia();
  }, []);

  const fetchMultimedia = async () => {
    setLoading(true);
    try {
      const { data, error } = await dbOperations.getMultimedia();
      if (data) setMultimedia(data);
      if (error) console.error(error);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dbOperations.subirImagen(formData);
      setIsModalOpen(false);
      setFormData({ url: '', titulo: '', tipo: 'publicacion' });
      fetchMultimedia();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Seguro que deseas eliminar este recurso?')) {
      try {
        await dbOperations.eliminarImagen(id);
        fetchMultimedia();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-brand-navy animate-spin" />
      </div>
    );
  }

  const isPDF = (url) => url?.toLowerCase().endsWith('.pdf') || url?.toLowerCase().includes('pdf');

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link 
        href="/intranet/cms" 
        className="flex items-center gap-2 text-brand-muted hover:text-brand-navy mb-8 transition-colors group text-sm font-bold uppercase tracking-widest"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver al CMS
      </Link>

      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-display font-black text-brand-navy uppercase tracking-tighter">
            BIBLIOTECA MULTIMEDIA
          </h1>
          <p className="text-brand-muted mt-2 uppercase text-xs font-bold tracking-widest">Gestiona imágenes y documentos para el sitio</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus size={20} /> AÑADIR RECURSO
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {multimedia.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="group relative aspect-video bg-white border border-brand-border overflow-hidden rounded-sm shadow-sm hover:shadow-card-hover transition-all"
          >
            {isPDF(item.url) || item.tipo === 'documento' ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-brand-gray/20">
                <FileText size={48} className="text-brand-navy/30" />
                <span className="text-[10px] font-black text-brand-navy mt-2 uppercase tracking-widest">DOCUMENTO PDF</span>
              </div>
            ) : (
              <img src={item.url} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            )}
            
            <div className="absolute inset-0 bg-brand-navy/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-4 transition-opacity text-center">
              <p className="text-white text-xs font-black uppercase tracking-widest mb-4 truncate w-full">{item.titulo}</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 bg-brand-red text-white rounded-full hover:bg-red-700 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(item.url);
                    alert('URL copiada al portapapeles');
                  }}
                  className="p-2 bg-brand-navy text-white rounded-full hover:bg-brand-teal transition-colors"
                  title="Copiar URL"
                >
                  <LinkIcon size={16} />
                </button>
              </div>
              <span className="absolute bottom-4 right-4 bg-brand-accent text-brand-navy text-[8px] font-black px-2 py-1 uppercase tracking-widest">
                {item.tipo}
              </span>
            </div>
          </motion.div>
        ))}
        {multimedia.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-brand-border bg-brand-light rounded-sm">
            <ImageIcon className="mx-auto text-brand-muted mb-4" size={48} />
            <p className="text-brand-muted uppercase text-xs font-black tracking-widest">No hay recursos cargados aún</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="AÑADIR NUEVO RECURSO"
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="URL DEL RECURSO (IMAGEN O PDF)"
            name="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://ejemplo.com/recurso.jpg"
            required
          />
          <FormInput
            label="TÍTULO / ETIQUETA"
            name="titulo"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            placeholder="Ej: Paper Degradación Fotocatalítica"
            required
          />
          <div className="mb-6">
            <label className="block font-display font-bold text-sm text-brand-navy tracking-widest mb-3 uppercase">TIPO DE RECURSO</label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className="w-full px-4 py-3 border-2 border-brand-border rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent bg-brand-gray/30 transition-all"
            >
              <option value="banner">Banner / Principal</option>
              <option value="publicacion">Publicación / Noticia</option>
              <option value="documento">Documento / PDF</option>
              <option value="perfil">Perfil / Personal</option>
              <option value="logo">Logo / Marca</option>
            </select>
          </div>
          <div className="mt-8 flex justify-end gap-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              CANCELAR
            </Button>
            <Button type="submit">
              AÑADIR A BIBLIOTECA
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

