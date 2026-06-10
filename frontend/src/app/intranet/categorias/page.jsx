'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/api';
import { Plus, Trash2, Edit2, AlertCircle, Layers, Search } from 'lucide-react';
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
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CategoriasPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    if (user && user.rol?.toLowerCase() !== 'admin') {
      router.replace('/intranet/dashboard');
    }
  }, [user, router]);
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

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const { data, error } = await dbOperations.getCategorias();
      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchCategorias();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({ nombre: '', descripcion: '' });
    setError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (categoria) => {
    setEditingId(categoria.id);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    // Validar duplicado localmente
    const duplicate = categorias.find(c => 
      c.nombre.toLowerCase() === formData.nombre.toLowerCase().trim() && 
      c.id !== editingId
    );

    if (duplicate) {
      setError(`Ya existe una categoría con el nombre "${formData.nombre}"`);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let result;
      if (editingId) {
        result = await dbOperations.actualizarCategoria(
          editingId,
          formData.nombre.trim(),
          formData.descripcion.trim()
        );
      } else {
        result = await dbOperations.crearCategoria(
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

      await fetchCategorias();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      const { error: deleteError } = await dbOperations.eliminarCategoria(deleteId);
      if (deleteError) throw deleteError;
      await fetchCategorias();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredCategorias = categorias.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.descripcion && c.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    { 
      key: 'nombre', 
      label: 'Categoría',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-gray rounded-sm">
            <Layers className="w-4 h-4 text-brand-navy" />
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
            <Layers className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-brand-navy tracking-tight uppercase">Categorías</h1>
            <p className="text-brand-teal font-bold text-xs tracking-widest uppercase mt-1">Gestión de Tipos de Equipos</p>
          </div>
        </div>
        <Button onClick={handleNew} variant="primary">
          <Plus className="w-5 h-5 mr-2 inline" /> NUEVA CATEGORÍA
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-brand-border flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar categorías..."
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
        ) : filteredCategorias.length === 0 ? (
          <div className="p-20 text-center">
            <div className="bg-brand-gray inline-block p-6 rounded-full mb-6">
              <Layers className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-brand-navy mb-2 uppercase">No se encontraron categorías</h3>
            <p className="text-gray-500">Organiza tus equipos creando categorías para un mejor seguimiento.</p>
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
            data={filteredCategorias}
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
        title={editingId ? 'EDITAR CATEGORÍA' : 'NUEVA CATEGORÍA'}
      >
        <div className="space-y-6">
          <FormInput
            label="NOMBRE DE LA CATEGORÍA"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder="Ej: Microscopios, Cristalería, etc."
            required
          />
          <FormInput
            label="DESCRIPCIÓN (OPCIONAL)"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            placeholder="Detalles sobre qué incluye esta categoría..."
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
        title="ELIMINAR CATEGORÍA"
        message="¿Estás seguro de que deseas eliminar esta categoría? Esta acción podría afectar la clasificación de los equipos asociados."
        confirmText="ELIMINAR"
      />
    </div>
  );
}
