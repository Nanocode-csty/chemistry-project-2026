'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/api';
import { Table, Button, Modal, FormInput } from '@/components/intranet/Forms';
import { Plus, Edit2, Trash2, Loader2, ArrowLeft, Award } from 'lucide-react';
import Link from 'next/link';

export default function CMSValores() {
  const [valores, setValores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingValor, setEditingValor] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    orden: 0
  });

  useEffect(() => {
    fetchValores();
  }, []);

  const fetchValores = async () => {
    setLoading(true);
    try {
      const { data, error } = await dbOperations.getValores();
      if (data) setValores(data);
      if (error) console.error(error);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (valor = null) => {
    if (valor) {
      setEditingValor(valor);
      setFormData({
        titulo: valor.titulo,
        descripcion: valor.descripcion,
        orden: valor.orden
      });
    } else {
      setEditingValor(null);
      setFormData({ titulo: '', descripcion: '', orden: valores.length + 1 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingValor) {
        await dbOperations.actualizarValor(editingValor.id, formData);
      } else {
        // Implementar crearValor si es necesario, por ahora actualizamos
        alert('Funcionalidad de creación próximamente');
      }
      setIsModalOpen(false);
      fetchValores();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { key: 'orden', label: 'ORDEN' },
    { key: 'titulo', label: 'VALOR' },
    { key: 'descripcion', label: 'DESCRIPCIÓN', render: (row) => (
      <p className="max-w-md truncate">{row.descripcion}</p>
    )},
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
            NUESTROS VALORES
          </h1>
          <p className="text-brand-muted mt-2 uppercase text-xs font-bold tracking-widest">Gestiona los principios éticos de la institución</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus size={20} /> NUEVO VALOR
        </Button>
      </div>

      <Table
        columns={columns}
        data={valores}
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
        title={editingValor ? 'EDITAR VALOR' : 'NUEVO VALOR'}
      >
        <form onSubmit={handleSubmit}>
          <FormInput
            label="TÍTULO DEL VALOR"
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
            label="ORDEN DE APARICIÓN"
            name="orden"
            type="number"
            value={formData.orden}
            onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
            required
          />
          <div className="mt-8 flex justify-end gap-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              CANCELAR
            </Button>
            <Button type="submit">
              {editingValor ? 'GUARDAR CAMBIOS' : 'CREAR VALOR'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
