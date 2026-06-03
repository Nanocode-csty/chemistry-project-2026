'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/supabase';
import { Plus, Trash2, CheckCircle, AlertCircle, Calendar, Search, Filter, History, Clock } from 'lucide-react';
import {
  Modal,
  FormSelect,
  SearchableSelect,
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
    equipo_id: '',
    estudiante_id: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [tab, setTab] = useState('activos'); // activos | todos
  const [searchTerm, setSearchTerm] = useState('');

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

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleNew = () => {
    setFormData({ ambiente_id: '', equipo_id: '', estudiante_id: '' });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.equipo_id || !formData.estudiante_id) {
      setError('Debes seleccionar un equipo y un estudiante');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { error: saveError } = await dbOperations.crearPrestamo(
        parseInt(formData.equipo_id),
        parseInt(formData.estudiante_id)
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
      const { error: devolverError } = await dbOperations.devolverPrestamo(selectedPrestamoId);
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

  const prestamosFiltrados = (tab === 'activos'
    ? prestamos.filter((p) => !p.fecha_devolucion)
    : prestamos
  ).filter(p => 
    p.equipo?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.equipo?.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.estudiante?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.estudiante?.matricula.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const equiposDisponiblesPorAmbiente = equipos.filter((e) => {
    const disponible = e.estado === 'disponible';
    const matchesAmbiente = formData.ambiente_id ? e.ambiente_id === parseInt(formData.ambiente_id) : true;
    return disponible && matchesAmbiente;
  });

  const columns = [
    {
      key: 'fechaPrestamo',
      label: 'Registro',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-brand-navy">
            {new Date(row.fecha_prestamo).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
          </span>
          <span className="text-[10px] text-gray-400 font-bold uppercase">
            {new Date(row.fecha_prestamo).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ),
    },
    {
      key: 'equipo',
      label: 'Equipo / Código',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-brand-navy">{row.equipo?.nombre || 'N/A'}</span>
          <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest">{row.equipo?.codigo || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'estudiante',
      label: 'Estudiante / Matrícula',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-700">{row.estudiante?.nombre || 'N/A'}</span>
          <span className="text-[10px] font-mono font-bold text-gray-400">{row.estudiante?.matricula || 'N/A'}</span>
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
              <span className="text-xs font-bold text-gray-400 uppercase">Devuelto el</span>
              <span className="text-xs text-gray-500">{new Date(row.fecha_devolucion).toLocaleDateString('es-MX')}</span>
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
            <h1 className="text-3xl font-black text-brand-navy tracking-tight uppercase">Préstamos</h1>
            <p className="text-brand-teal font-bold text-xs tracking-widest uppercase mt-1">Control de Salidas y Devoluciones</p>
          </div>
        </div>
        <Button onClick={handleNew} variant="primary">
          <Plus className="w-5 h-5 mr-2 inline" /> NUEVO PRÉSTAMO
        </Button>
      </div>

      {/* Tabs and Search */}
      <div className="bg-white p-2 rounded-lg shadow-sm border border-brand-border flex flex-col lg:flex-row items-center gap-4">
        <div className="flex p-1 bg-brand-gray rounded-sm w-full lg:w-auto">
          <button
            onClick={() => setTab('activos')}
            className={`flex-1 lg:flex-none px-6 py-2.5 rounded-sm font-display font-bold text-xs tracking-widest transition-all ${
              tab === 'activos'
                ? 'bg-white text-brand-navy shadow-sm'
                : 'text-gray-500 hover:text-brand-navy'
            }`}
          >
            ACTIVOS
          </button>
          <button
            onClick={() => setTab('todos')}
            className={`flex-1 lg:flex-none px-6 py-2.5 rounded-sm font-display font-bold text-xs tracking-widest transition-all ${
              tab === 'todos'
                ? 'bg-white text-brand-navy shadow-sm'
                : 'text-gray-500 hover:text-brand-navy'
            }`}
          >
            HISTORIAL
          </button>
        </div>
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por equipo, código, estudiante o matrícula..."
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
        ) : prestamosFiltrados.length === 0 ? (
          <div className="p-20 text-center">
            <div className="bg-brand-gray inline-block p-6 rounded-full mb-6">
              {tab === 'activos' ? <Clock className="w-12 h-12 text-gray-400" /> : <History className="w-12 h-12 text-gray-400" />}
            </div>
            <h3 className="text-xl font-bold text-brand-navy mb-2 uppercase">
              {tab === 'activos' ? 'No hay préstamos activos' : 'Historial vacío'}
            </h3>
            <p className="text-gray-500">
              {tab === 'activos' 
                ? 'Todos los equipos están disponibles o en mantenimiento.' 
                : 'Aún no se han registrado movimientos en el sistema.'}
            </p>
            {(searchTerm) && (
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

      {/* New Loan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="REGISTRAR NUEVO PRÉSTAMO"
      >
        <div className="space-y-6">
          <FormSelect
            label="1. FILTRAR POR LABORATORIO (OPCIONAL)"
            name="ambiente_id"
            value={formData.ambiente_id}
            onChange={handleInputChange}
            options={ambientes}
            placeholder="Todos los ambientes"
          />
          
          <FormSelect
            label="2. SELECCIONAR EQUIPO DISPONIBLE"
            name="equipo_id"
            value={formData.equipo_id}
            onChange={handleInputChange}
            options={equiposDisponiblesPorAmbiente.map(e => ({ id: e.id, nombre: `${e.nombre} [${e.codigo}]` }))}
            placeholder={equiposDisponiblesPorAmbiente.length === 0 ? "No hay equipos disponibles" : "Selecciona un equipo..."}
            required
          />

          <FormSelect
            label="3. SELECCIONAR ESTUDIANTE"
            name="estudiante_id"
            value={formData.estudiante_id}
            onChange={handleInputChange}
            options={estudiantes}
            placeholder="Busca al estudiante..."
            required
          />

          <div className="bg-brand-gray/30 p-4 rounded-sm border-l-4 border-brand-accent">
            <p className="text-[10px] font-black text-brand-navy uppercase tracking-widest mb-1">Nota importante</p>
            <p className="text-xs text-gray-600">Al registrar el préstamo, el estado del equipo cambiará automáticamente a <span className="font-bold text-brand-navy">OCUPADO</span>.</p>
          </div>

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
              disabled={isSaving || !formData.equipo_id || !formData.estudiante_id}
              fullWidth
            >
              {isSaving ? 'REGISTRANDO...' : 'CONFIRMAR PRÉSTAMO'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Return Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDevolverModalOpen}
        onClose={() => setIsDevolverModalOpen(false)}
        onConfirm={handleDevolver}
        title="CONFIRMAR DEVOLUCIÓN"
        message="¿El equipo ha sido entregado en buenas condiciones? Esta acción marcará el equipo como disponible nuevamente."
        confirmText="SÍ, DEVOLVER"
        variant="success"
      />
    </div>
  );
}
