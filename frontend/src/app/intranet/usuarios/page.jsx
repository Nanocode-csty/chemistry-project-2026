'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/api';
import { Table, Button, Modal, FormInput, Badge } from '@/components/intranet/Forms';
import { Plus, Edit2, Trash2, Loader2, ArrowLeft, UserPlus, Shield, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CMSUsuarios() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    password: '',
    rol: 'laboratorio'
  });

  useEffect(() => {
    if (currentUser && currentUser.rol?.toLowerCase() !== 'admin') {
      router.replace('/intranet/dashboard');
    }
    fetchUsuarios();
  }, [currentUser, router]);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const { data, error } = await dbOperations.getUsuarios();
      if (data) setUsuarios(data);
      if (error) console.error(error);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUsuario) {
        await dbOperations.actualizarUsuario(editingUsuario.id, formData);
      } else {
        await dbOperations.crearUsuario(formData);
      }
      setIsModalOpen(false);
      setFormData({ email: '', nombre: '', password: '', rol: 'laboratorio' });
      setEditingUsuario(null);
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      alert('Error al procesar la solicitud');
    }
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      email: usuario.email,
      nombre: usuario.nombre || '',
      password: '', // No cargamos el password por seguridad
      rol: usuario.rol || 'laboratorio'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Seguro que deseas eliminar este usuario?')) {
      try {
        await dbOperations.eliminarUsuario(id);
        fetchUsuarios();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const columns = [
    { 
      key: 'nombre', 
      label: 'NOMBRE', 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-navy/10 flex items-center justify-center text-brand-navy">
            <User size={14} />
          </div>
          <span className="font-bold">{row.nombre || 'Sin nombre'}</span>
        </div>
      )
    },
    { key: 'email', label: 'EMAIL', render: (row) => <span className="text-slate-500">{row.email}</span> },
    { 
      key: 'rol', 
      label: 'ROL', 
      render: (row) => (
        <Badge color={row.rol === 'admin' ? 'blue' : 'yellow'}>
          {row.rol === 'admin' ? 'ADMINISTRADOR' : 'LABORATORIO'}
        </Badge>
      ) 
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-brand-navy animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-display font-black text-brand-navy uppercase tracking-tighter flex items-center gap-4">
            <Shield size={36} className="text-brand-accent" />
            GESTIÓN DE USUARIOS
          </h1>
          <p className="text-brand-muted mt-2 uppercase text-xs font-bold tracking-widest">Administra los accesos y roles del sistema de inventario</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <UserPlus size={20} /> NUEVO USUARIO
        </Button>
      </div>

      <Table
        columns={columns}
        data={usuarios}
        actions={(row) => (
          <>
            <button
              onClick={() => handleEdit(row)}
              className="p-2 text-brand-navy hover:bg-brand-light rounded-sm transition-colors"
              title="Editar"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => handleDelete(row.id)}
              className="p-2 text-brand-red hover:bg-red-50 rounded-sm transition-colors"
              title="Eliminar"
            >
              <Trash2 size={18} />
            </button>
          </>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUsuario(null);
          setFormData({ email: '', nombre: '', password: '', rol: 'laboratorio' });
        }}
        title={editingUsuario ? 'EDITAR USUARIO' : 'NUEVO USUARIO'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="EMAIL DE ACCESO"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="ejemplo@escuela-iq.edu"
            required
          />
          <FormInput
            label="NOMBRE COMPLETO"
            name="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Juan Pérez"
            required
          />
          <FormInput
            label={editingUsuario ? "CAMBIAR CONTRASEÑA (OPCIONAL)" : "CONTRASEÑA"}
            name="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="********"
            required={!editingUsuario}
          />
          
          <div className="mb-6">
            <label className="block font-display font-bold text-sm text-brand-navy tracking-widest mb-3 uppercase">ROL DEL USUARIO</label>
            <select
              value={formData.rol}
              onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
              className="w-full px-4 py-3 border-2 border-brand-border rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent bg-brand-gray/30 transition-all font-sans text-sm"
            >
              <option value="laboratorio">Laboratorio (Acceso Limitado)</option>
              <option value="admin">Administrador (Acceso Total)</option>
            </select>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              CANCELAR
            </Button>
            <Button type="submit">
              {editingUsuario ? 'GUARDAR CAMBIOS' : 'CREAR USUARIO'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
