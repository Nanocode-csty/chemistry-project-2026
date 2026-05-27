'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/supabase';
import { Plus, Trash2, Edit2, AlertCircle, Zap } from 'lucide-react';
import {
  Modal,
  FormInput,
  FormSelect,
  Button,
  Table,
  Badge,
} from '@/components/intranet/Forms';

export default function EquiposPage() {
  const [equipos, setEquipos] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    ambiente_id: '',
    categoria_id: '',
    descripcion: '',
    estado: 'disponible',
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [equiposRes, ambientesRes, categoriasRes] = await Promise.all([
        dbOperations.getEquipos(),
        dbOperations.getAmbientes(),
        dbOperations.getCategorias(),
      ]);

      if (equiposRes.error) throw equiposRes.error;
      if (ambientesRes.error) throw ambientesRes.error;
      if (categoriasRes.error) throw categoriasRes.error;

      setEquipos(equiposRes.data || []);
      setAmbientes(ambientesRes.data || []);
      setCategorias(categoriasRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      nombre: '',
      codigo: '',
      ambiente_id: '',
      categoria_id: '',
      descripcion: '',
      estado: 'disponible',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (equipo) => {
    setEditingId(equipo.id);
    setFormData({
      nombre: equipo.nombre,
      codigo: equipo.codigo,
      ambiente_id: equipo.ambiente_id,
      categoria_id: equipo.categoria_id,
      descripcion: equipo.descripcion || '',
      estado: equipo.estado,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim() || !formData.codigo.trim() || !formData.ambiente_id || !formData.categoria_id) {
      setError('Todos los campos son requeridos');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let result;
      if (editingId) {
        result = await dbOperations.actualizarEquipo(
          editingId,
          formData.nombre,
          formData.codigo,
          parseInt(formData.ambiente_id),
          parseInt(formData.categoria_id),
          formData.descripcion,
          formData.estado
        );
      } else {
        result = await dbOperations.crearEquipo(
          formData.nombre,
          formData.codigo,
          parseInt(formData.ambiente_id),
          parseInt(formData.categoria_id),
          formData.descripcion
        );
      }

      const { error } = result;
      if (error) throw error;

      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeStatus = async (equipoId, estado) => {
    try {
      const { error } = await dbOperations.cambiarEstadoEquipo(equipoId, estado);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro?')) {
      try {
        const { error } = await dbOperations.eliminarEquipo(id);
        if (error) throw error;
        await fetchData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const getEstadoColor = (estado) => {
    if (estado === 'disponible') return 'green';
    if (estado === 'ocupado') return 'blue';
    return 'red';
  };

  const getEstadoLabel = (estado) => {
    if (estado === 'disponible') return 'Disponible';
    if (estado === 'ocupado') return 'Ocupado';
    return 'Mantenimiento';
  };

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'codigo', label: 'Código' },
    {
      key: 'ambiente',
      label: 'Ambiente',
      render: (row) => row.ambiente?.nombre || 'N/A',
    },
    {
      key: 'categoria',
      label: 'Categoría',
      render: (row) => row.categoria?.nombre || 'N/A',
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) => (
        <Badge color={getEstadoColor(row.estado)}>
          {getEstadoLabel(row.estado)}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Equipos</h1>
          <p className="text-gray-600 mt-2">Gestiona todos los equipos del inventario</p>
        </div>
        <Button onClick={handleNew} variant="success">
          <Plus className="w-5 h-5 mr-2 inline" /> Nuevo Equipo
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
      ) : equipos.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-600">No hay equipos registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <Table
            columns={columns}
            data={equipos}
            actions={(row) => (
              <>
                <div className="flex gap-2">
                  {row.estado === 'disponible' && (
                    <button
                      onClick={() => handleChangeStatus(row.id, 'en_mantenimiento')}
                      className="text-yellow-600 hover:text-yellow-800 text-xs font-semibold"
                      title="Enviar a mantenimiento"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                  )}
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
                </div>
              </>
            )}
          />
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Editar Equipo' : 'Nuevo Equipo'}
      >
        <FormInput
          label="Nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleInputChange}
          placeholder="Ej: Microscopio Óptico"
          required
        />
        <FormInput
          label="Código"
          name="codigo"
          value={formData.codigo}
          onChange={handleInputChange}
          placeholder="Ej: MICRO-001"
          required
        />
        <FormSelect
          label="Ambiente"
          name="ambiente_id"
          value={formData.ambiente_id}
          onChange={handleInputChange}
          options={ambientes}
          required
        />
        <FormSelect
          label="Categoría"
          name="categoria_id"
          value={formData.categoria_id}
          onChange={handleInputChange}
          options={categorias}
          required
        />
        <FormInput
          label="Descripción"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleInputChange}
          placeholder="Descripción adicional"
          textarea
        />
        {editingId && (
          <FormSelect
            label="Estado"
            name="estado"
            value={formData.estado}
            onChange={handleInputChange}
            options={[
              { id: 'disponible', nombre: 'Disponible' },
              { id: 'ocupado', nombre: 'Ocupado' },
              { id: 'en_mantenimiento', nombre: 'En Mantenimiento' },
            ]}
          />
        )}
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
