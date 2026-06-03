'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/supabase';
import { Table, Button, Modal, FormInput } from '@/components/intranet/Forms';
import { Plus, Edit2, Trash2, Loader2, ArrowLeft, History } from 'lucide-react';
import Link from 'next/link';

export default function CMSEvolucion() {
  const [evolucion, setEvolucion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvolucion, setEditingEvolucion] = useState(null);
  const [formData, setFormData] = useState({
    periodo: '',
    titulo: '',
    descripcion: '',
    orden: 0
  });

  useEffect(() => {
    fetchEvolucion();
  }, []);

  const fetchEvolucion = async () => {
    setLoading(true);
    try {
      const { data, error } = await dbOperations.getEvolucion();
      if (data) setEvolucion(data);
      if (error) console.error(error);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingEvolucion(item);
      setFormData({
        periodo: item.periodo,
        titulo: item.titulo,
        descripcion: item.descripcion,
        orden: item.orden
      });
    } else {
      setEditingEvolucion(null);
      setFormData({ periodo: '', titulo: '', descripcion: '', orden: evolucion.length + 1 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvolucion) {
        await dbOperations.actualizarEvolucion(editingEvolucion.id, formData);
      } else {
        alert('Funcionalidad de creación próximamente');
      }
      setIsModalOpen(false);
      fetchEvolucion();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { key: 'periodo', label: 'PERIODO' },
    { key: 'titulo', label: 'TÍTULO' },
    { key: 'descripcion', label: 'DESCRIPCIÓN', render: (row) => (
      <p className="max-w-md truncate">{row.descripcion}</p>
    )},
    { key: 'orden', label: 'ORDEN' },
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
            NUESTRA EVOLUCIÓN
          </h1>
          <p className="text-brand-muted mt-2 uppercase text-xs font-bold tracking-widest">Gestiona la línea de tiempo histórica</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus size={20} /> NUEVO HITO
        </Button>
      </div>

      <Table
        columns={columns}
        data={evolucion}
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
        title={editingEvolucion ? 'EDITAR HITO HISTÓRICO' : 'NUEVO HITO HISTÓRICO'}
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="PERIODO (AÑOS)"
            name="periodo"
            value={formData.periodo}
            onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
            placeholder="Ej: 2020 - 2030"
            required
          />
          <FormInput
            label="TÍTULO DEL HITO"
            name="titulo"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            required
          />
          <FormInput
            label="DESCRIPCIÓN"
            name="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            textarea
            required
          />
          <FormInput
            label="ORDEN EN LA LÍNEA"
            name="orden"
            type="number"
            value={formData.orden}
            onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
            required
          />
          <div className="mt-8 flex justify-end gap-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              CANCELAR
            </Button>
            <Button type="submit">
              {editingEvolucion ? 'GUARDAR CAMBIOS' : 'CREAR HITO'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
