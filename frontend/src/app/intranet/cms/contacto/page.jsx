'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/supabase';
import { FormInput, Button } from '@/components/intranet/Forms';
import { Save, Loader2, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CMSContacto() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contacto, setContacto] = useState({
    id: null,
    titulo: '',
    descripcion: '',
    email: '',
    telefono: '',
    direccion: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data, error } = await dbOperations.getContacto();
      if (data) setContacto(data);
      if (error) console.error(error);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await dbOperations.actualizarContacto(contacto);
      if (!error) alert('Datos de contacto actualizados');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/intranet/cms" className="flex items-center gap-2 text-brand-muted hover:text-brand-navy mb-8 font-bold uppercase text-sm">
        <ArrowLeft size={16} /> Volver al CMS
      </Link>

      <h1 className="text-4xl font-display font-black text-brand-navy uppercase tracking-tighter mb-12">
        GESTIÓN DE CONTACTO
      </h1>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} 
        className="bg-white p-10 shadow-premium rounded-sm border border-brand-border"
      >
        <div className="grid gap-8">
          <FormInput
            label="TÍTULO DE SECCIÓN"
            value={contacto.titulo}
            onChange={(e) => setContacto({...contacto, titulo: e.target.value})}
            required
          />
          <FormInput
            label="DESCRIPCIÓN DE CONTACTO"
            value={contacto.descripcion}
            onChange={(e) => setContacto({...contacto, descripcion: e.target.value})}
            textarea
            required
          />

          <div className="grid md:grid-cols-2 gap-8 border-t border-brand-border pt-10 mt-2">
            <div className="space-y-6">
              <h3 className="text-sm font-black text-brand-navy uppercase tracking-widest flex items-center gap-2">
                <Mail size={16} className="text-brand-teal" /> Email de Contacto
              </h3>
              <FormInput
                label="CORREO ELECTRÓNICO"
                value={contacto.email}
                onChange={(e) => setContacto({...contacto, email: e.target.value})}
                required
              />
            </div>
            <div className="space-y-6">
              <h3 className="text-sm font-black text-brand-navy uppercase tracking-widest flex items-center gap-2">
                <Phone size={16} className="text-brand-teal" /> Teléfono / WhatsApp
              </h3>
              <FormInput
                label="NÚMERO TELEFÓNICO"
                value={contacto.telefono}
                onChange={(e) => setContacto({...contacto, telefono: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black text-brand-navy uppercase tracking-widest flex items-center gap-2">
              <MapPin size={16} className="text-brand-teal" /> Ubicación Física
            </h3>
            <FormInput
              label="DIRECCIÓN COMPLETA"
              value={contacto.direccion}
              onChange={(e) => setContacto({...contacto, direccion: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="mt-12 flex justify-end">
          <Button type="submit" disabled={saving} className="flex items-center gap-3">
            {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save size={20} />}
            {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
