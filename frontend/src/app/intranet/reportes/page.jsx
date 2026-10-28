'use client';

import { useState, useEffect } from 'react';
import { dbOperations } from '@/lib/api';
import {
  getItemTotalInfo,
  consolidateInventoryTotals,
} from '@/lib/units';
import {
  AlertCircle,
  Download,
  BarChart3,
  Calendar,
  Filter,
  FileText,
  TrendingUp,
  Clock,
  Package,
  Building2,
  Users,
  FlaskConical,
  Microscope,
  Layers,
  Scale,
} from 'lucide-react';
import { Button, Badge, Table } from '@/components/intranet/Forms';
import { TableSkeleton } from '@/components/intranet/Skeleton';
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

  const [activeTab, setActiveTab] = useState('inventario'); // 'inventario' | 'prestamos' | 'investigaciones'
  const [prestamos, setPrestamos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [investigaciones, setInvestigaciones] = useState([]);
  const [stats, setStats] = useState(null);
  const [equiposMasUsados, setEquiposMasUsados] = useState([]);
  const [ambientesMasPrestamos, setAmbientesMasPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros de Inventario
  const [filtroTipoInventario, setFiltroTipoInventario] = useState('todos');
  const [filtroAmbienteInventario, setFiltroAmbienteInventario] = useState('todos');
  const [filtroCategoriaInventario, setFiltroCategoriaInventario] = useState('todos');

  // Filtros de Préstamos
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroAmbiente, setFiltroAmbiente] = useState('todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Filtros de Investigaciones
  const [filtroEstadoInv, setFiltroEstadoInv] = useState('todos');

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
          investigacionesRes,
          statsRes,
          equiposUsadosRes,
          ambientesPrestamosRes,
        ] = await Promise.all([
          dbOperations.getPrestamos(),
          dbOperations.getEquipos(),
          dbOperations.getEstudiantes(),
          dbOperations.getAmbientes(),
          dbOperations.getCategorias(),
          dbOperations.getInvestigaciones(),
          dbOperations.getDashboardStats(),
          dbOperations.getEquiposMasUsados(),
          dbOperations.getAmbientesMasPrestamos(),
        ]);

        if (prestamosRes.error) throw new Error(prestamosRes.error);
        if (equiposRes.error) throw new Error(equiposRes.error);
        if (estudiantesRes.error) throw new Error(estudiantesRes.error);
        if (ambientesRes.error) throw new Error(ambientesRes.error);
        if (categoriasRes.error) throw new Error(categoriasRes.error);

        setPrestamos(prestamosRes.data || []);
        setEquipos(equiposRes.data || []);
        setEstudiantes(estudiantesRes.data || []);
        setAmbientes(ambientesRes.data || []);
        setCategorias(categoriasRes.data || []);
        setInvestigaciones(investigacionesRes.data || []);
        setStats(statsRes.data || null);
        setEquiposMasUsados(equiposUsadosRes.data || []);
        setAmbientesMasPrestamos(ambientesPrestamosRes.data || []);
      } catch (err) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrado de Inventario
  const inventarioFiltrado = equipos.filter((item) => {
    if (
      filtroTipoInventario !== 'todos' &&
      (item.tipo_item || 'equipo') !== filtroTipoInventario
    ) {
      return false;
    }
    if (
      filtroAmbienteInventario !== 'todos' &&
      String(item.ambiente_id) !== String(filtroAmbienteInventario)
    ) {
      return false;
    }
    if (
      filtroCategoriaInventario !== 'todos' &&
      String(item.categoria_id) !== String(filtroCategoriaInventario)
    ) {
      return false;
    }
    return true;
  });

  const consolidadoFiltrado = consolidateInventoryTotals(inventarioFiltrado);

  // Filtrado de Préstamos
  const prestamosFiltrados = prestamos.filter((p) => {
    let matches = true;

    if (filtroEstado === 'activos') matches = matches && !p.fecha_devolucion;
    if (filtroEstado === 'devueltos') matches = matches && Boolean(p.fecha_devolucion);

    if (filtroAmbiente !== 'todos' && p.equipo?.ambiente_id) {
      matches = matches && String(p.equipo.ambiente_id) === String(filtroAmbiente);
    }

    if (fechaInicio) {
      matches = matches && new Date(p.fecha_prestamo) >= new Date(fechaInicio);
    }
    if (fechaFin) {
      const finDate = new Date(fechaFin);
      finDate.setHours(23, 59, 59, 999);
      matches = matches && new Date(p.fecha_prestamo) <= finDate;
    }

    return matches;
  });

  // Filtrado de Investigaciones
  const investigacionesFiltradas = investigaciones.filter((inv) => {
    if (filtroEstadoInv === 'todos') return true;
    return inv.estado === filtroEstadoInv;
  });

  const equiposPorAmbiente = ambientes.map((amb) => ({
    nombre: amb.nombre,
    count: equipos.filter((e) => e.ambiente_id === amb.id).length,
  }));

  const equiposPorEstado = {
    disponibles: equipos.filter((e) => e.estado === 'disponible').length,
    ocupados: equipos.filter((e) => e.estado === 'ocupado').length,
    mantenimiento: equipos.filter((e) => e.estado === 'en_mantenimiento').length,
  };

  const chartDataEquiposEstado = {
    labels: ['Disponibles', 'En Uso / Préstamo', 'En Mantenimiento'],
    datasets: [
      {
        data: [
          equiposPorEstado.disponibles,
          equiposPorEstado.ocupados,
          equiposPorEstado.mantenimiento,
        ],
        backgroundColor: ['#9ABE00', '#005180', '#be123c'],
        borderWidth: 1,
      },
    ],
  };

  const chartDataEquiposAmbiente = {
    labels: equiposPorAmbiente.map((a) => a.nombre),
    datasets: [
      {
        label: 'Ítems en Inventario',
        data: equiposPorAmbiente.map((a) => a.count),
        backgroundColor: '#002b45',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // Funciones de exportación (CSV, Excel, PDF con estilo LABCAM)
  const exportarCSV = (datos, nombreArchivo) => {
    if (!datos || datos.length === 0) return;
    const headers = Object.keys(datos[0] || {});
    const csvContent = [
      headers.join(','),
      ...datos.map((row) =>
        headers
          .map((fieldName) => `"${String(row[fieldName] ?? '').replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${nombreArchivo}-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarExcel = (datos, nombreArchivo) => {
    if (!datos || datos.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte LABCAM');
    XLSX.writeFile(
      workbook,
      `${nombreArchivo}-${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  const exportarPDF = (datos, titulo, nombreArchivo) => {
    if (!datos || datos.length === 0) return;
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFillColor(0, 43, 69); // #002b45 LABCAM Navy
    doc.rect(0, 0, 297, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(`LABCAM - ${titulo.toUpperCase()}`, 14, 15);
    doc.setFontSize(9);
    doc.setTextColor(154, 190, 0); // #9ABE00 LABCAM Accent
    doc.text(
      `Generado el: ${new Date().toLocaleDateString('es-PE')} | Total registros: ${datos.length}`,
      14,
      23
    );

    const headers = Object.keys(datos[0]);
    const tableData = datos.map((row) => headers.map((header) => String(row[header] ?? '')));

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 34,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [0, 43, 69], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`${nombreArchivo}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const calcularDias = (fecha) => {
    const ahora = new Date();
    const f = new Date(fecha);
    return Math.max(0, Math.floor((ahora - f) / (1000 * 60 * 60 * 24)));
  };

  // Datasets preparados para exportación
  const datosExportarInventarioDetallado = inventarioFiltrado.map((e) => {
    const info = getItemTotalInfo(e);
    return {
      Código: e.codigo,
      Nombre: e.nombre,
      Tipo: (e.tipo_item || 'equipo').toUpperCase(),
      Fórmula: e.formula_quimica || '-',
      Concentración: e.concentracion || '-',
      Presentación: info.presentacion,
      'Medida por Envase': `${info.capacidad} ${info.unidad}`,
      'N° Envases (Stock)': info.cantidad,
      'Cantidad Total Neta': info.fullTotalLabel,
      Laboratorio: e.ambiente?.nombre || 'N/A',
      Categoría: e.categoria?.nombre || 'N/A',
      Estado: e.estado,
    };
  });

  const datosExportarConsolidado = consolidadoFiltrado.map((c) => ({
    'Sustancia / Material': c.nombre,
    Fórmula: c.formula_quimica || '-',
    Tipo: (c.tipo_item || 'equipo').toUpperCase(),
    Categoría: c.categoria_nombre,
    'N° Lotes': c.lotesCount,
    'Total Envases': c.totalEnvases,
    'Desglose de Presentaciones': c.desgloseTexto,
    'Cantidad Total Acumulada': c.cantidadTotalConsolidada,
    Ubicaciones: c.ambientes,
  }));

  const datosExportarPrestamos = prestamosFiltrados.map((p) => ({
    Material_Equipo: p.equipo?.nombre || 'N/A',
    Código: p.equipo?.codigo || 'N/A',
    Presentación_Medida: p.equipo?.unidad_medida
      ? `${p.equipo.presentacion || 'Unidad'} ${p.equipo.capacidad || 1} ${p.equipo.unidad_medida}`
      : 'Unidad',
    Estudiante: p.estudiante?.nombre || 'N/A',
    Matrícula: p.estudiante?.matricula || 'N/A',
    'Fecha Préstamo': new Date(p.fecha_prestamo).toLocaleDateString('es-PE'),
    'Fecha Devolución': p.fecha_devolucion
      ? new Date(p.fecha_devolucion).toLocaleDateString('es-PE')
      : 'Pendiente',
    Días: p.fecha_devolucion
      ? Math.max(
          0,
          Math.floor(
            (new Date(p.fecha_devolucion) - new Date(p.fecha_prestamo)) /
              (1000 * 60 * 60 * 24)
          )
        )
      : calcularDias(p.fecha_prestamo),
    Estado: p.fecha_devolucion ? 'Devuelto' : 'Activo',
  }));

  const datosExportarInvestigaciones = investigacionesFiltradas.map((inv) => ({
    Título: inv.titulo,
    Tipo: inv.tipo === 'paper' ? 'Paper Científico' : 'Tesis',
    Estado: (inv.estado || 'en_progreso').replace('_', ' ').toUpperCase(),
    Investigadores:
      (inv.investigadores || []).map((e) => e.nombre).join(', ') || 'Sin asignar',
    'Equipos / Materiales Asignados':
      (inv.equipos || []).map((eq) => `${eq.nombre} (${eq.codigo})`).join(', ') ||
      'Ninguno',
    'Fecha Inicio': inv.fecha_inicio
      ? new Date(inv.fecha_inicio).toLocaleDateString('es-PE')
      : '-',
    'Fecha Fin': inv.fecha_fin
      ? new Date(inv.fecha_fin).toLocaleDateString('es-PE')
      : 'En curso',
  }));

  const datosExportarEstudiantes = estudiantes.map((e) => ({
    Nombre: e.nombre,
    Matrícula: e.matricula,
    Email: e.email || 'N/A',
    Ciclo: e.ciclo ? `Ciclo ${e.ciclo}` : 'N/A',
    Carrera: e.carrera || 'Ingeniería Química',
    Estado: e.estado || 'activo',
  }));

  const totalReactivosCount = equipos.filter((e) => e.tipo_item === 'reactivo').length;
  const stockBajoCount = equipos.filter(
    (e) => (Number(e.cantidad) || 1) <= (Number(e.stock_minimo) || 1)
  ).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header - LABCAM Corporate Style */}
      <div className="bg-white p-8 rounded-lg shadow-premium border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-brand-navy p-4 rounded-sm shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-brand-navy tracking-tight uppercase">
              Reportes y Analítica
            </h1>
            <p className="text-brand-teal font-bold text-xs tracking-widest uppercase mt-1">
              Control de Reactivos, Unidades de Medida, Totales, Préstamos e Investigaciones
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              exportarExcel(datosExportarConsolidado, 'consolidado-totales-labcam')
            }
            variant="secondary"
            className="!py-3 !px-5 !text-xs"
          >
            <Download className="w-4 h-4 mr-2 inline" /> EXCEL TOTALES
          </Button>
          <Button
            onClick={() =>
              exportarPDF(
                datosExportarInventarioDetallado,
                'Reporte General de Inventario y Reactivos',
                'inventario-labcam'
              )
            }
            variant="primary"
            className="!py-3 !px-5 !text-xs"
          >
            <FileText className="w-4 h-4 mr-2 inline" /> REPORTE PDF
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-brand-red/10 border-l-4 border-brand-red p-6 rounded-sm">
          <div className="flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-brand-red" />
            <p className="text-brand-red font-bold">{error}</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-sm border border-brand-border shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Total Registros
          </p>
          <p className="text-3xl font-display font-black text-[#002b45] mt-1">
            {stats?.totalEquipos ?? equipos.length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-sm border border-brand-border shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Lotes Reactivos
          </p>
          <p className="text-3xl font-display font-black text-[#9ABE00] mt-1">
            {stats?.totalReactivos ?? totalReactivosCount}
          </p>
        </div>
        <div className="bg-white p-5 rounded-sm border border-brand-border shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Disponibles
          </p>
          <p className="text-3xl font-display font-black text-green-600 mt-1">
            {stats?.equiposDisponibles ?? equiposPorEstado.disponibles}
          </p>
        </div>
        <div className="bg-white p-5 rounded-sm border border-brand-border shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            En Préstamo
          </p>
          <p className="text-3xl font-display font-black text-brand-navy mt-1">
            {stats?.equiposOcupados ?? equiposPorEstado.ocupados}
          </p>
        </div>
        <div className="bg-white p-5 rounded-sm border border-brand-border shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Stock Bajo
          </p>
          <p className="text-3xl font-display font-black text-brand-red mt-1">
            {stats?.stockBajoCount ?? stockBajoCount}
          </p>
        </div>
        <div className="bg-white p-5 rounded-sm border border-brand-border shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Investigaciones
          </p>
          <p className="text-3xl font-display font-black text-brand-teal mt-1">
            {stats?.totalInvestigaciones ?? investigaciones.length}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-brand-border flex flex-wrap gap-2">
        {[
          {
            id: 'inventario',
            label: '1. INVENTARIO, REACTIVOS Y TOTALES',
            icon: FlaskConical,
          },
          {
            id: 'prestamos',
            label: '2. PRÉSTAMOS Y OPERACIONES',
            icon: Clock,
          },
          {
            id: 'investigaciones',
            label: '3. INVESTIGACIONES Y ESTUDIANTES',
            icon: Microscope,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-sm font-display font-black text-xs tracking-widest uppercase transition-all ${
                active
                  ? 'bg-[#002b45] text-white shadow-md'
                  : 'bg-slate-50 text-slate-500 hover:text-[#002b45] hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-[#9ABE00]' : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {!isMounted || loading ? (
        <div className="bg-white p-8 rounded-lg shadow-premium border border-brand-border">
          <TableSkeleton />
        </div>
      ) : (
        <>
          {/* TAB 1: INVENTARIO, REACTIVOS Y TOTALES */}
          {activeTab === 'inventario' && (
            <div className="space-y-8">
              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-premium border border-brand-border p-6">
                  <h3 className="font-display font-black text-sm text-[#002b45] uppercase tracking-wider mb-4 border-b border-slate-100 pb-3">
                    Disponibilidad del Inventario
                  </h3>
                  <div className="h-64">
                    <Pie data={chartDataEquiposEstado} options={chartOptions} />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-premium border border-brand-border p-6">
                  <h3 className="font-display font-black text-sm text-[#002b45] uppercase tracking-wider mb-4 border-b border-slate-100 pb-3">
                    Distribución por Laboratorio / Ambiente
                  </h3>
                  <div className="h-64">
                    <Bar data={chartDataEquiposAmbiente} options={chartOptions} />
                  </div>
                </div>
              </div>

              {/* Inventory Filters */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-brand-border flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-xs font-black text-[#002b45] uppercase tracking-widest">
                    <Filter className="w-4 h-4 text-[#9ABE00]" /> FILTRAR INVENTARIO:
                  </div>
                  <select
                    value={filtroTipoInventario}
                    onChange={(e) => setFiltroTipoInventario(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-brand-border rounded-sm text-xs font-bold text-[#002b45] uppercase"
                  >
                    <option value="todos">TODOS LOS TIPOS</option>
                    <option value="reactivo">SOLO REACTIVOS QUÍMICOS</option>
                    <option value="material">SOLO MATERIALES / CRISTALERÍA</option>
                    <option value="equipo">SOLO EQUIPOS / INSTRUMENTOS</option>
                    <option value="seguridad">SOLO SEGURIDAD / EPP</option>
                  </select>

                  <select
                    value={filtroAmbienteInventario}
                    onChange={(e) => setFiltroAmbienteInventario(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-brand-border rounded-sm text-xs font-bold text-[#002b45] uppercase"
                  >
                    <option value="todos">TODOS LOS LABORATORIOS</option>
                    {ambientes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre.toUpperCase()}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filtroCategoriaInventario}
                    onChange={(e) => setFiltroCategoriaInventario(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-brand-border rounded-sm text-xs font-bold text-[#002b45] uppercase"
                  >
                    <option value="todos">TODAS LAS CATEGORÍAS</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Consolidated Totals Table */}
              <div className="bg-white rounded-lg shadow-premium border border-brand-border overflow-hidden">
                <div className="p-6 border-b border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
                  <div>
                    <h3 className="font-display font-black text-base text-[#002b45] uppercase tracking-tight flex items-center gap-2">
                      <Scale className="w-5 h-5 text-[#9ABE00]" />
                      Reporte Consolidado de Cantidades Totales por Sustancia / Material
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Suma automática de múltiples frascos/presentaciones del mismo reactivo o material
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() =>
                        exportarCSV(datosExportarConsolidado, 'totales-consolidados')
                      }
                      variant="secondary"
                      className="!py-2.5 !px-4 !text-xs"
                    >
                      <FileText className="w-4 h-4 mr-1.5 inline" /> CSV
                    </Button>
                    <Button
                      onClick={() =>
                        exportarExcel(datosExportarConsolidado, 'totales-consolidados')
                      }
                      variant="secondary"
                      className="!py-2.5 !px-4 !text-xs"
                    >
                      <FileText className="w-4 h-4 mr-1.5 inline" /> EXCEL
                    </Button>
                    <Button
                      onClick={() =>
                        exportarPDF(
                          datosExportarConsolidado,
                          'Consolidado de Cantidades Totales de Reactivos y Materiales',
                          'totales-consolidados'
                        )
                      }
                      variant="primary"
                      className="!py-2.5 !px-4 !text-xs"
                    >
                      <FileText className="w-4 h-4 mr-1.5 inline" /> PDF
                    </Button>
                  </div>
                </div>

                <Table
                  columns={[
                    {
                      key: 'nombre',
                      label: 'Reactivo / Material',
                      render: (row) => (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#002b45] uppercase">
                              {row.nombre}
                            </span>
                            {row.formula_quimica && (
                              <span className="px-2 py-0.5 bg-[#002b45]/10 text-[#002b45] font-mono font-black text-[10px] rounded-sm">
                                {row.formula_quimica}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {row.categoria_nombre}
                          </span>
                        </div>
                      ),
                    },
                    {
                      key: 'desgloseTexto',
                      label: 'Desglose de Frascos / Presentaciones',
                      render: (row) => (
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">
                            {row.desgloseTexto}
                          </span>
                          <span className="text-[10px] font-black text-[#9ABE00] uppercase">
                            {row.totalEnvases} envases/unidades en {row.lotesCount}{' '}
                            {row.lotesCount === 1 ? 'lote' : 'lotes'}
                          </span>
                        </div>
                      ),
                    },
                    {
                      key: 'cantidadTotalConsolidada',
                      label: 'Cantidad Total Neta',
                      render: (row) => (
                        <Badge color="navy">{row.cantidadTotalConsolidada}</Badge>
                      ),
                    },
                    {
                      key: 'ambientes',
                      label: 'Laboratorios',
                      render: (row) => (
                        <span className="text-xs font-medium text-gray-600">
                          {row.ambientes}
                        </span>
                      ),
                    },
                  ]}
                  data={consolidadoFiltrado}
                />
              </div>

              {/* Detailed Inventory Table */}
              <div className="bg-white rounded-lg shadow-premium border border-brand-border overflow-hidden">
                <div className="p-6 border-b border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
                  <div>
                    <h3 className="font-display font-black text-base text-[#002b45] uppercase tracking-tight flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#9ABE00]" />
                      Inventario Detallado por Lote / Código ({inventarioFiltrado.length})
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Detalle individual de cada frasco, material o equipo con su unidad de medida
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() =>
                        exportarCSV(
                          datosExportarInventarioDetallado,
                          'inventario-detallado'
                        )
                      }
                      variant="secondary"
                      className="!py-2.5 !px-4 !text-xs"
                    >
                      <FileText className="w-4 h-4 mr-1.5 inline" /> CSV
                    </Button>
                    <Button
                      onClick={() =>
                        exportarExcel(
                          datosExportarInventarioDetallado,
                          'inventario-detallado'
                        )
                      }
                      variant="secondary"
                      className="!py-2.5 !px-4 !text-xs"
                    >
                      <FileText className="w-4 h-4 mr-1.5 inline" /> EXCEL
                    </Button>
                    <Button
                      onClick={() =>
                        exportarPDF(
                          datosExportarInventarioDetallado,
                          'Reporte Detallado de Inventario y Unidades de Medida',
                          'inventario-detallado'
                        )
                      }
                      variant="primary"
                      className="!py-2.5 !px-4 !text-xs"
                    >
                      <FileText className="w-4 h-4 mr-1.5 inline" /> PDF
                    </Button>
                  </div>
                </div>

                <Table
                  columns={[
                    {
                      key: 'nombre',
                      label: 'Ítem / Código',
                      render: (row) => (
                        <div className="flex flex-col">
                          <span className="font-bold text-[#002b45] uppercase">
                            {row.nombre}
                          </span>
                          <span className="text-[10px] font-black text-[#9ABE00] uppercase tracking-widest">
                            {row.codigo}{' '}
                            {row.formula_quimica ? `• ${row.formula_quimica}` : ''}
                          </span>
                        </div>
                      ),
                    },
                    {
                      key: 'presentacion',
                      label: 'Presentación / Medida',
                      render: (row) => {
                        const info = getItemTotalInfo(row);
                        return <Badge color="gray">{info.presentacionLabel}</Badge>;
                      },
                    },
                    {
                      key: 'total',
                      label: 'Stock / Total Neto',
                      render: (row) => {
                        const info = getItemTotalInfo(row);
                        return (
                          <div className="flex flex-col">
                            <span className="font-display font-black text-sm text-[#002b45]">
                              {info.fullTotalLabel}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">
                              {info.envasesLabel}
                            </span>
                          </div>
                        );
                      },
                    },
                    {
                      key: 'ambiente',
                      label: 'Ubicación',
                      render: (row) => (
                        <span className="text-xs font-medium text-gray-600">
                          {row.ambiente?.nombre || 'N/A'}
                        </span>
                      ),
                    },
                    {
                      key: 'estado',
                      label: 'Estado',
                      render: (row) => (
                        <Badge
                          color={
                            row.estado === 'disponible'
                              ? 'green'
                              : row.estado === 'ocupado'
                              ? 'blue'
                              : 'red'
                          }
                        >
                          {row.estado.toUpperCase()}
                        </Badge>
                      ),
                    },
                  ]}
                  data={inventarioFiltrado}
                />
              </div>
            </div>
          )}

          {/* TAB 2: PRÉSTAMOS Y OPERACIONES */}
          {activeTab === 'prestamos' && (
            <div className="space-y-8">
              {/* Top Used Rankings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-premium border border-brand-border p-6">
                  <h3 className="font-display font-black text-sm text-[#002b45] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <TrendingUp className="w-5 h-5 text-[#9ABE00]" />
                    Materiales y Equipos Más Solicitados
                  </h3>
                  <div className="space-y-3">
                    {equiposMasUsados.slice(0, 5).map((equipo, index) => (
                      <div
                        key={equipo.id}
                        className="flex items-center justify-between p-3.5 bg-slate-50 rounded-sm border border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-[#002b45] text-[#9ABE00] rounded-sm flex items-center justify-center font-display font-black text-xs">
                            #{index + 1}
                          </span>
                          <div>
                            <p className="font-bold text-[#002b45] text-sm uppercase">
                              {equipo.nombre}
                            </p>
                            <p className="text-[10px] font-black text-[#9ABE00] uppercase tracking-widest">
                              {equipo.codigo}
                            </p>
                          </div>
                        </div>
                        <span className="text-2xl font-display font-black text-[#002b45]">
                          {equipo.count}
                        </span>
                      </div>
                    ))}
                    {equiposMasUsados.length === 0 && (
                      <p className="text-slate-400 text-center py-8 text-xs font-bold uppercase">
                        No hay datos de préstamos registrados
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-premium border border-brand-border p-6">
                  <h3 className="font-display font-black text-sm text-[#002b45] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Building2 className="w-5 h-5 text-[#9ABE00]" />
                    Laboratorios con Mayor Movimiento
                  </h3>
                  <div className="space-y-3">
                    {ambientesMasPrestamos.slice(0, 5).map((ambiente, index) => (
                      <div
                        key={ambiente.nombre}
                        className="flex items-center justify-between p-3.5 bg-slate-50 rounded-sm border border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-brand-teal text-white rounded-sm flex items-center justify-center font-display font-black text-xs">
                            #{index + 1}
                          </span>
                          <p className="font-bold text-[#002b45] text-sm uppercase">
                            {ambiente.nombre}
                          </p>
                        </div>
                        <span className="text-2xl font-display font-black text-brand-teal">
                          {ambiente.count}
                        </span>
                      </div>
                    ))}
                    {ambientesMasPrestamos.length === 0 && (
                      <p className="text-slate-400 text-center py-8 text-xs font-bold uppercase">
                        No hay datos de préstamos por ambiente
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Filters for Loans */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-brand-border flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-xs font-black text-[#002b45] uppercase tracking-widest">
                    <Filter className="w-4 h-4 text-[#9ABE00]" /> FILTROS:
                  </div>

                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-brand-border rounded-sm text-xs font-bold text-[#002b45] uppercase"
                  >
                    <option value="todos">TODOS LOS PRÉSTAMOS</option>
                    <option value="activos">ACTIVOS (PENDIENTES)</option>
                    <option value="devueltos">DEVUELTOS</option>
                  </select>

                  <select
                    value={filtroAmbiente}
                    onChange={(e) => setFiltroAmbiente(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-brand-border rounded-sm text-xs font-bold text-[#002b45] uppercase"
                  >
                    <option value="todos">TODOS LOS AMBIENTES</option>
                    {ambientes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre.toUpperCase()}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#002b45]" />
                    <input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-brand-border rounded-sm text-xs font-bold text-[#002b45]"
                    />
                    <span className="text-xs font-bold text-slate-400">A</span>
                    <input
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-brand-border rounded-sm text-xs font-bold text-[#002b45]"
                    />
                  </div>
                </div>

                {(filtroEstado !== 'todos' ||
                  filtroAmbiente !== 'todos' ||
                  fechaInicio ||
                  fechaFin) && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setFiltroEstado('todos');
                      setFiltroAmbiente('todos');
                      setFechaInicio('');
                      setFechaFin('');
                    }}
                    className="!py-2 !px-4 !text-xs"
                  >
                    LIMPIAR FILTROS
                  </Button>
                )}
              </div>

              {/* Loans Table */}
              <div className="bg-white rounded-lg shadow-premium border border-brand-border overflow-hidden">
                <div className="p-6 border-b border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
                  <div>
                    <h3 className="font-display font-black text-base text-[#002b45] uppercase tracking-tight">
                      Historial y Reporte de Préstamos ({prestamosFiltrados.length})
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Control de salidas y devoluciones de materiales, reactivos y equipos
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => exportarCSV(datosExportarPrestamos, 'prestamos')}
                      variant="secondary"
                      className="!py-2.5 !px-4 !text-xs"
                    >
                      <FileText className="w-4 h-4 mr-1.5 inline" /> CSV
                    </Button>
                    <Button
                      onClick={() => exportarExcel(datosExportarPrestamos, 'prestamos')}
                      variant="secondary"
                      className="!py-2.5 !px-4 !text-xs"
                    >
                      <FileText className="w-4 h-4 mr-1.5 inline" /> EXCEL
                    </Button>
                    <Button
                      onClick={() =>
                        exportarPDF(
                          datosExportarPrestamos,
                          'Reporte de Préstamos y Devoluciones',
                          'prestamos'
                        )
                      }
                      variant="primary"
                      className="!py-2.5 !px-4 !text-xs"
                    >
                      <FileText className="w-4 h-4 mr-1.5 inline" /> PDF
                    </Button>
                  </div>
                </div>

                <Table
                  columns={[
                    {
                      key: 'equipo',
                      label: 'Material / Equipo',
                      render: (row) => (
                        <div className="flex flex-col">
                          <span className="font-bold text-[#002b45] uppercase">
                            {row.equipo?.nombre || 'N/A'}
                          </span>
                          <span className="text-[10px] font-black text-[#9ABE00] uppercase tracking-widest">
                            {row.equipo?.codigo || 'N/A'}
                            {row.equipo?.unidad_medida
                              ? ` • ${row.equipo.presentacion || 'Unidad'} ${row.equipo.capacidad || 1} ${row.equipo.unidad_medida}`
                              : ''}
                          </span>
                        </div>
                      ),
                    },
                    {
                      key: 'estudiante',
                      label: 'Estudiante / Matrícula',
                      render: (row) => (
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">
                            {row.estudiante?.nombre || 'N/A'}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {row.estudiante?.matricula || 'N/A'}
                          </span>
                        </div>
                      ),
                    },
                    {
                      key: 'fechas',
                      label: 'Préstamo / Devolución',
                      render: (row) => (
                        <div className="flex flex-col text-xs">
                          <span className="font-bold text-[#002b45]">
                            Salida: {new Date(row.fecha_prestamo).toLocaleDateString('es-PE')}
                          </span>
                          <span className="text-slate-400 font-medium">
                            Retorno:{' '}
                            {row.fecha_devolucion
                              ? new Date(row.fecha_devolucion).toLocaleDateString('es-PE')
                              : 'Pendiente'}
                          </span>
                        </div>
                      ),
                    },
                    {
                      key: 'dias',
                      label: 'Duración',
                      render: (row) => {
                        const d = row.fecha_devolucion
                          ? Math.max(
                              0,
                              Math.floor(
                                (new Date(row.fecha_devolucion) -
                                  new Date(row.fecha_prestamo)) /
                                  (1000 * 60 * 60 * 24)
                              )
                            )
                          : calcularDias(row.fecha_prestamo);
                        return (
                          <span className="font-display font-black text-sm text-[#002b45]">
                            {d} días
                          </span>
                        );
                      },
                    },
                    {
                      key: 'estado',
                      label: 'Estado',
                      render: (row) => (
                        <Badge color={row.fecha_devolucion ? 'gray' : 'blue'}>
                          {row.fecha_devolucion ? 'DEVUELTO' : 'ACTIVO'}
                        </Badge>
                      ),
                    },
                  ]}
                  data={prestamosFiltrados}
                />
              </div>
            </div>
          )}

          {/* TAB 3: INVESTIGACIONES Y ESTUDIANTES */}
          {activeTab === 'investigaciones' && (
            <div className="space-y-8">
              {/* Research Projects Report */}
              <div className="bg-white rounded-lg shadow-premium border border-brand-border overflow-hidden">
                <div className="p-6 border-b border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
                  <div>
                    <h3 className="font-display font-black text-base text-[#002b45] uppercase tracking-tight flex items-center gap-2">
                      <Microscope className="w-5 h-5 text-[#9ABE00]" />
                      Reporte de Investigaciones Científicas ({investigacionesFiltradas.length})
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Papers y tesis con investigadores y equipamiento/materiales asignados
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={filtroEstadoInv}
                      onChange={(e) => setFiltroEstadoInv(e.target.value)}
                      className="px-3 py-2 bg-white border border-brand-border rounded-sm text-xs font-bold text-[#002b45] uppercase"
                    >
                      <option value="todos">TODOS LOS ESTADOS</option>
                      <option value="en_progreso">EN PROGRESO</option>
                      <option value="pausado">PAUSADOS</option>
                      <option value="finalizado">FINALIZADOS</option>
                    </select>
                    <Button
                      onClick={() =>
                        exportarCSV(datosExportarInvestigaciones, 'investigaciones')
                      }
                      variant="secondary"
                      className="!py-2.5 !px-4 !text-xs"
                    >
                      <FileText className="w-4 h-4 mr-1.5 inline" /> CSV
                    </Button>
                    <Button
                      onClick={() =>
                        exportarExcel(datosExportarInvestigaciones, 'investigaciones')
                      }
                      variant="secondary"
                      className="!py-2.5 !px-4 !text-xs"
                    >
                      <FileText className="w-4 h-4 mr-1.5 inline" /> EXCEL
                    </Button>
                    <Button
                      onClick={() =>
                        exportarPDF(
                          datosExportarInvestigaciones,
                          'Reporte de Investigaciones y Equipamiento Asignado',
                          'investigaciones'
                        )
                      }
                      variant="primary"
                      className="!py-2.5 !px-4 !text-xs"
                    >
                      <FileText className="w-4 h-4 mr-1.5 inline" /> PDF
                    </Button>
                  </div>
                </div>

                <Table
                  columns={[
                    {
                      key: 'titulo',
                      label: 'Proyecto de Investigación',
                      render: (row) => (
                        <div className="flex flex-col">
                          <span className="font-bold text-[#002b45] uppercase">
                            {row.titulo}
                          </span>
                          <span className="text-[10px] font-black text-[#9ABE00] uppercase tracking-widest">
                            {row.tipo === 'paper' ? 'PAPER CIENTÍFICO' : 'TESIS DE GRADO'}
                          </span>
                        </div>
                      ),
                    },
                    {
                      key: 'investigadores',
                      label: 'Investigadores',
                      render: (row) => (
                        <span className="text-xs font-medium text-slate-700">
                          {(row.investigadores || []).map((e) => e.nombre).join(', ') ||
                            'Sin asignar'}
                        </span>
                      ),
                    },
                    {
                      key: 'equipos',
                      label: 'Equipos / Materiales Asignados',
                      render: (row) => (
                        <span className="text-xs text-slate-600">
                          {(row.equipos || []).map((eq) => eq.nombre).join(', ') ||
                            'Ninguno'}
                        </span>
                      ),
                    },
                    {
                      key: 'estado',
                      label: 'Estado',
                      render: (row) => (
                        <Badge
                          color={
                            row.estado === 'finalizado'
                              ? 'green'
                              : row.estado === 'pausado'
                              ? 'yellow'
                              : 'teal'
                          }
                        >
                          {(row.estado || 'en_progreso').replace('_', ' ').toUpperCase()}
                        </Badge>
                      ),
                    },
                  ]}
                  data={investigacionesFiltradas}
                />
              </div>

              {/* Students Report */}
              <div className="bg-white rounded-lg shadow-premium border border-brand-border overflow-hidden">
                <div className="p-6 border-b border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
                  <div>
                    <h3 className="font-display font-black text-base text-[#002b45] uppercase tracking-tight flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#9ABE00]" />
                      Padrón de Estudiantes Registrados ({estudiantes.length})
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Comunidad académica habilitada para préstamos e investigaciones
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() =>
                        exportarCSV(datosExportarEstudiantes, 'estudiantes')
                      }
                      variant="secondary"
                      className="!py-2.5 !px-4 !text-xs"
                    >
                      <FileText className="w-4 h-4 mr-1.5 inline" /> CSV
                    </Button>
                    <Button
                      onClick={() =>
                        exportarExcel(datosExportarEstudiantes, 'estudiantes')
                      }
                      variant="secondary"
                      className="!py-2.5 !px-4 !text-xs"
                    >
                      <FileText className="w-4 h-4 mr-1.5 inline" /> EXCEL
                    </Button>
                    <Button
                      onClick={() =>
                        exportarPDF(
                          datosExportarEstudiantes,
                          'Reporte de Estudiantes Registrados',
                          'estudiantes'
                        )
                      }
                      variant="primary"
                      className="!py-2.5 !px-4 !text-xs"
                    >
                      <FileText className="w-4 h-4 mr-1.5 inline" /> PDF
                    </Button>
                  </div>
                </div>

                <Table
                  columns={[
                    {
                      key: 'nombre',
                      label: 'Estudiante',
                      render: (row) => (
                        <span className="font-bold text-[#002b45] uppercase">
                          {row.nombre}
                        </span>
                      ),
                    },
                    {
                      key: 'matricula',
                      label: 'Matrícula',
                      render: (row) => (
                        <span className="font-mono font-bold text-xs text-slate-600">
                          {row.matricula}
                        </span>
                      ),
                    },
                    {
                      key: 'email',
                      label: 'Correo Institucional',
                      render: (row) => (
                        <span className="text-xs text-slate-500">
                          {row.email || 'No registrado'}
                        </span>
                      ),
                    },
                    {
                      key: 'ciclo',
                      label: 'Ciclo',
                      render: (row) => (
                        <Badge color="teal">
                          {row.ciclo ? `CICLO ${row.ciclo}` : 'N/A'}
                        </Badge>
                      ),
                    },
                  ]}
                  data={estudiantes}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
