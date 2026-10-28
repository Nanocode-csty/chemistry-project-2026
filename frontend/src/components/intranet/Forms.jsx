'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl', zIndex = 'z-[99999]' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const openModals = parseInt(document.body.getAttribute('data-open-modals') || '0');
      document.body.setAttribute('data-open-modals', (openModals + 1).toString());
      document.body.style.overflow = 'hidden';
    } else {
      const openModals = parseInt(document.body.getAttribute('data-open-modals') || '0');
      const newCount = Math.max(0, openModals - 1);
      document.body.setAttribute('data-open-modals', newCount.toString());
      if (newCount === 0) {
        document.body.style.overflow = 'unset';
      }
    }
    return () => {};
  }, [isOpen]);

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 w-full h-full ${zIndex} flex items-center justify-center overflow-y-auto p-4 sm:p-6 custom-scrollbar`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 w-full h-full bg-[#001a2a]/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            className={`bg-white rounded-md shadow-[0_25px_70px_-15px_rgba(0,26,42,0.55)] ${maxWidth} w-full my-auto border border-slate-200/80 relative z-[100000] max-h-[90vh] flex flex-col`}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/95 rounded-t-md flex-shrink-0">
              <div className="flex flex-col">
                <h2 className="font-display font-black text-lg md:text-xl text-[#002b45] tracking-tight uppercase leading-none">
                  {title}
                </h2>
                <div className="h-1 w-10 bg-[#9ABE00] mt-2 rounded-full" />
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-red-500 transition-all p-2 rounded-full hover:bg-red-50 group"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
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
  disabled = false,
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
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full px-4 py-3 border-2 border-brand-border rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent resize-none bg-brand-gray/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
  disabled = false,
}) {
  return (
    <div className="mb-6">
      {label && (
        <label htmlFor={name} className="block font-display font-bold text-sm text-brand-navy tracking-widest mb-3">
          {label}
          {required && <span className="text-brand-red ml-1">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full px-4 py-3 border-2 border-brand-border rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent bg-brand-gray/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {(options || []).map((option) => {
          const optionValue = option.value !== undefined ? option.value : option.id;
          const optionLabel = option.nombre || option.name || option.label || optionValue;
          return (
            <option key={option.id || option.value} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
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
  type = 'button',
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
      type={type}
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
          {(data || []).map((row, index) => (
            <motion.tr
              key={row.id || row.key || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="hover:bg-brand-gray/50 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={`${row.id || row.key || index}-${col.key}`}
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
    teal: 'bg-brand-teal/15 text-brand-teal border border-brand-teal/30',
    navy: 'bg-[#002b45]/10 text-[#002b45] border border-[#002b45]/20',
    orange: 'bg-amber-100 text-amber-800 border border-amber-200',
    purple: 'bg-purple-100 text-purple-800 border border-purple-200',
  };

  return (
    <span className={`inline-block px-4 py-2 rounded-sm text-xs font-display font-bold tracking-widest ${colors[color] || colors.blue}`}>
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

  const safeOptions = options || [];

  const selectedOption = safeOptions.find((opt) => {
    const optValue = opt.value !== undefined ? opt.value : opt.id;
    return String(optValue) === String(value);
  });

  const filteredOptions = safeOptions.filter((opt) => {
    const optLabel = `${opt.nombre || opt.name || opt.label || ''} ${opt.sublabel || ''} ${opt.badge || ''}`;
    return optLabel.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
    const optionValue = option.value !== undefined ? option.value : option.id;
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
    setSearchTerm('');
  };

  const getLabel = (option) => {
    return option.nombre || option.name || option.label || '';
  };

  return (
    <div className="mb-4" ref={containerRef}>
      {label && (
        <label className="block font-display font-bold text-sm text-brand-navy tracking-widest mb-3">
          {label}
          {required && <span className="text-brand-red ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 border-2 border-brand-border rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent bg-white text-left flex items-center justify-between transition-all shadow-sm"
        >
          <span className={selectedOption ? 'text-[#002b45] font-bold text-sm truncate' : 'text-gray-400 text-sm'}>
            {selectedOption ? getLabel(selectedOption) : placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-[99999] w-full mt-1 bg-white border-2 border-brand-navy/20 rounded-sm shadow-2xl max-h-64 overflow-y-auto">
            <div className="p-2.5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Escribe para filtrar..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:outline-none focus:border-[#9ABE00]"
                  autoFocus
                />
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-gray-400 text-xs font-bold uppercase text-center">
                  No se encontraron coincidencias
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const optValue = option.value !== undefined ? option.value : option.id;
                  const isSelected = String(optValue) === String(value);
                  return (
                    <button
                      key={option.id || option.value}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between gap-2 ${
                        isSelected ? 'bg-[#002b45]/5 text-[#002b45] font-bold' : 'text-gray-800'
                      }`}
                    >
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold text-[#002b45] truncate">
                          {getLabel(option)}
                        </span>
                        {option.sublabel && (
                          <span className="text-[11px] text-slate-500 truncate">
                            {option.sublabel}
                          </span>
                        )}
                      </div>
                      {option.badge && (
                        <span className="px-2 py-0.5 bg-slate-100 text-[#002b45] font-mono font-bold text-[10px] rounded-sm flex-shrink-0">
                          {option.badge}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
