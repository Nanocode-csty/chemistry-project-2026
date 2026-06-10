'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/api';
import { AlertCircle, Download, BarChart3, PieChart, Calendar, Filter, FileText, TrendingUp, Clock, Package, Building2, Users } from 'lucide-react';
import { Button } from '@/components/intranet/Forms';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportesPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.rol?.toLowerCase() !== 'admin') {
      router.replace('/intranet/dashboard');
    }
  }, [user, router]);

  const [prestamos, setPrestamos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [stats, setStats] = useState(null);
  const [equiposMasUsados, setEquiposMasUsados] = useState([]);
  const [ambientesMasPrestamos, setAmbientesMasPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroAmbiente, setFiltroAmbiente] = useState('todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          prestamosRes,
          equiposRes,
          estudiantesRes,
          ambientesRes,
          categoriasRes,
          statsData,
          equiposUsadosRes,
          ambientesPrestamosRes
        ] = await Promise.all([
          dbOperations.getPrestamos(),
          dbOperations.getEquipos(),
          dbOperations.getEstudiantes(),
          dbOperations.getAmbientes(),
          dbOperations.getCategorias(),
          dbOperations.getDashboardStats(),
          dbOperations.getEquiposMasUsados(),
          dbOperations.getAmbientesMasPrestamos()
        ]);

        if (prestamosRes.error) throw prestamosRes.error;
        if (equiposRes.error) throw equiposRes.error;
        if (estudiantesRes.error) throw estudiantesRes.error;
        if (ambientesRes.error) throw ambientesRes.error;
        if (categoriasRes.error) throw categoriasRes.error;

        setPrestamos(prestamosRes.data || []);
        setEquipos(equiposRes.data || []);
        setEstudiantes(estudiantesRes.data || []);
        setAmbientes(ambientesRes.data || []);
        setCategorias(categoriasRes.data || []);
        setStats(statsData);
        setEquiposMasUsados(equiposUsadosRes.data || []);
        setAmbientesMasPrestamos(ambientesPrestamosRes.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtros
  const prestamosFiltrados = prestamos.filter((p) => {
    let matches = true;
    
    if (filtroEstado === 'activos') matches = matches && !p.fecha_devolucion;
    if (filtroEstado === 'devueltos') matches = matches && p.fecha_devolucion;
    
    if (filtroAmbiente !== 'todos' && p.equipo?.ambiente_id) {
      matches = matches && p.equipo.ambiente_id === parseInt(filtroAmbiente);
    }
    
    if (fechaInicio) {
      matches = matches && new Date(p.fecha_prestamo) >= new Date(fechaInicio);
    }
    if (fechaFin) {
      matches = matches && new Date(p.fecha_prestamo) <= new Date(fechaFin);
    }
    
    return matches;
  });

  const equiposPorAmbiente = ambientes.map(amb => ({
    nombre: amb.nombre,
    count: equipos.filter(e => e.ambiente_id === amb.id).length
  }));

  const equiposPorEstado = {
    disponibles: equipos.filter(e => e.estado === 'disponible').length,
    ocupados: equipos.filter(e => e.estado === 'ocupado').length,
    mantenimiento: equipos.filter(e => e.estado === 'en_mantenimiento').length
  };

  // Datos para gráficos
  const chartDataEquiposEstado = {
    labels: ['Disponibles', 'Ocupados', 'En Mantenimiento'],
    datasets: [
      {
        data: [equiposPorEstado.disponibles, equiposPorEstado.ocupados, equiposPorEstado.mantenimiento],
        backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
        borderWidth: 1,
      },
    ],
  };

  const chartDataEquiposAmbiente = {
    labels: equiposPorAmbiente.map(a => a.nombre),
    datasets: [
      {
        label: 'Equipos por Ambiente',
        data: equiposPorAmbiente.map(a => a.count),
        backgroundColor: '#6366f1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // Funciones de exportación
  const exportarCSV = (datos, nombreArchivo) => {
    const headers = Object.keys(datos[0] || {});
    const csvContent = [
      headers.join(','),
      ...datos.map(row => 
        headers.map(fieldName => `"${String(row[fieldName] || '').replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${nombreArchivo}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarExcel = (datos, nombreArchivo) => {
    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
    XLSX.writeFile(workbook, `${nombreArchivo}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportarPDF = (datos, titulo, nombreArchivo) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(titulo, 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-MX')}`, 14, 32);
    
    if (datos.length > 0) {
      const headers = Object.keys(datos[0]);
      const tableData = datos.map(row => headers.map(header => row[header]));
      
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 40,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [66, 153, 225] }
      });
    }
    
    doc.save(`${nombreArchivo}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const datosParaExportarPrestamos = prestamosFiltrados.map(p => ({
    'Equipo': p.equipo?.nombre || 'N/A',
    'Código': p.equipo?.codigo || 'N/A',
    'Estudiante': p.estudiante?.nombre || 'N/A',
    'Matrícula': p.estudiante?.matricula || 'N/A',
    'Fecha Préstamo': new Date(p.fecha_prestamo).toLocaleDateString('es-MX'),
    'Fecha Devolución': p.fecha_devolucion ? new Date(p.fecha_devolucion).toLocaleDateString('es-MX') : 'Pendiente',
    'Estado': p.fecha_devolucion ? 'Devuelto' : 'Activo'
  }));

  const datosParaExportarEquipos = equipos.map(e => ({
    'Equipo': e.nombre,
    'Código': e.codigo,
    'Ambiente': e.ambiente?.nombre || 'N/A',
    'Categoría': e.categoria?.nombre || 'N/A',
    'Estado': e.estado,
    'Descripción': e.descripcion || ''
  }));

  const datosParaExportarEstudiantes = estudiantes.map(e => ({
    'Nombre': e.nombre,
    'Email': e.email || 'N/A',
    'Matrícula': e.matricula,
    'Carrera': e.carrera || 'N/A',
    'Estado': e.estado
  }));

  const calcularDias = (fecha) => {
    const ahora = new Date();
    const f = new Date(fecha);
    return Math.floor((ahora - f) / (1000 * 60 * 60 * 24));
  };

  if (!isMounted || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-8 h-8" />
            Reportes Avanzados
          </h1>
          <p className="text-gray-600 mt-2">Análisis completo del inventario y operaciones</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Sección 1: Inventario */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
          <Package className="w-6 h-6" />
          Inventario
        </h2>

        {/* Cards de estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Total Equipos</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalEquipos}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Equipos Disponibles</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.equiposDisponibles}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Equipos Ocupados</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.equiposOcupados}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">En Mantenimiento</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.equiposMantenimiento}</p>
            </div>
          </div>
        )}

        {/* Gráficos de Inventario */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Equipos por Estado</h3>
            <div className="h-64">
              <Pie data={chartDataEquiposEstado} options={chartOptions} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Equipos por Ambiente</h3>
            <div className="h-64">
              <Bar data={chartDataEquiposAmbiente} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Exportar Equipos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-lg font-semibold text-gray-800">Exportar Datos de Equipos</h3>
            <div className="flex gap-2">
              <Button onClick={() => exportarCSV(datosParaExportarEquipos, 'equipos')} variant="secondary">
                <FileText className="w-4 h-4 mr-2" /> CSV
              </Button>
              <Button onClick={() => exportarExcel(datosParaExportarEquipos, 'equipos')} variant="secondary">
                <FileText className="w-4 h-4 mr-2" /> Excel
              </Button>
              <Button onClick={() => exportarPDF(datosParaExportarEquipos, 'Reporte de Equipos', 'equipos')} variant="secondary">
                <FileText className="w-4 h-4 mr-2" /> PDF
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 2: Operaciones */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
          <Clock className="w-6 h-6" />
          Operaciones
        </h2>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Filtros:</span>
            </div>
            
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="todos">Todos los préstamos</option>
              <option value="activos">Activos</option>
              <option value="devueltos">Devueltos</option>
            </select>

            <select
              value={filtroAmbiente}
              onChange={(e) => setFiltroAmbiente(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="todos">Todos los ambientes</option>
              {ambientes.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="border rounded-lg px-3 py-2"
                placeholder="Fecha inicio"
              />
              <span className="text-gray-500">a</span>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="border rounded-lg px-3 py-2"
                placeholder="Fecha fin"
              />
            </div>
          </div>
        </div>

        {/* Gráficos de Operaciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Equipos Más Usados
            </h3>
            <div className="space-y-3">
              {equiposMasUsados.slice(0, 5).map((equipo, index) => (
                <div key={equipo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{equipo.nombre}</p>
                      <p className="text-sm text-gray-500">{equipo.codigo}</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{equipo.count}</span>
                </div>
              ))}
              {equiposMasUsados.length === 0 && (
                <p className="text-gray-500 text-center py-8">No hay datos de uso</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Ambientes con Más Préstamos
            </h3>
            <div className="space-y-3">
              {ambientesMasPrestamos.slice(0, 5).map((ambiente, index) => (
                <div key={ambiente.nombre} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <p className="font-medium text-gray-800">{ambiente.nombre}</p>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">{ambiente.count}</span>
                </div>
              ))}
              {ambientesMasPrestamos.length === 0 && (
                <p className="text-gray-500 text-center py-8">No hay datos de préstamos</p>
              )}
            </div>
          </div>
        </div>

        {/* Historial de Préstamos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-lg font-semibold text-gray-800">Historial de Préstamos</h3>
            <div className="flex gap-2">
              <Button onClick={() => exportarCSV(datosParaExportarPrestamos, 'prestamos')} variant="secondary">
                <FileText className="w-4 h-4 mr-2" /> CSV
              </Button>
              <Button onClick={() => exportarExcel(datosParaExportarPrestamos, 'prestamos')} variant="secondary">
                <FileText className="w-4 h-4 mr-2" /> Excel
              </Button>
              <Button onClick={() => exportarPDF(datosParaExportarPrestamos, 'Reporte de Préstamos', 'prestamos')} variant="secondary">
                <FileText className="w-4 h-4 mr-2" /> PDF
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Equipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Estudiante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Matrícula</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Fecha Préstamo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Fecha Devolución</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Días</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {prestamosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-600">
                      No hay préstamos para mostrar
                    </td>
                  </tr>
                ) : (
                  prestamosFiltrados.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">{p.equipo?.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{p.estudiante?.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{p.estudiante?.matricula}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(p.fecha_prestamo).toLocaleDateString('es-MX')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {p.fecha_devolucion ? new Date(p.fecha_devolucion).toLocaleDateString('es-MX') : 'Pendiente'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {p.fecha_devolucion
                          ? Math.floor(
                              (new Date(p.fecha_devolucion) - new Date(p.fecha_prestamo)) /
                                (1000 * 60 * 60 * 24)
                            )
                          : calcularDias(p.fecha_prestamo)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          p.fecha_devolucion 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {p.fecha_devolucion ? 'Devuelto' : 'Activo'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Sección 3: Gestión y Estadísticas */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
          <Users className="w-6 h-6" />
          Gestión y Estadísticas
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exportar Estudiantes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h3 className="text-lg font-semibold text-gray-800">Estudiantes Registrados</h3>
              <div className="flex gap-2">
                <Button onClick={() => exportarCSV(datosParaExportarEstudiantes, 'estudiantes')} variant="secondary">
                  <FileText className="w-4 h-4 mr-2" /> CSV
                </Button>
                <Button onClick={() => exportarExcel(datosParaExportarEstudiantes, 'estudiantes')} variant="secondary">
                  <FileText className="w-4 h-4 mr-2" /> Excel
                </Button>
                <Button onClick={() => exportarPDF(datosParaExportarEstudiantes, 'Reporte de Estudiantes', 'estudiantes')} variant="secondary">
                  <FileText className="w-4 h-4 mr-2" /> PDF
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-gray-600">Total de estudiantes: <span className="font-bold text-gray-800">{estudiantes.length}</span></p>
            </div>
          </div>

          {/* Resumen General */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen General</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Total Ambientes</span>
                <span className="font-bold text-blue-600">{stats?.totalAmbientes || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">Total Categorías</span>
                <span className="font-bold text-green-600">{categorias.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-700">Total Préstamos Históricos</span>
                <span className="font-bold text-purple-600">{prestamos.length}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
