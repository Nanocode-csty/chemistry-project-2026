'use client';

import { useState, useEffect } from 'react';
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
  Globe,
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
  { href: '/intranet/cms', label: 'Sitio Web', icon: Globe },
];

export function IntranetSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/intranet/login');
    } catch (err) {
      console.error('Logout failed:', err);
      // Forzar redirección si falla
      window.location.href = '/intranet/login';
    }
  };

  const sidebarX = isOpen ? 0 : (isMounted && typeof window !== 'undefined' && window.innerWidth >= 1024) ? 0 : -300;

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
        animate={{ x: sidebarX }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-screen w-72 bg-white text-gray-800 shadow-premium z-50 lg:relative border-r border-brand-border"
      >
        {/* Header del Sidebar */}
        <div className="p-8 border-b border-brand-border">
          <div className="flex items-center justify-between">
            <Link href="/intranet/dashboard" className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-brand-navy p-2.5 rounded-sm shadow-lg"
              >
                <Package className="w-6 h-6 text-white" />
              </motion.div>
              <div className="flex flex-col">
                <h1 className="font-display font-black text-xl tracking-tight text-brand-navy">INTRANET IQ</h1>
                <p className="text-[10px] text-brand-accent font-black tracking-widest uppercase">Sistema de Gestión</p>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-brand-navy transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Usuario actual */}
        {isMounted && user && (
          <div className="p-6 border-b border-brand-border bg-brand-light">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-white font-black shadow-sm">
                {user.email ? user.email[0].toUpperCase() : 'A'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-[10px] text-brand-muted font-bold tracking-widest uppercase">Sesión Activa</p>
                <p className="font-bold truncate text-brand-navy text-sm">{user.email || 'Administrador'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu items */}
        <nav className="flex-1 py-6 px-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-4 px-4 py-3 rounded-sm transition-all duration-200 group ${
                      isActive 
                        ? 'bg-brand-navy text-white shadow-premium' 
                        : 'text-brand-muted hover:bg-brand-light hover:text-brand-navy'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-brand-accent' : 'text-brand-muted group-hover:text-brand-navy'}`} />
                    <span className="font-display font-bold text-xs tracking-widest uppercase">
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-brand-border space-y-1">
          <Link
            href="/"
            className="flex items-center gap-4 px-4 py-3 rounded-sm transition-all duration-200 text-brand-muted hover:bg-brand-light hover:text-brand-navy group"
          >
            <Home className="w-5 h-5 text-brand-muted group-hover:text-brand-navy" />
            <span className="font-display font-bold text-xs tracking-widest uppercase">
              SITIO PÚBLICO
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-sm transition-all duration-200 text-gray-600 hover:bg-red-50 hover:text-brand-red group"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-brand-red" />
            <span className="font-display font-bold text-xs tracking-widest uppercase">
              CERRAR SESIÓN
            </span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}

export function IntranetHeader({ onMenuOpen }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const pageTitle = menuItems.find(item => item.href === pathname)?.label || 'Panel';

  if (!isMounted) return <header className="bg-white border-b border-brand-border h-20" />;

  return (
    <header className="bg-white border-b border-brand-border h-20 flex items-center px-8 sticky top-0 z-30">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuOpen}
            className="lg:hidden text-gray-500 hover:text-brand-navy p-2 hover:bg-brand-gray rounded-sm transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="font-display font-black text-xl text-brand-navy tracking-tight uppercase">
            {pageTitle}
          </h2>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] text-brand-navy font-black tracking-widest uppercase">Escuela de Ingeniería Química</span>
            <span className="text-xs text-brand-muted font-bold uppercase">Gestión de Laboratorios</span>
          </div>
          <div className="w-px h-8 bg-brand-border hidden md:block" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center text-white text-[10px] font-black">
              IQ
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
