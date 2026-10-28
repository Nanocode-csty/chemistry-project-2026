'use client';

import { useState, useEffect, useRef } from 'react';
import { dbOperations } from '@/lib/api';
import { getItemTotalInfo } from '@/lib/units';
import {
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Calendar,
  Search,
  History,
  Clock,
  Package,
  User,
  MapPin,
  Filter,
  FlaskConical,
  Mail,
  GraduationCap,
  X as CloseIcon,
  ChevronDown,
  Layers,
} from 'lucide-react';
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

export default function PrestamosPage() {
  const [prestamos, setPrestamos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDevolverModalOpen, setIsDevolverModalOpen] = useState(false);
  const [selectedPrestamoId, setSelectedPrestamoId] = useState(null);

  const [formData, setFormData] = useState({
    ambiente_id: '',
    equipo_ids: [],
    estudiante_id: '',
    observaciones: '',
  });

  // Smart search states inside modal
  const [studentQuery, setStudentQuery] = useState('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const studentDropdownRef = useRef(null);

  const [equipoQuery, setEquipoQuery] = useState('');
  const [isEquipoDropdownOpen, setIsEquipoDropdownOpen] = useState(false);
  const equipoDropdownRef = useRef(null);

  const [isSaving, setIsSaving] = useState(false);
  const [tab, setTab] = useState('activos'); // activos | todos
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAmbiente, setFilterAmbiente] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prestamosRes, equiposRes, estudiantesRes, ambientesRes] =
        await Promise.all([
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
    setIsMounted(true);
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        studentDropdownRef.current &&
        !studentDropdownRef.current.contains(event.target)
      ) {
        setIsStudentDropdownOpen(false);
      }
      if (
        equipoDropdownRef.current &&
        !equipoDropdownRef.current.contains(event.target)
      ) {
        setIsEquipoDropdownOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsStudentDropdownOpen(false);
        setIsEquipoDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleNew = () => {
    setFormData({
      ambiente_id: '',
      equipo_ids: [],
      estudiante_id: '',
      observaciones: '',
    });
    setStudentQuery('');
    setEquipoQuery('');
    setIsStudentDropdownOpen(false);
    setIsEquipoDropdownOpen(false);
    setError(null);
    setIsModalOpen(true);
  };

  // Auto-match student when exact matricula is typed
  const handleStudentQueryChange = (e) => {
    const val = e.target.value;
    setStudentQuery(val);
    setIsStudentDropdownOpen(true);
    if (error) setError(null);

    const trimmed = val.trim();
    if (trimmed.length >= 6) {
      const exactMatch = estudiantes.find(
        (est) => String(est.matricula).toLowerCase() === trimmed.toLowerCase()
      );
      if (exactMatch) {
        setFormData((prev) => ({ ...prev, estudiante_id: exactMatch.id }));
        setIsStudentDropdownOpen(false);
      }
    }
  };

  const handleSelectStudent = (est) => {
    setFormData((prev) => ({ ...prev, estudiante_id: est.id }));
    setStudentQuery(`${est.matricula} — ${est.nombre}`);
    setIsStudentDropdownOpen(false);
    if (error) setError(null);
  };

  const handleClearStudent = () => {
    setFormData((prev) => ({ ...prev, estudiante_id: '' }));
    setStudentQuery('');
    setIsStudentDropdownOpen(true);
  };

  // Add item to multi-loan list
  const handleAddEquipo = (eq) => {
    setFormData((prev) => {
      if (prev.equipo_ids.includes(eq.id)) return prev;
      return {
        ...prev,
        equipo_ids: [...prev.equipo_ids, eq.id],
      };
    });
    setEquipoQuery('');
    setIsEquipoDropdownOpen(false);
    if (error) setError(null);
  };

  const handleRemoveEquipo = (idToRemove) => {
    setFormData((prev) => ({
      ...prev,
      equipo_ids: prev.equipo_ids.filter((id) => id !== idToRemove),
    }));
  };

  const handleSave = async () => {
    if (!formData.estudiante_id) {
      setError('Debes identificar al estudiante (por código/matrícula o nombre)');
      return;
    }
    if (!formData.equipo_ids || formData.equipo_ids.length === 0) {
      setError('Debes agregar al menos un equipo, material o reactivo a la lista del préstamo');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { error: saveError } = await dbOperations.crearPrestamo(
        formData.equipo_ids.map((id) => parseInt(id)),
        parseInt(formData.estudiante_id),
        formData.observaciones.trim()
      );
      if (saveError) throw saveError;

      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDevolver = (id) => {
    setSelectedPrestamoId(id);
    setIsDevolverModalOpen(true);
  };

  const handleDevolver = async () => {
    try {
      const { error: devolverError } = await dbOperations.devolverPrestamo(
        selectedPrestamoId
      );
      if (devolverError) throw devolverError;
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const calcularDias = (fechaPrestamo) => {
    const ahora = new Date();
    const fecha = new Date(fechaPrestamo);
    const dias = Math.floor((ahora - fecha) / (1000 * 60 * 60 * 24));
    return dias;
  };

  const prestamosFiltrados = (
    tab === 'activos'
      ? prestamos.filter((p) => !p.fecha_devolucion)
      : prestamos
  ).filter((p) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      p.equipo?.nombre?.toLowerCase().includes(search) ||
      p.equipo?.codigo?.toLowerCase().includes(search) ||
      p.estudiante?.nombre?.toLowerCase().includes(search) ||
      p.estudiante?.matricula?.toLowerCase().includes(search);

    const matchesAmbiente =
      !filterAmbiente ||
      String(p.equipo?.ambiente_id) === String(filterAmbiente);

    return matchesSearch && matchesAmbiente;
  });

  // Filtered students for autocomplete
  const filteredEstudiantes = estudiantes.filter((est) => {
    const q = studentQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      est.matricula?.toLowerCase().includes(q) ||
      est.nombre?.toLowerCase().includes(q) ||
      est.email?.toLowerCase().includes(q)
    );
  });

  // Filtered available equipment/materials/reagents across all labs (excluding already added ones)
  const equiposDisponibles = equipos.filter((e) => {
    const disponible = e.estado === 'disponible';
    const notAlreadySelected = !formData.equipo_ids.includes(e.id);
    const matchesAmbiente =
      !formData.ambiente_id ||
      String(e.ambiente_id) === String(formData.ambiente_id);
    const q = equipoQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      e.nombre?.toLowerCase().includes(q) ||
      e.codigo?.toLowerCase().includes(q) ||
      e.formula_quimica?.toLowerCase().includes(q) ||
      e.ambiente?.nombre?.toLowerCase().includes(q) ||
      e.categoria?.nombre?.toLowerCase().includes(q);
    return disponible && notAlreadySelected && matchesAmbiente && matchesQuery;
  });

  const selectedEstudiante = estudiantes.find(
    (est) => String(est.id) === String(formData.estudiante_id)
  );

  const selectedEquiposList = formData.equipo_ids
    .map((id) => equipos.find((e) => e.id === id))
    .filter(Boolean);

  const getAmbienteNombre = (ambienteId, fallbackName) => {
    if (fallbackName) return fallbackName;
    const amb = ambientes.find((a) => String(a.id) === String(ambienteId));
    return amb ? amb.nombre : 'Laboratorio General';
  };

  const columns = [
    {
      key: 'fechaPrestamo',
      label: 'Registro',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-brand-navy">
            {new Date(row.fecha_prestamo).toLocaleDateString('es-PE', {
              day: '2-digit',
              month: 'short',
            })}
          </span>
          <span className="text-[10px] text-gray-400 font-bold uppercase">
            {new Date(row.fecha_prestamo).toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      ),
    },
    {
      key: 'equipo',
      label: 'Equipo / Material / Ubicación',
      render: (row) => {
        const info = row.equipo ? getItemTotalInfo(row.equipo) : null;
        const labName = getAmbienteNombre(
          row.equipo?.ambiente_id,
          row.equipo?.ambiente_nombre
        );
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-brand-navy">
              {row.equipo?.nombre || 'N/A'}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest">
                {row.equipo?.codigo || 'N/A'}
              </span>
              {info && !info.isSimpleUnit && (
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  • {info.presentacionLabel}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#002b45] bg-slate-100 px-2 py-0.5 rounded-sm">
                <MapPin className="w-2.5 h-2.5 text-[#9ABE00]" /> {labName}
              </span>
            </div>
            {row.observaciones && (
              <span className="text-[10px] text-slate-400 italic mt-0.5">
                Nota: {row.observaciones}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'estudiante',
      label: 'Estudiante / Código',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-700">
            {row.estudiante?.nombre || 'N/A'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-[#002b45] bg-[#002b45]/5 px-1.5 py-0.5 rounded-sm">
              {row.estudiante?.matricula || 'N/A'}
            </span>
            {row.estudiante?.ciclo && (
              <span className="text-[9px] text-brand-teal font-black uppercase tracking-widest">
                • Ciclo {row.estudiante.ciclo}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'tiempo',
      label: 'Tiempo',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.fecha_devolucion ? (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Devuelto el
              </span>
              <span className="text-xs font-bold text-gray-600">
                {new Date(row.fecha_devolucion).toLocaleDateString('es-PE')}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-brand-accent">
              <Clock className="w-4 h-4" />
              <span className="font-bold text-sm">
                {isMounted ? `${calcularDias(row.fecha_prestamo)} días` : '...'}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) => (
        <Badge color={row.fecha_devolucion ? 'gray' : 'blue'}>
          {row.fecha_devolucion ? 'DEVUELTO' : 'ACTIVO'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="bg-white p-8 rounded-lg shadow-premium border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-brand-navy p-4 rounded-sm shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-brand-navy tracking-tight uppercase">
              Préstamos de Laboratorio
            </h1>
            <p className="text-brand-teal font-bold text-xs tracking-widest uppercase mt-1">
              Control de Salidas, Búsqueda por Código de Estudiante y Préstamo Múltiple
            </p>
          </div>
        </div>
        <Button onClick={handleNew} variant="primary">
          <Plus className="w-5 h-5 mr-2 inline" /> NUEVO PRÉSTAMO
        </Button>
      </div>

      {/* Tabs, Search and Lab Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-brand-border flex flex-col lg:flex-row items-center gap-4">
        <div className="flex p-1 bg-brand-gray rounded-sm w-full lg:w-auto">
          <button
            onClick={() => setTab('activos')}
            className={`flex-1 lg:flex-none px-6 py-2.5 rounded-sm font-display font-bold text-xs tracking-widest transition-all ${
              tab === 'activos'
                ? 'bg-white text-brand-navy shadow-sm'
                : 'text-gray-500 hover:text-brand-navy'
            }`}
          >
            ACTIVOS ({prestamos.filter((p) => !p.fecha_devolucion).length})
          </button>
          <button
            onClick={() => setTab('todos')}
            className={`flex-1 lg:flex-none px-6 py-2.5 rounded-sm font-display font-bold text-xs tracking-widest transition-all ${
              tab === 'todos'
                ? 'bg-white text-brand-navy shadow-sm'
                : 'text-gray-500 hover:text-brand-navy'
            }`}
          >
            HISTORIAL ({prestamos.length})
          </button>
        </div>

        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar préstamo por equipo, código, estudiante o matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-brand-gray/30 border-2 border-transparent focus:border-brand-accent rounded-sm outline-none transition-all font-sans text-sm"
          />
        </div>

        <div className="relative w-full lg:w-64">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filterAmbiente}
            onChange={(e) => setFilterAmbiente(e.target.value)}
            className="w-full pl-10 pr-8 py-3 bg-brand-gray/30 border-2 border-transparent focus:border-brand-accent rounded-sm outline-none appearance-none transition-all font-sans text-xs font-bold text-gray-600 uppercase"
          >
            <option value="">TODOS LOS LABORATORIOS</option>
            {ambientes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && !isModalOpen && (
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
        ) : prestamosFiltrados.length === 0 ? (
          <div className="p-20 text-center">
            <div className="bg-brand-gray inline-block p-6 rounded-full mb-6">
              {tab === 'activos' ? (
                <Clock className="w-12 h-12 text-gray-400" />
              ) : (
                <History className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <h3 className="text-xl font-bold text-brand-navy mb-2 uppercase">
              {tab === 'activos' ? 'No hay préstamos activos' : 'Historial vacío'}
            </h3>
            <p className="text-gray-500">
              {tab === 'activos'
                ? 'Todos los equipos y materiales están disponibles en sus respectivos laboratorios.'
                : 'Aún no se han registrado movimientos que coincidan con tu búsqueda.'}
            </p>
            {(searchTerm || filterAmbiente) && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm('');
                  setFilterAmbiente('');
                }}
                className="mt-6"
              >
                LIMPIAR FILTROS
              </Button>
            )}
          </div>
        ) : (
          <Table
            columns={columns}
            data={prestamosFiltrados}
            actions={(row) => (
              <div className="flex items-center gap-2">
                {!row.fecha_devolucion && (
                  <button
                    onClick={() => confirmDevolver(row.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-teal/10 text-brand-teal hover:bg-brand-teal hover:text-white rounded-sm font-display font-bold text-[10px] tracking-widest transition-all"
                  >
                    <CheckCircle className="w-3 h-3" /> DEVOLVER
                  </button>
                )}
              </div>
            )}
          />
        )}
      </div>

      {/* Redesigned Smart Loan Modal (Multi-item + Non-clipped Dropdowns) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="REGISTRAR NUEVO PRÉSTAMO"
        maxWidth="max-w-3xl"
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

          {/* SECTION 1: STUDENT IDENTIFICATION BY CODE OR NAME */}
          <div className="bg-slate-50 p-5 rounded-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-display font-black text-[#002b45] uppercase tracking-wider">
                <User className="w-4 h-4 text-[#9ABE00]" /> 1. Identificación del Estudiante
              </label>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Ingresa Código de Matrícula o Nombre
              </span>
            </div>

            {!selectedEstudiante ? (
              <div className="relative" ref={studentDropdownRef}>
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={studentQuery}
                    onChange={handleStudentQueryChange}
                    onFocus={() => setIsStudentDropdownOpen(true)}
                    placeholder="Escribe el código (ej. 2021000001) o apellidos del estudiante..."
                    className="w-full pl-10 pr-16 py-3 bg-white border-2 border-brand-border rounded-sm focus:outline-none focus:border-[#9ABE00] font-sans text-sm text-[#002b45] font-medium"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    {studentQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setStudentQuery('');
                          setIsStudentDropdownOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-sm"
                        title="Limpiar texto"
                      >
                        <CloseIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsStudentDropdownOpen((prev) => !prev)}
                      className="p-1.5 text-slate-400 hover:text-[#002b45] rounded-sm transition-colors"
                      title={isStudentDropdownOpen ? 'Cerrar lista' : 'Abrir lista'}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isStudentDropdownOpen ? 'rotate-180 text-[#9ABE00]' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {isStudentDropdownOpen && (
                  <div className="absolute z-[999] w-full mt-1 bg-white border border-slate-200 rounded-sm shadow-2xl max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {filteredEstudiantes.length > 0 ? (
                      filteredEstudiantes.map((est) => (
                        <div
                          key={est.id}
                          onClick={() => handleSelectStudent(est)}
                          className="px-4 py-3 hover:bg-[#002b45] hover:text-white cursor-pointer transition-colors group flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="font-bold text-sm group-hover:text-white text-[#002b45]">
                              {est.nombre}
                            </div>
                            <div className="text-[11px] text-slate-400 group-hover:text-white/80 flex items-center gap-2 mt-0.5">
                              <span>{est.email || 'Sin correo registrado'}</span>
                              {est.ciclo && <span>• Ciclo {est.ciclo}</span>}
                            </div>
                          </div>
                          <span className="px-2.5 py-1 bg-[#9ABE00]/15 text-[#002b45] group-hover:bg-[#9ABE00] group-hover:text-[#002b45] font-mono font-black text-xs rounded-sm flex-shrink-0">
                            {est.matricula}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-xs text-slate-400">
                        No se encontró ningún estudiante con "{studentQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Auto-filled Student Card */
              <div className="bg-white p-4 rounded-sm border-l-4 border-[#9ABE00] shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#002b45] text-white font-display font-black text-sm flex items-center justify-center flex-shrink-0">
                    {selectedEstudiante.nombre
                      .split(' ')
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-display font-black text-[#002b45] text-sm uppercase">
                        {selectedEstudiante.nombre}
                      </h4>
                      <span className="px-2 py-0.5 bg-[#9ABE00]/20 text-[#002b45] font-mono font-black text-xs rounded-sm">
                        CÓDIGO: {selectedEstudiante.matricula}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      {selectedEstudiante.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-[#002b45]" />
                          {selectedEstudiante.email}
                        </span>
                      )}
                      {selectedEstudiante.ciclo && (
                        <span className="flex items-center gap-1 font-bold text-[#002b45]">
                          <GraduationCap className="w-3.5 h-3.5 text-[#9ABE00]" />
                          Ciclo {selectedEstudiante.ciclo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearStudent}
                  className="px-3 py-1.5 text-[10px] font-display font-black uppercase tracking-wider text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-sm border border-slate-200 transition-colors flex-shrink-0"
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>

          {/* SECTION 2: SMART MULTI-ITEM & LABORATORY SEARCH */}
          <div className="bg-slate-50 p-5 rounded-sm border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-xs font-display font-black text-[#002b45] uppercase tracking-wider">
                <Package className="w-4 h-4 text-[#9ABE00]" /> 2. Agregar Equipos, Materiales o Reactivos ({selectedEquiposList.length})
              </label>

              {/* Optional Lab Filter */}
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#9ABE00]" />
                <select
                  name="ambiente_id"
                  value={formData.ambiente_id}
                  onChange={handleInputChange}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-sm text-[11px] font-bold text-[#002b45] uppercase focus:outline-none focus:border-[#9ABE00]"
                >
                  <option value="">Todos los Laboratorios / Almacenes</option>
                  {ambientes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Input that stays available to add 1 or multiple items */}
            <div className="relative" ref={equipoDropdownRef}>
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={equipoQuery}
                  onChange={(e) => {
                    setEquipoQuery(e.target.value);
                    setIsEquipoDropdownOpen(true);
                    if (error) setError(null);
                  }}
                  onFocus={() => setIsEquipoDropdownOpen(true)}
                  placeholder="Busca y haz clic para añadir uno o varios ítems (ej. Microscopio, Matraz, Balanza)..."
                  className="w-full pl-10 pr-16 py-3 bg-white border-2 border-brand-border rounded-sm focus:outline-none focus:border-[#9ABE00] font-sans text-sm text-[#002b45] font-medium"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  {equipoQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setEquipoQuery('');
                        setIsEquipoDropdownOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-sm"
                      title="Limpiar búsqueda"
                    >
                      <CloseIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsEquipoDropdownOpen((prev) => !prev)}
                    className="p-1.5 text-slate-400 hover:text-[#002b45] rounded-sm transition-colors"
                    title={isEquipoDropdownOpen ? 'Cerrar lista' : 'Abrir lista'}
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isEquipoDropdownOpen ? 'rotate-180 text-[#9ABE00]' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              {isEquipoDropdownOpen && (
                <div className="absolute z-[999] w-full mt-1 bg-white border border-slate-200 rounded-sm shadow-2xl max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {equiposDisponibles.length > 0 ? (
                    equiposDisponibles.map((eq) => {
                      const info = getItemTotalInfo(eq);
                      const labName = getAmbienteNombre(
                        eq.ambiente_id,
                        eq.ambiente?.nombre
                      );
                      return (
                        <div
                          key={eq.id}
                          onClick={() => handleAddEquipo(eq)}
                          className="px-4 py-3 hover:bg-[#002b45] hover:text-white cursor-pointer transition-colors group flex items-center justify-between gap-3"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#002b45] group-hover:text-white">
                                {eq.nombre}
                              </span>
                              <span className="text-[10px] font-mono font-black text-[#9ABE00] uppercase">
                                {eq.codigo}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 group-hover:text-white/80">
                              <span className="inline-flex items-center gap-1 font-bold text-[#002b45] group-hover:text-[#9ABE00]">
                                <MapPin className="w-3 h-3" /> {labName}
                              </span>
                              <span>• {info.presentacionLabel}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="px-2.5 py-1 bg-slate-100 text-[#002b45] group-hover:bg-white/15 group-hover:text-white font-display font-black text-[11px] rounded-sm">
                              {info.fullTotalLabel}
                            </span>
                            <span className="px-2 py-1 bg-[#9ABE00] text-[#002b45] font-display font-black text-[10px] rounded-sm uppercase">
                              + Añadir
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-6 text-center text-xs text-slate-400">
                      No hay más equipos o materiales disponibles que coincidan con la búsqueda.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Items List (1 or Multiple) */}
            {selectedEquiposList.length > 0 ? (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-display font-black text-[#002b45] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#9ABE00]" />
                    Ítems a prestar en esta solicitud ({selectedEquiposList.length})
                  </span>
                  {selectedEquiposList.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, equipo_ids: [] }))
                      }
                      className="text-[10px] font-bold text-red-500 hover:underline uppercase"
                    >
                      Quitar todos
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                  {selectedEquiposList.map((eq) => {
                    const info = getItemTotalInfo(eq);
                    const labName = getAmbienteNombre(
                      eq.ambiente_id,
                      eq.ambiente?.nombre
                    );
                    return (
                      <div
                        key={eq.id}
                        className="bg-white p-3 rounded-sm border-l-4 border-[#002b45] border border-slate-200 shadow-sm flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 rounded-sm border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {eq.imagen_url ? (
                              <img
                                src={eq.imagen_url}
                                alt={eq.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : eq.tipo_item === 'reactivo' ? (
                              <FlaskConical className="w-5 h-5 text-[#002b45]" />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-display font-black text-[#002b45] text-xs uppercase">
                                {eq.nombre}
                              </span>
                              <span className="px-1.5 py-0.5 bg-[#002b45]/10 text-[#002b45] font-mono font-black text-[10px] rounded-sm">
                                {eq.codigo}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] mt-0.5">
                              <span className="inline-flex items-center gap-1 font-bold text-[#002b45] bg-[#9ABE00]/20 px-1.5 py-0.5 rounded-sm">
                                <MapPin className="w-3 h-3 text-[#002b45]" />
                                {labName}
                              </span>
                              <span className="text-slate-500 font-bold">
                                • {info.presentacionLabel} ({info.fullTotalLabel})
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEquipo(eq.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors flex-shrink-0"
                          title="Quitar de la lista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white/70 border border-dashed border-slate-200 rounded-sm p-4 text-center text-xs text-slate-400">
                Aún no has agregado ningún ítem. Usa el buscador de arriba para seleccionar uno o varios equipos/materiales.
              </div>
            )}
          </div>

          {/* SECTION 3: OPTIONAL OBSERVATIONS */}
          <div>
            <FormInput
              label="OBSERVACIONES / PROPÓSITO DE LA PRÁCTICA (OPCIONAL)"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              placeholder="Ej: Práctica de Química Analítica - Grupo B, entrega en buen estado..."
            />
          </div>

          {/* MODAL ACTIONS */}
          <div className="flex gap-4 pt-2">
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
              className="!bg-[#002b45] hover:!bg-[#9ABE00] hover:!text-[#002b45]"
            >
              {isSaving
                ? 'PROCESANDO...'
                : selectedEquiposList.length > 1
                ? `CONFIRMAR PRÉSTAMO (${selectedEquiposList.length} ÍTEMS)`
                : 'CONFIRMAR PRÉSTAMO'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Devolution Modal */}
      <ConfirmationModal
        isOpen={isDevolverModalOpen}
        onClose={() => setIsDevolverModalOpen(false)}
        onConfirm={handleDevolver}
        title="DEVOLVER EQUIPO / MATERIAL"
        message="¿Estás seguro de que deseas marcar este préstamo como devuelto? El ítem volverá a figurar como disponible en su laboratorio."
        confirmText="CONFIRMAR DEVOLUCIÓN"
      />
    </div>
  );
}
