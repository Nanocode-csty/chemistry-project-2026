'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/supabase';
import { Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import {
  Modal,
  FormInput,
  Button,
  Table,
} from '@/components/intranet/Forms';

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
  const [isSaving, setIsSaving] = useState(false);

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
    fetchCategorias();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({ nombre: '', descripcion: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (categoria) => {
    setEditingId(categoria.id);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let result;
      if (editingId) {
        result = await dbOperations.actualizarCategoria(
          editingId,
          formData.nombre,
          formData.descripcion
        );
      } else {
        result = await dbOperations.crearCategoria(
          formData.nombre,
          formData.descripcion
        );
      }

      const { error } = result;
      if (error) throw error;

      await fetchCategorias();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro?')) {
      try {
        const { error } = await dbOperations.eliminarCategoria(id);
        if (error) throw error;
        await fetchCategorias();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Categorías de Equipos</h1>
          <p className="text-gray-600 mt-2">Gestiona las categorías de los equipos</p>
        </div>
        <Button onClick={handleNew} variant="success">
          <Plus className="w-5 h-5 mr-2 inline" /> Nueva Categoría
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          </div>
        </div>
      ) : categorias.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-600">No hay categorías registradas</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <Table
            columns={columns}
            data={categorias}
            actions={(row) => (
              <>
                <button
                  onClick={() => handleEdit(row)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          />
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        <FormInput
          label="Nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleInputChange}
          placeholder="Ej: Microscopios"
          required
        />
        <FormInput
          label="Descripción"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleInputChange}
          placeholder="Descripción de la categoría"
          textarea
        />
        <div className="flex gap-3 mt-6">
          <Button
            onClick={() => setIsModalOpen(false)}
            variant="secondary"
            fullWidth
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            fullWidth
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
