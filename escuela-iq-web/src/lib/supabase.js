import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || null;
};

const backendUrl = getBackendUrl();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper for local backend calls
const fetchLocal = async (path, options = {}) => {
  if (!backendUrl) {
    return { data: null, error: 'Backend URL not configured' };
  }

  try {
    const url = `${backendUrl}${path}`;
    
    // Solo acceder a localStorage en el cliente
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('iq_token');
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    
    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) return { data: null, error: data || response.statusText };
    return { data, error: null };
  } catch (err) {
    console.error(`Fetch error at ${path}:`, err);
    return { data: null, error: 'Error de conexión con el servidor' };
  }
};

// Helper functions for common operations
export const dbOperations = {
  // Auth
  async login(email, password) {
    if (backendUrl) {
      return await fetchLocal('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async logout() {
    if (backendUrl) return { success: true };
    return await supabase.auth.signOut();
  },

  async getCurrentUser() {
    if (backendUrl) {
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('iq_user');
        if (savedUser) return JSON.parse(savedUser);
      }
      return null;
    }
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Ambientes
  async getAmbientes() {
    if (backendUrl) return await fetchLocal('/ambientes');
    const { data, error } = await supabase
      .from('ambientes')
      .select('*')
      .order('nombre', { ascending: true });
    return { data, error };
  },

  async crearAmbiente(nombre, descripcion) {
    if (backendUrl) {
      return await fetchLocal('/ambientes', {
        method: 'POST',
        body: JSON.stringify({ nombre, descripcion }),
      });
    }
    const { data, error } = await supabase
      .from('ambientes')
      .insert([{ nombre, descripcion }])
      .select();
    return { data, error };
  },

  async actualizarAmbiente(id, nombre, descripcion) {
    if (backendUrl) {
      return await fetchLocal(`/ambientes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ nombre, descripcion }),
      });
    }
    const { data, error } = await supabase
      .from('ambientes')
      .update({ nombre, descripcion })
      .eq('id', id)
      .select();
    return { data, error };
  },

  async eliminarAmbiente(id) {
    if (backendUrl) {
      return await fetchLocal(`/ambientes/${id}`, {
        method: 'DELETE',
      });
    }
    const { data, error } = await supabase
      .from('ambientes')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  // Categorías
  async getCategorias() {
    if (backendUrl) return await fetchLocal('/categorias');
    const { data, error } = await supabase
      .from('categorias_equipos')
      .select('*')
      .order('nombre', { ascending: true });
    return { data, error };
  },

  async crearCategoria(nombre, descripcion) {
    if (backendUrl) {
      return await fetchLocal('/categorias', {
        method: 'POST',
        body: JSON.stringify({ nombre, descripcion }),
      });
    }
    const { data, error } = await supabase
      .from('categorias_equipos')
      .insert([{ nombre, descripcion }])
      .select();
    return { data, error };
  },

  async actualizarCategoria(id, nombre, descripcion) {
    if (backendUrl) {
      return await fetchLocal(`/categorias/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ nombre, descripcion }),
      });
    }
    const { data, error } = await supabase
      .from('categorias_equipos')
      .update({ nombre, descripcion })
      .eq('id', id)
      .select();
    return { data, error };
  },

  async eliminarCategoria(id) {
    if (backendUrl) {
      return await fetchLocal(`/categorias/${id}`, {
        method: 'DELETE',
      });
    }
    const { data, error } = await supabase
      .from('categorias_equipos')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  // Estudiantes
  async getEstudiantes() {
    if (backendUrl) return await fetchLocal('/estudiantes');
    const { data, error } = await supabase
      .from('estudiantes')
      .select('*')
      .order('nombre', { ascending: true });
    return { data, error };
  },

  async crearEstudiante(nombre, email, matricula) {
    if (backendUrl) {
      return await fetchLocal('/estudiantes', {
        method: 'POST',
        body: JSON.stringify({ nombre, email, matricula }),
      });
    }
    const { data, error } = await supabase
      .from('estudiantes')
      .insert([{ nombre, email, matricula }])
      .select();
    return { data, error };
  },

  async actualizarEstudiante(id, nombre, email, matricula) {
    if (backendUrl) {
      return await fetchLocal(`/estudiantes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ nombre, email, matricula }),
      });
    }
    const { data, error } = await supabase
      .from('estudiantes')
      .update({ nombre, email, matricula })
      .eq('id', id)
      .select();
    return { data, error };
  },

  async eliminarEstudiante(id) {
    if (backendUrl) {
      return await fetchLocal(`/estudiantes/${id}`, {
        method: 'DELETE',
      });
    }
    const { data, error } = await supabase
      .from('estudiantes')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  // Equipos
  async getEquipos() {
    if (backendUrl) return await fetchLocal('/equipos');
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
    if (backendUrl) return await fetchLocal(`/equipos?ambiente=${ambienteId}`);
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
    if (backendUrl) {
      return await fetchLocal('/equipos', {
        method: 'POST',
        body: JSON.stringify({ nombre, codigo, ambiente_id: ambienteId, categoria_id: categoriaId, descripcion }),
      });
    }
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
    if (backendUrl) {
      return await fetchLocal(`/equipos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ nombre, codigo, ambiente_id: ambienteId, categoria_id: categoriaId, descripcion, estado }),
      });
    }
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
    if (backendUrl) {
      return await fetchLocal(`/equipos/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      });
    }
    const { data, error } = await supabase
      .from('equipos')
      .update({ estado })
      .eq('id', id)
      .select();
    return { data, error };
  },

  async eliminarEquipo(id) {
    if (backendUrl) {
      return await fetchLocal(`/equipos/${id}`, {
        method: 'DELETE',
      });
    }
    const { data, error } = await supabase
      .from('equipos')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  // Préstamos
  async crearPrestamo(equipoId, estudianteId, fechaPrestamo) {
    if (backendUrl) {
      return await fetchLocal('/prestamos', {
        method: 'POST',
        body: JSON.stringify({ equipo_id: equipoId, estudiante_id: estudianteId, fecha_prestamo: fechaPrestamo }),
      });
    }
    const { data, error } = await supabase.rpc('registrar_prestamo', {
      equipo_id: equipoId,
      estudiante_id: estudianteId,
      fecha_prestamo: fechaPrestamo || new Date().toISOString(),
    });
    return { data, error };
  },

  async devolverPrestamo(prestamoId) {
    if (backendUrl) {
      return await fetchLocal(`/prestamos/${prestamoId}/devolver`, {
        method: 'PUT',
      });
    }
    const { data, error } = await supabase.rpc('devolver_prestamo', {
      prestamo_id: prestamoId,
    });
    return { data, error };
  },

  async getPrestamos() {
    if (backendUrl) return await fetchLocal('/prestamos');
    const { data, error } = await supabase
      .from('prestamos')
      .select(`
        *,
        equipo:equipo_id(nombre, codigo, ambiente_id, categoria_id),
        estudiante:estudiante_id(nombre, matricula)
      `)
      .order('fecha_prestamo', { ascending: false });
    return { data, error };
  },

  async getPrestamosPendientes() {
    if (backendUrl) {
      const { data, error } = await fetchLocal('/prestamos');
      if (error) return { data, error };
      return { data: data.filter(p => !p.fecha_devolucion), error: null };
    }
    const { data, error } = await supabase
      .from('prestamos')
      .select(`
        *,
        equipo:equipo_id(nombre, codigo, ambiente_id, categoria_id),
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
    if (backendUrl) return await fetchLocal('/dashboard/stats');
    
    try {
      const [
        { count: totalAmbientes },
        { count: totalEstudiantes },
        { count: totalEquipos },
        { count: prestamosPendientes },
        { count: equiposDisponibles },
        { count: equiposOcupados },
        { count: equiposMantenimiento }
      ] = await Promise.all([
        supabase.from('ambientes').select('*', { count: 'exact', head: true }),
        supabase.from('estudiantes').select('*', { count: 'exact', head: true }),
        supabase.from('equipos').select('*', { count: 'exact', head: true }),
        supabase.from('prestamos').select('*', { count: 'exact', head: true }).is('fecha_devolucion', null),
        supabase.from('equipos').select('*', { count: 'exact', head: true }).eq('estado', 'disponible'),
        supabase.from('equipos').select('*', { count: 'exact', head: true }).eq('estado', 'ocupado'),
        supabase.from('equipos').select('*', { count: 'exact', head: true }).eq('estado', 'en_mantenimiento'),
      ]);

      return {
        data: {
          totalAmbientes: totalAmbientes || 0,
          totalEstudiantes: totalEstudiantes || 0,
          totalEquipos: totalEquipos || 0,
          prestamosPendientes: prestamosPendientes || 0,
          equiposDisponibles: equiposDisponibles || 0,
          equiposOcupados: equiposOcupados || 0,
          equiposMantenimiento: equiposMantenimiento || 0
        },
        error: null
      };
    } catch (err) {
      console.error('Error fetching Supabase stats:', err);
      return { data: null, error: err.message };
    }
  },

  // Equipos por Ambiente
  async getEquiposPorAmbienteStats() {
    if (backendUrl) {
      // Reusamos getEquipos que ya trae el ambiente
      return await fetchLocal('/equipos');
    }
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
    if (backendUrl) return await fetchLocal('/reports/equipos-mas-usados');
    
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
    if (backendUrl) return await fetchLocal('/reports/ambientes-mas-prestamos');

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

  // --- CMS OPERATIONS ---
  
  // Nosotros
  async getNosotros() {
    if (backendUrl) return await fetchLocal('/cms/nosotros');
    const { data, error } = await supabase.from('cms_nosotros').select('*').single();
    return { data, error };
  },
  async actualizarNosotros(content) {
    if (backendUrl) return await fetchLocal('/cms/nosotros', { method: 'PUT', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_nosotros').update(content).eq('id', content.id).select();
    return { data, error };
  },

  // Valores
  async getValores() {
    if (backendUrl) return await fetchLocal('/cms/valores');
    const { data, error } = await supabase.from('cms_valores').select('*').order('orden', { ascending: true });
    return { data, error };
  },
  async actualizarValor(id, content) {
    if (backendUrl) return await fetchLocal(`/cms/valores/${id}`, { method: 'PUT', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_valores').update(content).eq('id', id).select();
    return { data, error };
  },

  // Misión y Visión
  async getMisionVision() {
    if (backendUrl) return await fetchLocal('/cms/mision-vision');
    const { data, error } = await supabase.from('cms_mision_vision').select('*').single();
    return { data, error };
  },
  async actualizarMisionVision(content) {
    if (backendUrl) return await fetchLocal('/cms/mision-vision', { method: 'PUT', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_mision_vision').update(content).eq('id', content.id).select();
    return { data, error };
  },

  // Círculo Dorado
  async getCirculoDorado() {
    if (backendUrl) return await fetchLocal('/cms/circulo-dorado');
    const { data, error } = await supabase.from('cms_circulo_dorado').select('*').single();
    return { data, error };
  },
  async actualizarCirculoDorado(content) {
    if (backendUrl) return await fetchLocal('/cms/circulo-dorado', { method: 'PUT', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_circulo_dorado').update(content).eq('id', content.id).select();
    return { data, error };
  },

  // Evolución
  async getEvolucion() {
    if (backendUrl) return await fetchLocal('/cms/evolucion');
    const { data, error } = await supabase.from('cms_evolucion').select('*').order('orden', { ascending: true });
    return { data, error };
  },
  async actualizarEvolucion(id, content) {
    if (backendUrl) return await fetchLocal(`/cms/evolucion/${id}`, { method: 'PUT', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_evolucion').update(content).eq('id', id).select();
    return { data, error };
  },

  // Noticias (CMS)
  async getNoticiasCMS() {
    if (backendUrl) return await fetchLocal('/cms/noticias');
    const { data, error } = await supabase.from('cms_noticias').select('*').order('fecha', { ascending: false });
    return { data, error };
  },
  async crearNoticia(content) {
    if (backendUrl) return await fetchLocal('/cms/noticias', { method: 'POST', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_noticias').insert([content]).select();
    return { data, error };
  },
  async actualizarNoticia(id, content) {
    if (backendUrl) return await fetchLocal(`/cms/noticias/${id}`, { method: 'PUT', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_noticias').update(content).eq('id', id).select();
    return { data, error };
  },
  async eliminarNoticia(id) {
    if (backendUrl) return await fetchLocal(`/cms/noticias/${id}`, { method: 'DELETE' });
    const { data, error } = await supabase.from('cms_noticias').delete().eq('id', id);
    return { data, error };
  },

  // Multimedia
  async getMultimedia() {
    if (backendUrl) return await fetchLocal('/cms/multimedia');
    const { data, error } = await supabase.from('cms_multimedia').select('*').order('created_at', { ascending: false });
    return { data, error };
  },
  async subirImagen(content) {
    if (backendUrl) return await fetchLocal('/cms/multimedia', { method: 'POST', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_multimedia').insert([content]).select();
    return { data, error };
  },
  async eliminarImagen(id) {
    if (backendUrl) return await fetchLocal(`/cms/multimedia/${id}`, { method: 'DELETE' });
    const { data, error } = await supabase.from('cms_multimedia').delete().eq('id', id);
    return { data, error };
  },

  // Hero
  async getHero() {
    if (backendUrl) return await fetchLocal('/cms/hero');
    const { data, error } = await supabase.from('cms_hero').select('*').single();
    return { data, error };
  },
  async actualizarHero(content) {
    if (backendUrl) return await fetchLocal('/cms/hero', { method: 'PUT', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_hero').update(content).eq('id', content.id).select();
    return { data, error };
  },

  // Estudiantes CMS
  async getEstudiantesHeader() {
    if (backendUrl) return await fetchLocal('/cms/estudiantes/header');
    const { data, error } = await supabase.from('cms_estudiantes_header').select('*').single();
    return { data, error };
  },
  async actualizarEstudiantesHeader(content) {
    if (backendUrl) return await fetchLocal('/cms/estudiantes/header', { method: 'PUT', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_estudiantes_header').update(content).eq('id', content.id).select();
    return { data, error };
  },
  async getInvestigaciones() {
    if (backendUrl) return await fetchLocal('/cms/investigaciones');
    const { data, error } = await supabase.from('cms_investigaciones').select('*').order('orden', { ascending: true });
    return { data, error };
  },
  async crearInvestigacion(content) {
    if (backendUrl) return await fetchLocal('/cms/investigaciones', { method: 'POST', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_investigaciones').insert([content]).select();
    return { data, error };
  },
  async actualizarInvestigacion(id, content) {
    if (backendUrl) return await fetchLocal(`/cms/investigaciones/${id}`, { method: 'PUT', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_investigaciones').update(content).eq('id', id).select();
    return { data, error };
  },
  async eliminarInvestigacion(id) {
    if (backendUrl) return await fetchLocal(`/cms/investigaciones/${id}`, { method: 'DELETE' });
    const { data, error } = await supabase.from('cms_investigaciones').delete().eq('id', id);
    return { data, error };
  },

  async getPapers() {
    if (backendUrl) return await fetchLocal('/cms/papers');
    const { data, error } = await supabase.from('cms_papers').select('*').order('anio', { ascending: false });
    return { data, error };
  },
  async crearPaper(content) {
    if (backendUrl) return await fetchLocal('/cms/papers', { method: 'POST', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_papers').insert([content]).select();
    return { data, error };
  },
  async actualizarPaper(id, content) {
    if (backendUrl) return await fetchLocal(`/cms/papers/${id}`, { method: 'PUT', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_papers').update(content).eq('id', id).select();
    return { data, error };
  },
  async eliminarPaper(id) {
    if (backendUrl) return await fetchLocal(`/cms/papers/${id}`, { method: 'DELETE' });
    const { data, error } = await supabase.from('cms_papers').delete().eq('id', id);
    return { data, error };
  },

  async getPatentes() {
    if (backendUrl) return await fetchLocal('/cms/patentes');
    const { data, error } = await supabase.from('cms_patentes').select('*').order('orden', { ascending: true });
    return { data, error };
  },
  async crearPatente(content) {
    if (backendUrl) return await fetchLocal('/cms/patentes', { method: 'POST', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_patentes').insert([content]).select();
    return { data, error };
  },
  async actualizarPatente(id, content) {
    if (backendUrl) return await fetchLocal(`/cms/patentes/${id}`, { method: 'PUT', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_patentes').update(content).eq('id', id).select();
    return { data, error };
  },
  async eliminarPatente(id) {
    if (backendUrl) return await fetchLocal(`/cms/patentes/${id}`, { method: 'DELETE' });
    const { data, error } = await supabase.from('cms_patentes').delete().eq('id', id);
    return { data, error };
  },

  // Profesionales CMS
  async getProfesionalesHeader() {
    if (backendUrl) return await fetchLocal('/cms/profesionales/header');
    const { data, error } = await supabase.from('cms_profesionales_header').select('*').single();
    return { data, error };
  },
  async actualizarProfesionalesHeader(content) {
    if (backendUrl) return await fetchLocal('/cms/profesionales/header', { method: 'PUT', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_profesionales_header').update(content).eq('id', content.id).select();
    return { data, error };
  },
  async getServicios() {
    if (backendUrl) return await fetchLocal('/cms/servicios');
    const { data, error } = await supabase.from('cms_servicios').select('*').order('orden', { ascending: true });
    return { data, error };
  },
  async crearServicio(content) {
    if (backendUrl) return await fetchLocal('/cms/servicios', { method: 'POST', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_servicios').insert([content]).select();
    return { data, error };
  },
  async actualizarServicio(id, content) {
    if (backendUrl) return await fetchLocal(`/cms/servicios/${id}`, { method: 'PUT', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_servicios').update(content).eq('id', id).select();
    return { data, error };
  },
  async eliminarServicio(id) {
    if (backendUrl) return await fetchLocal(`/cms/servicios/${id}`, { method: 'DELETE' });
    const { data, error } = await supabase.from('cms_servicios').delete().eq('id', id);
    return { data, error };
  },

  async getProyectos() {
    if (backendUrl) return await fetchLocal('/cms/proyectos');
    const { data, error } = await supabase.from('cms_proyectos').select('*').order('orden', { ascending: true });
    return { data, error };
  },
  async crearProyecto(content) {
    if (backendUrl) return await fetchLocal('/cms/proyectos', { method: 'POST', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_proyectos').insert([content]).select();
    return { data, error };
  },
  async actualizarProyecto(id, content) {
    if (backendUrl) return await fetchLocal(`/cms/proyectos/${id}`, { method: 'PUT', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_proyectos').update(content).eq('id', id).select();
    return { data, error };
  },
  async eliminarProyecto(id) {
    if (backendUrl) return await fetchLocal(`/cms/proyectos/${id}`, { method: 'DELETE' });
    const { data, error } = await supabase.from('cms_proyectos').delete().eq('id', id);
    return { data, error };
  },

  async getConcursos() {
    if (backendUrl) return await fetchLocal('/cms/concursos');
    const { data, error } = await supabase.from('cms_concursos').select('*').order('orden', { ascending: true });
    return { data, error };
  },
  async crearConcurso(content) {
    if (backendUrl) return await fetchLocal('/cms/concursos', { method: 'POST', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_concursos').insert([content]).select();
    return { data, error };
  },
  async actualizarConcurso(id, content) {
    if (backendUrl) return await fetchLocal(`/cms/concursos/${id}`, { method: 'PUT', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_concursos').update(content).eq('id', id).select();
    return { data, error };
  },
  async eliminarConcurso(id) {
    if (backendUrl) return await fetchLocal(`/cms/concursos/${id}`, { method: 'DELETE' });
    const { data, error } = await supabase.from('cms_concursos').delete().eq('id', id);
    return { data, error };
  },

  async getTransferencia() {
    if (backendUrl) return await fetchLocal('/cms/transferencia');
    const { data, error } = await supabase.from('cms_transferencia').select('*').order('orden', { ascending: true });
    return { data, error };
  },
  async crearTransferencia(content) {
    if (backendUrl) return await fetchLocal('/cms/transferencia', { method: 'POST', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_transferencia').insert([content]).select();
    return { data, error };
  },
  async actualizarTransferencia(id, content) {
    if (backendUrl) return await fetchLocal(`/cms/transferencia/${id}`, { method: 'PUT', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_transferencia').update(content).eq('id', id).select();
    return { data, error };
  },
  async eliminarTransferencia(id) {
    if (backendUrl) return await fetchLocal(`/cms/transferencia/${id}`, { method: 'DELETE' });
    const { data, error } = await supabase.from('cms_transferencia').delete().eq('id', id);
    return { data, error };
  },

  async getStats() {
    if (backendUrl) return await fetchLocal('/cms/stats');
    const { data, error } = await supabase.from('cms_stats').select('*').order('orden', { ascending: true });
    return { data, error };
  },
  async crearStat(content) {
    if (backendUrl) return await fetchLocal('/cms/stats', { method: 'POST', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_stats').insert([content]).select();
    return { data, error };
  },
  async actualizarStat(id, content) {
    if (backendUrl) return await fetchLocal(`/cms/stats/${id}`, { method: 'PUT', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_stats').update(content).eq('id', id).select();
    return { data, error };
  },
  async eliminarStat(id) {
    if (backendUrl) return await fetchLocal(`/cms/stats/${id}`, { method: 'DELETE' });
    const { data, error } = await supabase.from('cms_stats').delete().eq('id', id);
    return { data, error };
  },

  // Contacto CMS
  async getContacto() {
    if (backendUrl) return await fetchLocal('/cms/contacto');
    const { data, error } = await supabase.from('cms_contacto').select('*').single();
    return { data, error };
  },
  async actualizarContacto(content) {
    if (backendUrl) return await fetchLocal('/cms/contacto', { method: 'PUT', body: JSON.stringify(content) });
    const { data, error } = await supabase.from('cms_contacto').update(content).eq('id', content.id).select();
    return { data, error };
  },
};


