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

export default function EstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    matricula: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchEstudiantes = async () => {
    try {
      setLoading(true);
      const { data, error } = await dbOperations.getEstudiantes();
      if (error) throw error;
      setEstudiantes(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstudiantes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({ nombre: '', email: '', matricula: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (estudiante) => {
    setEditingId(estudiante.id);
    setFormData({
      nombre: estudiante.nombre,
      email: estudiante.email || '',
      matricula: estudiante.matricula,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim() || !formData.matricula.trim()) {
      setError('Nombre y matrícula son requeridos');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let result;
      if (editingId) {
        result = await dbOperations.actualizarEstudiante(
          editingId,
          formData.nombre,
          formData.email,
          formData.matricula
        );
      } else {
        result = await dbOperations.crearEstudiante(
          formData.nombre,
          formData.email,
          formData.matricula
        );
      }

      const { error } = result;
      if (error) throw error;

      await fetchEstudiantes();
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
        const { error } = await dbOperations.eliminarEstudiante(id);
        if (error) throw error;
        await fetchEstudiantes();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'matricula', label: 'Matrícula' },
    { key: 'email', label: 'Email' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Estudiantes</h1>
          <p className="text-gray-600 mt-2">Gestiona los estudiantes registrados</p>
        </div>
        <Button onClick={handleNew} variant="success">
          <Plus className="w-5 h-5 mr-2 inline" /> Nuevo Estudiante
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
      ) : estudiantes.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-600">No hay estudiantes registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <Table
            columns={columns}
            data={estudiantes}
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
        title={editingId ? 'Editar Estudiante' : 'Nuevo Estudiante'}
      >
        <FormInput
          label="Nombre Completo"
          name="nombre"
          value={formData.nombre}
          onChange={handleInputChange}
          placeholder="Ej: Juan Pérez"
          required
        />
        <FormInput
          label="Matrícula"
          name="matricula"
          value={formData.matricula}
          onChange={handleInputChange}
          placeholder="Ej: 2022-0001"
          required
        />
        <FormInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="juan@ejemplo.com"
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
