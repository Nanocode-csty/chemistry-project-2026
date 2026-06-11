'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/api';
import { Plus, Trash2, Edit2, AlertCircle, Users, Search, Package, Microscope, X } from 'lucide-react';
import {
  Modal,
  FormInput,
  FormSelect,
  Button,
  Table,
  Badge,
  SearchableSelect,
} from '@/components/intranet/Forms';
import { ConfirmationModal } from '@/components/intranet/ConfirmationModal';
import { TableSkeleton } from '@/components/intranet/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function InvestigacionesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [investigaciones, setInvestigaciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: '',
    estado: 'en_progreso',
    investigadores_ids: [], // array of student ids
    equipos_ids: [], // array of equipo ids
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const fetchInvestigaciones = async () => {
    try {
      setLoading(true);
      const { data, error } = await dbOperations.getInvestigaciones();
      if (error) throw error;
      setInvestigaciones(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstudiantes = async () => {
    try {
      const { data, error } = await dbOperations.getEstudiantes();
      if (error) throw error;
      setEstudiantes(data || []);
    } catch (err) {
      console.error('Error fetching estudiantes:', err);
    }
  };

  const fetchEquipos = async () => {
    try {
      const { data, error } = await dbOperations.getEquipos();
      if (error) throw error;
      setEquipos(data || []);
    } catch (err) {
      console.error('Error fetching equipos:', err);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchInvestigaciones();
    fetchEstudiantes();
    fetchEquipos();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      titulo: '',
      tipo: '',
      estado: 'en_progreso',
      investigadores_ids: [],
      equipos_ids: [],
      descripcion: '',
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: '',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (investigacion) => {
    setEditingId(investigacion.id);
    setFormData({
      titulo: investigacion.titulo,
      tipo: investigacion.tipo,
      estado: investigacion.estado,
      investigadores_ids: investigacion.investigadores_ids || [],
      equipos_ids: investigacion.equipos_ids || [],
      descripcion: investigacion.descripcion || '',
      fecha_inicio: investigacion.fecha_inicio || '',
      fecha_fin: investigacion.fecha_fin || '',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.titulo.trim() || !formData.tipo || formData.investigadores_ids.length === 0) {
      setError('Título, tipo de investigación y al menos un investigador son requeridos');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let result;
      if (editingId) {
        result = await dbOperations.actualizarInvestigacion(editingId, formData);
      } else {
        result = await dbOperations.crearInvestigacion(formData);
      }

      if (result.error) throw new Error(result.error.message || 'Error al guardar');
      
      await fetchInvestigaciones();
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
      const { error } = await dbOperations.eliminarInvestigacion(deleteId);
      if (error) throw error;
      await fetchInvestigaciones();
    } catch (err) {
      setError(err.message);
    }
  };

  const addInvestigador = (value) => {
    const studentId = value;
    // Check if already added using string comparison
    const alreadyAdded = formData.investigadores_ids.some(id => String(id) === String(studentId));
    if (!alreadyAdded) {
      setFormData(prev => ({
        ...prev,
        investigadores_ids: [...prev.investigadores_ids, studentId]
      }));
    }
  };

  const removeInvestigador = (studentId) => {
    setFormData(prev => ({
      ...prev,
      investigadores_ids: prev.investigadores_ids.filter(id => String(id) !== String(studentId))
    }));
  };

  const addEquipo = (value) => {
    const equipoId = value;
    // Check if already added using string comparison
    const alreadyAdded = formData.equipos_ids.some(id => String(id) === String(equipoId));
    if (!alreadyAdded) {
      setFormData(prev => ({
        ...prev,
        equipos_ids: [...prev.equipos_ids, equipoId]
      }));
    }
  };

  const removeEquipo = (equipoId) => {
    setFormData(prev => ({
      ...prev,
      equipos_ids: prev.equipos_ids.filter(id => String(id) !== String(equipoId))
    }));
  };

  const getStudentById = (id) => {
    // Compare as strings to handle type mismatches
    return estudiantes.find(e => String(e.id) === String(id));
  };

  const getEquipoById = (id) => {
    // Compare as strings to handle type mismatches
    return equipos.find(e => String(e.id) === String(id));
  };

  const filteredInvestigaciones = investigaciones.filter(inv => 
    inv.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.descripcion && inv.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (inv.investigadores_ids && inv.investigadores_ids.some(invId => {
      const est = getStudentById(invId);
      return est && (est.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || est.matricula.includes(searchTerm));
    }))
  );

  const getInvestigadoresText = (invIds) => {
    if (!invIds || invIds.length === 0) return 'N/A';
    const nombres = invIds.map(id => {
      const est = getStudentById(id);
      return est ? est.nombre.split(' ').slice(0, 2).join(' ') : 'Desconocido';
    });
    if (nombres.length <= 2) return nombres.join(' y ');
    return `${nombres[0]} +${nombres.length - 1}`;
  };

  const getEquiposPrestados = (inv) => {
    if (!inv.equipos_ids || inv.equipos_ids.length === 0) return 'Ninguno';
    const nombres = inv.equipos_ids.map(id => {
      const eq = getEquipoById(id);
      return eq ? eq.nombre : 'Desconocido';
    });
    return nombres.join(', ');
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'en_progreso': return 'teal';
      case 'finalizado': return 'green';
      case 'pausado': return 'yellow';
      default: return 'gray';
    }
  };

  const columns = [
    { 
      key: 'titulo', 
      label: 'Investigación',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-brand-navy/10 flex items-center justify-center text-brand-navy">
            <Microscope size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-brand-navy leading-tight">{row.titulo}</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
              {row.tipo === 'paper' ? 'Paper' : 'Tesis'}
            </span>
          </div>
        </div>
      )
    },
    { 
      key: 'investigadores_ids', 
      label: 'Investigadores',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-accent" />
          <span className="text-sm text-gray-600">{getInvestigadoresText(row.investigadores_ids)}</span>
        </div>
      )
    },
    { 
      key: 'equipos_ids', 
      label: 'Equipos Asignados',
      render: (row) => (
        <div className="text-sm text-gray-500">{getEquiposPrestados(row)}</div>
      )
    },
    { 
      key: 'estado', 
      label: 'Estado',
      render: (row) => <Badge color={getEstadoColor(row.estado)}>{row.estado.replace('_', ' ')}</Badge>
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="bg-white p-8 rounded-lg shadow-premium border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-brand-navy p-4 rounded-sm shadow-lg">
            <Microscope className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-brand-navy tracking-tight uppercase">Investigaciones</h1>
            <p className="text-brand-teal font-bold text-xs tracking-widest uppercase mt-1">Gestión de proyectos de investigación</p>
          </div>
        </div>
        <Button onClick={handleNew} variant="primary">
          <Plus className="w-5 h-5 mr-2 inline" /> NUEVA INVESTIGACIÓN
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-brand-border flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título, descripción o investigador..."
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
            className="bg-red-50 border-l-4 border-brand-red p-6 rounded-sm overflow-hidden"
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
        ) : filteredInvestigaciones.length === 0 ? (
          <div className="p-20 text-center">
            <div className="bg-brand-gray inline-block p-6 rounded-full mb-6">
              <Microscope className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-brand-navy mb-2 uppercase">No hay investigaciones registradas</h3>
            <p className="text-gray-500">Comienza a agregar proyectos de investigación haciendo clic en "Nueva Investigación"</p>
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
            data={filteredInvestigaciones}
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
        title={editingId ? 'EDITAR INVESTIGACIÓN' : 'NUEVA INVESTIGACIÓN'}
        maxWidth="max-w-5xl"
      >
        <div className="space-y-6">
          {/* Error display inside modal */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-brand-red/10 border-l-4 border-brand-red p-4 rounded-sm overflow-hidden"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-brand-red" />
                  <p className="text-brand-red font-bold text-sm">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <FormInput
                label="TÍTULO DE LA INVESTIGACIÓN"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                placeholder="Ingresa el título completo..."
                required
              />
            </div>
            <FormSelect
              label="TIPO DE INVESTIGACIÓN"
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              options={[
                { value: '', label: 'Selecciona un tipo' },
                { value: 'paper', label: 'Paper / Artículo Científico' },
                { value: 'tesis', label: 'Tesis / Trabajo de Grado' },
              ]}
              required
            />
            <FormSelect
              label="ESTADO"
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              options={[
                { value: 'en_progreso', label: 'En Progreso' },
                { value: 'pausado', label: 'Pausado' },
                { value: 'finalizado', label: 'Finalizado' },
              ]}
            />
            <FormInput
              label="FECHA DE INICIO"
              name="fecha_inicio"
              type="date"
              value={formData.fecha_inicio}
              onChange={handleInputChange}
            />
            <FormInput
              label="FECHA DE FINALIZACIÓN (OPCIONAL)"
              name="fecha_fin"
              type="date"
              value={formData.fecha_fin}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Investigadores */}
            <div className="space-y-4">
              <label className="block font-display font-bold text-sm text-brand-navy tracking-widest">
                INVESTIGADORES
              </label>
              <div className="bg-brand-gray/30 p-4 rounded-sm border border-brand-border">
                {/* Selected Investigadores */}
                {formData.investigadores_ids.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {formData.investigadores_ids.map(id => {
                      const est = getStudentById(id);
                      return (
                        <div 
                          key={id} 
                          className="flex items-center gap-2 bg-brand-teal/20 text-brand-navy px-3 py-1.5 rounded-sm text-xs font-bold border border-brand-teal/30"
                        >
                          <Users className="w-3 h-3" />
                          {est ? `${est.nombre} (${est.matricula})` : 'Desconocido'}
                          <button
                            type="button"
                            onClick={() => removeInvestigador(id)}
                            className="ml-2 text-brand-red hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Selector */}
                <SearchableSelect
                  label="AGREGAR INVESTIGADOR"
                  name="investigador_temp"
                  value=""
                  onChange={(e) => e.target.value && addInvestigador(e.target.value)}
                  options={estudiantes
                    .filter(e => !formData.investigadores_ids.some(id => String(id) === String(e.id)))
                    .map(e => ({ value: e.id, label: `${e.nombre} (${e.matricula})` }))}
                  placeholder="Buscar estudiante..."
                />
              </div>
            </div>

            {/* Equipos */}
            <div className="space-y-4">
              <label className="block font-display font-bold text-sm text-brand-navy tracking-widest">
                EQUIPOS ASIGNADOS
              </label>
              <div className="bg-brand-gray/30 p-4 rounded-sm border border-brand-border">
                {/* Selected Equipos */}
                {formData.equipos_ids.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {formData.equipos_ids.map(id => {
                      const eq = getEquipoById(id);
                      return (
                        <div 
                          key={id} 
                          className="flex items-center gap-2 bg-brand-teal/20 text-brand-navy px-3 py-1.5 rounded-sm text-xs font-bold border border-brand-teal/30"
                        >
                          <Package className="w-3 h-3" />
                          {eq ? `${eq.nombre} (${eq.codigo})` : 'Desconocido'}
                          <button
                            type="button"
                            onClick={() => removeEquipo(id)}
                            className="ml-2 text-brand-red hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Selector */}
                <SearchableSelect
                  label="AGREGAR EQUIPO"
                  name="equipo_temp"
                  value=""
                  onChange={(e) => e.target.value && addEquipo(e.target.value)}
                  options={equipos
                    .filter(e => 
                      !formData.equipos_ids.some(id => String(id) === String(e.id)) && 
                      e.estado === 'disponible'
                    )
                    .map(e => ({ value: e.id, label: `${e.nombre} (${e.codigo})` }))}
                  placeholder="Buscar equipo..."
                />
              </div>
            </div>
          </div>

          <FormInput
            label="DESCRIPCIÓN (OPCIONAL)"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            placeholder="Agrega una descripción detallada del proyecto..."
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
        title="ELIMINAR INVESTIGACIÓN"
        message="¿Estás seguro de que deseas eliminar esta investigación? Se perderán todos los datos asociados."
        confirmText="ELIMINAR"
      />
    </div>
  );
}
