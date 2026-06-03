'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { IntranetSidebar, IntranetHeader } from './Sidebar';

export default function IntranetLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Si no hay usuario y no está cargando, redirigir al login
    if (!loading && !user) {
      console.log('No user found, redirecting to login...');
      router.replace('/intranet/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray/30">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-12 h-12 border-4 border-brand-border border-t-brand-navy rounded-full"></div>
          </div>
          <p className="mt-4 text-brand-navy font-bold animate-pulse tracking-widest uppercase text-xs">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray/30">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-12 h-12 border-4 border-brand-border border-t-brand-navy rounded-full"></div>
          </div>
          <p className="mt-4 text-brand-navy font-bold animate-pulse">REDIRECCIONANDO AL LOGIN...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-brand-gray/30 overflow-hidden">
      {/* Sidebar */}
      <IntranetSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <IntranetHeader onMenuOpen={() => setSidebarOpen(true)} />

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto p-6 md:p-8 lg:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
