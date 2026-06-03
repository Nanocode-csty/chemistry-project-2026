'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/supabase';
import { Plus, Trash2, Edit2, AlertCircle, Building2, Search } from 'lucide-react';
import {
  Modal,
  FormInput,
  Button,
  Table,
  Badge,
} from '@/components/intranet/Forms';
import { ConfirmationModal } from '@/components/intranet/ConfirmationModal';
import { TableSkeleton } from '@/components/intranet/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';

export default function AmbientesPage() {
  const [ambientes, setAmbientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Cargar ambientes
  const fetchAmbientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await dbOperations.getAmbientes();
      if (error) throw error;
      setAmbientes(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchAmbientes();
  }, []);

  // Manejar cambios de formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  // Abrir modal para crear
  const handleNew = () => {
    setEditingId(null);
    setFormData({ nombre: '', descripcion: '' });
    setError(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (ambiente) => {
    setEditingId(ambiente.id);
    setFormData({
      nombre: ambiente.nombre,
      descripcion: ambiente.descripcion || '',
    });
    setError(null);
    setIsModalOpen(true);
  };

  // Guardar (crear o actualizar)
  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    // Validar duplicado localmente antes de enviar
    const duplicate = ambientes.find(a => 
      a.nombre.toLowerCase() === formData.nombre.toLowerCase().trim() && 
      a.id !== editingId
    );

    if (duplicate) {
      setError(`Ya existe un ambiente con el nombre "${formData.nombre}"`);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let result;
      if (editingId) {
        result = await dbOperations.actualizarAmbiente(
          editingId,
          formData.nombre.trim(),
          formData.descripcion.trim()
        );
      } else {
        result = await dbOperations.crearAmbiente(
          formData.nombre.trim(),
          formData.descripcion.trim()
        );
      }

      const { error: saveError } = result;
      if (saveError) {
        if (typeof saveError === 'object' && saveError.error) {
          throw new Error(saveError.error);
        }
        throw new Error(saveError.message || 'Error al guardar');
      }

      await fetchAmbientes();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Preparar eliminación
  const confirmDelete = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Ejecutar eliminación
  const handleDelete = async () => {
    try {
      const { error: deleteError } = await dbOperations.eliminarAmbiente(deleteId);
      if (deleteError) throw deleteError;
      await fetchAmbientes();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredAmbientes = ambientes.filter(a => 
    a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.descripcion && a.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    { 
      key: 'nombre', 
      label: 'Ambiente',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-gray rounded-sm">
            <Building2 className="w-4 h-4 text-brand-navy" />
          </div>
          <span className="font-bold text-brand-navy">{row.nombre}</span>
        </div>
      )
    },
    { 
      key: 'descripcion', 
      label: 'Descripción',
      render: (row) => (
        <span className="text-gray-500 italic">
          {row.descripcion || 'Sin descripción'}
        </span>
      )
    },
    { 
      key: 'id', 
      label: 'ID', 
      render: (row) => <Badge color="gray">#{row.id}</Badge> 
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="bg-white p-8 rounded-lg shadow-premium border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-brand-navy p-4 rounded-sm shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-brand-navy tracking-tight uppercase">Ambientes</h1>
            <p className="text-brand-teal font-bold text-xs tracking-widest uppercase mt-1">Gestión de Laboratorios y Salas</p>
          </div>
        </div>
        <Button onClick={handleNew} variant="primary">
          <Plus className="w-5 h-5 mr-2 inline" /> NUEVO AMBIENTE
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-brand-border flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar ambientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-brand-gray/30 border-2 border-transparent focus:border-brand-accent rounded-sm outline-none transition-all font-sans"
          />
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-brand-red/10 border-l-4 border-brand-red p-6 rounded-sm overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <AlertCircle className="w-6 h-6 text-brand-red" />
              <p className="text-brand-red font-bold">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-premium border border-brand-border overflow-hidden">
        {!isMounted || loading ? (
          <div className="p-8">
            <TableSkeleton />
          </div>
        ) : filteredAmbientes.length === 0 ? (
          <div className="p-20 text-center">
            <div className="bg-brand-gray inline-block p-6 rounded-full mb-6">
              <Building2 className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-brand-navy mb-2 uppercase">No se encontraron ambientes</h3>
            <p className="text-gray-500">Comienza creando uno nuevo para gestionar tus laboratorios.</p>
            {searchTerm && (
              <Button 
                variant="secondary" 
                onClick={() => setSearchTerm('')} 
                className="mt-6"
              >
                LIMPIAR BÚSQUEDA
              </Button>
            )}
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredAmbientes}
            actions={(row) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(row)}
                  className="p-2 text-brand-navy hover:bg-brand-gray rounded-sm transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => confirmDelete(row.id)}
                  className="p-2 text-brand-red hover:bg-red-50 rounded-sm transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          />
        )}
      </div>

      {/* Edit/Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'EDITAR AMBIENTE' : 'NUEVO AMBIENTE'}
      >
        <div className="space-y-6">
          <FormInput
            label="NOMBRE DEL AMBIENTE"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder="Ej: Laboratorio de Química Orgánica"
            required
          />
          <FormInput
            label="DESCRIPCIÓN (OPCIONAL)"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            placeholder="Detalles sobre el uso o equipamiento del ambiente..."
            textarea
          />
          <div className="flex gap-4 pt-4">
            <Button
              onClick={() => setIsModalOpen(false)}
              variant="secondary"
              fullWidth
            >
              CANCELAR
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              fullWidth
            >
              {isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="ELIMINAR AMBIENTE"
        message="¿Estás seguro de que deseas eliminar este ambiente? Esta acción no se puede deshacer y podría afectar a los equipos asociados."
        confirmText="ELIMINAR"
      />
    </div>
  );
}
