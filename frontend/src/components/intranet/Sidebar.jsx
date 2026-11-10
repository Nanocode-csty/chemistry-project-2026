'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  BarChart3,
  Building2,
  Package,
  Users,
  Layers,
  FileText,
  LogOut,
  Microscope,
  FlaskConical,
} from 'lucide-react';
import { motion } from 'framer-motion';

const adminMenuItems = [
  { href: '/intranet/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/intranet/usuarios', label: 'Usuarios', icon: Users },
  { href: '/intranet/ambientes', label: 'Ambientes', icon: Building2 },
  { href: '/intranet/categorias', label: 'Categorías', icon: Layers },
  { href: '/intranet/equipos', label: 'Materiales y Equipos', icon: Package },
  { href: '/intranet/reactivos', label: 'Reactivos', icon: FlaskConical },
  { href: '/intranet/estudiantes', label: 'Coordinadores / Área', icon: Users },
  { href: '/intranet/prestamos', label: 'Consumo y Préstamos', icon: FileText },
  { href: '/intranet/investigaciones', label: 'Investigaciones', icon: Microscope },
  { href: '/intranet/reportes', label: 'Reportes', icon: BarChart3 },
];

const userMenuItems = [
  { href: '/intranet/dashboard', label: 'Inicio', icon: BarChart3 },
  { href: '/intranet/reactivos', label: 'Reactivos', icon: FlaskConical },
  { href: '/intranet/prestamos', label: 'Consumo y Préstamos', icon: FileText },
];

export function IntranetSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  const isAdmin = user?.rol?.toLowerCase() === 'admin';
  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/intranet/login');
    } catch (err) {
      console.error('Logout failed:', err);
      window.location.href = '/intranet/login';
    }
  };

  const sidebarX =
    isOpen
      ? 0
      : isMounted && typeof window !== 'undefined' && window.innerWidth >= 1024
      ? 0
      : -300;

  const normalizedPathname = pathname?.replace(/\/$/, '') || '';

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
        className="fixed left-0 top-0 h-screen w-72 bg-white text-gray-800 shadow-2xl z-50 lg:relative border-r border-gray-100 flex flex-col"
      >
        {/* Header del Sidebar con Marca roo Soluciones Digitales + INVENTA */}
        <div className="p-6 border-b border-gray-100 bg-white">
          <Link href="/intranet/dashboard" className="flex flex-col gap-2">
            <img
              src="/roo-logo.png"
              alt="roo Soluciones Digitales"
              className="h-9 w-auto object-contain object-left"
            />
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="font-display font-black text-base tracking-tight leading-none text-[#002b45]">
                INVENTA
              </span>
              <span className="text-[9px] text-[#9ABE00] font-black tracking-widest uppercase">
                Gestión de Laboratorios
              </span>
            </div>
          </Link>
        </div>

        {/* Usuario actual */}
        {isMounted && user && (
          <div className="px-6 py-4 border-b border-gray-100 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-[#002b45] flex items-center justify-center text-[#9ABE00] font-black text-xs shadow-sm uppercase">
                {user.email ? user.email[0] : 'A'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-[9px] text-[#9ABE00] font-black tracking-widest uppercase">
                  {user.rol === 'admin' ? 'Administrador' : 'Laboratorio'}
                </p>
                <p className="font-bold truncate text-[#002b45] text-xs tracking-tight uppercase">
                  {user.email?.split('@')[0]}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Menu items - SCROLLABLE AREA */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar py-4 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                normalizedPathname === item.href ||
                (item.href !== '/intranet/dashboard' &&
                  normalizedPathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200 group ${
                      isActive
                        ? 'bg-[#002b45] text-white font-black shadow-lg'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-[#002b45]'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-[#9ABE00]'
                          : 'text-slate-400 group-hover:text-[#002b45]'
                      }`}
                    />
                    <span className="font-sans font-bold text-[11px] tracking-wider uppercase">
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="ml-auto w-1 h-3 bg-[#9ABE00] rounded-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-3 border-t border-gray-100 bg-slate-50 space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-sm transition-all duration-200 text-slate-500 hover:bg-red-50 hover:text-red-600 group"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
            <span className="font-sans font-bold text-[10px] tracking-widest uppercase">
              CERRAR SESIÓN
            </span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}

export function IntranetHeader({ onMenuOpen }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const normalizedPathname = pathname?.replace(/\/$/, '') || '';
  const isAdmin = user?.rol?.toLowerCase() === 'admin';
  const currentMenuItems = isAdmin ? adminMenuItems : userMenuItems;
  const pageTitle =
    currentMenuItems.find(
      (item) =>
        normalizedPathname === item.href ||
        (item.href !== '/intranet/dashboard' &&
          normalizedPathname.startsWith(item.href))
    )?.label || 'Panel';

  if (!isMounted)
    return <header className="bg-white border-b border-gray-100 h-16" />;

  return (
    <header className="bg-[#002b45] h-16 flex items-center px-8 sticky top-0 z-30 shadow-lg border-b border-white/5">
      <div className="flex items-center justify-between w-full text-white">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuOpen}
            className="lg:hidden text-white/60 hover:text-white p-2 hover:bg-white/5 rounded-sm transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="font-sans font-black text-lg !text-white tracking-tight uppercase">
            {pageTitle}
          </h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-6">
            <span className="text-[9px] text-[#9ABE00] font-black tracking-[0.2em] uppercase">
              INVENTA • ROO SOLUCIONES DIGITALES
            </span>
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
              Sistema de Gestión de Inventarios
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#9ABE00] font-black text-[10px] border border-white/10">
            INV
          </div>
        </div>
      </div>
    </header>
  );
}
