const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const morgan = require('morgan');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

// Configuración de Multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Aumentado a 10MB
  fileFilter: (req, file, cb) => {
    // Aceptar cualquier tipo de imagen común
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (jpg, png, webp, etc)'), false);
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection with retry logic
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/escuelaiq';
console.log('Connecting to database at:', databaseUrl.replace(/:[^:@]+@/, ':****@')); // Hide password in logs

const pool = new Pool({
  connectionString: databaseUrl,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

const connectWithRetry = (retries = 10) => {
  console.log(`Attempting to connect to database... (${retries} retries left)`);
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Database connection error:', err.message);
      if (retries > 0) {
        console.log('Retrying in 5 seconds...');
        setTimeout(() => connectWithRetry(retries - 1), 5000);
      } else {
        console.error('Database connection failed after all retries. Keep retrying every 10 seconds...');
        setTimeout(() => connectWithRetry(0), 10000);
      }
    } else {
      console.log('Database connected successfully');
    }
  });
};

connectWithRetry();

// Routes
// 1. Ambientes
app.get('/api/ambientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ambientes ORDER BY nombre ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ambientes', async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO ambientes (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Ya existe un ambiente con ese nombre' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/ambientes/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  try {
    const result = await pool.query(
      'UPDATE ambientes SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *',
      [nombre, descripcion, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/ambientes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM ambientes WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Categorías
app.get('/api/categorias', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias_equipos ORDER BY nombre ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categorias', async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categorias_equipos (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/categorias/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  try {
    const result = await pool.query(
      'UPDATE categorias_equipos SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *',
      [nombre, descripcion, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categorias/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM categorias_equipos WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Estudiantes
app.get('/api/estudiantes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM estudiantes ORDER BY nombre ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/estudiantes', async (req, res) => {
  const { nombre, email, matricula } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO estudiantes (nombre, email, matricula) VALUES ($1, $2, $3) RETURNING *',
      [nombre, email, matricula]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un estudiante con esa matrícula' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/estudiantes/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email, matricula } = req.body;
  try {
    const result = await pool.query(
      'UPDATE estudiantes SET nombre = $1, email = $2, matricula = $3 WHERE id = $4 RETURNING *',
      [nombre, email, matricula, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/estudiantes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM estudiantes WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Equipos
app.get('/api/equipos', async (req, res) => {
  const { ambiente } = req.query;
  try {
    let query = `
      SELECT e.*, a.nombre as ambiente_nombre, c.nombre as categoria_nombre
      FROM equipos e
      LEFT JOIN ambientes a ON e.ambiente_id = a.id
      LEFT JOIN categorias_equipos c ON e.categoria_id = c.id
    `;
    let params = [];
    if (ambiente) {
      query += ' WHERE e.ambiente_id = $1';
      params.push(ambiente);
    }
    query += ' ORDER BY e.nombre ASC';
    
    const result = await pool.query(query, params);
    // Format to match Supabase response structure (nested objects)
    const formattedRows = result.rows.map(row => ({
      ...row,
      ambiente: { nombre: row.ambiente_nombre },
      categoria: { nombre: row.categoria_nombre }
    }));
    res.json(formattedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/equipos', async (req, res) => {
  const { nombre, codigo, ambiente_id, categoria_id, descripcion, imagen_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO equipos (nombre, codigo, ambiente_id, categoria_id, descripcion, estado, imagen_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [nombre, codigo, ambiente_id, categoria_id, descripcion, 'disponible', imagen_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un equipo con ese código' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/equipos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, codigo, ambiente_id, categoria_id, descripcion, estado, imagen_url } = req.body;
  try {
    const result = await pool.query(
      'UPDATE equipos SET nombre = $1, codigo = $2, ambiente_id = $3, categoria_id = $4, descripcion = $5, estado = $6, imagen_url = $7 WHERE id = $8 RETURNING *',
      [nombre, codigo, ambiente_id, categoria_id, descripcion, estado, imagen_url, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/equipos/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    const result = await pool.query(
      'UPDATE equipos SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/equipos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM equipos WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Préstamos
app.get('/api/prestamos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, 
             e.nombre as equipo_nombre, e.codigo as equipo_codigo, e.ambiente_id, e.categoria_id,
             est.nombre as estudiante_nombre, est.matricula as estudiante_matricula
      FROM prestamos p
      LEFT JOIN equipos e ON p.equipo_id = e.id
      LEFT JOIN estudiantes est ON p.estudiante_id = est.id
      ORDER BY p.fecha_prestamo DESC
    `);
    const formattedRows = result.rows.map(row => ({
      ...row,
      equipo: { 
        nombre: row.equipo_nombre, 
        codigo: row.equipo_codigo,
        ambiente_id: row.ambiente_id,
        categoria_id: row.categoria_id
      },
      estudiante: { nombre: row.estudiante_nombre, matricula: row.estudiante_matricula }
    }));
    res.json(formattedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/prestamos', async (req, res) => {
  const { equipo_id, estudiante_id } = req.body;
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    
    // Registrar préstamo
    const prestamoRes = await client.query(
      'INSERT INTO prestamos (equipo_id, estudiante_id) VALUES ($1, $2) RETURNING *',
      [equipo_id, estudiante_id]
    );
    
    // Actualizar estado equipo
    await client.query(
      'UPDATE equipos SET estado = $1 WHERE id = $2',
      ['ocupado', equipo_id]
    );
    
    await client.query('COMMIT');
    res.status(201).json(prestamoRes.rows[0]);
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

app.put('/api/prestamos/:id/devolver', async (req, res) => {
  const { id } = req.params;
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    
    // Obtener equipo_id
    const prestamo = await client.query('SELECT equipo_id FROM prestamos WHERE id = $1', [id]);
    if (prestamo.rows.length === 0) throw new Error('Préstamo no encontrado');
    const equipo_id = prestamo.rows[0].equipo_id;
    
    // Actualizar préstamo
    await client.query(
      'UPDATE prestamos SET fecha_devolucion = NOW() WHERE id = $1',
      [id]
    );
    
    // Actualizar equipo
    await client.query(
      'UPDATE equipos SET estado = $1 WHERE id = $2',
      ['disponible', equipo_id]
    );
    
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

// Auth simulation
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      // No devolvemos el password por seguridad
      delete user.password;
      res.json({
        user: user,
        token: 'fake-jwt-token-' + user.id
      });
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Dashboard Stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM ambientes) as total_ambientes,
        (SELECT COUNT(*) FROM estudiantes) as total_estudiantes,
        (SELECT COUNT(*) FROM equipos) as total_equipos,
        (SELECT COUNT(*) FROM prestamos WHERE fecha_devolucion IS NULL) as prestamos_pendientes,
        (SELECT COUNT(*) FROM equipos WHERE estado = 'disponible') as equipos_disponibles,
        (SELECT COUNT(*) FROM equipos WHERE estado = 'ocupado') as equipos_ocupados,
        (SELECT COUNT(*) FROM equipos WHERE estado = 'en_mantenimiento') as equipos_mantenimiento
    `);
    
    const row = stats.rows[0];
    res.json({
      totalAmbientes: parseInt(row.total_ambientes),
      totalEstudiantes: parseInt(row.total_estudiantes),
      totalEquipos: parseInt(row.total_equipos),
      prestamosPendientes: parseInt(row.prestamos_pendientes),
      equiposDisponibles: parseInt(row.equipos_disponibles),
      equiposOcupados: parseInt(row.equipos_ocupados),
      equiposMantenimiento: parseInt(row.equipos_mantenimiento)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Reportes - Equipos más usados
app.get('/api/reports/equipos-mas-usados', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.id, e.nombre, e.codigo, COUNT(p.id) as count
      FROM equipos e
      LEFT JOIN prestamos p ON e.id = p.equipo_id
      GROUP BY e.id, e.nombre, e.codigo
      ORDER BY count DESC
      LIMIT 10
    `);
    res.json(result.rows.map(row => ({
      ...row,
      count: parseInt(row.count)
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Reportes - Ambientes con más préstamos
app.get('/api/reports/ambientes-mas-prestamos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.nombre, COUNT(p.id) as count
      FROM ambientes a
      LEFT JOIN equipos e ON a.id = e.ambiente_id
      LEFT JOIN prestamos p ON e.id = p.equipo_id
      GROUP BY a.nombre
      ORDER BY count DESC
      LIMIT 10
    `);
    res.json(result.rows.map(row => ({
      ...row,
      count: parseInt(row.count)
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Upload de archivos
app.post('/api/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Error de Multer (ej: archivo muy grande)
      return res.status(400).json({ error: `Error de subida: ${err.message}` });
    } else if (err) {
      // Error personalizado (ej: tipo de archivo no permitido)
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
      }
      
      const protocol = req.protocol;
      const host = req.get('host');
      const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
      
      res.json(fileUrl);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

// --- CMS ENDPOINTS ---

// 0. Gestión de Usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/usuarios', async (req, res) => {
  const { email, password, rol, nombre } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (email, password, rol, nombre) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, password || 'lab123', rol || 'laboratorio', nombre]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { email, password, rol, nombre } = req.body;
  try {
    let query = 'UPDATE usuarios SET email = $1, rol = $2, nombre = $3';
    let params = [email, rol, nombre];
    
    if (password) {
      query += ', password = $4 WHERE id = $5';
      params.push(password, id);
    } else {
      query += ' WHERE id = $4';
      params.push(id);
    }
    
    const result = await pool.query(query + ' RETURNING *', params);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Nosotros
app.get('/api/cms/nosotros', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_nosotros LIMIT 1');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cms/nosotros', async (req, res) => {
  const { titulo, subtitulo, descripcion, miembros_conteo, miembros_descripcion } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cms_nosotros SET titulo = $1, subtitulo = $2, descripcion = $3, miembros_conteo = $4, miembros_descripcion = $5, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM cms_nosotros LIMIT 1) RETURNING *',
      [titulo, subtitulo, descripcion, miembros_conteo, miembros_descripcion]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Valores
app.get('/api/cms/valores', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_valores ORDER BY orden ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cms/valores', async (req, res) => {
  const { titulo, descripcion, orden } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cms_valores (titulo, descripcion, orden) VALUES ($1, $2, $3) RETURNING *',
      [titulo, descripcion, orden]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cms/valores/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, orden } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cms_valores SET titulo = $1, descripcion = $2, orden = $3 WHERE id = $4 RETURNING *',
      [titulo, descripcion, orden, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cms/valores/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM cms_valores WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Misión y Visión
app.get('/api/cms/mision-vision', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_mision_vision LIMIT 1');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cms/mision-vision', async (req, res) => {
  const { mision, vision } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cms_mision_vision SET mision = $1, vision = $2, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM cms_mision_vision LIMIT 1) RETURNING *',
      [mision, vision]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Círculo Dorado
app.get('/api/cms/circulo-dorado', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_circulo_dorado LIMIT 1');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cms/circulo-dorado', async (req, res) => {
  const { proposito_titulo, proposito_descripcion, proceso_titulo, proceso_descripcion, resultados_titulo, resultados_descripcion } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cms_circulo_dorado SET proposito_titulo = $1, proposito_descripcion = $2, proceso_titulo = $3, proceso_descripcion = $4, resultados_titulo = $5, resultados_descripcion = $6, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM cms_circulo_dorado LIMIT 1) RETURNING *',
      [proposito_titulo, proposito_descripcion, proceso_titulo, proceso_descripcion, resultados_titulo, resultados_descripcion]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Evolución
app.get('/api/cms/evolucion', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_evolucion ORDER BY orden ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cms/evolucion', async (req, res) => {
  const { periodo, titulo, descripcion, orden } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cms_evolucion (periodo, titulo, descripcion, orden) VALUES ($1, $2, $3, $4) RETURNING *',
      [periodo, titulo, descripcion, orden]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cms/evolucion/:id', async (req, res) => {
  const { id } = req.params;
  const { periodo, titulo, descripcion, orden } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cms_evolucion SET periodo = $1, titulo = $2, descripcion = $3, orden = $4 WHERE id = $5 RETURNING *',
      [periodo, titulo, descripcion, orden, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cms/evolucion/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM cms_evolucion WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Noticias (CMS)
app.get('/api/cms/noticias', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_noticias ORDER BY fecha DESC, created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cms/noticias', async (req, res) => {
  const { titulo, descripcion, contenido, categoria, imagen_url, fecha, destacada } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cms_noticias (titulo, descripcion, contenido, categoria, imagen_url, fecha, destacada) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [titulo, descripcion, contenido, categoria, imagen_url, fecha || new Date(), destacada || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cms/noticias/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, contenido, categoria, imagen_url, fecha, destacada } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cms_noticias SET titulo = $1, descripcion = $2, contenido = $3, categoria = $4, imagen_url = $5, fecha = $6, destacada = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *',
      [titulo, descripcion, contenido, categoria, imagen_url, fecha, destacada, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cms/noticias/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM cms_noticias WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Multimedia
app.get('/api/cms/multimedia', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_multimedia ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cms/multimedia', async (req, res) => {
  const { url, titulo, tipo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cms_multimedia (url, titulo, tipo) VALUES ($1, $2, $3) RETURNING *',
      [url, titulo, tipo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cms/multimedia/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM cms_multimedia WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Hero
app.get('/api/cms/hero', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_hero LIMIT 1');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cms/hero', async (req, res) => {
  const { titulo_linea1, titulo_linea2, titulo_linea3, descripcion, cta_primario_texto, cta_primario_link, cta_secundario_texto, cta_secundario_link, imagen_url } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cms_hero SET titulo_linea1 = $1, titulo_linea2 = $2, titulo_linea3 = $3, descripcion = $4, cta_primario_texto = $5, cta_primario_link = $6, cta_secundario_texto = $7, cta_secundario_link = $8, imagen_url = $9, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM cms_hero LIMIT 1) RETURNING *',
      [titulo_linea1, titulo_linea2, titulo_linea3, descripcion, cta_primario_texto, cta_primario_link, cta_secundario_texto, cta_secundario_link, imagen_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Estudiantes CMS
app.get('/api/cms/estudiantes/header', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_estudiantes_header LIMIT 1');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cms/estudiantes/header', async (req, res) => {
  const { titulo, descripcion } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cms_estudiantes_header SET titulo = $1, descripcion = $2, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM cms_estudiantes_header LIMIT 1) RETURNING *',
      [titulo, descripcion]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cms/investigaciones', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_investigaciones ORDER BY orden ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cms/investigaciones', async (req, res) => {
  const { titulo, descripcion, link, orden } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cms_investigaciones (titulo, descripcion, link, orden) VALUES ($1, $2, $3, $4) RETURNING *',
      [titulo, descripcion, link, orden]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cms/investigaciones/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, link, orden } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cms_investigaciones SET titulo = $1, descripcion = $2, link = $3, orden = $4 WHERE id = $5 RETURNING *',
      [titulo, descripcion, link, orden, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cms/investigaciones/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM cms_investigaciones WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cms/papers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_papers ORDER BY anio DESC, orden ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cms/papers', async (req, res) => {
  const { titulo, resumen, anio, revista, autores, doi, pdf_url, link, orden } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cms_papers (titulo, resumen, anio, revista, autores, doi, pdf_url, link, orden) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [titulo, resumen, anio, revista, autores, doi, pdf_url, link, orden]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cms/papers/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, resumen, anio, revista, autores, doi, pdf_url, link, orden } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cms_papers SET titulo = $1, resumen = $2, anio = $3, revista = $4, autores = $5, doi = $6, pdf_url = $7, link = $8, orden = $9 WHERE id = $10 RETURNING *',
      [titulo, resumen, anio, revista, autores, doi, pdf_url, link, orden, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cms/papers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM cms_papers WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cms/patentes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_patentes ORDER BY orden ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cms/patentes', async (req, res) => {
  const { titulo, orden } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cms_patentes (titulo, orden) VALUES ($1, $2) RETURNING *',
      [titulo, orden]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cms/patentes/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, orden } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cms_patentes SET titulo = $1, orden = $2 WHERE id = $3 RETURNING *',
      [titulo, orden, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cms/patentes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM cms_patentes WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Profesionales CMS
app.get('/api/cms/profesionales/header', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_profesionales_header LIMIT 1');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cms/profesionales/header', async (req, res) => {
  const { titulo, descripcion, alianza_titulo } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cms_profesionales_header SET titulo = $1, descripcion = $2, alianza_titulo = $3, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM cms_profesionales_header LIMIT 1) RETURNING *',
      [titulo, descripcion, alianza_titulo]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Configuración Global (CMS Config)
app.get('/api/cms/config', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_config LIMIT 1');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cms/config', async (req, res) => {
  const { noticias_limite, investigaciones_limite, servicios_limite } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cms_config SET noticias_limite = $1, investigaciones_limite = $2, servicios_limite = $3, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM cms_config LIMIT 1) RETURNING *',
      [noticias_limite, investigaciones_limite, servicios_limite]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cms/servicios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_servicios ORDER BY orden ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cms/servicios', async (req, res) => {
  const { titulo, descripcion, icono, link, orden } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cms_servicios (titulo, descripcion, icono, link, orden) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [titulo, descripcion, icono, link, orden]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cms/servicios/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, icono, link, orden } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cms_servicios SET titulo = $1, descripcion = $2, icono = $3, link = $4, orden = $5 WHERE id = $6 RETURNING *',
      [titulo, descripcion, icono, link, orden, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cms/servicios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM cms_servicios WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cms/proyectos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_proyectos ORDER BY orden ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cms/proyectos', async (req, res) => {
  const { titulo, descripcion, empresa, imagen_url, anio, orden } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cms_proyectos (titulo, descripcion, empresa, imagen_url, anio, orden) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [titulo, descripcion, empresa, imagen_url, anio, orden]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cms/proyectos/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, empresa, imagen_url, anio, orden } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cms_proyectos SET titulo = $1, descripcion = $2, empresa = $3, imagen_url = $4, anio = $5, orden = $6 WHERE id = $7 RETURNING *',
      [titulo, descripcion, empresa, imagen_url, anio, orden, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cms/proyectos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM cms_proyectos WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cms/concursos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_concursos ORDER BY orden ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cms/concursos', async (req, res) => {
  const { titulo, descripcion, premio, anio, orden } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cms_concursos (titulo, descripcion, premio, anio, orden) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [titulo, descripcion, premio, anio, orden]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cms/concursos/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, premio, anio, orden } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cms_concursos SET titulo = $1, descripcion = $2, premio = $3, anio = $4, orden = $5 WHERE id = $6 RETURNING *',
      [titulo, descripcion, premio, anio, orden, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cms/concursos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM cms_concursos WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cms/transferencia', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_transferencia ORDER BY orden ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cms/transferencia', async (req, res) => {
  const { titulo, descripcion, tecnologia, impacto, orden } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cms_transferencia (titulo, descripcion, tecnologia, impacto, orden) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [titulo, descripcion, tecnologia, impacto, orden]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cms/transferencia/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, tecnologia, impacto, orden } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cms_transferencia SET titulo = $1, descripcion = $2, tecnologia = $3, impacto = $4, orden = $5 WHERE id = $6 RETURNING *',
      [titulo, descripcion, tecnologia, impacto, orden, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cms/transferencia/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM cms_transferencia WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cms/stats', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_stats ORDER BY orden ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cms/stats', async (req, res) => {
  const { valor, etiqueta, orden } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cms_stats (valor, etiqueta, orden) VALUES ($1, $2, $3) RETURNING *',
      [valor, etiqueta, orden]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cms/stats/:id', async (req, res) => {
  const { id } = req.params;
  const { valor, etiqueta, orden } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cms_stats SET valor = $1, etiqueta = $2, orden = $3 WHERE id = $4 RETURNING *',
      [valor, etiqueta, orden, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cms/stats/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM cms_stats WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Contacto CMS
app.get('/api/cms/contacto', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cms_contacto LIMIT 1');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cms/contacto', async (req, res) => {
  const { titulo, descripcion, email, telefono, direccion } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cms_contacto SET titulo = $1, descripcion = $2, email = $3, telefono = $4, direccion = $5, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM cms_contacto LIMIT 1) RETURNING *',
      [titulo, descripcion, email, telefono, direccion]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
