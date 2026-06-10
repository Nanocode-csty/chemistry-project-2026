// Cliente de API para el backend local (Reemplaza a Supabase)

const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';
};

const backendUrl = getBackendUrl();

// Helper for local backend calls
const fetchLocal = async (path, options = {}) => {
  try {
    const url = `${backendUrl}${path}`;
    
    // Solo acceder a localStorage en el cliente
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('iq_token');
    }
    
    const isFormData = options.body instanceof FormData;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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
    return { data: null, error: 'Error de conexión con el servidor local' };
  }
};

// Helper functions for common operations
export const dbOperations = {
  // Auth
  async login(email, password) {
    return await fetchLocal('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async logout() {
    return { success: true };
  },

  async getCurrentUser() {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('iq_user');
      if (savedUser) return JSON.parse(savedUser);
    }
    return null;
  },

  // Ambientes
  async getAmbientes() {
    return await fetchLocal('/ambientes');
  },

  async crearAmbiente(nombre, descripcion) {
    return await fetchLocal('/ambientes', {
      method: 'POST',
      body: JSON.stringify({ nombre, descripcion }),
    });
  },

  async actualizarAmbiente(id, nombre, descripcion) {
    return await fetchLocal(`/ambientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ nombre, descripcion }),
    });
  },

  async eliminarAmbiente(id) {
    return await fetchLocal(`/ambientes/${id}`, {
      method: 'DELETE',
    });
  },

  // Categorías
  async getCategorias() {
    return await fetchLocal('/categorias');
  },

  async crearCategoria(nombre, descripcion) {
    return await fetchLocal('/categorias', {
      method: 'POST',
      body: JSON.stringify({ nombre, descripcion }),
    });
  },

  async actualizarCategoria(id, nombre, descripcion) {
    return await fetchLocal(`/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ nombre, descripcion }),
    });
  },

  async eliminarCategoria(id) {
    return await fetchLocal(`/categorias/${id}`, {
      method: 'DELETE',
    });
  },

  // Estudiantes
  async getEstudiantes() {
    return await fetchLocal('/estudiantes');
  },

  async crearEstudiante(nombre, email, matricula) {
    return await fetchLocal('/estudiantes', {
      method: 'POST',
      body: JSON.stringify({ nombre, email, matricula }),
    });
  },

  async actualizarEstudiante(id, nombre, email, matricula) {
    return await fetchLocal(`/estudiantes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ nombre, email, matricula }),
    });
  },

  async eliminarEstudiante(id) {
    return await fetchLocal(`/estudiantes/${id}`, {
      method: 'DELETE',
    });
  },

  // Equipos
  async getEquipos() {
    return await fetchLocal('/equipos');
  },

  async getEquiposPorAmbiente(ambienteId) {
    return await fetchLocal(`/equipos?ambiente=${ambienteId}`);
  },

  async crearEquipo(nombre, codigo, ambienteId, categoriaId, descripcion, imagenUrl = '') {
    return await fetchLocal('/equipos', {
      method: 'POST',
      body: JSON.stringify({ 
        nombre, 
        codigo, 
        ambiente_id: ambienteId, 
        categoria_id: categoriaId, 
        descripcion,
        imagen_url: imagenUrl,
        estado: 'disponible' 
      }),
    });
  },

  async actualizarEquipo(id, nombre, codigo, ambienteId, categoriaId, descripcion, estado, imagenUrl = '') {
    return await fetchLocal(`/equipos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ 
        nombre, 
        codigo, 
        ambiente_id: ambienteId, 
        categoria_id: categoriaId, 
        descripcion, 
        estado,
        imagen_url: imagenUrl
      }),
    });
  },

  async cambiarEstadoEquipo(id, estado) {
    return await fetchLocal(`/equipos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
  },

  async eliminarEquipo(id) {
    return await fetchLocal(`/equipos/${id}`, {
      method: 'DELETE',
    });
  },

  // Préstamos
  async crearPrestamo(equipoId, estudianteId, fechaPrestamo) {
    return await fetchLocal('/prestamos', {
      method: 'POST',
      body: JSON.stringify({ equipo_id: equipoId, estudiante_id: estudianteId, fecha_prestamo: fechaPrestamo }),
    });
  },

  async devolverPrestamo(prestamoId) {
    return await fetchLocal(`/prestamos/${prestamoId}/devolver`, {
      method: 'PUT',
    });
  },

  async getPrestamos() {
    return await fetchLocal('/prestamos');
  },

  async getPrestamosPendientes() {
    const { data, error } = await fetchLocal('/prestamos');
    if (error) return { data, error };
    return { data: (data || []).filter(p => !p.fecha_devolucion), error: null };
  },

  async getHistorialEstudiante(estudianteId) {
    return await fetchLocal(`/prestamos?estudiante=${estudianteId}`);
  },

  // Dashboard Stats
  async getDashboardStats() {
    return await fetchLocal('/dashboard/stats');
  },

  // Equipos por Ambiente
  async getEquiposPorAmbienteStats() {
    return await fetchLocal('/equipos');
  },

  // Equipos más usados (por número de préstamos)
  async getEquiposMasUsados() {
    return await fetchLocal('/reports/equipos-mas-usados');
  },

  // Ambientes con más préstamos
  async getAmbientesMasPrestamos() {
    return await fetchLocal('/reports/ambientes-mas-prestamos');
  },

  // --- CMS OPERATIONS ---
  
  // Nosotros
  async getNosotros() {
    return await fetchLocal('/cms/nosotros');
  },
  async actualizarNosotros(content) {
    return await fetchLocal('/cms/nosotros', { method: 'PUT', body: JSON.stringify(content) });
  },

  // Valores
  async getValores() {
    return await fetchLocal('/cms/valores');
  },
  async actualizarValor(id, content) {
    return await fetchLocal(`/cms/valores/${id}`, { method: 'PUT', body: JSON.stringify(content) });
  },

  // Misión y Visión
  async getMisionVision() {
    return await fetchLocal('/cms/mision-vision');
  },
  async actualizarMisionVision(content) {
    return await fetchLocal('/cms/mision-vision', { method: 'PUT', body: JSON.stringify(content) });
  },

  // Círculo Dorado
  async getCirculoDorado() {
    return await fetchLocal('/cms/circulo-dorado');
  },
  async actualizarCirculoDorado(content) {
    return await fetchLocal('/cms/circulo-dorado', { method: 'PUT', body: JSON.stringify(content) });
  },

  // Evolución
  async getEvolucion() {
    return await fetchLocal('/cms/evolucion');
  },
  async actualizarEvolucion(id, content) {
    return await fetchLocal(`/cms/evolucion/${id}`, { method: 'PUT', body: JSON.stringify(content) });
  },

  // Noticias (CMS)
  async getNoticiasCMS() {
    return await fetchLocal('/cms/noticias');
  },
  async crearNoticia(content) {
    return await fetchLocal('/cms/noticias', { method: 'POST', body: JSON.stringify(content) });
  },
  async actualizarNoticia(id, content) {
    return await fetchLocal(`/cms/noticias/${id}`, { method: 'PUT', body: JSON.stringify(content) });
  },
  async eliminarNoticia(id) {
    return await fetchLocal(`/cms/noticias/${id}`, { method: 'DELETE' });
  },

  // Multimedia
  async getMultimedia() {
    return await fetchLocal('/cms/multimedia');
  },
  async subirImagen(content) {
    return await fetchLocal('/cms/multimedia', { method: 'POST', body: JSON.stringify(content) });
  },
  async eliminarImagen(id) {
    return await fetchLocal(`/cms/multimedia/${id}`, { method: 'DELETE' });
  },

  // Hero
  async getHero() {
    return await fetchLocal('/cms/hero');
  },
  async actualizarHero(content) {
    return await fetchLocal('/cms/hero', { method: 'PUT', body: JSON.stringify(content) });
  },

  // Estudiantes CMS
  async getEstudiantesHeader() {
    return await fetchLocal('/cms/estudiantes/header');
  },
  async actualizarEstudiantesHeader(content) {
    return await fetchLocal('/cms/estudiantes/header', { method: 'PUT', body: JSON.stringify(content) });
  },
  async getInvestigaciones() {
    return await fetchLocal('/cms/investigaciones');
  },
  async crearInvestigacion(content) {
    return await fetchLocal('/cms/investigaciones', { method: 'POST', body: JSON.stringify(content) });
  },
  async actualizarInvestigacion(id, content) {
    return await fetchLocal(`/cms/investigaciones/${id}`, { method: 'PUT', body: JSON.stringify(content) });
  },
  async eliminarInvestigacion(id) {
    return await fetchLocal(`/cms/investigaciones/${id}`, { method: 'DELETE' });
  },

  async getPapers() {
    return await fetchLocal('/cms/papers');
  },
  async crearPaper(content) {
    return await fetchLocal('/cms/papers', { method: 'POST', body: JSON.stringify(content) });
  },
  async actualizarPaper(id, content) {
    return await fetchLocal(`/cms/papers/${id}`, { method: 'PUT', body: JSON.stringify(content) });
  },
  async eliminarPaper(id) {
    return await fetchLocal(`/cms/papers/${id}`, { method: 'DELETE' });
  },

  async getPatentes() {
    return await fetchLocal('/cms/patentes');
  },
  async crearPatente(content) {
    return await fetchLocal('/cms/patentes', { method: 'POST', body: JSON.stringify(content) });
  },
  async actualizarPatente(id, content) {
    return await fetchLocal(`/cms/patentes/${id}`, { method: 'PUT', body: JSON.stringify(content) });
  },
  async eliminarPatente(id) {
    return await fetchLocal(`/cms/patentes/${id}`, { method: 'DELETE' });
  },

  // Profesionales CMS
  async getProfesionalesHeader() {
    return await fetchLocal('/cms/profesionales/header');
  },
  async actualizarProfesionalesHeader(content) {
    return await fetchLocal('/cms/profesionales/header', { method: 'PUT', body: JSON.stringify(content) });
  },
  async getServicios() {
    return await fetchLocal('/cms/servicios');
  },
  async crearServicio(content) {
    return await fetchLocal('/cms/servicios', { method: 'POST', body: JSON.stringify(content) });
  },
  async actualizarServicio(id, content) {
    return await fetchLocal(`/cms/servicios/${id}`, { method: 'PUT', body: JSON.stringify(content) });
  },
  async eliminarServicio(id) {
    return await fetchLocal(`/cms/servicios/${id}`, { method: 'DELETE' });
  },

  async getProyectos() {
    return await fetchLocal('/cms/proyectos');
  },
  async crearProyecto(content) {
    return await fetchLocal('/cms/proyectos', { method: 'POST', body: JSON.stringify(content) });
  },
  async actualizarProyecto(id, content) {
    return await fetchLocal(`/cms/proyectos/${id}`, { method: 'PUT', body: JSON.stringify(content) });
  },
  async eliminarProyecto(id) {
    return await fetchLocal(`/cms/proyectos/${id}`, { method: 'DELETE' });
  },

  async getConcursos() {
    return await fetchLocal('/cms/concursos');
  },
  async crearConcurso(content) {
    return await fetchLocal('/cms/concursos', { method: 'POST', body: JSON.stringify(content) });
  },
  async actualizarConcurso(id, content) {
    return await fetchLocal(`/cms/concursos/${id}`, { method: 'PUT', body: JSON.stringify(content) });
  },
  async eliminarConcurso(id) {
    return await fetchLocal(`/cms/concursos/${id}`, { method: 'DELETE' });
  },

  async getTransferencia() {
    return await fetchLocal('/cms/transferencia');
  },
  async crearTransferencia(content) {
    return await fetchLocal('/cms/transferencia', { method: 'POST', body: JSON.stringify(content) });
  },
  async actualizarTransferencia(id, content) {
    return await fetchLocal(`/cms/transferencia/${id}`, { method: 'PUT', body: JSON.stringify(content) });
  },
  async eliminarTransferencia(id) {
    return await fetchLocal(`/cms/transferencia/${id}`, { method: 'DELETE' });
  },

  async getStats() {
    return await fetchLocal('/cms/stats');
  },
  async crearStat(content) {
    return await fetchLocal('/cms/stats', { method: 'POST', body: JSON.stringify(content) });
  },
  async actualizarStat(id, content) {
    return await fetchLocal(`/cms/stats/${id}`, { method: 'PUT', body: JSON.stringify(content) });
  },
  async eliminarStat(id) {
    return await fetchLocal(`/cms/stats/${id}`, { method: 'DELETE' });
  },

  // Contacto CMS
  async getContacto() {
    return await fetchLocal('/cms/contacto');
  },
  async actualizarContacto(content) {
    return await fetchLocal('/cms/contacto', { method: 'PUT', body: JSON.stringify(content) });
  },

  // Configuración Global CMS
  async getConfig() {
    return await fetchLocal('/cms/config');
  },
  async actualizarConfig(content) {
    return await fetchLocal('/cms/config', { method: 'PUT', body: JSON.stringify(content) });
  },

  // Gestión de Usuarios (Admin)
  async getUsuarios() {
    return await fetchLocal('/usuarios');
  },
  async crearUsuario(content) {
    return await fetchLocal('/usuarios', { method: 'POST', body: JSON.stringify(content) });
  },
  async actualizarUsuario(id, content) {
    return await fetchLocal(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(content) });
  },
  async eliminarUsuario(id) {
    return await fetchLocal(`/usuarios/${id}`, { method: 'DELETE' });
  },

  // Storage / Upload
  async uploadImagen(file, bucket = 'equipos') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);
      
      return await fetchLocal('/upload', {
        method: 'POST',
        body: formData,
      });
    } catch (err) {
      console.error('Upload error:', err);
      return { data: null, error: 'Error al subir imagen al servidor local' };
    }
  },
};
