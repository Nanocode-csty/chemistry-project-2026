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
  const [galleryFilter, setGalleryFilter] = useState('all');
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
    // NO cerrar la galería automáticamente para que el usuario vea la selección
    // setIsGalleryOpen(false); 
  };

  const confirmImageSelection = () => {
    setIsGalleryOpen(false);
  };

  const columns = [
    { 
      key: 'imagen_url', 
      label: 'IMAGEN', 
      render: (row) => (
        <div className="w-16 h-10 bg-brand-light rounded-sm overflow-hidden border border-brand-border">
          {row.imagen_url ? (
            <img src={row.imagen_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={14} className="text-brand-muted" />
            </div>
          )}
        </div>
      )
    },
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
            placeholder="Escribe el cuerpo de la noticia aquí..."
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
                <div className="flex-1 border-2 border-brand-border p-3 rounded-sm bg-brand-light flex items-center gap-3 overflow-hidden">
                  {formData.imagen_url ? (
                    <>
                      <img src={formData.imagen_url} alt="Preview" className="w-10 h-10 object-cover rounded-sm border border-brand-border" />
                      <span className="text-[10px] font-black text-brand-navy truncate uppercase tracking-tighter flex-1">{formData.imagen_url}</span>
                    </>
                  ) : (
                    <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest italic">Ninguna seleccionada</span>
                  )}
                </div>
                <Button 
                  type="button"
                  variant="secondary" 
                  onClick={(e) => {
                    e.preventDefault();
                    setIsGalleryOpen(true);
                  }} 
                  className="!py-2 !px-4"
                >
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

      <Modal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        title="SELECCIONAR IMAGEN DE GALERÍA"
        maxWidth="max-w-4xl"
        zIndex="z-[100001]"
      >
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100">
            {['all', 'publicacion', 'banner', 'logo', 'perfil'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setGalleryFilter(filter)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  galleryFilter === filter 
                    ? 'bg-brand-navy text-white' 
                    : 'bg-brand-gray text-brand-navy hover:bg-brand-border'
                }`}
              >
                {filter === 'all' ? 'TODOS' : filter}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
            {multimedia
              .filter(img => galleryFilter === 'all' || img.tipo === galleryFilter)
              .map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => handleSelectImage(img.url)}
                  className={`group relative aspect-square bg-brand-light overflow-hidden border-4 transition-all rounded-sm ${
                    formData.imagen_url === img.url ? 'border-brand-accent' : 'border-transparent hover:border-brand-navy'
                  }`}
                >
                  <img src={img.url} alt={img.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-brand-navy/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity p-2 text-center">
                    <span className="text-white text-[9px] font-black uppercase tracking-widest mb-1 truncate w-full">{img.titulo}</span>
                    <span className="text-brand-accent text-[8px] font-black uppercase tracking-tighter">Click para seleccionar</span>
                  </div>
                  {formData.imagen_url === img.url && (
                    <div className="absolute top-2 right-2 bg-brand-accent text-brand-navy p-1 rounded-full shadow-lg">
                      <Plus size={12} className="rotate-45" />
                    </div>
                  )}
                </button>
              ))}
            {multimedia.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-brand-border bg-brand-light">
                <ImageIcon className="mx-auto text-brand-muted mb-4" size={48} />
                <p className="text-brand-muted uppercase text-xs font-black tracking-widest">
                  No hay recursos cargados aún.
                </p>
                <Link href="/intranet/cms/multimedia" className="text-brand-navy text-[10px] font-black underline mt-4 inline-block hover:text-brand-teal transition-colors">
                  IR A CARGAR MULTIMEDIA
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-4">
          <Button type="button" variant="secondary" onClick={() => setIsGalleryOpen(false)}>
            CANCELAR
          </Button>
          <Button type="button" onClick={confirmImageSelection} disabled={!formData.imagen_url}>
            CONFIRMAR SELECCIÓN
          </Button>
        </div>
      </Modal>
    </div>
  );
}
