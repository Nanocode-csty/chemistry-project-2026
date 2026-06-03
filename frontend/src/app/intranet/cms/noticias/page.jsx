'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/supabase';
import { Table, Button, Modal, FormInput, Badge } from '@/components/intranet/Forms';
import { Plus, Edit2, Trash2, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function CMSNoticias() {
  const [noticias, setNoticias] = useState([]);
  const [multimedia, setMultimedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [editingNoticia, setEditingNoticia] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    contenido: '',
    categoria: '',
    imagen_url: '',
    fecha: new Date().toISOString().split('T')[0],
    destacada: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [noticiasRes, multimediaRes] = await Promise.all([
        dbOperations.getNoticiasCMS(),
        dbOperations.getMultimedia()
      ]);
      if (noticiasRes.data) setNoticias(noticiasRes.data);
      if (multimediaRes.data) setMultimedia(multimediaRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (noticia = null) => {
    if (noticia) {
      setEditingNoticia(noticia);
      setFormData({
        titulo: noticia.titulo,
        descripcion: noticia.descripcion,
        contenido: noticia.contenido,
        categoria: noticia.categoria,
        imagen_url: noticia.imagen_url,
        fecha: noticia.fecha.split('T')[0],
        destacada: noticia.destacada
      });
    } else {
      setEditingNoticia(null);
      setFormData({
        titulo: '',
        descripcion: '',
        contenido: '',
        categoria: '',
        imagen_url: '',
        fecha: new Date().toISOString().split('T')[0],
        destacada: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNoticia) {
        await dbOperations.actualizarNoticia(editingNoticia.id, formData);
      } else {
        await dbOperations.crearNoticia(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectImage = (url) => {
    setFormData({ ...formData, imagen_url: url });
    setIsGalleryOpen(false);
  };

  const columns = [
    { key: 'fecha', label: 'FECHA', render: (row) => new Date(row.fecha).toLocaleDateString() },
    { key: 'titulo', label: 'TÍTULO', render: (row) => <span className="font-bold">{row.titulo}</span> },
    { key: 'categoria', label: 'CATEGORÍA', render: (row) => <Badge color="blue">{row.categoria}</Badge> },
    { key: 'destacada', label: 'DESTACADA', render: (row) => row.destacada ? 'SÍ' : 'NO' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-brand-navy animate-spin" />
      </div>
    );
  }

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
            NOTICIAS Y ACTUALIDAD
          </h1>
          <p className="text-brand-muted mt-2 uppercase text-xs font-bold tracking-widest">Publica novedades para el portal principal</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus size={20} /> NUEVA NOTICIA
        </Button>
      </div>

      <Table
        columns={columns}
        data={noticias}
        actions={(row) => (
          <>
            <button
              onClick={() => handleOpenModal(row)}
              className="p-2 text-brand-navy hover:bg-brand-light rounded-sm transition-colors"
              title="Editar"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={async () => {
                if(confirm('¿Seguro que deseas eliminar esta noticia?')) {
                  await dbOperations.eliminarNoticia(row.id);
                  fetchData();
                }
              }}
              className="p-2 text-brand-red hover:bg-red-50 rounded-sm transition-colors"
              title="Eliminar"
            >
              <Trash2 size={18} />
            </button>
          </>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNoticia ? 'EDITAR NOTICIA' : 'NUEVA NOTICIA'}
      >
        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto pr-4">
          <div className="grid md:grid-cols-2 gap-6">
            <FormInput
              label="TÍTULO DE LA NOTICIA"
              name="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
            />
            <FormInput
              label="CATEGORÍA"
              name="categoria"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              placeholder="Ej: Investigación, Evento, Convenio"
              required
            />
          </div>

          <FormInput
            label="BREVE DESCRIPCIÓN (RESUMEN)"
            name="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            textarea
            required
          />

          <FormInput
            label="CONTENIDO COMPLETO"
            name="contenido"
            value={formData.contenido}
            onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
            textarea
            placeholder="Puedes usar HTML o texto plano..."
          />

          <div className="grid md:grid-cols-2 gap-6">
            <FormInput
              label="FECHA"
              name="fecha"
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              required
            />
            <div className="mb-6">
              <label className="block font-display font-bold text-sm text-brand-navy tracking-widest mb-3 uppercase">IMAGEN DESTACADA</label>
              <div className="flex gap-4">
                <div className="flex-1 border-2 border-brand-border p-3 rounded-sm bg-brand-light text-xs truncate">
                  {formData.imagen_url || 'Ninguna imagen seleccionada'}
                </div>
                <Button variant="secondary" onClick={() => setIsGalleryOpen(true)} className="!py-2">
                  <ImageIcon size={18} />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <input
              type="checkbox"
              id="destacada"
              checked={formData.destacada}
              onChange={(e) => setFormData({ ...formData, destacada: e.target.checked })}
              className="w-5 h-5 accent-brand-navy"
            />
            <label htmlFor="destacada" className="font-display font-bold text-sm text-brand-navy uppercase tracking-widest cursor-pointer">Marcar como noticia destacada</label>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              CANCELAR
            </Button>
            <Button type="submit">
              {editingNoticia ? 'GUARDAR CAMBIOS' : 'PUBLICAR NOTICIA'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Galería de Selección de Imágenes */}
      <Modal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        title="SELECCIONAR IMAGEN DE GALERÍA"
      >
        <div className="grid grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto p-2">
          {multimedia.map((img) => (
            <button
              key={img.id}
              onClick={() => handleSelectImage(img.url)}
              className="group relative aspect-video bg-brand-light overflow-hidden border-2 border-transparent hover:border-brand-navy transition-all"
            >
              <img src={img.url} alt={img.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-brand-navy/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-[10px] font-black uppercase tracking-widest">Seleccionar</span>
              </div>
            </button>
          ))}
          {multimedia.length === 0 && (
            <div className="col-span-3 py-12 text-center text-brand-muted uppercase text-xs font-bold tracking-widest">
              No hay imágenes en la galería. Cárgalas en la sección Multimedia.
            </div>
          )}
        </div>
        <div className="mt-8 flex justify-end">
          <Button variant="secondary" onClick={() => setIsGalleryOpen(false)}>
            CERRAR
          </Button>
        </div>
      </Modal>
    </div>
  );
}
