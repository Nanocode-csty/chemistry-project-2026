'use client';

import { useState, useEffect, useRef } from 'react';
import { dbOperations } from '@/lib/api';
import { getItemTotalInfo } from '@/lib/units';
import {
  Plus,
  Minus,
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
  FileText,
  Scale,
  BookOpen,
  Building2,
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

const AREAS_ACADEMICAS = [
  'Área de Química Orgánica',
  'Área de Química Analítica e Instrumental',
  'Área de Físico-Química y Procesos',
  'Área de Bioquímica y Biotecnología',
  'Área de Química General e Inorgánica',
  'Área de Ingeniería Ambiental y Materiales',
];

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

  const defaultMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const [formData, setFormData] = useState({
    tipo_movimiento: 'consumo_curso', // 'consumo_curso' | 'prestamo'
    ambiente_id: '',
    items: [], // Array of { equipo_id, cantidad_prestada }
    estudiante_id: '',
    area_academica: '',
    curso_asignatura: '',
    periodo_mes: defaultMonth,
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
  const [filterPeriodo, setFilterPeriodo] = useState('');
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
      tipo_movimiento: 'consumo_curso',
      ambiente_id: '',
      items: [],
      estudiante_id: '',
      area_academica: '',
      curso_asignatura: '',
      periodo_mes: new Date().toISOString().slice(0, 7),
      observaciones: '',
    });
    setStudentQuery('');
    setEquipoQuery('');
    setIsStudentDropdownOpen(false);
    setIsEquipoDropdownOpen(false);
    setError(null);
    setIsModalOpen(true);
  };

  // Auto-match coordinator or student when exact code/matricula is typed
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
        handleSelectStudent(exactMatch);
      }
    }
  };

  const handleSelectStudent = (est) => {
    const defaultCourses = est.cursos_asignados
      ? est.cursos_asignados
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
      : [];

    setFormData((prev) => ({
      ...prev,
      estudiante_id: est.id,
      area_academica:
        est.area_coordinacion || prev.area_academica || AREAS_ACADEMICAS[0],
      curso_asignatura: defaultCourses[0] || prev.curso_asignatura || '',
    }));
    setStudentQuery(`${est.matricula} — ${est.nombre}`);
    setIsStudentDropdownOpen(false);
    if (error) setError(null);
  };

  const handleClearStudent = () => {
    setFormData((prev) => ({
      ...prev,
      estudiante_id: '',
      area_academica: '',
      curso_asignatura: '',
    }));
    setStudentQuery('');
    setIsStudentDropdownOpen(true);
  };

  // Add item to multi-loan list with default quantity = 1
  const handleAddEquipo = (eq) => {
    setFormData((prev) => {
      const exists = prev.items.find((it) => it.equipo_id === eq.id);
      if (exists) return prev;
      return {
        ...prev,
        items: [...prev.items, { equipo_id: eq.id, cantidad_prestada: 1 }],
      };
    });
    setEquipoQuery('');
    setIsEquipoDropdownOpen(false);
    if (error) setError(null);
  };

  // Update requested quantity for an item (clamped between 1 and max available stock)
  const handleUpdateCantidadItem = (equipoId, newQty, maxStock) => {
    const parsed = parseInt(newQty);
    const safeMax = Math.max(1, parseInt(maxStock) || 1);
    const clamped = isNaN(parsed) ? 1 : Math.min(Math.max(1, parsed), safeMax);

    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((it) =>
        it.equipo_id === equipoId ? { ...it, cantidad_prestada: clamped } : it
      ),
    }));
  };

  const handleRemoveEquipo = (idToRemove) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.equipo_id !== idToRemove),
    }));
  };

  const handleSave = async () => {
    if (!formData.estudiante_id) {
      setError(
        'Debes seleccionar al Coordinador de Área o Solicitante responsable'
      );
      return;
    }
    if (
      formData.tipo_movimiento === 'consumo_curso' &&
      !formData.curso_asignatura.trim()
    ) {
      setError(
        'Indica el nombre del Curso / Asignatura para el cual se coordinan los insumos'
      );
      return;
    }
    if (!formData.items || formData.items.length === 0) {
      setError(
        'Debes agregar al menos un reactivo, material o equipo a la programación'
      );
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { error: saveError } = await dbOperations.crearPrestamo(
        formData.items,
        parseInt(formData.estudiante_id),
        formData.observaciones.trim(),
        {
          tipo_movimiento: formData.tipo_movimiento,
          curso_asignatura: formData.curso_asignatura.trim() || null,
          area_academica: formData.area_academica.trim() || null,
          periodo_mes: formData.periodo_mes || defaultMonth,
        }
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
    return Math.max(0, dias);
  };

  const formatMesReporteSiguiente = (periodoMesStr, fechaPrestamo) => {
    const base =
      periodoMesStr ||
      (fechaPrestamo ? new Date(fechaPrestamo).toISOString().slice(0, 7) : '');
    if (!base || !base.includes('-')) return { consumo: 'N/A', reporte: 'N/A' };
    const [y, m] = base.split('-').map(Number);
    const meses = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    const nextDate = new Date(y, m, 1); // m is 1-based so Date(y, m, 1) is next month!
    return {
      consumo: `${meses[m - 1] || m} ${y}`,
      reporte: `${meses[nextDate.getMonth()]} ${nextDate.getFullYear()}`,
    };
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
      p.estudiante?.matricula?.toLowerCase().includes(search) ||
      p.curso_asignatura?.toLowerCase().includes(search) ||
      p.area_academica?.toLowerCase().includes(search);

    const matchesAmbiente =
      !filterAmbiente ||
      String(p.equipo?.ambiente_id) === String(filterAmbiente);

    const pMes =
      p.periodo_mes ||
      (p.fecha_prestamo ? String(p.fecha_prestamo).slice(0, 7) : '');
    const matchesPeriodo = !filterPeriodo || pMes === filterPeriodo;

    return matchesSearch && matchesAmbiente && matchesPeriodo;
  });

  // Filtered coordinators & students for autocomplete
  const filteredEstudiantes = estudiantes.filter((est) => {
    const q = studentQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      est.matricula?.toLowerCase().includes(q) ||
      est.nombre?.toLowerCase().includes(q) ||
      est.area_coordinacion?.toLowerCase().includes(q) ||
      est.cursos_asignados?.toLowerCase().includes(q) ||
      est.email?.toLowerCase().includes(q)
    );
  });

  // Filtered available equipment/materials/reagents across all labs
  const selectedIdsSet = new Set(formData.items.map((it) => it.equipo_id));
  const equiposDisponibles = equipos.filter((e) => {
    const disponible =
      e.estado === 'disponible' && (parseInt(e.cantidad) || 1) > 0;
    const notAlreadySelected = !selectedIdsSet.has(e.id);
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

  // Courses suggested from the selected coordinator
  const coordinatorSuggestedCourses = selectedEstudiante?.cursos_asignados
    ? selectedEstudiante.cursos_asignados
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  const selectedItemsDetailed = formData.items
    .map((it) => {
      const eq = equipos.find((e) => e.id === it.equipo_id);
      if (!eq) return null;
      const maxStock = Math.max(1, parseInt(eq.cantidad) || 1);
      const cantPrestada = Math.min(it.cantidad_prestada, maxStock);
      const borrowedInfo = getItemTotalInfo({
        ...eq,
        cantidad: cantPrestada,
      });
      const stockInfo = getItemTotalInfo(eq);
      return {
        ...eq,
        maxStock,
        cantidad_prestada: cantPrestada,
        borrowedInfo,
        stockInfo,
      };
    })
    .filter(Boolean);

  // Calculate Ticket/Boleta Consolidated Summary
  const calcularResumenBoleta = () => {
    let totalEquiposUnidades = 0;
    let totalCristaleriaPiezas = 0;
    let totalSeguridadUnidades = 0;
    let totalReactivosEnvases = 0;
    let totalMasaMg = 0;
    let hasMasa = false;
    let totalVolumenMl = 0;
    let hasVolumen = false;
    const otrosReactivos = [];

    const MASS_TO_MG = { mg: 1, g: 1000, kg: 1000000 };
    const VOLUME_TO_ML = { 'µL': 0.001, uL: 0.001, mL: 1, L: 1000 };

    for (const item of selectedItemsDetailed) {
      const tipo = item.tipo_item || 'equipo';
      const cant = item.cantidad_prestada;
      const cap = parseFloat(item.capacidad) || 1;
      const und = item.unidad_medida || 'und';

      if (tipo === 'equipo') {
        totalEquiposUnidades += cant;
      } else if (tipo === 'seguridad') {
        totalSeguridadUnidades +=
          cant * (item.presentacion !== 'Unidad' && und === 'und' ? cap : 1);
      } else if (tipo === 'material') {
        totalCristaleriaPiezas += cant;
      } else if (tipo === 'reactivo') {
        totalReactivosEnvases += cant;
        const neto = cant * cap;
        if (MASS_TO_MG[und] !== undefined) {
          hasMasa = true;
          totalMasaMg += neto * MASS_TO_MG[und];
        } else if (VOLUME_TO_ML[und] !== undefined) {
          hasVolumen = true;
          totalVolumenMl += neto * VOLUME_TO_ML[und];
        } else {
          otrosReactivos.push(`${neto} ${und}`);
        }
      }
    }

    const formatNum = (n) =>
      Number(n.toFixed(2)).toLocaleString('es-PE', {
        maximumFractionDigits: 2,
      });

    let masaLabel = null;
    if (hasMasa) {
      masaLabel =
        totalMasaMg >= 1000
          ? `${formatNum(totalMasaMg / 1000)} g (${formatNum(totalMasaMg)} mg)`
          : `${formatNum(totalMasaMg)} mg`;
    }

    let volumenLabel = null;
    if (hasVolumen) {
      volumenLabel =
        totalVolumenMl >= 1000
          ? `${formatNum(totalVolumenMl / 1000)} L (${formatNum(
              totalVolumenMl
            )} mL)`
          : `${formatNum(totalVolumenMl)} mL`;
    }

    return {
      totalItemsDistintos: selectedItemsDetailed.length,
      totalUnidadesFisicas: selectedItemsDetailed.reduce(
        (acc, it) => acc + it.cantidad_prestada,
        0
      ),
      totalEquiposUnidades,
      totalCristaleriaPiezas,
      totalSeguridadUnidades,
      totalReactivosEnvases,
      masaLabel,
      volumenLabel,
      otrosReactivos,
    };
  };

  const resumenBoleta = calcularResumenBoleta();

  const getAmbienteNombre = (ambienteId, fallbackName) => {
    if (fallbackName) return fallbackName;
    const amb = ambientes.find((a) => String(a.id) === String(ambienteId));
    return amb ? amb.nombre : 'Laboratorio General';
  };

  const columns = [
    {
      key: 'fechaPrestamo',
      label: 'Mes Consumo / Reporte',
      render: (row) => {
        const periodo = formatMesReporteSiguiente(
          row.periodo_mes,
          row.fecha_prestamo
        );
        return (
          <div className="flex flex-col">
            <span className="font-bold text-brand-navy text-xs uppercase">
              Consumo: {periodo.consumo}
            </span>
            <span className="text-[10px] font-black text-[#9ABE00] uppercase tracking-wider">
              Se reporta: {periodo.reporte}
            </span>
            <span className="text-[10px] text-gray-400 font-medium mt-0.5">
              Reg:{' '}
              {new Date(row.fecha_prestamo).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'short',
              })}
            </span>
          </div>
        );
      },
    },
    {
      key: 'coordinador',
      label: 'QUIÉN (Coordinador / Área / Curso)',
      render: (row) => {
        const isCoord =
          (row.estudiante?.tipo_solicitante || 'coordinador') === 'coordinador';
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-[#002b45] text-xs uppercase">
                {row.estudiante?.nombre || 'N/A'}
              </span>
              <span className="text-[10px] font-mono font-bold text-[#002b45] bg-[#002b45]/10 px-1.5 py-0.5 rounded-sm">
                {row.estudiante?.matricula || 'N/A'}
              </span>
            </div>
            <span className="text-[10px] font-bold text-brand-teal uppercase">
              {row.area_academica ||
                row.estudiante?.area_coordinacion ||
                (isCoord ? 'Coordinación de Área' : 'Práctica Académica')}
            </span>
            {row.curso_asignatura && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#002b45] bg-[#9ABE00]/20 px-2 py-0.5 rounded-sm w-fit mt-0.5">
                <BookOpen className="w-2.5 h-2.5 text-[#002b45]" /> Curso:{' '}
                {row.curso_asignatura}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'equipo',
      label: 'QUÉ Y CUÁNTO (Material / Reactivo / Cantidad)',
      render: (row) => {
        const cantPrestada = parseInt(row.cantidad_prestada) || 1;
        const info = row.equipo
          ? getItemTotalInfo({ ...row.equipo, cantidad: cantPrestada })
          : null;
        const labName = getAmbienteNombre(
          row.equipo?.ambiente_id,
          row.equipo?.ambiente_nombre
        );
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-brand-navy text-xs uppercase">
                {row.equipo?.nombre || 'N/A'}
              </span>
              {info && (
                <span className="px-2 py-0.5 bg-[#002b45] text-[#9ABE00] font-display font-black text-[10px] rounded-sm uppercase">
                  CUÁNTO: {info.fullTotalLabel}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest">
                {row.equipo?.codigo || 'N/A'}
              </span>
              {info && !info.isSimpleUnit && (
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  • {info.envasesLabel} ({info.presentacionLabel})
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
      key: 'estado',
      label: 'Estado / Control',
      render: (row) => (
        <div className="flex flex-col items-start gap-1">
          <Badge color={row.fecha_devolucion ? 'gray' : 'blue'}>
            {row.fecha_devolucion
              ? 'CERRADO / DEVUELTO'
              : row.tipo_movimiento === 'consumo_curso'
              ? 'DOTACIÓN DE CURSO'
              : 'EN PRÉSTAMO'}
          </Badge>
          <span className="text-[10px] text-slate-400 font-bold">
            {row.fecha_devolucion
              ? `Cerrado: ${new Date(row.fecha_devolucion).toLocaleDateString(
                  'es-PE'
                )}`
              : isMounted
              ? `Hace ${calcularDias(row.fecha_prestamo)} días`
              : '...'}
          </span>
        </div>
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
              Programación de Consumo por Curso y Préstamos
            </h1>
            <p className="text-brand-teal font-bold text-xs tracking-widest uppercase mt-1">
              Solicitudes de Coordinadores de Área (Quién, Qué y Cuánto) para el Desarrollo de Cursos
            </p>
          </div>
        </div>
        <Button onClick={handleNew} variant="primary">
          <Plus className="w-5 h-5 mr-2 inline" /> REGISTRAR DOTACIÓN / PRÉSTAMO
        </Button>
      </div>

      {/* Tabs, Search, Period and Lab Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-brand-border flex flex-col lg:flex-row items-center gap-4">
        <div className="flex p-1 bg-brand-gray rounded-sm w-full lg:w-auto">
          <button
            onClick={() => setTab('activos')}
            className={`flex-1 lg:flex-none px-5 py-2.5 rounded-sm font-display font-bold text-xs tracking-widest transition-all ${
              tab === 'activos'
                ? 'bg-white text-brand-navy shadow-sm'
                : 'text-gray-500 hover:text-brand-navy'
            }`}
          >
            VIGENTES ({prestamos.filter((p) => !p.fecha_devolucion).length})
          </button>
          <button
            onClick={() => setTab('todos')}
            className={`flex-1 lg:flex-none px-5 py-2.5 rounded-sm font-display font-bold text-xs tracking-widest transition-all ${
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
            placeholder="Buscar por coordinador, curso, área, reactivo o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-brand-gray/30 border-2 border-transparent focus:border-brand-accent rounded-sm outline-none transition-all font-sans text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <input
            type="month"
            value={filterPeriodo}
            onChange={(e) => setFilterPeriodo(e.target.value)}
            className="px-3 py-2.5 bg-brand-gray/30 border border-brand-border rounded-sm text-xs font-bold text-[#002b45]"
            title="Filtrar por mes de consumo"
          />
          <select
            value={filterAmbiente}
            onChange={(e) => setFilterAmbiente(e.target.value)}
            className="w-full lg:w-56 px-3 py-3 bg-brand-gray/30 border border-transparent focus:border-brand-accent rounded-sm outline-none font-sans text-xs font-bold text-gray-600 uppercase"
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
              No se encontraron registros de consumo o préstamo
            </h3>
            <p className="text-gray-500">
              Registra una nueva dotación de curso solicitada por un Coordinador de Área.
            </p>
            {(searchTerm || filterAmbiente || filterPeriodo) && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm('');
                  setFilterAmbiente('');
                  setFilterPeriodo('');
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
                    className="flex items-center gap-1.5 px-3 py-2 bg-brand-teal/10 text-brand-teal hover:bg-brand-teal hover:text-white rounded-sm font-display font-bold text-[10px] tracking-widest transition-all"
                    title="Marcar retorno de material o cierre de asignación"
                  >
                    <CheckCircle className="w-3 h-3" /> DEVOLVER / CERRAR
                  </button>
                )}
              </div>
            )}
          />
        )}
      </div>

      {/* Redesigned Smart Modal: Coordinator + Course Planning + Multi-item Quantities + Boleta */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="SOLICITUD DE DOTACIÓN POR COORDINADOR DE ÁREA / PRÉSTAMO"
        maxWidth="max-w-5xl"
      >
        <div className="space-y-5">
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

          {/* Modal Mode Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-100 p-1.5 rounded-sm">
            {[
              {
                id: 'consumo_curso',
                title: '1. Programación de Consumo para Curso (Coordinador de Área)',
                subtitle: 'Se registra Quién, Qué y Cuánto se tomará para el curso y se reporta al mes siguiente',
              },
              {
                id: 'prestamo',
                title: '2. Préstamo Temporal de Equipos / Cristalería',
                subtitle: 'Salida de instrumentos o materiales retornables con devolución de stock',
              },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, tipo_movimiento: m.id }))
                }
                className={`p-3 rounded-sm text-left transition-all ${
                  formData.tipo_movimiento === m.id
                    ? 'bg-[#002b45] text-white shadow-md'
                    : 'bg-white/60 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="font-display font-black text-xs uppercase tracking-wider">
                  {m.title}
                </div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    formData.tipo_movimiento === m.id
                      ? 'text-[#9ABE00]'
                      : 'text-slate-400'
                  }`}
                >
                  {m.subtitle}
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN (7/12): COORDINATOR + COURSE + ITEM QUANTITIES */}
            <div className="lg:col-span-7 space-y-4">
              {/* SECTION 1: COORDINATOR / REQUESTER IDENTIFICATION */}
              <div className="bg-slate-50 p-4 rounded-sm border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-display font-black text-[#002b45] uppercase tracking-wider">
                    <User className="w-4 h-4 text-[#9ABE00]" /> 1. ¿Quién Solicita? (Coordinador de Área / Docente)
                  </label>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Por Código (COORD-...) o Nombre
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
                        placeholder="Busca al Coordinador de Área (ej. COORD-ORG1, Dr. Roberto Salazar)..."
                        className="w-full pl-10 pr-16 py-2.5 bg-white border-2 border-brand-border rounded-sm focus:outline-none focus:border-[#9ABE00] font-sans text-sm text-[#002b45] font-medium"
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
                      <div className="absolute z-[999] w-full mt-1 bg-white border border-slate-200 rounded-sm shadow-2xl max-h-64 overflow-y-auto divide-y divide-slate-100">
                        {filteredEstudiantes.length > 0 ? (
                          filteredEstudiantes.map((est) => {
                            const isCoord =
                              (est.tipo_solicitante || 'coordinador') ===
                              'coordinador';
                            return (
                              <div
                                key={est.id}
                                onClick={() => handleSelectStudent(est)}
                                className="px-4 py-3 hover:bg-[#002b45] hover:text-white cursor-pointer transition-colors group flex items-center justify-between gap-3"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm group-hover:text-white text-[#002b45]">
                                      {est.nombre}
                                    </span>
                                    <span
                                      className={`text-[9px] font-display font-black px-1.5 py-0.5 rounded-sm uppercase ${
                                        isCoord
                                          ? 'bg-[#002b45] text-[#9ABE00] group-hover:bg-[#9ABE00] group-hover:text-[#002b45]'
                                          : 'bg-slate-100 text-slate-600 group-hover:bg-white/20 group-hover:text-white'
                                      }`}
                                    >
                                      {isCoord ? 'Coordinador' : 'Estudiante'}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 group-hover:text-white/80 flex flex-wrap items-center gap-2 mt-0.5">
                                    <span className="font-bold">
                                      {est.area_coordinacion || 'Área General'}
                                    </span>
                                    {est.cursos_asignados && (
                                      <span>• Cursos: {est.cursos_asignados}</span>
                                    )}
                                  </div>
                                </div>
                                <span className="px-2.5 py-1 bg-[#9ABE00]/15 text-[#002b45] group-hover:bg-[#9ABE00] group-hover:text-[#002b45] font-mono font-black text-xs rounded-sm flex-shrink-0">
                                  {est.matricula}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-4 py-6 text-center text-xs text-slate-400">
                            No se encontró ningún coordinador o solicitante con "{studentQuery}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Auto-filled Coordinator Card */
                  <div className="bg-white p-3.5 rounded-sm border-l-4 border-[#9ABE00] shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#002b45] text-[#9ABE00] font-display font-black text-xs flex items-center justify-center flex-shrink-0">
                        {selectedEstudiante.nombre
                          .split(' ')
                          .filter((w) => !w.includes('.'))
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display font-black text-[#002b45] text-xs uppercase">
                            {selectedEstudiante.nombre}
                          </h4>
                          <span className="px-2 py-0.5 bg-[#9ABE00]/20 text-[#002b45] font-mono font-black text-[11px] rounded-sm">
                            {selectedEstudiante.matricula}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 mt-0.5">
                          <span className="font-bold text-[#002b45]">
                            {selectedEstudiante.area_coordinacion ||
                              'Coordinación de Área'}
                          </span>
                          {selectedEstudiante.email && (
                            <span className="text-slate-400">
                              • {selectedEstudiante.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearStudent}
                      className="px-2.5 py-1 text-[10px] font-display font-black uppercase tracking-wider text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-sm border border-slate-200 transition-colors flex-shrink-0"
                    >
                      Cambiar
                    </button>
                  </div>
                )}

                {/* Course, Area & Consumption Month Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/70">
                  <div>
                    <label className="block font-display font-bold text-[10px] text-brand-navy tracking-wider mb-1 uppercase">
                      ÁREA ACADÉMICA
                    </label>
                    <select
                      name="area_academica"
                      value={formData.area_academica}
                      onChange={handleInputChange}
                      className="w-full px-2.5 py-2 border border-brand-border rounded-sm bg-white font-bold text-xs text-[#002b45]"
                    >
                      <option value="">Selecciona Área...</option>
                      {AREAS_ACADEMICAS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-display font-bold text-[10px] text-brand-navy tracking-wider mb-1 uppercase">
                      CURSO QUE SE DICTA
                    </label>
                    <input
                      type="text"
                      name="curso_asignatura"
                      list="cursos-sugeridos-list"
                      value={formData.curso_asignatura}
                      onChange={handleInputChange}
                      placeholder="Ej: Química Orgánica I"
                      className="w-full px-2.5 py-2 border border-brand-border rounded-sm bg-white font-bold text-xs text-[#002b45]"
                    />
                    <datalist id="cursos-sugeridos-list">
                      {coordinatorSuggestedCourses.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block font-display font-bold text-[10px] text-brand-navy tracking-wider mb-1 uppercase">
                      MES DE CONSUMO
                    </label>
                    <input
                      type="month"
                      name="periodo_mes"
                      value={formData.periodo_mes}
                      onChange={handleInputChange}
                      className="w-full px-2.5 py-2 border border-brand-border rounded-sm bg-white font-bold text-xs text-[#002b45]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: SMART MULTI-ITEM & QUANTITY SELECTION */}
              <div className="bg-slate-50 p-4 rounded-sm border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-xs font-display font-black text-[#002b45] uppercase tracking-wider">
                    <Package className="w-4 h-4 text-[#9ABE00]" /> 2. ¿Qué y Cuánto se Tomará para el Curso? ({selectedItemsDetailed.length})
                  </label>

                  {/* Optional Lab Filter */}
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#9ABE00]" />
                    <select
                      name="ambiente_id"
                      value={formData.ambiente_id}
                      onChange={handleInputChange}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-sm text-[10px] font-bold text-[#002b45] uppercase focus:outline-none focus:border-[#9ABE00]"
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

                {/* Search Input */}
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
                      placeholder="Busca reactivos, materiales o equipos y haz clic para añadir..."
                      className="w-full pl-10 pr-16 py-2.5 bg-white border-2 border-brand-border rounded-sm focus:outline-none focus:border-[#9ABE00] font-sans text-sm text-[#002b45] font-medium"
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
                    <div className="absolute z-[999] w-full mt-1 bg-white border border-slate-200 rounded-sm shadow-2xl max-h-72 overflow-y-auto divide-y divide-slate-100">
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
                                <span className="px-2 py-1 bg-slate-100 text-[#002b45] group-hover:bg-white/15 group-hover:text-white font-display font-black text-[10px] rounded-sm">
                                  Disp: {info.fullTotalLabel}
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
                          No hay más reactivos, materiales o equipos disponibles con ese criterio.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Items List with Quantity Stepper */}
                {selectedItemsDetailed.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-display font-black text-[#002b45] uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#9ABE00]" />
                        Ajusta cuánto se tomará de cada ítem para el curso
                      </span>
                      {selectedItemsDetailed.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, items: [] }))
                          }
                          className="text-[10px] font-bold text-red-500 hover:underline uppercase"
                        >
                          Vaciar lista
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {selectedItemsDetailed.map((eq) => {
                        const labName = getAmbienteNombre(
                          eq.ambiente_id,
                          eq.ambiente?.nombre
                        );
                        return (
                          <div
                            key={eq.id}
                            className="bg-white p-3 rounded-sm border-l-4 border-[#002b45] border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 bg-slate-50 rounded-sm border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                                {eq.imagen_url ? (
                                  <img
                                    src={eq.imagen_url}
                                    alt={eq.nombre}
                                    className="w-full h-full object-cover"
                                  />
                                ) : eq.tipo_item === 'reactivo' ? (
                                  <FlaskConical className="w-4 h-4 text-[#002b45]" />
                                ) : (
                                  <Package className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-display font-black text-[#002b45] text-xs uppercase truncate">
                                    {eq.nombre}
                                  </span>
                                  <span className="px-1.5 py-0.5 bg-[#002b45]/10 text-[#002b45] font-mono font-black text-[9px] rounded-sm">
                                    {eq.codigo}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-[10px] mt-0.5">
                                  <span className="inline-flex items-center gap-1 font-bold text-[#002b45] bg-[#9ABE00]/20 px-1.5 py-0.5 rounded-sm">
                                    <MapPin className="w-2.5 h-2.5 text-[#002b45]" />
                                    {labName}
                                  </span>
                                  <span className="text-slate-400 font-bold">
                                    Stock máx: {eq.maxStock}{' '}
                                    {eq.tipo_item === 'reactivo'
                                      ? eq.presentacion || 'env.'
                                      : 'und.'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Quantity Stepper (- [ N ] +) */}
                            <div className="flex items-center justify-end gap-2 flex-shrink-0">
                              <div className="flex items-center border border-slate-200 rounded-sm bg-slate-50">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateCantidadItem(
                                      eq.id,
                                      eq.cantidad_prestada - 1,
                                      eq.maxStock
                                    )
                                  }
                                  disabled={eq.cantidad_prestada <= 1}
                                  className="px-2 py-1 text-[#002b45] hover:bg-slate-200 disabled:opacity-30 transition-colors"
                                  title="Disminuir cantidad"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max={eq.maxStock}
                                  value={eq.cantidad_prestada}
                                  onChange={(e) =>
                                    handleUpdateCantidadItem(
                                      eq.id,
                                      e.target.value,
                                      eq.maxStock
                                    )
                                  }
                                  className="w-11 text-center bg-white font-display font-black text-xs text-[#002b45] py-1 border-x border-slate-200 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateCantidadItem(
                                      eq.id,
                                      eq.cantidad_prestada + 1,
                                      eq.maxStock
                                    )
                                  }
                                  disabled={eq.cantidad_prestada >= eq.maxStock}
                                  className="px-2 py-1 text-[#002b45] hover:bg-slate-200 disabled:opacity-30 transition-colors"
                                  title="Aumentar cantidad"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveEquipo(eq.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                                title="Quitar de la solicitud"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/70 border border-dashed border-slate-200 rounded-sm p-4 text-center text-xs text-slate-400">
                    Busca arriba y haz clic para añadir los reactivos, materiales o equipos que requerirá el curso.
                  </div>
                )}
              </div>

              {/* SECTION 3: OPTIONAL OBSERVATIONS */}
              <div>
                <FormInput
                  label="DETALLE DE PRÁCTICAS / OBSERVACIONES DEL CURSO"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  placeholder="Ej: Dotación programada para las 4 prácticas del mes en Química Analítica..."
                />
              </div>
            </div>

            {/* RIGHT COLUMN (5/12): BOLETA / FICHA RESUMEN DE DOTACIÓN DE CURSO */}
            <div className="lg:col-span-5">
              <div className="bg-[#002b45] text-white rounded-sm shadow-xl border-t-4 border-[#9ABE00] overflow-hidden flex flex-col">
                {/* Boleta Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-[#9ABE00]" />
                    <div>
                      <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">
                        Ficha de Consumo por Curso
                      </h3>
                      <p className="text-[10px] text-[#9ABE00] uppercase tracking-widest font-bold">
                         Consumo:{' '}
                        {
                          formatMesReporteSiguiente(formData.periodo_mes)
                            .consumo
                        }{' '}
                        → Reporte:{' '}
                        {
                          formatMesReporteSiguiente(formData.periodo_mes)
                            .reporte
                        }
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-[#9ABE00] text-[#002b45] font-display font-black text-[10px] rounded-sm uppercase">
                    {resumenBoleta.totalItemsDistintos}{' '}
                    {resumenBoleta.totalItemsDistintos === 1 ? 'ÍTEM' : 'ÍTEMS'}
                  </span>
                </div>

                {/* Boleta Body */}
                <div className="p-5 space-y-4">
                  {/* QUIÉN: Coordinator & Course Summary */}
                  <div className="bg-white/5 p-3.5 rounded-sm border border-white/10 space-y-1.5">
                    <span className="text-[9px] font-display font-black text-[#9ABE00] uppercase tracking-widest block">
                      ¿QUIÉN SOLICITA? (Coordinador y Curso)
                    </span>
                    {selectedEstudiante ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-white truncate">
                            {selectedEstudiante.nombre}
                          </span>
                          <span className="font-mono font-black text-[11px] text-[#9ABE00] flex-shrink-0">
                            {selectedEstudiante.matricula}
                          </span>
                        </div>
                        <div className="text-[10px] text-white/80 flex flex-col gap-0.5">
                          <span>
                            <strong>Área:</strong>{' '}
                            {formData.area_academica ||
                              selectedEstudiante.area_coordinacion ||
                              'No especificada'}
                          </span>
                          <span>
                            <strong>Curso:</strong>{' '}
                            {formData.curso_asignatura ||
                              'Pendiente de indicar curso'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-white/40 italic block">
                        Selecciona al Coordinador de Área...
                      </span>
                    )}
                  </div>

                  {/* QUÉ Y CUÁNTO: Line Items Breakdown */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-display font-black text-[#9ABE00] uppercase tracking-widest block">
                      ¿QUÉ Y CUÁNTO SE TOMARÁ? (Desglose)
                    </span>

                    {selectedItemsDetailed.length > 0 ? (
                      <div className="divide-y divide-white/10 max-h-52 overflow-y-auto pr-1">
                        {selectedItemsDetailed.map((item, idx) => (
                          <div
                            key={item.id}
                            className="py-2.5 flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="space-y-0.5 min-w-0">
                              <div className="font-bold text-white leading-tight">
                                {idx + 1}. {item.nombre}
                              </div>
                              <div className="text-[10px] text-white/60 flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-[#9ABE00]">
                                  {item.codigo}
                                </span>
                                <span>
                                  •{' '}
                                  {getAmbienteNombre(
                                    item.ambiente_id,
                                    item.ambiente?.nombre
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="px-2 py-0.5 bg-white/10 text-white font-display font-black text-[11px] rounded-sm block">
                                {item.borrowedInfo.fullTotalLabel}
                              </span>
                              {!item.borrowedInfo.isSimpleUnit && (
                                <span className="text-[9px] text-white/60 block mt-0.5">
                                  {item.borrowedInfo.envasesLabel} ×{' '}
                                  {item.capacidad} {item.unidad_medida}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-white/40 text-xs border border-dashed border-white/10 rounded-sm">
                        Añade reactivos o materiales para calcular el consumo del curso.
                      </div>
                    )}
                  </div>

                  {/* Consolidated Totals Box (Unidades, mL, mg/g) */}
                  <div className="bg-white/10 p-4 rounded-sm border border-white/15 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-[10px] font-display font-black text-[#9ABE00] uppercase tracking-widest flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5" /> Total Consumo del Curso
                      </span>
                      <span className="text-xs font-display font-black text-white">
                        {resumenBoleta.totalUnidadesFisicas}{' '}
                        {resumenBoleta.totalUnidadesFisicas === 1
                          ? 'envase/und'
                          : 'envases/und'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      {resumenBoleta.masaLabel && (
                        <div className="bg-[#9ABE00]/20 border border-[#9ABE00]/40 p-2 rounded-sm">
                          <span className="text-[#9ABE00] block text-[9px] uppercase font-black">
                            Masa Total Reactivos
                          </span>
                          <span className="font-display font-black text-white text-xs">
                            {resumenBoleta.masaLabel}
                          </span>
                        </div>
                      )}

                      {resumenBoleta.volumenLabel && (
                        <div className="bg-[#9ABE00]/20 border border-[#9ABE00]/40 p-2 rounded-sm">
                          <span className="text-[#9ABE00] block text-[9px] uppercase font-black">
                            Volumen Total Reactivos
                          </span>
                          <span className="font-display font-black text-white text-xs">
                            {resumenBoleta.volumenLabel}
                          </span>
                        </div>
                      )}

                      {resumenBoleta.totalCristaleriaPiezas > 0 && (
                        <div className="bg-[#001a2a]/60 p-2 rounded-sm">
                          <span className="text-white/60 block text-[9px] uppercase font-bold">
                            Cristalería / Mat.
                          </span>
                          <span className="font-display font-black text-white text-xs">
                            {resumenBoleta.totalCristaleriaPiezas}{' '}
                            {resumenBoleta.totalCristaleriaPiezas === 1
                              ? 'Pieza'
                              : 'Piezas'}
                          </span>
                        </div>
                      )}

                      {resumenBoleta.totalEquiposUnidades > 0 && (
                        <div className="bg-[#001a2a]/60 p-2 rounded-sm">
                          <span className="text-white/60 block text-[9px] uppercase font-bold">
                            Equipos / Instrum.
                          </span>
                          <span className="font-display font-black text-white text-xs">
                            {resumenBoleta.totalEquiposUnidades}{' '}
                            {resumenBoleta.totalEquiposUnidades === 1
                              ? 'Unidad'
                              : 'Unidades'}
                          </span>
                        </div>
                      )}

                      {resumenBoleta.totalSeguridadUnidades > 0 && (
                        <div className="bg-[#001a2a]/60 p-2 rounded-sm">
                          <span className="text-white/60 block text-[9px] uppercase font-bold">
                            Seguridad / EPP
                          </span>
                          <span className="font-display font-black text-white text-xs">
                            {resumenBoleta.totalSeguridadUnidades}{' '}
                            {resumenBoleta.totalSeguridadUnidades === 1
                              ? 'Unidad'
                              : 'Unidades'}
                          </span>
                        </div>
                      )}
                    </div>

                    {resumenBoleta.totalItemsDistintos === 0 && (
                      <p className="text-[11px] text-white/50 text-center py-1">
                        Sin cantidades seleccionadas
                      </p>
                    )}
                  </div>

                  {/* Confirm & Cancel Buttons inside Boleta Footer */}
                  <div className="pt-1 space-y-2">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      fullWidth
                      className="!bg-[#9ABE00] !text-[#002b45] hover:!bg-white hover:!text-[#002b45] !py-3.5 shadow-lg"
                    >
                      {isSaving
                        ? 'REGISTRANDO DOTACIÓN...'
                        : selectedItemsDetailed.length > 0
                        ? `CONFIRMAR DOTACIÓN (${resumenBoleta.totalUnidadesFisicas} UND)`
                        : 'CONFIRMAR DOTACIÓN / PRÉSTAMO'}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="w-full py-2 text-center font-display font-bold text-[11px] uppercase tracking-widest text-white/70 hover:text-white transition-colors"
                    >
                      Cancelar y Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Devolution Modal */}
      <ConfirmationModal
        isOpen={isDevolverModalOpen}
        onClose={() => setIsDevolverModalOpen(false)}
        onConfirm={handleDevolver}
        title="DEVOLVER / CERRAR DOTACIÓN"
        message="¿Deseas registrar el retorno o cierre de este material/equipo? Las unidades retornables se repondrán en el stock del laboratorio."
        confirmText="CONFIRMAR"
      />
    </div>
  );
}
