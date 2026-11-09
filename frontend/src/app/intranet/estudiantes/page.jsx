'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/api';
import {
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  Users,
  Search,
  Mail,
  Fingerprint,
  GraduationCap,
  BookOpen,
  Building2,
} from 'lucide-react';
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

export const AREAS_COORDINACION = [
  'Área de Química Orgánica',
  'Área de Química Analítica e Instrumental',
  'Área de Físico-Química y Procesos',
  'Área de Bioquímica y Biotecnología',
  'Área de Química General e Inorgánica',
  'Área de Ingeniería Ambiental y Materiales',
];

const ciclos = Array.from({ length: 10 }, (_, i) => ({
  value: i + 1,
  label: `Ciclo ${i + 1}`,
  id: i + 1,
  nombre: `Ciclo ${i + 1}`,
}));

export default function EstudiantesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [estudiantes, setEstudiantes] = useState([]);

  useEffect(() => {
    if (user && user.rol !== 'admin') {
      router.replace('/intranet/dashboard');
    }
  }, [user, router]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    matricula: '',
    ciclo: '',
    tipo_solicitante: 'coordinador',
    area_coordinacion: AREAS_COORDINACION[0],
    cursos_asignados: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState(''); // '' | 'coordinador' | 'estudiante'
  const [filterArea, setFilterArea] = useState('');
  const [isMounted, setIsMounted] = useState(false);

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
    setIsMounted(true);
    fetchEstudiantes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      nombre: '',
      email: '',
      matricula: '',
      ciclo: '',
      tipo_solicitante: 'coordinador',
      area_coordinacion: AREAS_COORDINACION[0],
      cursos_asignados: '',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      nombre: item.nombre || '',
      email: item.email || '',
      matricula: item.matricula || '',
      ciclo: item.ciclo || '',
      tipo_solicitante: item.tipo_solicitante || 'coordinador',
      area_coordinacion: item.area_coordinacion || AREAS_COORDINACION[0],
      cursos_asignados: item.cursos_asignados || '',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim() || !formData.matricula.trim()) {
      setError('Nombre completo y código / matrícula son requeridos');
      return;
    }

    if (
      formData.email &&
      !/^[a-zA-Z0-9._%+-]+@unitru\.edu\.pe$/.test(formData.email.trim())
    ) {
      setError('El correo debe ser del dominio institucional @unitru.edu.pe');
      return;
    }

    const duplicate = estudiantes.find(
      (e) =>
        e.matricula.toLowerCase() === formData.matricula.toLowerCase().trim() &&
        e.id !== editingId
    );

    if (duplicate) {
      setError(
        `Ya existe un coordinador o solicitante con el código "${formData.matricula}"`
      );
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        email: formData.email.trim() || null,
        matricula: formData.matricula.trim().toUpperCase(),
        ciclo: formData.ciclo ? parseInt(formData.ciclo) : null,
        tipo_solicitante: formData.tipo_solicitante || 'coordinador',
        area_coordinacion: formData.area_coordinacion?.trim() || null,
        cursos_asignados: formData.cursos_asignados?.trim() || null,
      };

      const result = editingId
        ? await dbOperations.actualizarEstudiante(editingId, payload)
        : await dbOperations.crearEstudiante(payload);

      const { error: saveError } = result;
      if (saveError) {
        if (typeof saveError === 'object' && saveError.error) {
          throw new Error(saveError.error);
        }
        throw new Error(saveError.message || 'Error al guardar');
      }

      await fetchEstudiantes();
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
      const { error: deleteError } = await dbOperations.eliminarEstudiante(deleteId);
      if (deleteError) throw deleteError;
      await fetchEstudiantes();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredEstudiantes = estudiantes.filter((e) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      e.nombre?.toLowerCase().includes(q) ||
      e.matricula?.toLowerCase().includes(q) ||
      e.area_coordinacion?.toLowerCase().includes(q) ||
      e.cursos_asignados?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q);

    const matchesRol =
      !filterRol || (e.tipo_solicitante || 'coordinador') === filterRol;
    const matchesArea =
      !filterArea || e.area_coordinacion === filterArea;

    return matchesSearch && matchesRol && matchesArea;
  });

  const columns = [
    {
      key: 'nombre',
      label: 'Coordinador / Solicitante',
      render: (row) => {
        const isCoord = (row.tipo_solicitante || 'coordinador') === 'coordinador';
        return (
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border ${
                isCoord
                  ? 'bg-[#002b45] text-[#9ABE00] border-[#002b45]'
                  : 'bg-brand-gray text-brand-navy border-brand-border'
              }`}
            >
              {row.nombre
                .split(' ')
                .filter((w) => !w.includes('.'))
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-brand-navy">{row.nombre}</span>
                <Badge color={isCoord ? 'navy' : 'teal'}>
                  {isCoord ? 'COORDINADOR DE ÁREA' : 'TESISTA / ESTUDIANTE'}
                </Badge>
              </div>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 text-[#9ABE00]" />
                {row.email || 'Sin correo institucional'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'matricula',
      label: 'Código / ID',
      render: (row) => (
        <div className="flex items-center gap-2 text-[#002b45]">
          <Fingerprint className="w-4 h-4 text-brand-teal" />
          <span className="font-mono font-black text-xs bg-slate-100 px-2 py-1 rounded-sm">
            {row.matricula}
          </span>
        </div>
      ),
    },
    {
      key: 'area',
      label: 'Área Académica Coordinada',
      render: (row) => (
        <div className="flex items-center gap-2 text-slate-700">
          <Building2 className="w-4 h-4 text-[#9ABE00] flex-shrink-0" />
          <span className="font-bold text-xs uppercase">
            {row.area_coordinacion || 'Área General de Química'}
          </span>
        </div>
      ),
    },
    {
      key: 'cursos',
      label: 'Cursos a Cargo / Asignaturas que Dicta',
      render: (row) => (
        <div className="flex flex-col gap-1 max-w-xs">
          <span className="text-xs font-medium text-slate-700">
            {row.cursos_asignados || 'Prácticas Generales de Laboratorio'}
          </span>
          {row.ciclo && (
            <span className="text-[10px] font-black text-brand-teal uppercase tracking-wider">
              Ciclo {row.ciclo}
            </span>
          )}
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
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-brand-navy tracking-tight uppercase">
              Coordinadores de Área y Solicitantes
            </h1>
            <p className="text-brand-teal font-bold text-xs tracking-widest uppercase mt-1">
              Responsables de Áreas Académicas y Cursos que Solicitan Dotación de Laboratorio
            </p>
          </div>
        </div>
        <Button onClick={handleNew} variant="primary">
          <Plus className="w-5 h-5 mr-2 inline" /> NUEVO COORDINADOR / SOLICITANTE
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-brand-border space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
          {[
            { value: '', label: `TODOS (${estudiantes.length})` },
            {
              value: 'coordinador',
              label: `COORDINADORES DE ÁREA (${
                estudiantes.filter(
                  (e) => (e.tipo_solicitante || 'coordinador') === 'coordinador'
                ).length
              })`,
            },
            {
              value: 'estudiante',
              label: `TESISTAS / ESTUDIANTES (${
                estudiantes.filter((e) => e.tipo_solicitante === 'estudiante')
                  .length
              })`,
            },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterRol(tab.value)}
              className={`px-4 py-2 rounded-sm font-display font-black text-[10px] tracking-widest uppercase transition-all ${
                filterRol === tab.value
                  ? 'bg-[#002b45] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:text-[#002b45]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por coordinador, código (ej. COORD-ORG1), área o curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-brand-gray/30 border-2 border-transparent focus:border-brand-accent rounded-sm outline-none transition-all font-sans text-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="bg-brand-gray/30 border border-brand-border rounded-sm px-4 py-3 focus:outline-none focus:border-brand-teal text-xs font-bold text-[#002b45] uppercase w-full md:w-72"
            >
              <option value="">TODAS LAS ÁREAS ACADÉMICAS</option>
              {AREAS_COORDINACION.map((area) => (
                <option key={area} value={area}>
                  {area.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          {(searchTerm || filterRol || filterArea) && (
            <Button
              variant="secondary"
              onClick={() => {
                setSearchTerm('');
                setFilterRol('');
                setFilterArea('');
              }}
            >
              Limpiar
            </Button>
          )}
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
        ) : filteredEstudiantes.length === 0 ? (
          <div className="p-20 text-center">
            <div className="bg-brand-gray inline-block p-6 rounded-full mb-6">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-brand-navy mb-2 uppercase">
              No se encontraron registros
            </h3>
            <p className="text-gray-500">
              Registra a los coordinadores de área encargados de solicitar materiales y reactivos para los cursos.
            </p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredEstudiantes}
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
        title={
          editingId
            ? 'EDITAR COORDINADOR / SOLICITANTE'
            : 'REGISTRAR COORDINADOR DE ÁREA / SOLICITANTE'
        }
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          {error && (
            <div className="bg-brand-red/10 border-l-4 border-brand-red p-4 rounded-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-brand-red" />
              <p className="text-brand-red font-bold text-sm">{error}</p>
            </div>
          )}

          {/* Selector de Rol */}
          <div>
            <label className="block font-display font-bold text-xs text-brand-navy tracking-widest mb-2 uppercase">
              TIPO DE SOLICITANTE
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: 'coordinador',
                  label: 'Coordinador de Área / Docente',
                  desc: 'Solicita dotación de insumos para cursos',
                },
                {
                  value: 'estudiante',
                  label: 'Tesista / Estudiante',
                  desc: 'Préstamos puntuales o investigación',
                },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      tipo_solicitante: t.value,
                    }))
                  }
                  className={`p-3 rounded-sm border text-left transition-all ${
                    formData.tipo_solicitante === t.value
                      ? 'bg-[#002b45] border-[#002b45] text-white shadow-md'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-[#002b45]/40'
                  }`}
                >
                  <div className="font-display font-black text-xs uppercase">
                    {t.label}
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 ${
                      formData.tipo_solicitante === t.value
                        ? 'text-[#9ABE00]'
                        : 'text-slate-400'
                    }`}
                  >
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <FormInput
            label={
              formData.tipo_solicitante === 'coordinador'
                ? 'NOMBRE COMPLETO DEL COORDINADOR / DOCENTE'
                : 'NOMBRE COMPLETO DEL ESTUDIANTE'
            }
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder={
              formData.tipo_solicitante === 'coordinador'
                ? 'Ej: Dr. Roberto Salazar Mendoza'
                : 'Ej: Juan Pérez García'
            }
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label={
                formData.tipo_solicitante === 'coordinador'
                  ? 'CÓDIGO DOCENTE / COORDINADOR'
                  : 'CÓDIGO DE MATRÍCULA'
              }
              name="matricula"
              value={formData.matricula}
              onChange={handleInputChange}
              placeholder={
                formData.tipo_solicitante === 'coordinador'
                  ? 'Ej: COORD-ORG1'
                  : 'Ej: 2021000001'
              }
              required
            />
            <FormInput
              label="CORREO INSTITUCIONAL (@unitru.edu.pe)"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="rsalazar@unitru.edu.pe"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-display font-bold text-xs text-brand-navy tracking-widest mb-2 uppercase">
                ÁREA ACADÉMICA QUE COORDINA
              </label>
              <select
                name="area_coordinacion"
                value={formData.area_coordinacion}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-brand-border rounded-sm bg-white font-bold text-xs text-[#002b45]"
              >
                {AREAS_COORDINACION.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <FormSelect
              label="CICLO REFERENCIAL DEL CURSO"
              name="ciclo"
              value={formData.ciclo}
              onChange={handleInputChange}
              options={[{ value: '', label: 'Todos / Multinivel' }, ...ciclos]}
            />
          </div>

          <FormInput
            label="CURSOS / ASIGNATURAS QUE SE DICTAN (SEPARADOS POR COMA)"
            name="cursos_asignados"
            value={formData.cursos_asignados}
            onChange={handleInputChange}
            placeholder="Ej: Química Orgánica I, Química Orgánica II, Síntesis Orgánica"
          />

          <div className="flex gap-4 pt-2">
            <Button
              onClick={() => setIsModalOpen(false)}
              variant="secondary"
              fullWidth
            >
              CANCELAR
            </Button>
            <Button onClick={handleSave} disabled={isSaving} fullWidth>
              {isSaving ? 'GUARDANDO...' : 'GUARDAR REGISTRO'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="ELIMINAR REGISTRO"
        message="¿Estás seguro de que deseas eliminar a este coordinador/solicitante del registro?"
        confirmText="ELIMINAR"
      />
    </div>
  );
}
