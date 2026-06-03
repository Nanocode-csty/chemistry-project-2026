'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/supabase';
import { FormInput, Button, Table, Modal } from '@/components/intranet/Forms';
import { Save, Loader2, ArrowLeft, Users, Microscope, ScrollText, Lightbulb, Plus, Edit2, Trash2, ExternalLink, FileDown } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CMSEstudiantes() {
  const [loading, setLoading] = useState(true);
  const [savingHeader, setSavingHeader] = useState(false);
  const [header, setHeader] = useState({ id: null, titulo: '', descripcion: '' });
  
  // States for lists
  const [investigaciones, setInvestigaciones] = useState([]);
  const [papers, setPapers] = useState([]);
  const [patentes, setPatentes] = useState([]);
  
  // States for modals
  const [modalType, setModalType] = useState(null); // 'investigacion', 'paper', 'patente'
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [savingItem, setSavingItem] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [headerRes, invRes, papersRes, patentesRes] = await Promise.all([
        dbOperations.getEstudiantesHeader(),
        dbOperations.getInvestigaciones(),
        dbOperations.getPapers(),
        dbOperations.getPatentes()
      ]);
      if (headerRes.data) setHeader(headerRes.data);
      if (invRes.data) setInvestigaciones(invRes.data);
      if (papersRes.data) setPapers(papersRes.data);
      if (patentesRes.data) setPatentes(patentesRes.data);
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
      const { error } = await dbOperations.actualizarEstudiantesHeader(header);
      if (!error) alert('Cabecera actualizada con éxito');
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
      case 'investigacion': return { titulo: '', descripcion: '', link: '', orden: 0 };
      case 'paper': return { titulo: '', resumen: '', anio: new Date().getFullYear().toString(), revista: '', autores: '', doi: '', pdf_url: '', link: '', orden: 0 };
      case 'patente': return { titulo: '', orden: 0 };
      default: return {};
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    setSavingItem(true);
    try {
      let res;
      if (modalType === 'investigacion') {
        res = editingItem.id 
          ? await dbOperations.actualizarInvestigacion(editingItem.id, editingItem)
          : await dbOperations.crearInvestigacion(editingItem);
      } else if (modalType === 'paper') {
        // Validaciones para papers
        if (!editingItem.anio || isNaN(editingItem.anio)) {
          alert('El año debe ser un número válido');
          setSavingItem(false);
          return;
        }
        res = editingItem.id 
          ? await dbOperations.actualizarPaper(editingItem.id, editingItem)
          : await dbOperations.crearPaper(editingItem);
      } else if (modalType === 'patente') {
        res = editingItem.id 
          ? await dbOperations.actualizarPatente(editingItem.id, editingItem)
          : await dbOperations.crearPatente(editingItem);
      }

      if (!res.error) {
        await fetchData();
        setShowModal(false);
      } else {
        alert('Error al guardar: ' + res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (type, id) => {
    if (!confirm('¿Estás seguro de eliminar este elemento?')) return;
    try {
      let res;
      if (type === 'investigacion') res = await dbOperations.eliminarInvestigacion(id);
      else if (type === 'paper') res = await dbOperations.eliminarPaper(id);
      else if (type === 'patente') res = await dbOperations.eliminarPatente(id);
      
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
        GESTIÓN SECCIÓN ESTUDIANTES
      </h1>

      {/* Header Form */}
      <section className="mb-16">
        <div className="bg-white p-8 border border-brand-border shadow-premium rounded-sm">
          <h2 className="text-xl font-display font-black text-brand-navy uppercase mb-6 flex items-center gap-3">
            <Users size={24} className="text-brand-teal" /> Cabecera de Sección
          </h2>
          <form onSubmit={handleHeaderSubmit}>
            <div className="grid gap-6">
              <FormInput
                label="TÍTULO DE SECCIÓN"
                value={header.titulo}
                onChange={(e) => setHeader({...header, titulo: e.target.value})}
                required
              />
              <FormInput
                label="DESCRIPCIÓN"
                value={header.descripcion}
                onChange={(e) => setHeader({...header, descripcion: e.target.value})}
                textarea
                required
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={savingHeader}>
                  {savingHeader ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                  <span className="ml-2">GUARDAR CABECERA</span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Investigaciones Table */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-display font-black text-brand-navy uppercase flex items-center gap-3">
            <Microscope size={24} className="text-brand-teal" /> Investigación Académica
          </h2>
          <Button variant="secondary" onClick={() => openModal('investigacion')} className="flex items-center gap-2">
            <Plus size={18} /> AÑADIR INVESTIGACIÓN
          </Button>
        </div>
        <Table
          columns={[
            { key: 'orden', label: 'ORDEN' },
            { key: 'titulo', label: 'TÍTULO' },
            { key: 'descripcion', label: 'DESCRIPCIÓN', render: (row) => <p className="truncate max-w-xs">{row.descripcion}</p> }
          ]}
          data={investigaciones}
          actions={(row) => (
            <div className="flex gap-2">
              <button onClick={() => openModal('investigacion', row)} className="p-2 hover:bg-brand-light text-brand-navy"><Edit2 size={16} /></button>
              <button onClick={() => handleDeleteItem('investigacion', row.id)} className="p-2 hover:bg-red-50 text-brand-red"><Trash2 size={16} /></button>
            </div>
          )}
        />
      </section>

      {/* Papers Table */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-display font-black text-brand-navy uppercase flex items-center gap-3">
            <ScrollText size={24} className="text-brand-teal" /> Papers Científicos
          </h2>
          <Button variant="secondary" onClick={() => openModal('paper')} className="flex items-center gap-2">
            <Plus size={18} /> AÑADIR PAPER
          </Button>
        </div>
        <Table
          columns={[
            { key: 'anio', label: 'AÑO' },
            { key: 'revista', label: 'REVISTA' },
            { key: 'titulo', label: 'TÍTULO', render: (row) => <span className="font-bold">{row.titulo}</span> },
            { key: 'autores', label: 'AUTORES' },
            { key: 'pdf_url', label: 'PDF', render: (row) => row.pdf_url ? <FileDown size={18} className="text-brand-teal" /> : <span className="text-brand-muted">-</span> }
          ]}
          data={papers}
          actions={(row) => (
            <div className="flex gap-2">
              <button onClick={() => openModal('paper', row)} className="p-2 hover:bg-brand-light text-brand-navy"><Edit2 size={16} /></button>
              <button onClick={() => handleDeleteItem('paper', row.id)} className="p-2 hover:bg-red-50 text-brand-red"><Trash2 size={16} /></button>
            </div>
          )}
        />
      </section>

      {/* Patentes Table */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-display font-black text-brand-navy uppercase flex items-center gap-3">
            <Lightbulb size={24} className="text-brand-teal" /> Patentes Académicas
          </h2>
          <Button variant="secondary" onClick={() => openModal('patente')} className="flex items-center gap-2">
            <Plus size={18} /> AÑADIR PATENTE
          </Button>
        </div>
        <Table
          columns={[
            { key: 'orden', label: 'ORDEN' },
            { key: 'titulo', label: 'TÍTULO DE PATENTE' }
          ]}
          data={patentes}
          actions={(row) => (
            <div className="flex gap-2">
              <button onClick={() => openModal('patente', row)} className="p-2 hover:bg-brand-light text-brand-navy"><Edit2 size={16} /></button>
              <button onClick={() => handleDeleteItem('patente', row.id)} className="p-2 hover:bg-red-50 text-brand-red"><Trash2 size={16} /></button>
            </div>
          )}
        />
      </section>

      {/* Shared Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title={`${editingItem?.id ? 'EDITAR' : 'AÑADIR'} ${modalType?.toUpperCase()}`}
      >
        <form onSubmit={handleSaveItem} className="grid gap-4">
          {modalType === 'investigacion' && (
            <>
              <FormInput 
                label="TÍTULO" 
                value={editingItem.titulo} 
                onChange={e => setEditingItem({...editingItem, titulo: e.target.value})} 
                required 
              />
              <FormInput 
                label="DESCRIPCIÓN" 
                value={editingItem.descripcion} 
                onChange={e => setEditingItem({...editingItem, descripcion: e.target.value})} 
                textarea 
                required 
              />
              <FormInput 
                label="LINK EXTERNO (OPCIONAL)" 
                value={editingItem.link} 
                onChange={e => setEditingItem({...editingItem, link: e.target.value})} 
              />
              <FormInput 
                label="ORDEN" 
                type="number" 
                value={editingItem.orden} 
                onChange={e => setEditingItem({...editingItem, orden: parseInt(e.target.value)})} 
              />
            </>
          )}

          {modalType === 'paper' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormInput 
                  label="AÑO" 
                  value={editingItem.anio} 
                  onChange={e => setEditingItem({...editingItem, anio: e.target.value})} 
                  required 
                />
                <FormInput 
                  label="REVISTA" 
                  value={editingItem.revista} 
                  onChange={e => setEditingItem({...editingItem, revista: e.target.value})} 
                  required 
                />
              </div>
              <FormInput 
                label="TÍTULO" 
                value={editingItem.titulo} 
                onChange={e => setEditingItem({...editingItem, titulo: e.target.value})} 
                required 
              />
              <FormInput 
                label="RESUMEN (ABSTRACT)" 
                value={editingItem.resumen} 
                onChange={e => setEditingItem({...editingItem, resumen: e.target.value})} 
                textarea 
                required 
              />
              <FormInput 
                label="AUTORES (SEPARADOS POR COMA)" 
                value={editingItem.autores} 
                onChange={e => setEditingItem({...editingItem, autores: e.target.value})} 
                required 
              />
              <div className="grid grid-cols-2 gap-4">
                <FormInput 
                  label="DOI" 
                  placeholder="Ej: 10.1016/j.cej.2024.12345"
                  value={editingItem.doi} 
                  onChange={e => setEditingItem({...editingItem, doi: e.target.value})} 
                />
                <FormInput 
                  label="URL PDF" 
                  placeholder="https://ejemplo.com/paper.pdf"
                  value={editingItem.pdf_url} 
                  onChange={e => setEditingItem({...editingItem, pdf_url: e.target.value})} 
                />
              </div>
              <FormInput 
                label="LINK EXTERNO" 
                value={editingItem.link} 
                onChange={e => setEditingItem({...editingItem, link: e.target.value})} 
              />
              <FormInput 
                label="ORDEN" 
                type="number" 
                value={editingItem.orden} 
                onChange={e => setEditingItem({...editingItem, orden: parseInt(e.target.value)})} 
              />
            </>
          )}

          {modalType === 'patente' && (
            <>
              <FormInput 
                label="TÍTULO DE LA PATENTE" 
                value={editingItem.titulo} 
                onChange={e => setEditingItem({...editingItem, titulo: e.target.value})} 
                required 
              />
              <FormInput 
                label="ORDEN" 
                type="number" 
                value={editingItem.orden} 
                onChange={e => setEditingItem({...editingItem, orden: parseInt(e.target.value)})} 
              />
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

