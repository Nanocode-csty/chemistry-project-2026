'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dbOperations } from '@/lib/supabase';
import { Mail, Phone, MapPin, Send, MessageSquare, User, Building, Sparkles, Loader2 } from 'lucide-react';

const Contacto = () => {
  const [contacto, setContacto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    organizacion: '',
    email: '',
    mensaje: ''
  });

  useEffect(() => {
    const fetchContacto = async () => {
      try {
        const { data, error } = await dbOperations.getContacto();
        if (data) setContacto(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacto();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWhatsAppSend = (e) => {
    e.preventDefault();
    if (!contacto?.telefono) return;

    const cleanPhone = contacto.telefono.replace(/\D/g, '');
    const message = `*Nueva Consulta Institucional - LABCAM*\n\n` +
      `*Nombre:* ${formData.nombre}\n` +
      `*Organización:* ${formData.organizacion}\n` +
      `*Email:* ${formData.email}\n` +
      `*Mensaje:* ${formData.mensaje}`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
  };

  if (loading) return <div className="py-20 flex justify-center bg-slate-50"><Loader2 className="animate-spin text-[#002b45]" /></div>;
  if (!contacto) return null;

  return (
    <section id="contacto" className="py-32 bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-white/40 -skew-x-12 translate-x-1/2 z-0" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#98C560]/5 rounded-full blur-[120px] -ml-40 -mb-40 z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-20 items-start">
          
          {/* Info Side */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-1.5 bg-[#002b45] mb-8" />
              <h2 className="text-5xl md:text-7xl font-display font-black text-[#002b45] uppercase leading-[0.9] tracking-tighter mb-10">
                {(contacto.titulo || '').split(' ')[0]} <br />
                <span className="text-[#98C560] italic">{(contacto.titulo || '').split(' ').slice(1).join(' ')}</span>
              </h2>
              <p className="text-xl text-slate-500 mb-16 leading-relaxed border-l-4 border-[#98C560] pl-8 font-medium">
                {contacto.descripcion}
              </p>

              <div className="space-y-12">
                <ContactItem 
                  icon={<Mail size={24} />} 
                  title="CANAL DIGITAL" 
                  content={contacto.email} 
                  link={`mailto:${contacto.email}`}
                />
                <ContactItem 
                  icon={<Phone size={24} />} 
                  title="LÍNEA DIRECTA" 
                  content={contacto.telefono} 
                  link={`tel:${contacto.telefono.replace(/\s/g, '')}`}
                />
                <ContactItem 
                  icon={<MapPin size={24} />} 
                  title="CAMPUS CENTRAL" 
                  content={contacto.direccion} 
                  link="#"
                />
              </div>
            </motion.div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#002b45] p-10 lg:p-20 shadow-2xl relative overflow-hidden rounded-sm border-b-[10px] border-[#98C560]"
            >
              {/* Internal decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#98C560]/5 rounded-full -ml-24 -mb-24 blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 text-[#98C560] text-[11px] font-black tracking-[0.4em] uppercase mb-12 border-b border-white/10 pb-6">
                  <Sparkles size={16} /> CONSULTA INSTITUCIONAL
                </div>
                
                <form className="space-y-10" onSubmit={handleWhatsAppSend}>
                  <div className="grid md:grid-cols-2 gap-10">
                    <InputGroup 
                      icon={<User size={18} />} 
                      label="NOMBRE COMPLETO" 
                      placeholder="Ej. Juan Pérez" 
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                    />
                    <InputGroup 
                      icon={<Building size={18} />} 
                      label="ORGANIZACIÓN" 
                      placeholder="Empresa o Universidad" 
                      name="organizacion"
                      value={formData.organizacion}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <InputGroup 
                    icon={<Mail size={18} />} 
                    label="CORREO ELECTRÓNICO" 
                    placeholder="usuario@dominio.com" 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <MessageSquare size={16} className="text-[#98C560]" /> MENSAJE O REQUERIMIENTO
                    </label>
                    <textarea 
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white/[0.03] border-b-2 border-white/10 p-5 text-white font-sans font-medium focus:border-[#98C560] focus:outline-none transition-all duration-500 min-h-[160px] resize-none hover:bg-white/10"
                      placeholder="Describe brevemente tu consulta..."
                    ></textarea>
                  </div>

                  <motion.button 
                    type="submit"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#98C560] text-[#002b45] font-display font-black text-[12px] tracking-[0.3em] py-6 transition-all duration-300 flex items-center justify-center gap-4 uppercase shadow-[0_15px_30px_-10px_rgba(152,197,96,0.3)] rounded-sm group"
                  >
                    ENVIAR REQUERIMIENTO <Send size={20} className="group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform" />
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

const ContactItem = ({ icon, title, content, link }) => (
  <a href={link} className="flex gap-8 items-center group">
    <div className="w-16 h-16 bg-white shadow-xl flex items-center justify-center text-[#002b45] group-hover:bg-[#002b45] group-hover:text-white transition-all duration-500 group-hover:-translate-y-1 rounded-sm border border-gray-100">
      {icon}
    </div>
    <div>
      <h4 className="text-[11px] font-black tracking-[0.3em] text-slate-400 uppercase mb-1">{title}</h4>
      <p className="text-xl font-display font-black text-[#002b45] group-hover:text-[#98C560] transition-colors tracking-tight italic">{content}</p>
    </div>
  </a>
);

const InputGroup = ({ label, placeholder, icon, name, value, onChange, type = "text", required = false }) => (
  <div className="space-y-4">
    <label className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
      <span className="text-[#98C560]">{icon}</span> {label}
    </label>
    <input 
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full bg-white/[0.03] border-b-2 border-white/10 p-5 text-white font-sans font-medium focus:border-[#98C560] focus:outline-none transition-all duration-500 hover:bg-white/10"
      placeholder={placeholder}
    />
  </div>
);

export default Contacto;
