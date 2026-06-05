'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 w-full h-full z-[99999] flex items-start justify-center overflow-y-auto custom-scrollbar">
          {/* Overlay Oscuro Total */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 w-full h-full bg-[#001a2a]/95 backdrop-blur-md"
            onClick={onClose}
          ></motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className={`bg-white rounded-sm shadow-[0_30px_100px_-10px_rgba(0,0,0,0.8)] ${maxWidth} w-full mt-12 mb-20 mx-4 overflow-hidden border border-white/5 relative z-[100000]`}
          >
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 bg-slate-50/90 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex flex-col">
                <h2 className="font-display font-black text-xl md:text-2xl text-[#002b45] tracking-tight uppercase italic leading-none">{title}</h2>
                <div className="h-1 w-12 bg-[#98C560] mt-2 rounded-full"></div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-red-500 transition-all p-2.5 rounded-full hover:bg-red-50 group"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
            <div className="p-6 md:p-8">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

export function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  textarea = false,
}) {
  const Component = textarea ? 'textarea' : 'input';

  return (
    <div className="mb-6">
      <label htmlFor={name} className="block font-display font-bold text-sm text-brand-navy tracking-widest mb-3">
        {label}
        {required && <span className="text-brand-red ml-1">*</span>}
      </label>
      <Component
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 border-2 border-brand-border rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent resize-none bg-brand-gray/30 transition-all"
        rows={textarea ? 4 : undefined}
      />
    </div>
  );
}

export function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  placeholder = 'Selecciona una opción',
}) {
  return (
    <div className="mb-6">
      <label htmlFor={name} className="block font-display font-bold text-sm text-brand-navy tracking-widest mb-3">
        {label}
        {required && <span className="text-brand-red ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 border-2 border-brand-border rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent bg-brand-gray/30 transition-all"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.nombre || option.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  fullWidth = false,
  className = '',
}) {
  const variants = {
    primary: 'bg-brand-navy hover:bg-brand-teal text-white shadow-lg hover:shadow-premium',
    secondary: 'bg-brand-gray hover:bg-brand-teal/20 text-brand-navy border-2 border-brand-border',
    danger: 'bg-brand-red hover:bg-red-700 text-white shadow-lg',
    success: 'bg-brand-accent hover:bg-brand-teal text-white shadow-lg hover:shadow-premium',
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} disabled:opacity-50 disabled:cursor-not-allowed font-display font-bold text-sm tracking-widest py-4 px-8 rounded-sm transition-all duration-300 ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}

export function Table({ columns, data, actions }) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-premium">
      <table className="w-full">
        <thead className="bg-brand-navy border-b-2 border-brand-teal">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-8 py-4 text-left font-display font-black text-xs text-white uppercase tracking-[0.2em]"
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="px-8 py-4 text-left font-display font-black text-xs text-white uppercase tracking-[0.2em]">
                ACCIONES
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {data.map((row, index) => (
            <motion.tr
              key={row.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-brand-gray/50 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={`${row.id}-${col.key}`}
                  className="px-8 py-5 text-sm text-gray-700"
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              {actions && (
                <td className="px-8 py-5 text-sm space-x-3 flex">
                  {actions(row)}
                </td>
              )}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Badge({ children, color = 'blue' }) {
  const colors = {
    blue: 'bg-brand-teal/20 text-brand-navy border border-brand-teal/30',
    green: 'bg-green-100 text-green-800 border border-green-200',
    red: 'bg-brand-red/20 text-brand-red border border-brand-red/30',
    yellow: 'bg-brand-yellow/20 text-brand-navy border border-brand-yellow/30',
    gray: 'bg-brand-gray/50 text-brand-navy border border-brand-border',
  };

  return (
    <span className={`inline-block px-4 py-2 rounded-sm text-xs font-display font-bold tracking-widest ${colors[color]}`}>
      {children}
    </span>
  );
}

export function SearchableSelect({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  placeholder = 'Buscar y seleccionar...',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.id === value);

  const filteredOptions = options.filter(opt =>
    (opt.nombre || opt.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange({ target: { name, value: option.id } });
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="mb-4" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left flex items-center justify-between"
        >
          <span className={selectedOption ? 'text-gray-800' : 'text-gray-500'}>
            {selectedOption ? (selectedOption.nombre || selectedOption.name) : placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No se encontraron resultados
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors ${
                      option.id === value ? 'bg-blue-50 text-blue-800' : 'text-gray-800'
                    }`}
                  >
                    {option.nombre || option.name}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
