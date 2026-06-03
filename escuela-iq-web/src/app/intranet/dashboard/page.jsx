'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/supabase';
import {
  Package,
  Users,
  Building2,
  TrendingUp,
  AlertCircle,
  Clock,
  ChevronRight,
  Zap,
  Plus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardSkeleton } from '@/components/intranet/Skeleton';
import { Badge, Button } from '@/components/intranet/Forms';
import Link from 'next/link';

function StatCard({ icon: Icon, label, value, subtext, color = 'blue', delay = 0 }) {
  const colorMap = {
    blue: 'border-blue-100 bg-blue-50/30 text-blue-600',
    green: 'border-green-100 bg-green-50/30 text-green-600',
    red: 'border-red-100 bg-red-50/30 text-red-600',
    yellow: 'border-yellow-100 bg-yellow-50/30 text-yellow-600',
    navy: 'border-brand-navy/10 bg-brand-navy/5 text-brand-navy',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white p-6 rounded-lg border shadow-sm flex items-center justify-between group hover:shadow-premium transition-all duration-300 ${colorMap[color]}`}
    >
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-black tracking-tight">{value}</h3>
          {subtext && <span className="text-xs font-bold opacity-60">{subtext}</span>}
        </div>
      </div>
      <div className={`p-4 rounded-sm transition-transform group-hover:scale-110 ${colorMap[color].replace('border-', 'bg-').replace('/30', '/10')}`}>
        <Icon className="w-6 h-6" />
      </div>
    </motion.div>
  );
}

function RecentActivity({ prestamos }) {
  return (
    <div className="bg-white rounded-lg shadow-premium border border-brand-border overflow-hidden">
      <div className="p-6 border-b border-brand-border flex items-center justify-between">
        <h3 className="font-display font-black text-brand-navy tracking-tight uppercase">Préstamos Recientes</h3>
        <Link href="/intranet/prestamos" className="text-[10px] font-black text-brand-teal hover:text-brand-navy transition-colors tracking-widest uppercase flex items-center gap-1">
          Ver todos <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-brand-border">
        {prestamos.slice(0, 5).map((p, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            key={p.id} 
            className="p-4 flex items-center justify-between hover:bg-brand-gray/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-sm ${p.fecha_devolucion ? 'bg-gray-100 text-gray-400' : 'bg-brand-navy text-white'}`}>
                <Package className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-sm text-brand-navy">{p.equipo?.nombre}</p>
                <p className="text-xs text-gray-500">{p.estudiante?.nombre}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge color={p.fecha_devolucion ? 'gray' : 'blue'}>
                {p.fecha_devolucion ? 'DEVUELTO' : 'ACTIVO'}
              </Badge>
              <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">
                {new Date(p.fecha_prestamo).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        ))}
        {prestamos.length === 0 && (
          <div className="p-10 text-center text-gray-400 italic text-sm">
            No hay actividad reciente.
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
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
        const [statsRes, prestamosRes] = await Promise.all([
          dbOperations.getDashboardStats(),
          dbOperations.getPrestamos(),
        ]);
        
        if (statsRes.error) throw new Error(typeof statsRes.error === 'string' ? statsRes.error : (statsRes.error.message || 'Error al obtener estadísticas'));
        if (prestamosRes.error) throw new Error(typeof prestamosRes.error === 'string' ? prestamosRes.error : (prestamosRes.error.message || 'Error al obtener préstamos'));

        setStats(statsRes.data);
        setPrestamos(prestamosRes.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!isMounted || loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="bg-brand-navy text-white p-10 rounded-lg shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <Building2 className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Panel de Control</h1>
          <p className="text-brand-teal font-bold tracking-widest text-sm uppercase opacity-80">
            Escuela de Ingeniería Química • Gestión de Inventarios
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/intranet/prestamos">
              <Button variant="primary" className="bg-white !text-brand-navy hover:bg-brand-teal hover:!text-white">
                <Plus className="w-4 h-4 mr-2" /> NUEVO PRÉSTAMO
              </Button>
            </Link>
            <Link href="/intranet/equipos">
              <Button variant="secondary" className="border-white/30 text-white hover:bg-white/10">
                VER INVENTARIO
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Building2}
          label="Laboratorios"
          value={stats?.totalAmbientes || 0}
          color="navy"
          delay={0.1}
        />
        <StatCard
          icon={Package}
          label="Total Equipos"
          value={stats?.totalEquipos || 0}
          color="navy"
          delay={0.2}
        />
        <StatCard
          icon={Users}
          label="Estudiantes"
          value={stats?.totalEstudiantes || 0}
          color="navy"
          delay={0.3}
        />
        <StatCard
          icon={TrendingUp}
          label="Préstamos Activos"
          value={stats?.prestamosPendientes || 0}
          color="yellow"
          delay={0.4}
        />
      </div>

      {/* Secondary Stats & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Breakdown */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="font-display font-black text-brand-navy tracking-tight uppercase text-lg">Estado del Inventario</h3>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border border-brand-border shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="font-bold text-sm text-gray-600 uppercase tracking-wider">Disponibles</span>
              </div>
              <span className="text-2xl font-black text-brand-navy">{stats?.equiposDisponibles || 0}</span>
            </div>
            <div className="bg-white p-6 rounded-lg border border-brand-border shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-brand-accent" />
                <span className="font-bold text-sm text-gray-600 uppercase tracking-wider">En Uso</span>
              </div>
              <span className="text-2xl font-black text-brand-navy">{stats?.equiposOcupados || 0}</span>
            </div>
            <div className="bg-white p-6 rounded-lg border border-brand-border shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-brand-red" />
                <span className="font-bold text-sm text-gray-600 uppercase tracking-wider">Mantenimiento</span>
              </div>
              <span className="text-2xl font-black text-brand-navy">{stats?.equiposMantenimiento || 0}</span>
            </div>
          </div>

          <div className="bg-brand-gray/50 p-6 rounded-lg border-2 border-dashed border-brand-border">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-brand-teal" />
              <h4 className="font-bold text-brand-navy text-sm uppercase">Atención Requerida</h4>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Hay <span className="font-bold text-brand-navy">{stats?.equiposMantenimiento || 0} equipos</span> que requieren revisión técnica inmediata para volver a estar operativos.
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity prestamos={prestamos} />
        </div>
      </div>
    </div>
  );
}
