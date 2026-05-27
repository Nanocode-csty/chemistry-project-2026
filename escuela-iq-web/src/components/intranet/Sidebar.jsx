'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  X,
  BarChart3,
  Building2,
  Package,
  Users,
  Layers,
  FileText,
  LogOut,
  Home,
} from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
  { href: '/intranet/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/intranet/ambientes', label: 'Ambientes', icon: Building2 },
  { href: '/intranet/categorias', label: 'Categorías', icon: Layers },
  { href: '/intranet/equipos', label: 'Equipos', icon: Package },
  { href: '/intranet/estudiantes', label: 'Estudiantes', icon: Users },
  { href: '/intranet/prestamos', label: 'Préstamos', icon: FileText },
  { href: '/intranet/reportes', label: 'Reportes', icon: BarChart3 },
];

export function IntranetSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/intranet/login');
  };

  return (
    <>
      {/* Overlay en móviles */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-brand-navy to-brand-dark text-white shadow-premium z-50 lg:relative"
      >
        {/* Header del Sidebar */}
        <div className="p-8 border-b border-brand-teal/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: -2 }}
                className="bg-white p-3 rounded-sm shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Package className="w-6 h-6 text-brand-navy relative z-10" />
              </motion.div>
              <div className="flex flex-col">
                <h1 className="font-display font-black text-xl tracking-tight">INTRANET IQ</h1>
                <p className="text-xs text-brand-accent font-bold tracking-widest mt-1">Gestión de Inventarios</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-brand-teal hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Usuario actual */}
        {user && (
          <div className="p-6 border-b border-brand-teal/30 bg-brand-dark/50">
            <p className="text-xs text-brand-accent font-bold tracking-widest mb-1">CONECTADO COMO</p>
            <p className="font-semibold truncate text-white/90">{user.email}</p>
          </div>
        )}

        {/* Menu items */}
        <nav className="flex-1 py-8 px-6">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-4 px-5 py-4 rounded-lg transition-all duration-300 group ${
                      isActive 
                        ? 'bg-gradient-to-r from-brand-accent to-brand-teal shadow-lg' 
                        : 'hover:bg-brand-teal/30'
                    }`}
                  >
                    <div className={`p-2 rounded transition-colors ${isActive ? 'bg-white/20' : 'bg-brand-navy group-hover:bg-brand-teal/50'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`font-display font-bold text-sm tracking-wider ${isActive ? 'text-white' : 'text-white/80'}`}>
                      {item.label.toUpperCase()}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-6 border-t border-brand-teal/30 space-y-3">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-4 px-5 py-4 rounded-lg transition-all duration-300 hover:bg-brand-teal/30 group"
          >
            <div className="p-2 rounded bg-brand-navy group-hover:bg-brand-teal/50 transition-colors">
              <Home className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-sm tracking-wider text-white/80 group-hover:text-white transition-colors">
              IR AL SITIO
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-lg transition-all duration-300 hover:bg-red-600/30 text-left group"
          >
            <div className="p-2 rounded bg-brand-navy group-hover:bg-red-600/50 transition-colors">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-sm tracking-wider text-white/80 group-hover:text-white transition-colors">
              CERRAR SESIÓN
            </span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}

export function IntranetHeader({ onMenuOpen }) {
  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-brand-border sticky top-0 z-30">
      <div className="px-8 py-6 flex items-center justify-between lg:hidden">
        <h2 className="font-display font-black text-xl text-brand-navy">INTRANET IQ</h2>
        <button
          onClick={onMenuOpen}
          className="bg-brand-navy text-white p-3 rounded-sm shadow-lg active:scale-95 transition-transform"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
