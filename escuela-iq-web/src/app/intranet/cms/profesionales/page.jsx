'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/supabase';
import { FormInput, Button, Table, Modal } from '@/components/intranet/Forms';
import { Save, Loader2, ArrowLeft, Award, Zap, BarChart3, Plus, Edit2, Trash2, Factory, Trophy, Share2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CMSProfesionales() {
  const [loading, setLoading] = useState(true);
  const [savingHeader, setSavingHeader] = useState(false);
  const [header, setHeader] = useState({ id: null, titulo: '', descripcion: '', alianza_titulo: '' });
  
  // Lists
  const [servicios, setServicios] = useState([]);
  const [stats, setStats] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [concursos, setConcursos] = useState([]);
  const [transferencia, setTransferencia] = useState([]);
  
  // Modal states
  const [modalType, setModalType] = useState(null); // 'servicio', 'stat', 'proyecto', 'concurso', 'transferencia'
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [savingItem, setSavingItem] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [headerRes, servRes, statsRes, proyRes, concRes, transRes] = await Promise.all([
        dbOperations.getProfesionalesHeader(),
        dbOperations.getServicios(),
        dbOperations.getStats(),
        dbOperations.getProyectos(),
        dbOperations.getConcursos(),
        dbOperations.getTransferencia()
      ]);
      if (headerRes.data) setHeader(headerRes.data);
      if (servRes.data) setServicios(servRes.data);
      if (statsRes.data) setStats(statsRes.data);
      if (proyRes.data) setProyectos(proyRes.data);
      if (concRes.data) setConcursos(concRes.data);
      if (transRes.data) setTransferencia(transRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleHeaderSubmit = async (e) => {
    e.preventDefault();
    setSavingHeader(true);
    try {
      const { error } = await dbOperations.actualizarProfesionalesHeader(header);
      if (!error) alert('Configuración industrial actualizada');
    } catch (err) {
      console.error(err);
    } finally {
      setSavingHeader(false);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item || getInitialState(type));
    setShowModal(true);
  };

  const getInitialState = (type) => {
    switch (type) {
      case 'servicio': return { titulo: '', descripcion: '', icono: '', link: '', orden: 0 };
      case 'stat': return { valor: '', etiqueta: '', orden: 0 };
      case 'proyecto': return { titulo: '', descripcion: '', empresa: '', imagen_url: '', anio: '', orden: 0 };
      case 'concurso': return { titulo: '', descripcion: '', premio: '', anio: '', orden: 0 };
      case 'transferencia': return { titulo: '', descripcion: '', tecnologia: '', impacto: '', orden: 0 };
      default: return {};
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    setSavingItem(true);
    try {
      let res;
      if (modalType === 'servicio') {
        res = editingItem.id ? await dbOperations.actualizarServicio(editingItem.id, editingItem) : await dbOperations.crearServicio(editingItem);
      } else if (modalType === 'stat') {
        res = editingItem.id ? await dbOperations.actualizarStat(editingItem.id, editingItem) : await dbOperations.crearStat(editingItem);
      } else if (modalType === 'proyecto') {
        res = editingItem.id ? await dbOperations.actualizarProyecto(editingItem.id, editingItem) : await dbOperations.crearProyecto(editingItem);
      } else if (modalType === 'concurso') {
        res = editingItem.id ? await dbOperations.actualizarConcurso(editingItem.id, editingItem) : await dbOperations.crearConcurso(editingItem);
      } else if (modalType === 'transferencia') {
        res = editingItem.id ? await dbOperations.actualizarTransferencia(editingItem.id, editingItem) : await dbOperations.crearTransferencia(editingItem);
      }

      if (!res.error) {
        await fetchData();
        setShowModal(false);
      } else {
        alert('Error: ' + res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (type, id) => {
    if (!confirm('¿Eliminar este elemento?')) return;
    try {
      let res;
      if (type === 'servicio') res = await dbOperations.eliminarServicio(id);
      else if (type === 'stat') res = await dbOperations.eliminarStat(id);
      else if (type === 'proyecto') res = await dbOperations.eliminarProyecto(id);
      else if (type === 'concurso') res = await dbOperations.eliminarConcurso(id);
      else if (type === 'transferencia') res = await dbOperations.eliminarTransferencia(id);
      
      if (!res.error) await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-navy" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link href="/intranet/cms" className="flex items-center gap-2 text-brand-muted hover:text-brand-navy mb-8 font-bold uppercase text-sm">
        <ArrowLeft size={16} /> Volver al CMS
      </Link>

      <h1 className="text-4xl font-display font-black text-brand-navy uppercase tracking-tighter mb-12">
        GESTIÓN LIDERAZGO INDUSTRIAL
      </h1>

      {/* Header Form */}
      <section className="mb-16">
        <div className="bg-white p-8 border border-brand-border shadow-premium rounded-sm">
          <h2 className="text-xl font-display font-black text-brand-navy uppercase mb-6 flex items-center gap-3">
            <Award size={24} className="text-brand-teal" /> Configuración General
          </h2>
          <form onSubmit={handleHeaderSubmit}>
            <div className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormInput
                  label="TÍTULO PRINCIPAL"
                  value={header.titulo}
                  onChange={(e) => setHeader({...header, titulo: e.target.value})}
                  required
                />
                <FormInput
                  label="TÍTULO BANNER ALIANZA"
                  value={header.alianza_titulo}
                  onChange={(e) => setHeader({...header, alianza_titulo: e.target.value})}
                  required
                />
              </div>
              <FormInput
                label="DESCRIPCIÓN DE LIDERAZGO"
                value={header.descripcion}
                onChange={(e) => setHeader({...header, descripcion: e.target.value})}
                textarea
                required
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={savingHeader}>
                  {savingHeader ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                  <span className="ml-2">GUARDAR CONFIGURACIÓN</span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Servicios */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-display font-black text-brand-navy uppercase flex items-center gap-3">
              <Zap size={24} className="text-brand-teal" /> Servicios
            </h2>
            <Button variant="secondary" onClick={() => openModal('servicio')} className="!py-2">
              <Plus size={16} />
            </Button>
          </div>
          <Table
            columns={[
              { key: 'orden', label: '#' },
              { key: 'titulo', label: 'SERVICIO' }
            ]}
            data={servicios}
            actions={(row) => (
              <div className="flex gap-2">
                <button onClick={() => openModal('servicio', row)} className="p-2 hover:bg-brand-light text-brand-navy"><Edit2 size={14} /></button>
                <button onClick={() => handleDeleteItem('servicio', row.id)} className="p-2 hover:bg-red-50 text-brand-red"><Trash2 size={14} /></button>
              </div>
            )}
          />
        </section>

        {/* Stats */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-display font-black text-brand-navy uppercase flex items-center gap-3">
              <BarChart3 size={24} className="text-brand-teal" /> Estadísticas
            </h2>
            <Button variant="secondary" onClick={() => openModal('stat')} className="!py-2">
              <Plus size={16} />
            </Button>
          </div>
          <Table
            columns={[
              { key: 'valor', label: 'VALOR' },
              { key: 'etiqueta', label: 'ETIQUETA' }
            ]}
            data={stats}
            actions={(row) => (
              <div className="flex gap-2">
                <button onClick={() => openModal('stat', row)} className="p-2 hover:bg-brand-light text-brand-navy"><Edit2 size={14} /></button>
                <button onClick={() => handleDeleteItem('stat', row.id)} className="p-2 hover:bg-red-50 text-brand-red"><Trash2 size={14} /></button>
              </div>
            )}
          />
        </section>
      </div>

      {/* Proyectos Industriales */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-display font-black text-brand-navy uppercase flex items-center gap-3">
            <Factory size={24} className="text-brand-teal" /> Proyectos Industriales
          </h2>
          <Button variant="secondary" onClick={() => openModal('proyecto')} className="flex items-center gap-2">
            <Plus size={18} /> AÑADIR PROYECTO
          </Button>
        </div>
        <Table
          columns={[
            { key: 'anio', label: 'AÑO' },
            { key: 'empresa', label: 'EMPRESA' },
            { key: 'titulo', label: 'PROYECTO' }
          ]}
          data={proyectos}
          actions={(row) => (
            <div className="flex gap-2">
              <button onClick={() => openModal('proyecto', row)} className="p-2 hover:bg-brand-light text-brand-navy"><Edit2 size={16} /></button>
              <button onClick={() => handleDeleteItem('proyecto', row.id)} className="p-2 hover:bg-red-50 text-brand-red"><Trash2 size={16} /></button>
            </div>
          )}
        />
      </section>

      {/* Concursos y Premios */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-display font-black text-brand-navy uppercase flex items-center gap-3">
            <Trophy size={24} className="text-brand-teal" /> Concursos y Premios
          </h2>
          <Button variant="secondary" onClick={() => openModal('concurso')} className="flex items-center gap-2">
            <Plus size={18} /> AÑADIR CONCURSO
          </Button>
        </div>
        <Table
          columns={[
            { key: 'anio', label: 'AÑO' },
            { key: 'titulo', label: 'TÍTULO' },
            { key: 'premio', label: 'PREMIO' }
          ]}
          data={concursos}
          actions={(row) => (
            <div className="flex gap-2">
              <button onClick={() => openModal('concurso', row)} className="p-2 hover:bg-brand-light text-brand-navy"><Edit2 size={16} /></button>
              <button onClick={() => handleDeleteItem('concurso', row.id)} className="p-2 hover:bg-red-50 text-brand-red"><Trash2 size={16} /></button>
            </div>
          )}
        />
      </section>

      {/* Transferencia Tecnológica */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-display font-black text-brand-navy uppercase flex items-center gap-3">
            <Share2 size={24} className="text-brand-teal" /> Transferencia Tecnológica
          </h2>
          <Button variant="secondary" onClick={() => openModal('transferencia')} className="flex items-center gap-2">
            <Plus size={18} /> AÑADIR TRANSFERENCIA
          </Button>
        </div>
        <Table
          columns={[
            { key: 'tecnologia', label: 'TECNOLOGÍA' },
            { key: 'titulo', label: 'TÍTULO' },
            { key: 'impacto', label: 'IMPACTO', render: (row) => <span className="text-xs">{row.impacto}</span> }
          ]}
          data={transferencia}
          actions={(row) => (
            <div className="flex gap-2">
              <button onClick={() => openModal('transferencia', row)} className="p-2 hover:bg-brand-light text-brand-navy"><Edit2 size={16} /></button>
              <button onClick={() => handleDeleteItem('transferencia', row.id)} className="p-2 hover:bg-red-50 text-brand-red"><Trash2 size={16} /></button>
            </div>
          )}
        />
      </section>

      {/* Modal Compartido */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title={`${editingItem?.id ? 'EDITAR' : 'AÑADIR'} ${modalType?.toUpperCase()}`}
      >
        <form onSubmit={handleSaveItem} className="grid gap-4">
          {modalType === 'servicio' && (
            <>
              <FormInput label="TÍTULO" value={editingItem.titulo} onChange={e => setEditingItem({...editingItem, titulo: e.target.value})} required />
              <FormInput label="DESCRIPCIÓN" value={editingItem.descripcion} onChange={e => setEditingItem({...editingItem, descripcion: e.target.value})} textarea />
              <FormInput label="ICONO (NOMBRE LUCIDE)" value={editingItem.icono} onChange={e => setEditingItem({...editingItem, icono: e.target.value})} placeholder="Zap, Award, etc." />
              <FormInput label="ORDEN" type="number" value={editingItem.orden} onChange={e => setEditingItem({...editingItem, orden: parseInt(e.target.value)})} />
            </>
          )}

          {modalType === 'stat' && (
            <>
              <FormInput label="VALOR" value={editingItem.valor} onChange={e => setEditingItem({...editingItem, valor: e.target.value})} required placeholder="Ej: 85+" />
              <FormInput label="ETIQUETA" value={editingItem.etiqueta} onChange={e => setEditingItem({...editingItem, etiqueta: e.target.value})} required placeholder="Ej: Proyectos Ejecutados" />
              <FormInput label="ORDEN" type="number" value={editingItem.orden} onChange={e => setEditingItem({...editingItem, orden: parseInt(e.target.value)})} />
            </>
          )}

          {modalType === 'proyecto' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="AÑO" value={editingItem.anio} onChange={e => setEditingItem({...editingItem, anio: e.target.value})} required />
                <FormInput label="EMPRESA" value={editingItem.empresa} onChange={e => setEditingItem({...editingItem, empresa: e.target.value})} required />
              </div>
              <FormInput label="TÍTULO" value={editingItem.titulo} onChange={e => setEditingItem({...editingItem, titulo: e.target.value})} required />
              <FormInput label="DESCRIPCIÓN" value={editingItem.descripcion} onChange={e => setEditingItem({...editingItem, descripcion: e.target.value})} textarea />
              <FormInput label="URL IMAGEN" value={editingItem.imagen_url} onChange={e => setEditingItem({...editingItem, imagen_url: e.target.value})} />
              <FormInput label="ORDEN" type="number" value={editingItem.orden} onChange={e => setEditingItem({...editingItem, orden: parseInt(e.target.value)})} />
            </>
          )}

          {modalType === 'concurso' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="AÑO" value={editingItem.anio} onChange={e => setEditingItem({...editingItem, anio: e.target.value})} required />
                <FormInput label="PREMIO" value={editingItem.premio} onChange={e => setEditingItem({...editingItem, premio: e.target.value})} required />
              </div>
              <FormInput label="TÍTULO" value={editingItem.titulo} onChange={e => setEditingItem({...editingItem, titulo: e.target.value})} required />
              <FormInput label="DESCRIPCIÓN" value={editingItem.descripcion} onChange={e => setEditingItem({...editingItem, descripcion: e.target.value})} textarea />
              <FormInput label="ORDEN" type="number" value={editingItem.orden} onChange={e => setEditingItem({...editingItem, orden: parseInt(e.target.value)})} />
            </>
          )}

          {modalType === 'transferencia' && (
            <>
              <FormInput label="TECNOLOGÍA" value={editingItem.tecnologia} onChange={e => setEditingItem({...editingItem, tecnologia: e.target.value})} required />
              <FormInput label="TÍTULO" value={editingItem.titulo} onChange={e => setEditingItem({...editingItem, titulo: e.target.value})} required />
              <FormInput label="DESCRIPCIÓN" value={editingItem.descripcion} onChange={e => setEditingItem({...editingItem, descripcion: e.target.value})} textarea />
              <FormInput label="IMPACTO" value={editingItem.impacto} onChange={e => setEditingItem({...editingItem, impacto: e.target.value})} />
              <FormInput label="ORDEN" type="number" value={editingItem.orden} onChange={e => setEditingItem({...editingItem, orden: parseInt(e.target.value)})} />
            </>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>CANCELAR</Button>
            <Button type="submit" disabled={savingItem}>
              {savingItem ? <Loader2 className="animate-spin" /> : <Save size={18} />}
              <span className="ml-2">GUARDAR CAMBIOS</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

