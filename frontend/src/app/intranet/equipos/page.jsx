'use client';

import { useState, useEffect, useRef } from 'react';
import { dbOperations } from '@/lib/api';
import {
  TIPOS_ITEM,
  PRESENTACIONES,
  UNIDADES_MEDIDA_GRUPOS,
  getItemTotalInfo,
  consolidateInventoryTotals,
} from '@/lib/units';
import {
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  Zap,
  Package,
  Search,
  Filter,
  Info,
  MapPin,
  Tag,
  Upload,
  X as CloseIcon,
  Scale,
  FlaskConical,
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
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function EquiposPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [equipos, setEquipos] = useState([]);

  useEffect(() => {
    if (user && user.rol !== 'admin') {
      router.replace('/intranet/dashboard');
    }
  }, [user, router]);

  const [ambientes, setAmbientes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('inventario'); // 'inventario' | 'totales'
  const [filterTipo, setFilterTipo] = useState(''); // '' | 'material' | 'reactivo' | 'equipo' | 'seguridad'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    ambiente_id: '',
    categoria_id: '',
    descripcion: '',
    estado: 'disponible',
    imagen_url: '',
    tipo_item: 'material',
    presentacion: 'Unidad',
    capacidad: '1',
    unidad_medida: 'und',
    cantidad: '1',
    stock_minimo: '1',
    formula_quimica: '',
    concentracion: '',
    fecha_vencimiento: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAmbiente, setFilterAmbiente] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

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
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('La imagen es demasiado grande. Máximo 2MB.');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData((prev) => ({ ...prev, imagen_url: '' }));
    }
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
      imagen_url: '',
      tipo_item: 'material',
      presentacion: 'Unidad',
      capacidad: '1',
      unidad_medida: 'und',
      cantidad: '1',
      stock_minimo: '1',
      formula_quimica: '',
      concentracion: '',
      fecha_vencimiento: '',
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (equipo) => {
    setEditingId(equipo.id);
    setFormData({
      nombre: equipo.nombre || '',
      codigo: equipo.codigo || '',
      ambiente_id: equipo.ambiente_id || '',
      categoria_id: equipo.categoria_id || '',
      descripcion: equipo.descripcion || '',
      estado: equipo.estado || 'disponible',
      imagen_url: equipo.imagen_url || '',
      tipo_item: equipo.tipo_item || 'equipo',
      presentacion: equipo.presentacion || 'Unidad',
      capacidad:
        equipo.capacidad !== undefined && equipo.capacidad !== null
          ? String(equipo.capacidad)
          : '1',
      unidad_medida: equipo.unidad_medida || 'und',
      cantidad:
        equipo.cantidad !== undefined && equipo.cantidad !== null
          ? String(equipo.cantidad)
          : '1',
      stock_minimo:
        equipo.stock_minimo !== undefined && equipo.stock_minimo !== null
          ? String(equipo.stock_minimo)
          : '1',
      formula_quimica: equipo.formula_quimica || '',
      concentracion: equipo.concentracion || '',
      fecha_vencimiento: equipo.fecha_vencimiento
        ? String(equipo.fecha_vencimiento).split('T')[0]
        : '',
    });
    setSelectedFile(null);
    setPreviewUrl(equipo.imagen_url || '');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (
      !formData.nombre.trim() ||
      !formData.codigo.trim() ||
      !formData.ambiente_id ||
      !formData.categoria_id
    ) {
      setError('Todos los campos principales son requeridos');
      return;
    }

    const duplicate = equipos.find(
      (e) =>
        e.codigo.toLowerCase() === formData.codigo.toLowerCase().trim() &&
        e.id !== editingId
    );

    if (duplicate) {
      setError(`Ya existe un registro con el código "${formData.codigo}"`);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let finalImagenUrl = formData.imagen_url;

      if (selectedFile) {
        const uploadRes = await dbOperations.uploadImagen(selectedFile);
        if (uploadRes.error) throw new Error(`Error al subir imagen: ${uploadRes.error}`);
        finalImagenUrl = uploadRes.data;
      }

      const payload = {
        nombre: formData.nombre.trim(),
        codigo: formData.codigo.trim(),
        ambiente_id: parseInt(formData.ambiente_id),
        categoria_id: parseInt(formData.categoria_id),
        descripcion: formData.descripcion.trim(),
        estado: formData.estado,
        imagen_url: finalImagenUrl,
        tipo_item: formData.tipo_item || 'equipo',
        presentacion: formData.presentacion || 'Unidad',
        capacidad: parseFloat(formData.capacidad) || 1,
        unidad_medida: formData.unidad_medida || 'und',
        cantidad: parseInt(formData.cantidad) || 1,
        stock_minimo: parseInt(formData.stock_minimo) || 1,
        formula_quimica: formData.formula_quimica?.trim() || null,
        concentracion: formData.concentracion?.trim() || null,
        fecha_vencimiento: formData.fecha_vencimiento || null,
      };

      const result = editingId
        ? await dbOperations.actualizarEquipo(editingId, payload)
        : await dbOperations.crearEquipo(payload);

      const { error: saveError } = result;
      if (saveError) {
        if (typeof saveError === 'object' && saveError.error) {
          throw new Error(saveError.error);
        }
        throw new Error(saveError.message || 'Error al guardar');
      }

      await fetchData();
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
      const { error: deleteError } = await dbOperations.eliminarEquipo(deleteId);
      if (deleteError) throw deleteError;
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChangeStatus = async (equipoId, estado) => {
    try {
      const { error: statusError } = await dbOperations.cambiarEstadoEquipo(
        equipoId,
        estado
      );
      if (statusError) throw statusError;
      await fetchData();
    } catch (err) {
      setError(err.message);
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

  const filteredEquipos = equipos.filter((e) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      e.nombre?.toLowerCase().includes(search) ||
      e.codigo?.toLowerCase().includes(search) ||
      e.formula_quimica?.toLowerCase().includes(search);

    const matchesAmbiente =
      !filterAmbiente || String(e.ambiente_id) === String(filterAmbiente);
    const matchesCategoria =
      !filterCategoria || String(e.categoria_id) === String(filterCategoria);
    const matchesTipo = !filterTipo || (e.tipo_item || 'equipo') === filterTipo;

    return matchesSearch && matchesAmbiente && matchesCategoria && matchesTipo;
  });

  const consolidatedTotals = consolidateInventoryTotals(filteredEquipos);
  const liveModalTotal = getItemTotalInfo(formData);

  const columns = [
    {
      key: 'nombre',
      label: 'Material / Equipo / Reactivo',
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-sm border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
            {row.imagen_url ? (
              <img
                src={row.imagen_url}
                alt={row.nombre}
                className="w-full h-full object-cover"
              />
            ) : row.tipo_item === 'reactivo' ? (
              <FlaskConical className="w-6 h-6 text-[#002b45]" />
            ) : (
              <Package className="w-6 h-6 text-slate-300" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#002b45] text-sm uppercase tracking-tight">
                {row.nombre}
              </span>
              {row.formula_quimica && (
                <span className="px-2 py-0.5 bg-[#002b45]/10 text-[#002b45] font-mono font-black text-[10px] rounded-sm">
                  {row.formula_quimica}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-[#9ABE00] uppercase tracking-widest">
                {row.codigo}
              </span>
              {row.concentracion && (
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  • {row.concentracion}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'medida',
      label: 'Unidad / Presentación',
      render: (row) => {
        const info = getItemTotalInfo(row);
        return (
          <div className="flex flex-col">
            <Badge color="navy">{info.presentacionLabel}</Badge>
            <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
              {info.envasesLabel}
            </span>
          </div>
        );
      },
    },
    {
      key: 'cantidad_total',
      label: 'Total Cantidad',
      render: (row) => {
        const info = getItemTotalInfo(row);
        return (
          <div className="flex flex-col">
            <span className="font-display font-black text-sm text-[#002b45]">
              {info.fullTotalLabel}
            </span>
            {!info.isSimpleUnit && (
              <span className="text-[10px] text-slate-400 font-bold">
                ({info.cantidad} × {row.capacidad} {info.unidad})
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'ambiente',
      label: 'Ubicación',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-gray-600 font-medium text-xs">
            {row.ambiente?.nombre || 'No asignado'}
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-bold">
            {row.categoria?.nombre || 'General'}
          </span>
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) => (
        <Badge color={getEstadoColor(row.estado)}>
          {getEstadoLabel(row.estado).toUpperCase()}
        </Badge>
      ),
    },
  ];

  const consolidadoColumns = [
    {
      key: 'nombre',
      label: 'Material / Reactivo / Equipo',
      render: (row) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#002b45] text-sm uppercase">
              {row.nombre}
            </span>
            {row.formula_quimica && (
              <span className="px-2 py-0.5 bg-[#002b45]/10 text-[#002b45] font-mono font-black text-[10px] rounded-sm">
                {row.formula_quimica}
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {row.categoria_nombre} • {row.lotesCount}{' '}
            {row.lotesCount === 1 ? 'registro' : 'registros'}
          </span>
        </div>
      ),
    },
    {
      key: 'desgloseTexto',
      label: 'Presentaciones / Frascos',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-700">{row.desgloseTexto}</span>
          <span className="text-[10px] font-black text-[#9ABE00] uppercase tracking-widest mt-1">
            Total unidades/envases: {row.totalEnvases}
          </span>
        </div>
      ),
    },
    {
      key: 'cantidadTotalConsolidada',
      label: 'Cantidad Total Neta',
      render: (row) => (
        <div className="bg-[#002b45]/5 border border-[#002b45]/15 px-4 py-2 rounded-sm inline-block">
          <span className="font-display font-black text-sm text-[#002b45]">
            {row.cantidadTotalConsolidada}
          </span>
        </div>
      ),
    },
    {
      key: 'ambientes',
      label: 'Ubicación',
      render: (row) => (
        <span className="text-xs font-medium text-gray-600">{row.ambientes}</span>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="bg-white p-8 rounded-lg shadow-premium border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-brand-navy p-4 rounded-sm shadow-lg">
            <Package className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-brand-navy tracking-tight uppercase">
              Materiales, Reactivos y Equipos
            </h1>
            <p className="text-brand-teal font-bold text-xs tracking-widest uppercase mt-1">
              Ingreso de Materiales con Unidades de Medida, Presentaciones y Totales
            </p>
          </div>
        </div>
        <Button onClick={handleNew} variant="primary">
          <Plus className="w-5 h-5 mr-2 inline" /> INGRESAR MATERIAL / EQUIPO
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-brand-border space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { value: '', label: 'TODOS' },
              { value: 'reactivo', label: 'REACTIVOS' },
              { value: 'material', label: 'MATERIALES / CRISTALERÍA' },
              { value: 'equipo', label: 'EQUIPOS' },
              { value: 'seguridad', label: 'SEGURIDAD' },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setFilterTipo(t.value)}
                className={`px-4 py-2 rounded-sm font-display font-black text-[10px] tracking-widest uppercase transition-all ${
                  filterTipo === t.value
                    ? 'bg-[#002b45] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:text-[#002b45]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex p-1 bg-slate-100 rounded-sm">
            <button
              onClick={() => setViewMode('inventario')}
              className={`px-4 py-2 rounded-sm font-display font-black text-[10px] tracking-widest uppercase transition-all ${
                viewMode === 'inventario'
                  ? 'bg-white text-[#002b45] shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              POR REGISTRO ({filteredEquipos.length})
            </button>
            <button
              onClick={() => setViewMode('totales')}
              className={`px-4 py-2 rounded-sm font-display font-black text-[10px] tracking-widest uppercase transition-all ${
                viewMode === 'totales'
                  ? 'bg-white text-[#002b45] shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              TOTALES AGRUPADOS ({consolidatedTotals.length})
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, código o fórmula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-brand-gray/30 border-2 border-transparent focus:border-brand-accent rounded-sm outline-none transition-all font-sans"
            />
          </div>
          <div className="flex gap-4 flex-wrap md:flex-nowrap">
            <div className="relative min-w-[200px] flex-1">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterAmbiente}
                onChange={(e) => setFilterAmbiente(e.target.value)}
                className="w-full pl-10 pr-8 py-3 bg-brand-gray/30 border-2 border-transparent focus:border-brand-accent rounded-sm outline-none appearance-none transition-all font-sans text-sm font-bold text-gray-600"
              >
                <option value="">TODOS LOS AMBIENTES</option>
                {ambientes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative min-w-[200px] flex-1">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="w-full pl-10 pr-8 py-3 bg-brand-gray/30 border-2 border-transparent focus:border-brand-accent rounded-sm outline-none appearance-none transition-all font-sans text-sm font-bold text-gray-600"
              >
                <option value="">TODAS LAS CATEGORÍAS</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
        ) : filteredEquipos.length === 0 ? (
          <div className="p-20 text-center">
            <div className="bg-brand-gray inline-block p-6 rounded-full mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-brand-navy mb-2 uppercase">
              No se encontraron registros
            </h3>
            <p className="text-gray-500">
              Ajusta tus filtros o ingresa un nuevo material/reactivo para comenzar.
            </p>
            {(searchTerm || filterAmbiente || filterCategoria || filterTipo) && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm('');
                  setFilterAmbiente('');
                  setFilterCategoria('');
                  setFilterTipo('');
                }}
                className="mt-6"
              >
                LIMPIAR FILTROS
              </Button>
            )}
          </div>
        ) : viewMode === 'totales' ? (
          <Table columns={consolidadoColumns} data={consolidatedTotals} />
        ) : (
          <Table
            columns={columns}
            data={filteredEquipos}
            actions={(row) => (
              <div className="flex items-center gap-2">
                {row.estado === 'disponible' && (
                  <button
                    onClick={() => handleChangeStatus(row.id, 'en_mantenimiento')}
                    className="p-2 text-brand-yellow hover:bg-yellow-50 rounded-sm transition-colors"
                    title="Mantenimiento"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                )}
                {row.estado === 'en_mantenimiento' && (
                  <button
                    onClick={() => handleChangeStatus(row.id, 'disponible')}
                    className="p-2 text-brand-teal hover:bg-brand-gray rounded-sm transition-colors"
                    title="Marcar como disponible"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                )}
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
        title={
          editingId
            ? 'EDITAR MATERIAL / REACTIVO / EQUIPO'
            : 'INGRESO DE MATERIAL / REACTIVO / EQUIPO'
        }
        maxWidth="max-w-5xl"
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Columna Izquierda: Imagen, Calculadora de Total y Estado */}
          <div className="lg:w-1/3 space-y-6">
            <div className="relative aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-sm overflow-hidden group flex flex-col items-center justify-center p-4">
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Vista previa"
                    className="w-full h-full object-cover rounded-sm transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      className="!py-2 !px-3 !text-[9px] !bg-white"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      CAMBIAR
                    </Button>
                    <button
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl('');
                        setFormData((prev) => ({ ...prev, imagen_url: '' }));
                      }}
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div
                  className="text-center space-y-3 cursor-pointer hover:bg-slate-100/50 w-full h-full flex flex-col items-center justify-center transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                    <Upload className="w-8 h-8 text-[#9ABE00]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-[#002b45] uppercase tracking-widest">
                      Cargar Imagen
                    </p>
                    <p className="text-[9px] text-slate-400">
                      Click para seleccionar archivo
                    </p>
                  </div>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {/* Live Total Calculation Box */}
            <div className="p-5 bg-[#002b45] text-white rounded-sm shadow-lg space-y-2 border-l-4 border-[#9ABE00]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#9ABE00] uppercase tracking-widest">
                  Cantidad Total Calculada
                </span>
                <Scale className="w-4 h-4 text-[#9ABE00]" />
              </div>
              <div className="text-2xl font-display font-black">
                {liveModalTotal.fullTotalLabel}
              </div>
              <p className="text-xs text-white/80">{liveModalTotal.desgloseLabel}</p>
            </div>

            <div className="space-y-4">
              <FormInput
                label="URL EXTERNA"
                name="imagen_url"
                value={formData.imagen_url}
                onChange={(e) => {
                  handleInputChange(e);
                  if (e.target.value) {
                    setPreviewUrl(e.target.value);
                    setSelectedFile(null);
                  }
                }}
                placeholder="https://ejemplo.com/foto.jpg"
              />
            </div>

            {editingId && (
              <div className="p-5 bg-slate-50 rounded-sm border border-slate-100">
                <label className="block text-[10px] font-black text-[#002b45] uppercase tracking-[0.2em] mb-4">
                  Estado del Ítem
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['disponible', 'en_mantenimiento'].map((est) => (
                    <button
                      key={est}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, estado: est }))
                      }
                      className={`py-2 px-3 rounded-sm text-[9px] font-black uppercase tracking-wider transition-all border ${
                        formData.estado === est
                          ? est === 'disponible'
                            ? 'bg-[#9ABE00] border-[#9ABE00] text-white shadow-md'
                            : 'bg-red-500 border-red-500 text-white shadow-md'
                          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {est.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha: Información Principal */}
          <div className="lg:w-2/3 space-y-6">
            <div className="bg-white p-6 rounded-sm border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-[#9ABE00]" />
                  <h3 className="font-display font-black text-[#002b45] text-sm uppercase tracking-tight">
                    Información General
                  </h3>
                </div>
                <select
                  name="tipo_item"
                  value={formData.tipo_item}
                  onChange={handleInputChange}
                  className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-sm font-display font-black text-[10px] text-[#002b45] uppercase tracking-wider"
                >
                  {TIPOS_ITEM.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="NOMBRE DEL MATERIAL / REACTIVO / EQUIPO"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Nitrato de Plata / Matraz Volumétrico"
                  required
                />
                <FormInput
                  label="CÓDIGO ÚNICO"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleInputChange}
                  placeholder="Ej: REACT-001 / CRIST-001"
                  required
                />
              </div>

              {/* Presentación, Unidades de Medida y Stock */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-sm border border-slate-100">
                <div>
                  <label className="block font-display font-bold text-xs text-brand-navy tracking-widest mb-2 uppercase">
                    PRESENTACIÓN
                  </label>
                  <select
                    name="presentacion"
                    value={formData.presentacion}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border-2 border-brand-border rounded-sm bg-white font-bold text-xs text-[#002b45]"
                  >
                    {PRESENTACIONES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-display font-bold text-xs text-brand-navy tracking-widest mb-2 uppercase">
                    MEDIDA / CAPACIDAD
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    name="capacidad"
                    value={formData.capacidad}
                    onChange={handleInputChange}
                    placeholder="Ej: 100, 250"
                    className="w-full px-3 py-2.5 border-2 border-brand-border rounded-sm bg-white font-bold text-xs text-[#002b45]"
                  />
                </div>

                <div>
                  <label className="block font-display font-bold text-xs text-brand-navy tracking-widest mb-2 uppercase">
                    UNIDAD DE MEDIDA
                  </label>
                  <select
                    name="unidad_medida"
                    value={formData.unidad_medida}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border-2 border-brand-border rounded-sm bg-white font-bold text-xs text-[#002b45]"
                  >
                    {UNIDADES_MEDIDA_GRUPOS.map((grupo) => (
                      <optgroup key={grupo.grupo} label={grupo.grupo}>
                        {grupo.opciones.map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-display font-bold text-xs text-brand-navy tracking-widest mb-2 uppercase">
                    CANTIDAD (STOCK)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleInputChange}
                    placeholder="Ej: 5"
                    className="w-full px-3 py-2.5 border-2 border-brand-border rounded-sm bg-white font-bold text-xs text-[#002b45]"
                  />
                </div>
              </div>

              {formData.tipo_item === 'reactivo' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    label="FÓRMULA QUÍMICA / CAS"
                    name="formula_quimica"
                    value={formData.formula_quimica}
                    onChange={handleInputChange}
                    placeholder="Ej: AgNO3, H2SO4"
                  />
                  <FormInput
                    label="CONCENTRACIÓN / PUREZA"
                    name="concentracion"
                    value={formData.concentracion}
                    onChange={handleInputChange}
                    placeholder="Ej: 98% p/p, 1 M"
                  />
                  <FormInput
                    label="VENCIMIENTO"
                    name="fecha_vencimiento"
                    type="date"
                    value={formData.fecha_vencimiento}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-[#002b45] uppercase tracking-[0.2em]">
                    <MapPin className="w-3 h-3 text-[#9ABE00]" /> UBICACIÓN
                  </label>
                  <select
                    name="ambiente_id"
                    value={formData.ambiente_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#9ABE00] transition-all font-sans text-xs font-bold text-slate-600 uppercase"
                  >
                    <option value="">Selecciona Laboratorio</option>
                    {ambientes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-[#002b45] uppercase tracking-[0.2em]">
                    <Tag className="w-3 h-3 text-[#9ABE00]" /> CATEGORÍA
                  </label>
                  <select
                    name="categoria_id"
                    value={formData.categoria_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#9ABE00] transition-all font-sans text-xs font-bold text-slate-600 uppercase"
                  >
                    <option value="">Selecciona Categoría</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <FormInput
                label="ESPECIFICACIONES / NOTAS"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Detalles técnicos, marca, modelo, pureza, condiciones de almacenamiento..."
                textarea
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="secondary"
                fullWidth
                className="!py-3"
              >
                CANCELAR
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                fullWidth
                className="!py-3 !bg-[#002b45] hover:!bg-[#9ABE00] hover:!text-[#002b45]"
              >
                {isSaving
                  ? 'PROCESANDO...'
                  : editingId
                  ? 'ACTUALIZAR REGISTRO'
                  : 'REGISTRAR EN INVENTARIO'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="ELIMINAR REGISTRO"
        message="¿Estás seguro de que deseas eliminar este ítem del inventario? Esta acción es permanente y afectará el historial de préstamos."
        confirmText="ELIMINAR"
      />
    </div>
  );
}
