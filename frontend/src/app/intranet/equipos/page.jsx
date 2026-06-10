'use client';

import { useState, useEffect, useRef } from 'react';
import { dbOperations } from '@/lib/api';
import { Plus, Trash2, Edit2, AlertCircle, Zap, Package, Search, Filter, Image as ImageIcon, Info, MapPin, Tag, Upload, X as CloseIcon } from 'lucide-react';
import {
  Modal,
  FormInput,
  FormSelect,
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
      setError(err.message);
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
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('La imagen es demasiado grande. Máximo 2MB.');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData(prev => ({ ...prev, imagen_url: '' })); // Priorizar archivo sobre URL manual
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
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setError(null);
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
      imagen_url: equipo.imagen_url || '',
    });
    setSelectedFile(null);
    setPreviewUrl(equipo.imagen_url || '');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim() || !formData.codigo.trim() || !formData.ambiente_id || !formData.categoria_id) {
      setError('Todos los campos son requeridos');
      return;
    }

    // Validar código duplicado localmente
    const duplicate = equipos.find(e => 
      e.codigo.toLowerCase() === formData.codigo.toLowerCase().trim() && 
      e.id !== editingId
    );

    if (duplicate) {
      setError(`Ya existe un equipo con el código "${formData.codigo}"`);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let finalImagenUrl = formData.imagen_url;

      // Si hay un archivo seleccionado, subirlo primero
      if (selectedFile) {
        const uploadRes = await dbOperations.uploadImagen(selectedFile);
        if (uploadRes.error) throw new Error(`Error al subir imagen: ${uploadRes.error}`);
        finalImagenUrl = uploadRes.data;
      }

      let result;
      if (editingId) {
        result = await dbOperations.actualizarEquipo(
          editingId,
          formData.nombre.trim(),
          formData.codigo.trim(),
          parseInt(formData.ambiente_id),
          parseInt(formData.categoria_id),
          formData.descripcion.trim(),
          formData.estado,
          finalImagenUrl
        );
      } else {
        result = await dbOperations.crearEquipo(
          formData.nombre.trim(),
          formData.codigo.trim(),
          parseInt(formData.ambiente_id),
          parseInt(formData.categoria_id),
          formData.descripcion.trim(),
          finalImagenUrl
        );
      }

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
      const { error: statusError } = await dbOperations.cambiarEstadoEquipo(equipoId, estado);
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

  const filteredEquipos = equipos.filter(e => {
    const matchesSearch = !searchTerm || 
                         e.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         e.codigo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Comparación segura convirtiendo ambos a string para evitar problemas de tipos (int vs string)
    const matchesAmbiente = !filterAmbiente || String(e.ambiente_id) === String(filterAmbiente);
    const matchesCategoria = !filterCategoria || String(e.categoria_id) === String(filterCategoria);
    
    return matchesSearch && matchesAmbiente && matchesCategoria;
  });

  const columns = [
    { 
      key: 'nombre', 
      label: 'Equipo',
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-sm border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0">
            {row.imagen_url ? (
              <img src={row.imagen_url} alt={row.nombre} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-6 h-6 text-slate-300" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#002b45] text-sm uppercase tracking-tight">{row.nombre}</span>
            <span className="text-[10px] font-black text-[#98C560] uppercase tracking-widest">{row.codigo}</span>
          </div>
        </div>
      )
    },
    {
      key: 'ambiente',
      label: 'Ubicación',
      render: (row) => (
        <span className="text-gray-600 font-medium">
          {row.ambiente?.nombre || 'No asignado'}
        </span>
      ),
    },
    {
      key: 'categoria',
      label: 'Categoría',
      render: (row) => (
        <Badge color="gray">
          {row.categoria?.nombre || 'General'}
        </Badge>
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

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="bg-white p-8 rounded-lg shadow-premium border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-brand-navy p-4 rounded-sm shadow-lg">
            <Package className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-brand-navy tracking-tight uppercase">Equipos</h1>
            <p className="text-brand-teal font-bold text-xs tracking-widest uppercase mt-1">Inventario de Activos y Equipamiento</p>
          </div>
        </div>
        <Button onClick={handleNew} variant="primary">
          <Plus className="w-5 h-5 mr-2 inline" /> NUEVO EQUIPO
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-brand-border space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
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
                {ambientes.map(a => (
                  <option key={a.id} value={a.id}>{a.nombre.toUpperCase()}</option>
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
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre.toUpperCase()}</option>
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
            <h3 className="text-xl font-bold text-brand-navy mb-2 uppercase">No se encontraron equipos</h3>
            <p className="text-gray-500">Ajusta tus filtros o crea un nuevo equipo para comenzar.</p>
            {(searchTerm || filterAmbiente || filterCategoria) && (
              <Button 
                variant="secondary" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterAmbiente('');
                  setFilterCategoria('');
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
        title={editingId ? 'EDITAR EQUIPO' : 'NUEVO EQUIPO'}
        maxWidth="max-w-4xl"
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Columna Izquierda: Imagen y Estado */}
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
                        setFormData(prev => ({ ...prev, imagen_url: '' }));
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
                    <Upload className="w-8 h-8 text-[#98C560]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-[#002b45] uppercase tracking-widest">Cargar Imagen</p>
                    <p className="text-[9px] text-slate-400">Click para seleccionar archivo</p>
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

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-slate-200"></div>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">o usa una URL</span>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>

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
                  Estado del Equipo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['disponible', 'en_mantenimiento'].map((est) => (
                    <button
                      key={est}
                      onClick={() => setFormData(prev => ({ ...prev, estado: est }))}
                      className={`py-2 px-3 rounded-sm text-[9px] font-black uppercase tracking-wider transition-all border ${
                        formData.estado === est 
                          ? est === 'disponible' 
                            ? 'bg-[#98C560] border-[#98C560] text-white shadow-md' 
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
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <Info className="w-5 h-5 text-[#98C560]" />
                <h3 className="font-display font-black text-[#002b45] text-sm uppercase tracking-tight">Información General</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="NOMBRE DEL EQUIPO"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Microscopio Óptico"
                  required
                />
                <FormInput
                  label="CÓDIGO ÚNICO"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleInputChange}
                  placeholder="Ej: MICRO-001"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-[#002b45] uppercase tracking-[0.2em]">
                    <MapPin className="w-3 h-3 text-[#98C560]" /> UBICACIÓN
                  </label>
                  <select
                    name="ambiente_id"
                    value={formData.ambiente_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#98C560] transition-all font-sans text-xs font-bold text-slate-600 uppercase"
                  >
                    <option value="">Selecciona Laboratorio</option>
                    {ambientes.map(a => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-[#002b45] uppercase tracking-[0.2em]">
                    <Tag className="w-3 h-3 text-[#98C560]" /> CATEGORÍA
                  </label>
                  <select
                    name="categoria_id"
                    value={formData.categoria_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#98C560] transition-all font-sans text-xs font-bold text-slate-600 uppercase"
                  >
                    <option value="">Selecciona Categoría</option>
                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <FormInput
                label="ESPECIFICACIONES / NOTAS"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Detalles técnicos, marca, modelo, etc..."
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
                className="!py-3 !bg-[#002b45] hover:!bg-[#98C560] hover:!text-[#002b45]"
              >
                {isSaving ? 'PROCESANDO...' : editingId ? 'ACTUALIZAR EQUIPO' : 'REGISTRAR EQUIPO'}
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
        title="ELIMINAR EQUIPO"
        message="¿Estás seguro de que deseas eliminar este equipo del inventario? Esta acción es permanente y afectará el historial de préstamos."
        confirmText="ELIMINAR"
      />
    </div>
  );
}
