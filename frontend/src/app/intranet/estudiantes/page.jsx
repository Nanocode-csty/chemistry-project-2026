'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/api';
import { Plus, Trash2, Edit2, AlertCircle, Users, Search, Mail, Fingerprint, GraduationCap } from 'lucide-react';
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
  });
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCiclo, setFilterCiclo] = useState('');
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
    setFormData({ nombre: '', email: '', matricula: '', ciclo: '' });
    setError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (estudiante) => {
    setEditingId(estudiante.id);
    setFormData({
      nombre: estudiante.nombre,
      email: estudiante.email || '',
      matricula: estudiante.matricula,
      ciclo: estudiante.ciclo || '',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    // Validations
    if (!formData.nombre.trim() || !formData.matricula.trim()) {
      setError('Nombre y matrícula son requeridos');
      return;
    }
    // Validate matricula is exactly 10 digits
    if (!/^\d{10}$/.test(formData.matricula.trim())) {
      setError('La matrícula debe ser exactamente 10 dígitos numéricos');
      return;
    }
    // Validate email ends with @unitru.edu.pe
    if (formData.email && !/^[a-zA-Z0-9._%+-]+@unitru\.edu\.pe$/.test(formData.email.trim())) {
      setError('El correo debe ser del dominio @unitru.edu.pe');
      return;
    }

    // Validate duplicate
    const duplicate = estudiantes.find(e => 
      e.matricula.toLowerCase() === formData.matricula.toLowerCase().trim() && 
      e.id !== editingId
    );

    if (duplicate) {
      setError(`Ya existe un estudiante con la matrícula "${formData.matricula}"`);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let result;
      if (editingId) {
        result = await dbOperations.actualizarEstudiante(
          editingId,
          formData.nombre.trim(),
          formData.email.trim(),
          formData.matricula.trim(),
          formData.ciclo || null,
        );
      } else {
        result = await dbOperations.crearEstudiante(
          formData.nombre.trim(),
          formData.email.trim(),
          formData.matricula.trim(),
          formData.ciclo || null,
        );
      }

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

  const filteredEstudiantes = estudiantes.filter(e => {
    const matchesSearch = !searchTerm || 
      e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.email && e.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCiclo = !filterCiclo || String(e.ciclo) === String(filterCiclo);
    
    return matchesSearch && matchesCiclo;
  });

  const columns = [
    { 
      key: 'nombre', 
      label: 'Estudiante',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-gray flex items-center justify-center text-brand-navy font-black text-xs border border-brand-border">
            {row.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-brand-navy">{row.nombre}</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Inscrito</span>
          </div>
        </div>
      )
    },
    { 
      key: 'matricula', 
      label: 'Matrícula',
      render: (row) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Fingerprint className="w-4 h-4 text-brand-teal" />
          <span className="font-mono font-bold text-sm">{row.matricula}</span>
        </div>
      )
    },
    { 
      key: 'email', 
      label: 'Contacto',
      render: (row) => (
        <div className="flex items-center gap-2 text-gray-500">
          <Mail className="w-4 h-4 text-brand-accent" />
          <span className="text-sm">{row.email || 'No registrado'}</span>
        </div>
      )
    },
    { 
      key: 'ciclo', 
      label: 'Ciclo',
      render: (row) => (
        <div className="flex items-center gap-2 text-gray-600">
          <GraduationCap className="w-4 h-4 text-brand-navy" />
          <Badge color="teal">{row.ciclo ? `Ciclo ${row.ciclo}` : 'N/A'}</Badge>
        </div>
      )
    },
    { 
      key: 'id', 
      label: 'ID', 
      render: (row) => <Badge color="gray">#{row.id}</Badge> 
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
            <h1 className="text-3xl font-black text-brand-navy tracking-tight uppercase">Estudiantes</h1>
            <p className="text-brand-teal font-bold text-xs tracking-widest uppercase mt-1">Registro y Control Académico</p>
          </div>
        </div>
        <Button onClick={handleNew} variant="primary">
          <Plus className="w-5 h-5 mr-2 inline" /> NUEVO ESTUDIANTE
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-brand-border flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, matrícula o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-brand-gray/30 border-2 border-transparent focus:border-brand-accent rounded-sm outline-none transition-all font-sans"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm font-medium text-gray-500">Ciclo:</span>
          <select
            value={filterCiclo}
            onChange={(e) => setFilterCiclo(e.target.value)}
            className="bg-brand-gray/30 border border-brand-border rounded-sm px-4 py-3 focus:outline-none focus:border-brand-teal text-sm font-medium"
          >
            <option value="">Todos los ciclos</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(ciclo => (
              <option key={ciclo} value={ciclo}>Ciclo {ciclo}</option>
            ))}
          </select>
        </div>
        {(searchTerm || filterCiclo) && (
          <Button 
            variant="secondary" 
            onClick={() => {
              setSearchTerm('');
              setFilterCiclo('');
            }}
          >
            Limpiar filtros
          </Button>
        )}
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
        ) : filteredEstudiantes.length === 0 ? (
          <div className="p-20 text-center">
            <div className="bg-brand-gray inline-block p-6 rounded-full mb-6">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-brand-navy mb-2 uppercase">No se encontraron estudiantes</h3>
            <p className="text-gray-500">Mantén un registro de los alumnos que utilizan los laboratorios.</p>
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
        title={editingId ? 'EDITAR ESTUDIANTE' : 'NUEVO ESTUDIANTE'}
      >
        <div className="space-y-6">
          <FormInput
            label="NOMBRE COMPLETO"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder="Ej: Juan Pérez García"
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="MATRÍCULA (10 DÍGITOS)"
              name="matricula"
              value={formData.matricula}
              onChange={handleInputChange}
              placeholder="Ej: 2024000001"
              required
            />
            <FormInput
              label="CORREO ELECTRÓNICO (@unitru.edu.pe)"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="juan.perez@unitru.edu.pe"
            />
          </div>
          <FormSelect
            label="CICLO"
            name="ciclo"
            value={formData.ciclo}
            onChange={handleInputChange}
            options={[{ value: '', label: 'Seleccione un ciclo' }, ...ciclos]}
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
        title="ELIMINAR ESTUDIANTE"
        message="¿Estás seguro de que deseas eliminar a este estudiante del registro? Se perderá su historial de contacto asociado."
        confirmText="ELIMINAR"
      />
    </div>
  );
}
