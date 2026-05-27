'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/supabase';
import {
  Package,
  Users,
  Building2,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, subtext, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function EnvironmentCard({ ambiente, equipos }) {
  const disponibles = equipos.filter((e) => e.estado === 'disponible').length;
  const ocupados = equipos.filter((e) => e.estado === 'ocupado').length;
  const mantenimiento = equipos.filter(
    (e) => e.estado === 'en_mantenimiento'
  ).length;

  const total = equipos.length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {ambiente.nombre}
      </h3>

      {ambiente.descripcion && (
        <p className="text-sm text-gray-600 mb-4">{ambiente.descripcion}</p>
      )}

      {/* Estadísticas de equipos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <span className="text-sm text-gray-600">Total de equipos:</span>
          <span className="font-semibold text-gray-800">{total}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-50 rounded p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{disponibles}</p>
            <p className="text-xs text-gray-600">Disponibles</p>
          </div>
          <div className="bg-blue-50 rounded p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{ocupados}</p>
            <p className="text-xs text-gray-600">Ocupados</p>
          </div>
          <div className="bg-red-50 rounded p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{mantenimiento}</p>
            <p className="text-xs text-gray-600">Mantenimiento</p>
          </div>
        </div>
      </div>

      {/* Equipos en el ambiente */}
      {equipos.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-600 mb-3">
            EQUIPOS EN ESTE AMBIENTE
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {equipos.map((equipo) => (
              <div
                key={equipo.id}
                className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-700">{equipo.nombre}</p>
                  <p className="text-gray-500">{equipo.codigo}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    equipo.estado === 'disponible'
                      ? 'bg-green-100 text-green-700'
                      : equipo.estado === 'ocupado'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {equipo.estado === 'disponible'
                    ? 'Disponible'
                    : equipo.estado === 'ocupado'
                      ? 'Ocupado'
                      : 'Mantenimiento'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [ambientes, setAmbientes] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Obtener estadísticas, ambientes y equipos (todos en paralelo)
        const [statsData, ambientesRes, equiposRes] = await Promise.all([
          dbOperations.getDashboardStats(),
          dbOperations.getAmbientes(),
          dbOperations.getEquipos()
        ]);
        
        setStats(statsData);
        
        if (ambientesRes.error) throw ambientesRes.error;
        setAmbientes(ambientesRes.data || []);
        
        if (equiposRes.error) throw equiposRes.error;
        setEquipos(equiposRes.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          </div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Resumen de la gestión de inventarios
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Tarjetas de estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Building2}
            label="Total de Ambientes"
            value={stats.totalAmbientes}
            color="blue"
          />
          <StatCard
            icon={Users}
            label="Total de Estudiantes"
            value={stats.totalEstudiantes}
            color="green"
          />
          <StatCard
            icon={Package}
            label="Total de Equipos"
            value={stats.totalEquipos}
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            label="Préstamos Pendientes"
            value={stats.prestamosPendientes}
            color="yellow"
          />
        </div>
      )}

      {/* Resumen de estados */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={Package}
            label="Equipos Disponibles"
            value={stats.equiposDisponibles}
            subtext={`de ${stats.totalEquipos} equipos`}
            color="green"
          />
          <StatCard
            icon={Package}
            label="Equipos Ocupados"
            value={stats.equiposOcupados}
            subtext={`Préstamos activos`}
            color="blue"
          />
          <StatCard
            icon={AlertCircle}
            label="En Mantenimiento"
            value={stats.equiposMantenimiento}
            subtext={`Fuera de servicio`}
            color="red"
          />
        </div>
      )}

      {/* Mapa/Vista de Ambientes */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Ambientes y Equipos
        </h2>
        <p className="text-gray-600 mb-6">
          Vista de cada ambiente con la distribución de equipos
        </p>

        {ambientes.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No hay ambientes registrados. Comienza creando uno.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ambientes.map((ambiente) => (
              <EnvironmentCard
                key={ambiente.id}
                ambiente={ambiente}
                equipos={equipos.filter(e => e.ambiente_id === ambiente.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
