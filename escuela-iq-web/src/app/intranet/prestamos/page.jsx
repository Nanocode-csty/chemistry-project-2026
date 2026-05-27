'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/supabase';
import { Plus, Trash2, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import {
  Modal,
  FormSelect,
  SearchableSelect,
  Button,
  Table,
  Badge,
} from '@/components/intranet/Forms';

export default function PrestamosPage() {
  const [prestamos, setPrestamos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    ambiente_id: '',
    equipo_id: '',
    estudiante_id: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [tab, setTab] = useState('activos'); // activos | todos

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prestamosRes, equiposRes, estudiantesRes, ambientesRes] = await Promise.all([
        dbOperations.getPrestamos(),
        dbOperations.getEquipos(),
        dbOperations.getEstudiantes(),
        dbOperations.getAmbientes(),
      ]);

      if (prestamosRes.error) throw prestamosRes.error;
      if (equiposRes.error) throw equiposRes.error;
      if (estudiantesRes.error) throw estudiantesRes.error;
      if (ambientesRes.error) throw ambientesRes.error;

      setPrestamos(prestamosRes.data || []);
      setEquipos(equiposRes.data || []);
      setEstudiantes(estudiantesRes.data || []);
      setAmbientes(ambientesRes.data || []);
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
    setFormData({ ambiente_id: '', equipo_id: '', estudiante_id: '' });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.equipo_id || !formData.estudiante_id) {
      setError('Debes seleccionar equipo y estudiante');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { error } = await dbOperations.crearPrestamo(
        parseInt(formData.equipo_id),
        parseInt(formData.estudiante_id)
      );
      if (error) throw error;

      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDevolver = async (prestamoId) => {
    if (confirm('¿Confirmar devolución del equipo?')) {
      try {
        const { error } = await dbOperations.devolverPrestamo(prestamoId);
        if (error) throw error;
        await fetchData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const prestamosFiltrados = tab === 'activos'
    ? prestamos.filter((p) => !p.fecha_devolucion)
    : prestamos;

  const calcularDias = (fechaPrestamo) => {
    const ahora = new Date();
    const fecha = new Date(fechaPrestamo);
    const dias = Math.floor((ahora - fecha) / (1000 * 60 * 60 * 24));
    return dias;
  };

  // Filtrar equipos disponibles y por ambiente seleccionado
  const equiposDisponiblesPorAmbiente = equipos.filter((e) => {
    const disponible = e.estado === 'disponible';
    const matchesAmbiente = formData.ambiente_id ? e.ambiente_id === parseInt(formData.ambiente_id) : true;
    return disponible && matchesAmbiente;
  });

  const columns = [
    {
      key: 'fechaPrestamo',
      label: 'Fecha Préstamo',
      render: (row) =>
        new Date(row.fecha_prestamo).toLocaleDateString('es-MX'),
    },
    {
      key: 'equipo',
      label: 'Equipo',
      render: (row) => row.equipo?.nombre || 'N/A',
    },
    {
      key: 'codigo',
      label: 'Código',
      render: (row) => row.equipo?.codigo || 'N/A',
    },
    {
      key: 'estudiante',
      label: 'Estudiante',
      render: (row) => row.estudiante?.nombre || 'N/A',
    },
    {
      key: 'matricula',
      label: 'Matrícula',
      render: (row) => row.estudiante?.matricula || 'N/A',
    },
    {
      key: 'dias',
      label: 'Días',
      render: (row) =>
        row.fecha_devolucion
          ? `Devuelto`
          : `${calcularDias(row.fecha_prestamo)} días`,
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) => (
        <Badge color={row.fecha_devolucion ? 'gray' : 'blue'}>
          {row.fecha_devolucion ? 'Devuelto' : 'Activo'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Préstamos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona los préstamos y devoluciones de equipos
          </p>
        </div>
        <Button onClick={handleNew} variant="success">
          <Plus className="w-5 h-5 mr-2 inline" /> Nuevo Préstamo
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

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setTab('activos')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            tab === 'activos'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Préstamos Activos
        </button>
        <button
          onClick={() => setTab('todos')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            tab === 'todos'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          Todos los Préstamos
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          </div>
        </div>
      ) : prestamosFiltrados.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {tab === 'activos'
              ? 'No hay préstamos activos'
              : 'No hay préstamos registrados'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <Table
            columns={columns}
            data={prestamosFiltrados}
            actions={(row) => (
              <>
                {!row.fecha_devolucion && (
                  <button
                    onClick={() => handleDevolver(row.id)}
                    className="text-green-600 hover:text-green-800 text-sm font-semibold flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" /> Devolver
                  </button>
                )}
              </>
            )}
          />
        </div>
      )}

      {/* Modal para nuevo préstamo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Nuevo Préstamo"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Selecciona primero un ambiente, luego el equipo y finalmente el estudiante.
          </p>

          {ambientes.length === 0 ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-yellow-700 text-sm">
                No hay ambientes registrados.
              </p>
            </div>
          ) : (
            <>
              <SearchableSelect
                label="Ambiente"
                name="ambiente_id"
                value={formData.ambiente_id}
                onChange={(e) => {
                  handleInputChange(e);
                  setFormData(prev => ({ ...prev, equipo_id: '' }));
                }}
                options={ambientes.map((a) => ({
                  id: a.id,
                  nombre: a.nombre,
                }))}
                required
                placeholder="Buscar ambiente..."
              />

              {formData.ambiente_id && (
                <>
                  {equiposDisponiblesPorAmbiente.length === 0 ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                      <p className="text-yellow-700 text-sm">
                        No hay equipos disponibles en este ambiente.
                      </p>
                    </div>
                  ) : (
                    <>
                      <SearchableSelect
                        label="Equipo"
                        name="equipo_id"
                        value={formData.equipo_id}
                        onChange={handleInputChange}
                        options={equiposDisponiblesPorAmbiente.map((e) => ({
                          id: e.id,
                          nombre: `${e.nombre} (${e.codigo})`,
                        }))}
                        required
                        placeholder="Buscar equipo..."
                      />
                      {formData.equipo_id && (
                        <SearchableSelect
                          label="Estudiante"
                          name="estudiante_id"
                          value={formData.estudiante_id}
                          onChange={handleInputChange}
                          options={estudiantes.map((e) => ({
                            id: e.id,
                            nombre: `${e.nombre} - ${e.matricula}`,
                          }))}
                          required
                          placeholder="Buscar estudiante..."
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </>
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
              disabled={isSaving || !formData.equipo_id || !formData.estudiante_id}
              fullWidth
            >
              {isSaving ? 'Guardando...' : 'Registrar Préstamo'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
