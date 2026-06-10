'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/api';
import {
  Package,
  Users,
  Building2,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Plus,
  Globe,
  Zap,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardSkeleton } from '@/components/intranet/Skeleton';
import { Badge, Button } from '@/components/intranet/Forms';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

function StatCard({ icon: Icon, label, value, subtext, color = 'blue', delay = 0 }) {
  const colorMap = {
    blue: 'border-blue-100 bg-blue-50/30 text-blue-600 icon-bg-blue-100/10',
    green: 'border-[#9ABE00]/20 bg-[#9ABE00]/5 text-[#9ABE00] icon-bg-[#9ABE00]/10',
    red: 'border-red-100 bg-red-50/30 text-red-600 icon-bg-red-100/10',
    yellow: 'border-yellow-100 bg-yellow-50/30 text-yellow-600 icon-bg-yellow-100/10',
    navy: 'border-[#002b45]/10 bg-[#002b45]/5 text-[#002b45] icon-bg-[#002b45]/10',
  };

  const iconBgClass = colorMap[color].split(' ').find(c => c.startsWith('icon-bg-'))?.replace('icon-bg-', '') || 'bg-gray-100';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white p-8 rounded-sm border shadow-sm flex items-center justify-between group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${colorMap[color].split(' ').filter(c => !c.startsWith('icon-bg-')).join(' ')}`}
    >
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-4xl font-display font-black tracking-tighter italic">{value}</h3>
          {subtext && <span className="text-xs font-bold opacity-60">{subtext}</span>}
        </div>
      </div>
      <div className={`p-5 rounded-sm transition-transform group-hover:scale-110 shadow-sm ${iconBgClass}`}>
        <Icon className="w-8 h-8" />
      </div>
    </motion.div>
  );
}

function RecentActivity({ prestamos }) {
  return (
    <div className="bg-white rounded-sm shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-display font-black text-[#002b45] tracking-tighter uppercase text-lg">Préstamos Recientes</h3>
        <Link href="/intranet/prestamos" className="text-[11px] font-black text-[#9ABE00] hover:text-[#002b45] transition-all tracking-[0.2em] uppercase flex items-center gap-2 border-b-2 border-[#9ABE00] pb-1">
          VER TODOS <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="divide-y divide-gray-50">
        {prestamos.slice(0, 5).map((p, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            key={p.id} 
            className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-5">
              <div className={`p-3 rounded-sm transition-colors ${p.fecha_devolucion ? 'bg-slate-100 text-slate-400' : 'bg-[#002b45] text-white shadow-lg group-hover:bg-[#9ABE00] group-hover:text-[#002b45]'}`}>
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display font-black text-sm text-[#002b45] uppercase tracking-tight">{p.equipo?.nombre}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{p.estudiante?.nombre}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge color={p.fecha_devolucion ? 'gray' : 'blue'}>
                {p.fecha_devolucion ? 'DEVUELTO' : 'ACTIVO'}
              </Badge>
              <p className="text-[10px] text-slate-400 font-black mt-2 uppercase tracking-widest">
                {new Date(p.fecha_prestamo).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        ))}
        {prestamos.length === 0 && (
          <div className="p-16 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">
            No hay actividad reciente.
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Ejecutar peticiones en paralelo
        const [statsRes, prestamosRes] = await Promise.all([
          dbOperations.getDashboardStats(),
          dbOperations.getPrestamos(),
        ]);
        
        // Manejar errores de las respuestas sin lanzar excepciones que rompan el renderizado
        if (statsRes.error) {
          console.warn('Stats fetching error:', statsRes.error);
          // No lanzamos error aquí para permitir que la página cargue con valores por defecto
        }
        
        if (prestamosRes.error) {
          console.warn('Prestamos fetching error:', prestamosRes.error);
        }

        setStats(statsRes.data || {
          totalAmbientes: 0,
          totalEstudiantes: 0,
          totalEquipos: 0,
          prestamosPendientes: 0,
          equiposDisponibles: 0,
          equiposOcupados: 0,
          equiposMantenimiento: 0
        });
        
        setPrestamos(prestamosRes.data || []);
      } catch (err) {
        console.error('Unexpected error fetching dashboard data:', err);
        setError('Ocurrió un error inesperado al cargar los datos. Por favor, verifica la conexión con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!isMounted || loading) return <DashboardSkeleton />;

  const isAdmin = user?.rol === 'admin';

  return (
    <div className="space-y-8">
      {/* Error alert if any */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-sm flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 text-sm font-bold uppercase tracking-wider">{error}</p>
        </motion.div>
      )}

      {/* Admin Header - More compact and professional */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-sm border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-sans font-black text-[#002b45] tracking-tight uppercase">
            {isAdmin ? 'Panel de Control' : 'Acceso Laboratorio'}
          </h1>
          <p className="text-slate-400 font-bold text-xs tracking-widest uppercase mt-1">
            {isAdmin ? 'Resumen general del sistema de laboratorios' : 'Gestión rápida de préstamos y equipos'}
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/intranet/prestamos">
            <Button variant="primary" className="!bg-[#002b45] hover:!bg-[#9ABE00] hover:!text-[#002b45] font-bold tracking-wider text-[11px] px-6">
              <Plus className="w-4 h-4 mr-2" /> NUEVO PRÉSTAMO
            </Button>
          </Link>
          {isAdmin && (
            <Link href="/intranet/cms">
              <Button variant="secondary" className="border-gray-200 text-slate-600 hover:bg-slate-50 font-bold tracking-wider text-[11px] px-6">
                <Globe className="w-4 h-4 mr-2" /> EDITAR WEB
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
          <>
            <StatCard
              icon={Building2}
              label="Ambientes"
              value={stats?.totalAmbientes || 0}
              color="navy"
              delay={0.1}
            />
            <StatCard
              icon={Zap}
              label="Inventario"
              value={stats?.totalEquipos || 0}
              color="navy"
              delay={0.2}
            />
            <StatCard
              icon={Users}
              label="Usuarios"
              value={stats?.totalEstudiantes || 0}
              color="navy"
              delay={0.3}
            />
            <StatCard
              icon={Clock}
              label="En Préstamo"
              value={stats?.prestamosPendientes || 0}
              color="yellow"
              delay={0.4}
            />
          </>
        ) : (
          <>
            <StatCard
              icon={TrendingUp}
              label="Préstamos Activos"
              value={stats?.prestamosPendientes || 0}
              color="yellow"
              delay={0.1}
            />
            <StatCard
              icon={Zap}
              label="Equipos Disponibles"
              value={stats?.equiposDisponibles || 0}
              color="green"
              delay={0.2}
            />
            <StatCard
              icon={Clock}
              label="Pendientes hoy"
              value={prestamos.filter(p => !p.fecha_devolucion).length}
              color="navy"
              delay={0.3}
            />
            <StatCard
              icon={AlertCircle}
              label="Urgencias"
              value={0}
              color="red"
              delay={0.4}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentActivity prestamos={prestamos} />
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-sm border border-gray-100 shadow-sm">
            <h3 className="font-sans font-black text-[#002b45] tracking-tight uppercase text-sm mb-8 border-b border-gray-50 pb-4">
              Disponibilidad de Equipos
            </h3>
            <div className="space-y-6">
              <StatusRow label="Disponibles" count={stats?.equiposDisponibles || 0} color="bg-green-500" />
              <StatusRow label="En Uso" count={stats?.equiposOcupados || 0} color="bg-blue-500" />
              <StatusRow label="Mantenimiento" count={stats?.equiposMantenimiento || 0} color="bg-red-500" />
            </div>
            
            <div className="mt-10 p-5 bg-slate-50 rounded-sm border border-slate-100">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-[#9ABE00] mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  Se recomienda revisar los equipos en mantenimiento para optimizar el inventario disponible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, count, color }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-xl font-display font-black text-[#002b45]">{count}</span>
    </div>
  );
}
