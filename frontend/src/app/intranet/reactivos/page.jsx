'use client';

import { useState, useEffect, useRef } from 'react';
import { dbOperations } from '@/lib/api';
import {
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
  FlaskConical,
  Search,
  Filter,
  Info,
  MapPin,
  Tag,
  Upload,
  X as CloseIcon,
  Layers,
  Scale,
  Calendar,
  CheckCircle2,
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

export default function ReactivosPage() {
  const [reactivos, setReactivos] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('lotes'); // 'lotes' | 'consolidado'
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
    tipo_item: 'reactivo',
    presentacion: 'Frasco',
    capacidad: '100',
    unidad_medida: 'mg',
    cantidad: '1',
    stock_minimo: '1',
    formula_quimica: '',
    concentracion: '',
    fecha_vencimiento: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAmbiente, setFilterAmbiente] = useState('');
  const [filterUnidad, setFilterUnidad] = useState('');
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

      if (equiposRes.error) throw new Error(equiposRes.error);
      if (ambientesRes.error) throw new Error(ambientesRes.error);
      if (categoriasRes.error) throw new Error(categoriasRes.error);

      const allItems = equiposRes.data || [];
      const cats = categoriasRes.data || [];

      // Filtrar los ítems que son reactivos (por tipo_item === 'reactivo' o categoría 'Reactivos')
      const onlyReactivos = allItems.filter(
        (item) =>
          item.tipo_item === 'reactivo' ||
          item.categoria?.nombre?.toLowerCase().includes('reactivo')
      );

      setReactivos(onlyReactivos);
      setAmbientes(ambientesRes.data || []);
      setCategorias(cats);
    } catch (err) {
      setError(err.message || 'Error al cargar reactivos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const getDefaultReactivoCategoriaId = () => {
    const reactivoCat = categorias.find((c) =>
      c.nombre?.toLowerCase().includes('reactivo')
    );
    return reactivoCat ? reactivoCat.id : categorias[0]?.id || '';
  };

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
      ambiente_id: ambientes[0]?.id || '',
      categoria_id: getDefaultReactivoCategoriaId(),
      descripcion: '',
      estado: 'disponible',
      imagen_url: '',
      tipo_item: 'reactivo',
      presentacion: 'Frasco',
      capacidad: '100',
      unidad_medida: 'mg',
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

  const handleEdit = (reactivo) => {
    setEditingId(reactivo.id);
    setFormData({
      nombre: reactivo.nombre || '',
      codigo: reactivo.codigo || '',
      ambiente_id: reactivo.ambiente_id || '',
      categoria_id: reactivo.categoria_id || getDefaultReactivoCategoriaId(),
      descripcion: reactivo.descripcion || '',
      estado: reactivo.estado || 'disponible',
      imagen_url: reactivo.imagen_url || '',
      tipo_item: 'reactivo',
      presentacion: reactivo.presentacion || 'Frasco',
      capacidad: reactivo.capacidad !== undefined && reactivo.capacidad !== null ? String(reactivo.capacidad) : '100',
      unidad_medida: reactivo.unidad_medida || 'mg',
      cantidad: reactivo.cantidad !== undefined && reactivo.cantidad !== null ? String(reactivo.cantidad) : '1',
      stock_minimo: reactivo.stock_minimo !== undefined && reactivo.stock_minimo !== null ? String(reactivo.stock_minimo) : '1',
      formula_quimica: reactivo.formula_quimica || '',
      concentracion: reactivo.concentracion || '',
      fecha_vencimiento: reactivo.fecha_vencimiento
        ? String(reactivo.fecha_vencimiento).split('T')[0]
        : '',
    });
    setSelectedFile(null);
    setPreviewUrl(reactivo.imagen_url || '');
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
      setError('Nombre, código, laboratorio y categoría son requeridos');
      return;
    }

    const capNum = parseFloat(formData.capacidad);
    const cantNum = parseInt(formData.cantidad);
    if (Number.isNaN(capNum) || capNum <= 0) {
      setError('La capacidad/medida por envase debe ser un número mayor a 0');
      return;
    }
    if (Number.isNaN(cantNum) || cantNum < 0) {
      setError('La cantidad de envases debe ser un número válido');
      return;
    }

    const duplicate = reactivos.find(
      (r) =>
        r.codigo.toLowerCase() === formData.codigo.toLowerCase().trim() &&
        r.id !== editingId
    );
    if (duplicate) {
      setError(`Ya existe un reactivo con el código "${formData.codigo}"`);
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
        tipo_item: 'reactivo',
        presentacion: formData.presentacion || 'Frasco',
        capacidad: capNum,
        unidad_medida: formData.unidad_medida || 'mg',
        cantidad: cantNum,
        stock_minimo: parseInt(formData.stock_minimo) || 1,
        formula_quimica: formData.formula_quimica.trim() || null,
        concentracion: formData.concentracion.trim() || null,
        fecha_vencimiento: formData.fecha_vencimiento || null,
      };

      const result = editingId
        ? await dbOperations.actualizarEquipo(editingId, payload)
        : await dbOperations.crearEquipo(payload);

      if (result.error) {
        const msg =
          typeof result.error === 'object' && result.error.error
            ? result.error.error
            : result.error.message || result.error || 'Error al guardar reactivo';
        throw new Error(msg);
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
      if (deleteError) throw new Error(deleteError);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChangeStatus = async (id, estado) => {
    try {
      const { error: statusError } = await dbOperations.cambiarEstadoEquipo(id, estado);
      if (statusError) throw new Error(statusError);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredReactivos = reactivos.filter((r) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      r.nombre?.toLowerCase().includes(search) ||
      r.codigo?.toLowerCase().includes(search) ||
      r.formula_quimica?.toLowerCase().includes(search) ||
      r.concentracion?.toLowerCase().includes(search);

    const matchesAmbiente =
      !filterAmbiente || String(r.ambiente_id) === String(filterAmbiente);
    const matchesUnidad =
      !filterUnidad || String(r.unidad_medida) === String(filterUnidad);

    return matchesSearch && matchesAmbiente && matchesUnidad;
  });

  const consolidatedTotals = consolidateInventoryTotals(filteredReactivos);
  const liveModalTotal = getItemTotalInfo(formData);

  const totalEnvasesGlobal = filteredReactivos.reduce(
    (sum, r) => sum + (Number(r.cantidad) || 0),
    0
  );
  const stockBajoGlobal = filteredReactivos.filter(
    (r) => (Number(r.cantidad) || 0) <= (Number(r.stock_minimo) || 1)
  ).length;

  const loteColumns = [
    {
      key: 'nombre',
      label: 'Reactivo / Fórmula',
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-sm border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
            {row.imagen_url ? (
              <img src={row.imagen_url} alt={row.nombre} className="w-full h-full object-cover" />
            ) : (
              <FlaskConical className="w-6 h-6 text-[#002b45]" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#002b45] text-sm uppercase tracking-tight">
                {row.nombre}
              </span>
              {row.formula_quimica && (
                <span className="px-2 py-0.5 bg-[#002b45]/10 text-[#002b45] font-mono font-black text-[10px] rounded-sm">
                  {row.formula_quimica}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
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
      key: 'presentacion',
      label: 'Presentación / Medida',
      render: (row) => {
        const info = getItemTotalInfo(row);
        return (
          <div className="flex flex-col">
            <Badge color="navy">{info.presentacionLabel}</Badge>
            <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">
              {info.envasesLabel} en stock
            </span>
          </div>
        );
      },
    },
    {
      key: 'cantidad_total',
      label: 'Cantidad Total Neta',
      render: (row) => {
        const info = getItemTotalInfo(row);
        const isLowStock = info.cantidad <= (Number(row.stock_minimo) || 1);
        return (
          <div className="flex flex-col">
            <span className="font-display font-black text-base text-[#002b45]">
              {info.fullTotalLabel}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              ({info.cantidad} × { row.capacidad || 1 } {info.unidad})
            </span>
            {isLowStock && (
              <span className="text-[9px] font-black text-brand-red uppercase tracking-widest mt-0.5">
                ⚠ Stock Bajo (Mín: {row.stock_minimo || 1})
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'ambiente',
      label: 'Ubicación / Vencimiento',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-gray-700 font-bold text-xs uppercase">
            {row.ambiente?.nombre || 'No asignado'}
          </span>
          {row.fecha_vencimiento ? (
            <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#9ABE00]" />
              Vence: {new Date(row.fecha_vencimiento).toLocaleDateString('es-PE')}
            </span>
          ) : (
            <span className="text-[10px] text-slate-300 font-bold uppercase mt-1">
              Sin fecha venc.
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) => (
        <Badge
          color={
            row.estado === 'disponible'
              ? 'green'
              : row.estado === 'ocupado'
              ? 'blue'
              : 'red'
          }
        >
          {row.estado === 'disponible'
            ? 'DISPONIBLE'
            : row.estado === 'ocupado'
            ? 'EN USO'
            : 'MANTENIMIENTO'}
        </Badge>
      ),
    },
  ];

  const consolidadoColumns = [
    {
      key: 'nombre',
      label: 'Sustancia / Reactivo',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#002b45] text-[#9ABE00] rounded-sm">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#002b45] text-sm uppercase">{row.nombre}</span>
              {row.formula_quimica && (
                <span className="px-2 py-0.5 bg-[#002b45]/10 text-[#002b45] font-mono font-black text-[10px] rounded-sm">
                  {row.formula_quimica}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {row.lotesCount} {row.lotesCount === 1 ? 'presentación registrada' : 'presentaciones registradas'} ({row.codigos.join(', ')})
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'desgloseTexto',
      label: 'Desglose de Frascos / Envases',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-700">{row.desgloseTexto}</span>
          <span className="text-[10px] font-black text-[#9ABE00] uppercase tracking-widest mt-1">
            Total envases: {row.totalEnvases} unidades
          </span>
        </div>
      ),
    },
    {
      key: 'cantidadTotalConsolidada',
      label: 'Cantidad Total Acumulada',
      render: (row) => (
        <div className="bg-[#002b45]/5 border border-[#002b45]/15 px-4 py-2.5 rounded-sm inline-block">
          <span className="font-display font-black text-base text-[#002b45]">
            {row.cantidadTotalConsolidada}
          </span>
        </div>
      ),
    },
    {
      key: 'ambientes',
      label: 'Ubicaciones',
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
            <FlaskConical className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-brand-navy tracking-tight uppercase">
              Laboratorio de Reactivos
            </h1>
            <p className="text-brand-teal font-bold text-xs tracking-widest uppercase mt-1">
              Ingreso de Materiales Químicos, Presentaciones, Unidades de Medida y Totales
            </p>
          </div>
        </div>
        <Button onClick={handleNew} variant="primary">
          <Plus className="w-5 h-5 mr-2 inline" /> INGRESAR REACTIVO
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-sm border border-brand-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Lotes / Presentaciones
            </p>
            <p className="text-2xl font-display font-black text-[#002b45] mt-1">
              {filteredReactivos.length}
            </p>
          </div>
          <div className="p-3 bg-[#002b45]/5 text-[#002b45] rounded-sm">
            <FlaskConical className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-sm border border-brand-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Sustancias Únicas
            </p>
            <p className="text-2xl font-display font-black text-[#002b45] mt-1">
              {consolidatedTotals.length}
            </p>
          </div>
          <div className="p-3 bg-[#9ABE00]/15 text-[#002b45] rounded-sm">
            <Layers className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-sm border border-brand-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Total Frascos / Envases
            </p>
            <p className="text-2xl font-display font-black text-brand-teal mt-1">
              {totalEnvasesGlobal}
            </p>
          </div>
          <div className="p-3 bg-brand-teal/10 text-brand-teal rounded-sm">
            <Scale className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-sm border border-brand-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Alertas Stock Bajo
            </p>
            <p className="text-2xl font-display font-black text-brand-red mt-1">
              {stockBajoGlobal}
            </p>
          </div>
          <div className="p-3 bg-brand-red/10 text-brand-red rounded-sm">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* View Mode Tabs + Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-brand-border space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex p-1 bg-slate-100 rounded-sm w-full md:w-auto">
            <button
              onClick={() => setViewMode('lotes')}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-sm font-display font-black text-xs tracking-widest uppercase transition-all ${
                viewMode === 'lotes'
                  ? 'bg-[#002b45] text-white shadow-sm'
                  : 'text-slate-500 hover:text-[#002b45]'
              }`}
            >
              DETALLE POR FRASCO / LOTE ({filteredReactivos.length})
            </button>
            <button
              onClick={() => setViewMode('consolidado')}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-sm font-display font-black text-xs tracking-widest uppercase transition-all ${
                viewMode === 'consolidado'
                  ? 'bg-[#002b45] text-white shadow-sm'
                  : 'text-slate-500 hover:text-[#002b45]'
              }`}
            >
              TOTAL CONSOLIDADO POR REACTIVO ({consolidatedTotals.length})
            </button>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {viewMode === 'lotes'
              ? 'Mostrando cada envase/presentación individual y su subtotal'
              : 'Sumando todos los frascos de distinta medida de un mismo reactivo'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre del reactivo, fórmula química (ej. AgNO3, H2SO4) o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-brand-gray/30 border-2 border-slate-100 focus:border-brand-accent rounded-sm outline-none transition-all font-sans text-sm"
            />
          </div>
          <div className="flex gap-4 flex-wrap md:flex-nowrap">
            <div className="relative min-w-[200px] flex-1">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterAmbiente}
                onChange={(e) => setFilterAmbiente(e.target.value)}
                className="w-full pl-10 pr-8 py-3 bg-brand-gray/30 border-2 border-slate-100 focus:border-brand-accent rounded-sm outline-none appearance-none transition-all font-sans text-xs font-bold text-gray-600 uppercase"
              >
                <option value="">TODOS LOS LABORATORIOS</option>
                {ambientes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative min-w-[180px] flex-1">
              <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterUnidad}
                onChange={(e) => setFilterUnidad(e.target.value)}
                className="w-full pl-10 pr-8 py-3 bg-brand-gray/30 border-2 border-slate-100 focus:border-brand-accent rounded-sm outline-none appearance-none transition-all font-sans text-xs font-bold text-gray-600 uppercase"
              >
                <option value="">TODAS LAS UNIDADES</option>
                {UNIDADES_MEDIDA_GRUPOS.map((grupo) => (
                  <optgroup key={grupo.grupo} label={grupo.grupo}>
                    {grupo.opciones.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label.toUpperCase()}
                      </option>
                    ))}
                  </optgroup>
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

      {/* Main Table Content */}
      <div className="bg-white rounded-lg shadow-premium border border-brand-border overflow-hidden">
        {!isMounted || loading ? (
          <div className="p-8">
            <TableSkeleton />
          </div>
        ) : filteredReactivos.length === 0 ? (
          <div className="p-20 text-center">
            <div className="bg-brand-gray inline-block p-6 rounded-full mb-6">
              <FlaskConical className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-brand-navy mb-2 uppercase">
              No se encontraron reactivos registrados
            </h3>
            <p className="text-gray-500">
              Registra tus reactivos indicando su presentación (ej. Frasco 100 mg, Botella 1 L) y stock.
            </p>
          </div>
        ) : viewMode === 'consolidado' ? (
          <Table columns={consolidadoColumns} data={consolidatedTotals} />
        ) : (
          <Table
            columns={loteColumns}
            data={filteredReactivos}
            actions={(row) => (
              <div className="flex items-center gap-2">
                {row.estado === 'disponible' && (
                  <button
                    onClick={() => handleChangeStatus(row.id, 'en_mantenimiento')}
                    className="p-2 text-brand-yellow hover:bg-yellow-50 rounded-sm transition-colors"
                    title="Marcar en revisión / agotado"
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'EDITAR REACTIVO QUÍMICO' : 'INGRESO DE REACTIVO / MATERIAL QUÍMICO'}
        maxWidth="max-w-5xl"
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Image + Live Total Calculator */}
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
                      Foto del Reactivo / Etiqueta
                    </p>
                    <p className="text-[9px] text-slate-400">Click para seleccionar imagen</p>
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
            <div className="p-5 bg-[#002b45] text-white rounded-sm shadow-lg space-y-3 border-l-4 border-[#9ABE00]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#9ABE00] uppercase tracking-widest">
                  Cálculo Automático de Stock
                </span>
                <Scale className="w-4 h-4 text-[#9ABE00]" />
              </div>
              <div className="text-2xl font-display font-black tracking-tight">
                {liveModalTotal.fullTotalLabel}
              </div>
              <p className="text-xs text-white/80 font-medium">
                {liveModalTotal.desgloseLabel}
              </p>
            </div>

            <FormInput
              label="URL DE IMAGEN (OPCIONAL)"
              name="imagen_url"
              value={formData.imagen_url}
              onChange={(e) => {
                handleInputChange(e);
                if (e.target.value) {
                  setPreviewUrl(e.target.value);
                  setSelectedFile(null);
                }
              }}
              placeholder="https://ejemplo.com/reactivo.jpg"
            />
          </div>

          {/* Right Column: Form Fields */}
          <div className="lg:w-2/3 space-y-6">
            <div className="bg-white p-6 rounded-sm border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Info className="w-5 h-5 text-[#9ABE00]" />
                <h3 className="font-display font-black text-[#002b45] text-sm uppercase tracking-tight">
                  1. Identificación del Reactivo
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="NOMBRE DEL REACTIVO"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Nitrato de Plata / Ácido Sulfúrico"
                  required
                />
                <FormInput
                  label="CÓDIGO DE INVENTARIO / LOTE"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleInputChange}
                  placeholder="Ej: REACT-010"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormInput
                  label="FÓRMULA QUÍMICA / CAS"
                  name="formula_quimica"
                  value={formData.formula_quimica}
                  onChange={handleInputChange}
                  placeholder="Ej: AgNO3, H2SO4, NaOH"
                />
                <FormInput
                  label="CONCENTRACIÓN / PUREZA"
                  name="concentracion"
                  value={formData.concentracion}
                  onChange={handleInputChange}
                  placeholder="Ej: 99.8% PA, 98% p/p, 1 M"
                />
                <FormInput
                  label="FECHA DE VENCIMIENTO"
                  name="fecha_vencimiento"
                  type="date"
                  value={formData.fecha_vencimiento}
                  onChange={handleInputChange}
                />
              </div>

              {/* Section 2: Presentation & Units of Measure */}
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 pt-2">
                <Scale className="w-5 h-5 text-[#9ABE00]" />
                <h3 className="font-display font-black text-[#002b45] text-sm uppercase tracking-tight">
                  2. Presentación, Unidad de Medida y Cantidad Total
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-sm border border-slate-100">
                <div>
                  <label className="block font-display font-bold text-xs text-brand-navy tracking-widest mb-2 uppercase">
                    PRESENTACIÓN *
                  </label>
                  <select
                    name="presentacion"
                    value={formData.presentacion}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border-2 border-brand-border rounded-sm bg-white font-bold text-xs text-[#002b45] focus:outline-none focus:border-brand-accent"
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
                    MEDIDA POR ENVASE *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    name="capacidad"
                    value={formData.capacidad}
                    onChange={handleInputChange}
                    placeholder="Ej: 100, 200, 500"
                    className="w-full px-3 py-3 border-2 border-brand-border rounded-sm bg-white font-bold text-xs text-[#002b45] focus:outline-none focus:border-brand-accent"
                  />
                </div>

                <div>
                  <label className="block font-display font-bold text-xs text-brand-navy tracking-widest mb-2 uppercase">
                    UNIDAD DE MEDIDA *
                  </label>
                  <select
                    name="unidad_medida"
                    value={formData.unidad_medida}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border-2 border-brand-border rounded-sm bg-white font-bold text-xs text-[#002b45] focus:outline-none focus:border-brand-accent"
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
                    N° DE ENVASES (STOCK) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleInputChange}
                    placeholder="Ej: 3"
                    className="w-full px-3 py-3 border-2 border-brand-border rounded-sm bg-white font-bold text-xs text-[#002b45] focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-[#002b45] uppercase tracking-[0.2em]">
                    <MapPin className="w-3 h-3 text-[#9ABE00]" /> LABORATORIO / ALMACÉN *
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
                    <Tag className="w-3 h-3 text-[#9ABE00]" /> CATEGORÍA *
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

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-[#002b45] uppercase tracking-[0.2em]">
                    <AlertCircle className="w-3 h-3 text-[#9ABE00]" /> STOCK MÍNIMO (ALERTA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="stock_minimo"
                    value={formData.stock_minimo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#9ABE00] transition-all font-sans text-xs font-bold text-slate-600"
                  />
                </div>
              </div>

              <FormInput
                label="NOTAS DE SEGURIDAD / ALMACENAMIENTO (MSDS)"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Indicaciones de manipulación, almacenamiento en frasco ámbar, incompatibilidades..."
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
                  ? 'ACTUALIZAR REACTIVO'
                  : 'REGISTRAR REACTIVO'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="ELIMINAR REACTIVO"
        message="¿Estás seguro de que deseas eliminar este lote de reactivo del inventario?"
        confirmText="ELIMINAR"
      />
    </div>
  );
}
