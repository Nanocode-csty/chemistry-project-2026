import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const dbOperations = {
  // Auth
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async logout() {
    return await supabase.auth.signOut();
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Ambientes
  async getAmbientes() {
    const { data, error } = await supabase
      .from('ambientes')
      .select('*')
      .order('nombre', { ascending: true });
    return { data, error };
  },

  async crearAmbiente(nombre, descripcion) {
    const { data, error } = await supabase
      .from('ambientes')
      .insert([{ nombre, descripcion }])
      .select();
    return { data, error };
  },

  async actualizarAmbiente(id, nombre, descripcion) {
    const { data, error } = await supabase
      .from('ambientes')
      .update({ nombre, descripcion })
      .eq('id', id)
      .select();
    return { data, error };
  },

  async eliminarAmbiente(id) {
    const { data, error } = await supabase
      .from('ambientes')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  // Categorías
  async getCategorias() {
    const { data, error } = await supabase
      .from('categorias_equipos')
      .select('*')
      .order('nombre', { ascending: true });
    return { data, error };
  },

  async crearCategoria(nombre, descripcion) {
    const { data, error } = await supabase
      .from('categorias_equipos')
      .insert([{ nombre, descripcion }])
      .select();
    return { data, error };
  },

  async actualizarCategoria(id, nombre, descripcion) {
    const { data, error } = await supabase
      .from('categorias_equipos')
      .update({ nombre, descripcion })
      .eq('id', id)
      .select();
    return { data, error };
  },

  async eliminarCategoria(id) {
    const { data, error } = await supabase
      .from('categorias_equipos')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  // Estudiantes
  async getEstudiantes() {
    const { data, error } = await supabase
      .from('estudiantes')
      .select('*')
      .order('nombre', { ascending: true });
    return { data, error };
  },

  async crearEstudiante(nombre, email, matricula) {
    const { data, error } = await supabase
      .from('estudiantes')
      .insert([{ nombre, email, matricula }])
      .select();
    return { data, error };
  },

  async actualizarEstudiante(id, nombre, email, matricula) {
    const { data, error } = await supabase
      .from('estudiantes')
      .update({ nombre, email, matricula })
      .eq('id', id)
      .select();
    return { data, error };
  },

  async eliminarEstudiante(id) {
    const { data, error } = await supabase
      .from('estudiantes')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  // Equipos
  async getEquipos() {
    const { data, error } = await supabase
      .from('equipos')
      .select(`
        *,
        ambiente:ambiente_id(nombre),
        categoria:categoria_id(nombre)
      `)
      .order('nombre', { ascending: true });
    return { data, error };
  },

  async getEquiposPorAmbiente(ambienteId) {
    const { data, error } = await supabase
      .from('equipos')
      .select(`
        *,
        categoria:categoria_id(nombre)
      `)
      .eq('ambiente_id', ambienteId)
      .order('nombre', { ascending: true });
    return { data, error };
  },

  async crearEquipo(nombre, codigo, ambienteId, categoriaId, descripcion) {
    const { data, error } = await supabase
      .from('equipos')
      .insert([{
        nombre,
        codigo,
        ambiente_id: ambienteId,
        categoria_id: categoriaId,
        descripcion,
        estado: 'disponible'
      }])
      .select();
    return { data, error };
  },

  async actualizarEquipo(id, nombre, codigo, ambienteId, categoriaId, descripcion, estado) {
    const { data, error } = await supabase
      .from('equipos')
      .update({
        nombre,
        codigo,
        ambiente_id: ambienteId,
        categoria_id: categoriaId,
        descripcion,
        estado
      })
      .eq('id', id)
      .select();
    return { data, error };
  },

  async cambiarEstadoEquipo(id, estado) {
    const { data, error } = await supabase
      .from('equipos')
      .update({ estado })
      .eq('id', id)
      .select();
    return { data, error };
  },

  async eliminarEquipo(id) {
    const { data, error } = await supabase
      .from('equipos')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  // Préstamos
  async crearPrestamo(equipoId, estudianteId, fechaPrestamo) {
    const { data, error } = await supabase.rpc('registrar_prestamo', {
      equipo_id: equipoId,
      estudiante_id: estudianteId,
      fecha_prestamo: fechaPrestamo || new Date().toISOString(),
    });
    return { data, error };
  },

  async devolverPrestamo(prestamoId) {
    const { data, error } = await supabase.rpc('devolver_prestamo', {
      prestamo_id: prestamoId,
    });
    return { data, error };
  },

  async getPrestamos() {
    const { data, error } = await supabase
      .from('prestamos')
      .select(`
        *,
        equipo:equipo_id(nombre, codigo),
        estudiante:estudiante_id(nombre, matricula)
      `)
      .order('fecha_prestamo', { ascending: false });
    return { data, error };
  },

  async getPrestamosPendientes() {
    const { data, error } = await supabase
      .from('prestamos')
      .select(`
        *,
        equipo:equipo_id(nombre, codigo),
        estudiante:estudiante_id(nombre, matricula)
      `)
      .is('fecha_devolucion', null)
      .order('fecha_prestamo', { ascending: false });
    return { data, error };
  },

  async getHistorialEstudiante(estudianteId) {
    const { data, error } = await supabase
      .from('prestamos')
      .select(`
        *,
        equipo:equipo_id(nombre, codigo)
      `)
      .eq('estudiante_id', estudianteId)
      .order('fecha_prestamo', { ascending: false });
    return { data, error };
  },

  // Dashboard Stats
  async getDashboardStats() {
    try {
      const [ambientes, estudiantes, equipos, prestamos] = await Promise.all([
        supabase.from('ambientes').select('id'),
        supabase.from('estudiantes').select('id'),
        supabase.from('equipos').select('id, estado'),
        supabase.from('prestamos').select('id, fecha_devolucion'),
      ]);

      return {
        totalAmbientes: ambientes.data?.length || 0,
        totalEstudiantes: estudiantes.data?.length || 0,
        totalEquipos: equipos.data?.length || 0,
        equiposDisponibles: equipos.data?.filter(e => e.estado === 'disponible').length || 0,
        equiposOcupados: equipos.data?.filter(e => e.estado === 'ocupado').length || 0,
        equiposMantenimiento: equipos.data?.filter(e => e.estado === 'en_mantenimiento').length || 0,
        prestamosPendientes: prestamos.data?.filter(p => !p.fecha_devolucion).length || 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return null;
    }
  },

  // Equipos por Ambiente
  async getEquiposPorAmbiente() {
    const { data, error } = await supabase
      .from('equipos')
      .select(`
        id,
        ambiente:ambiente_id(nombre)
      `);
    return { data, error };
  },

  // Equipos más usados (por número de préstamos)
  async getEquiposMasUsados() {
    const { data: prestamos, error } = await supabase
      .from('prestamos')
      .select(`
        equipo:equipo_id(id, nombre, codigo)
      `);
    
    if (error) return { data: [], error };
    
    const usageCount = {};
    prestamos?.forEach(p => {
      if (p.equipo?.id) {
        if (!usageCount[p.equipo.id]) {
          usageCount[p.equipo.id] = { 
            ...p.equipo, 
            count: 0 
          };
        }
        usageCount[p.equipo.id].count++;
      }
    });
    
    const sorted = Object.values(usageCount).sort((a, b) => b.count - a.count);
    return { data: sorted, error: null };
  },

  // Ambientes con más préstamos
  async getAmbientesMasPrestamos() {
    const { data: prestamos, error } = await supabase
      .from('prestamos')
      .select(`
        equipo:equipo_id(
          ambiente:ambiente_id(nombre)
        )
      `);
    
    if (error) return { data: [], error };
    
    const ambienteCount = {};
    prestamos?.forEach(p => {
      const ambienteName = p.equipo?.ambiente?.nombre || 'Desconocido';
      ambienteCount[ambienteName] = (ambienteCount[ambienteName] || 0) + 1;
    });
    
    const sorted = Object.entries(ambienteCount)
      .map(([nombre, count]) => ({ nombre, count }))
      .sort((a, b) => b.count - a.count);
    
    return { data: sorted, error: null };
  },
};
