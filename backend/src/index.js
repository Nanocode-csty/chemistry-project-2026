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

const ensureDatabaseSchema = async () => {
  try {
    await pool.query(`
      ALTER TABLE equipos ADD COLUMN IF NOT EXISTS tipo_item VARCHAR(50) DEFAULT 'equipo';
      ALTER TABLE equipos ADD COLUMN IF NOT EXISTS presentacion VARCHAR(50) DEFAULT 'Unidad';
      ALTER TABLE equipos ADD COLUMN IF NOT EXISTS capacidad DECIMAL(12, 2) DEFAULT 1;
      ALTER TABLE equipos ADD COLUMN IF NOT EXISTS unidad_medida VARCHAR(30) DEFAULT 'und';
      ALTER TABLE equipos ADD COLUMN IF NOT EXISTS cantidad INTEGER DEFAULT 1;
      ALTER TABLE equipos ADD COLUMN IF NOT EXISTS stock_minimo INTEGER DEFAULT 1;
      ALTER TABLE equipos ADD COLUMN IF NOT EXISTS formula_quimica VARCHAR(100);
      ALTER TABLE equipos ADD COLUMN IF NOT EXISTS concentracion VARCHAR(100);
      ALTER TABLE equipos ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE;
    `);

    // Actualizar materiales de cristalería y seguridad existentes si aún están por defecto
    await pool.query(`
      UPDATE equipos SET tipo_item = 'material', presentacion = 'Unidad', capacidad = 250, unidad_medida = 'mL', cantidad = 10, stock_minimo = 3
      WHERE codigo = 'CRIST-001' AND (capacidad IS NULL OR capacidad = 1);
      UPDATE equipos SET tipo_item = 'material', presentacion = 'Kit', capacidad = 10, unidad_medida = 'mL', cantidad = 4, stock_minimo = 1
      WHERE codigo = 'CRIST-002' AND (capacidad IS NULL OR capacidad = 1);
      UPDATE equipos SET tipo_item = 'seguridad', presentacion = 'Caja', capacidad = 100, unidad_medida = 'und', cantidad = 8, stock_minimo = 2
      WHERE codigo = 'SEGUR-001' AND (capacidad IS NULL OR capacidad = 1);
    `);

    const reactivosCheck = await pool.query("SELECT COUNT(*) FROM equipos WHERE tipo_item = 'reactivo'");
    if (parseInt(reactivosCheck.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO equipos (
          nombre, codigo, ambiente_id, categoria_id, descripcion, estado, fecha_adquisicion,
          tipo_item, presentacion, capacidad, unidad_medida, cantidad, stock_minimo, formula_quimica, concentracion, fecha_vencimiento
        ) VALUES
        ('Nitrato de Plata', 'REACT-001', 1, 3, 'Reactivo analítico para titulaciones argentométricas (Presentación 100 mg)', 'disponible', '2025-01-10', 'reactivo', 'Frasco', 100, 'mg', 3, 2, 'AgNO3', '99.8% PA', '2027-06-30'),
        ('Nitrato de Plata', 'REACT-002', 1, 3, 'Reactivo analítico para titulaciones argentométricas (Presentación 200 mg)', 'disponible', '2025-02-15', 'reactivo', 'Frasco', 200, 'mg', 2, 1, 'AgNO3', '99.8% PA', '2027-08-15'),
        ('Ácido Sulfúrico Concentrado', 'REACT-003', 1, 3, 'Ácido mineral fuerte grado reactivo ACS en botella ámbar', 'disponible', '2025-03-01', 'reactivo', 'Botella', 1, 'L', 4, 2, 'H2SO4', '98% p/p', '2028-03-01'),
        ('Ácido Sulfúrico Concentrado', 'REACT-004', 4, 3, 'Ácido mineral fuerte grado reactivo ACS presentación 500 mL', 'disponible', '2025-03-10', 'reactivo', 'Frasco', 500, 'mL', 3, 2, 'H2SO4', '98% p/p', '2028-03-10'),
        ('Hidróxido de Sodio en Lentejas', 'REACT-005', 1, 3, 'Base fuerte en pellets para preparación de soluciones estándar', 'disponible', '2025-01-20', 'reactivo', 'Frasco', 500, 'g', 5, 2, 'NaOH', '99.0% PA', '2027-12-31'),
        ('Hidróxido de Sodio en Lentejas', 'REACT-006', 2, 3, 'Base fuerte en pellets presentación de 1 kg', 'disponible', '2025-02-05', 'reactivo', 'Frasco', 1, 'kg', 2, 1, 'NaOH', '99.0% PA', '2027-12-31'),
        ('Etanol Absoluto', 'REACT-007', 2, 3, 'Solvente orgánico de alta pureza para análisis e instrumental', 'disponible', '2025-04-12', 'reactivo', 'Galón', 4, 'L', 3, 1, 'C2H5OH', '99.9% v/v', '2027-05-01'),
        ('Fenolftaleína Indicador', 'REACT-008', 1, 3, 'Solución indicadora ácido-base en etanol', 'disponible', '2025-01-18', 'reactivo', 'Frasco', 100, 'mL', 4, 2, 'C20H14O4', '1% p/v', '2026-12-15'),
        ('Ácido Clorhídrico Fumante', 'REACT-009', 4, 3, 'Ácido clorhídrico grado analítico 37%', 'disponible', '2025-02-22', 'reactivo', 'Botella', 2.5, 'L', 2, 2, 'HCl', '37% p/p', '2027-09-30')
        ON CONFLICT (codigo) DO NOTHING;
      `);
    }
    console.log('Database schema and reagent columns verified');
  } catch (err) {
    console.error('Schema verification warning:', err.message);
  }
};

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
      ensureDatabaseSchema();
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
  const { nombre, email, matricula, ciclo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO estudiantes (nombre, email, matricula, ciclo) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, email, matricula, ciclo]
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
  const { nombre, email, matricula, ciclo } = req.body;
  try {
    const result = await pool.query(
      'UPDATE estudiantes SET nombre = $1, email = $2, matricula = $3, ciclo = $4 WHERE id = $5 RETURNING *',
      [nombre, email, matricula, ciclo, id]
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

// 4. Equipos, Materiales y Reactivos
app.get('/api/equipos', async (req, res) => {
  const { ambiente, tipo_item } = req.query;
  try {
    let query = `
      SELECT e.*,
             (COALESCE(e.cantidad, 1) * COALESCE(e.capacidad, 1)) as cantidad_total,
             a.nombre as ambiente_nombre,
             c.nombre as categoria_nombre
      FROM equipos e
      LEFT JOIN ambientes a ON e.ambiente_id = a.id
      LEFT JOIN categorias_equipos c ON e.categoria_id = c.id
    `;
    const conditions = [];
    const params = [];
    if (ambiente) {
      params.push(ambiente);
      conditions.push(`e.ambiente_id = $${params.length}`);
    }
    if (tipo_item) {
      params.push(tipo_item);
      conditions.push(`e.tipo_item = $${params.length}`);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY e.nombre ASC, e.capacidad ASC';
    
    const result = await pool.query(query, params);
    const formattedRows = result.rows.map(row => ({
      ...row,
      capacidad: row.capacidad !== null && row.capacidad !== undefined ? parseFloat(row.capacidad) : 1,
      cantidad: row.cantidad !== null && row.cantidad !== undefined ? parseInt(row.cantidad) : 1,
      stock_minimo: row.stock_minimo !== null && row.stock_minimo !== undefined ? parseInt(row.stock_minimo) : 1,
      cantidad_total: row.cantidad_total !== null && row.cantidad_total !== undefined ? parseFloat(row.cantidad_total) : 1,
      ambiente: { nombre: row.ambiente_nombre },
      categoria: { nombre: row.categoria_nombre }
    }));
    res.json(formattedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/equipos', async (req, res) => {
  const {
    nombre,
    codigo,
    ambiente_id,
    categoria_id,
    descripcion,
    imagen_url,
    tipo_item = 'equipo',
    presentacion = 'Unidad',
    capacidad = 1,
    unidad_medida = 'und',
    cantidad = 1,
    stock_minimo = 1,
    formula_quimica = null,
    concentracion = null,
    fecha_vencimiento = null
  } = req.body;
  try {
    const processedVencimiento = fecha_vencimiento === '' ? null : fecha_vencimiento;
    const result = await pool.query(
      `INSERT INTO equipos (
        nombre, codigo, ambiente_id, categoria_id, descripcion, estado, imagen_url,
        tipo_item, presentacion, capacidad, unidad_medida, cantidad, stock_minimo,
        formula_quimica, concentracion, fecha_vencimiento
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [
        nombre,
        codigo,
        ambiente_id,
        categoria_id,
        descripcion,
        'disponible',
        imagen_url,
        tipo_item || 'equipo',
        presentacion || 'Unidad',
        capacidad !== undefined && capacidad !== '' ? parseFloat(capacidad) : 1,
        unidad_medida || 'und',
        cantidad !== undefined && cantidad !== '' ? parseInt(cantidad) : 1,
        stock_minimo !== undefined && stock_minimo !== '' ? parseInt(stock_minimo) : 1,
        formula_quimica || null,
        concentracion || null,
        processedVencimiento
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un registro con ese código' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/equipos/:id', async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    codigo,
    ambiente_id,
    categoria_id,
    descripcion,
    estado,
    imagen_url,
    tipo_item,
    presentacion,
    capacidad,
    unidad_medida,
    cantidad,
    stock_minimo,
    formula_quimica,
    concentracion,
    fecha_vencimiento
  } = req.body;
  try {
    const processedVencimiento = fecha_vencimiento === '' ? null : fecha_vencimiento;
    const result = await pool.query(
      `UPDATE equipos SET
        nombre = $1,
        codigo = $2,
        ambiente_id = $3,
        categoria_id = $4,
        descripcion = $5,
        estado = COALESCE($6, estado),
        imagen_url = $7,
        tipo_item = COALESCE($8, tipo_item, 'equipo'),
        presentacion = COALESCE($9, presentacion, 'Unidad'),
        capacidad = COALESCE($10, capacidad, 1),
        unidad_medida = COALESCE($11, unidad_medida, 'und'),
        cantidad = COALESCE($12, cantidad, 1),
        stock_minimo = COALESCE($13, stock_minimo, 1),
        formula_quimica = $14,
        concentracion = $15,
        fecha_vencimiento = $16,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $17 RETURNING *`,
      [
        nombre,
        codigo,
        ambiente_id,
        categoria_id,
        descripcion,
        estado,
        imagen_url,
        tipo_item || null,
        presentacion || null,
        capacidad !== undefined && capacidad !== '' ? parseFloat(capacidad) : null,
        unidad_medida || null,
        cantidad !== undefined && cantidad !== '' ? parseInt(cantidad) : null,
        stock_minimo !== undefined && stock_minimo !== '' ? parseInt(stock_minimo) : null,
        formula_quimica !== undefined ? (formula_quimica || null) : null,
        concentracion !== undefined ? (concentracion || null) : null,
        processedVencimiento !== undefined ? processedVencimiento : null,
        id
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un registro con ese código' });
    }
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
             e.tipo_item, e.presentacion, e.capacidad, e.unidad_medida, e.formula_quimica, e.concentracion,
             a.nombre as ambiente_nombre,
             est.nombre as estudiante_nombre, est.matricula as estudiante_matricula, est.ciclo as estudiante_ciclo, est.email as estudiante_email
      FROM prestamos p
      LEFT JOIN equipos e ON p.equipo_id = e.id
      LEFT JOIN ambientes a ON e.ambiente_id = a.id
      LEFT JOIN estudiantes est ON p.estudiante_id = est.id
      ORDER BY p.fecha_prestamo DESC
    `);
    const formattedRows = result.rows.map(row => ({
      ...row,
      equipo: { 
        nombre: row.equipo_nombre, 
        codigo: row.equipo_codigo,
        ambiente_id: row.ambiente_id,
        ambiente_nombre: row.ambiente_nombre,
        categoria_id: row.categoria_id,
        tipo_item: row.tipo_item,
        presentacion: row.presentacion,
        capacidad: row.capacidad !== null && row.capacidad !== undefined ? parseFloat(row.capacidad) : 1,
        unidad_medida: row.unidad_medida,
        formula_quimica: row.formula_quimica,
        concentracion: row.concentracion
      },
      estudiante: {
        nombre: row.estudiante_nombre,
        matricula: row.estudiante_matricula,
        ciclo: row.estudiante_ciclo,
        email: row.estudiante_email
      }
    }));
    res.json(formattedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/prestamos', async (req, res) => {
  const { equipo_id, equipo_ids, estudiante_id, observaciones } = req.body;
  const ids = Array.isArray(equipo_ids) && equipo_ids.length > 0
    ? equipo_ids
    : (equipo_id ? [equipo_id] : []);

  if (ids.length === 0 || !estudiante_id) {
    return res.status(400).json({ error: 'Debes indicar al menos un equipo y un estudiante' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    
    const createdPrestamos = [];
    for (const eqId of ids) {
      const prestamoRes = await client.query(
        'INSERT INTO prestamos (equipo_id, estudiante_id, observaciones) VALUES ($1, $2, $3) RETURNING *',
        [eqId, estudiante_id, observaciones || null]
      );
      createdPrestamos.push(prestamoRes.rows[0]);
      await client.query(
        'UPDATE equipos SET estado = $1 WHERE id = $2',
        ['ocupado', eqId]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json(ids.length === 1 ? createdPrestamos[0] : createdPrestamos);
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

// 6. Investigaciones
app.get('/api/investigaciones', async (req, res) => {
  try {
    const [invRes, ieRes, ieqRes] = await Promise.all([
      pool.query('SELECT * FROM investigaciones ORDER BY created_at DESC'),
      pool.query(`
        SELECT ie.investigacion_id, e.*
        FROM investigacion_estudiantes ie
        JOIN estudiantes e ON e.id = ie.estudiante_id
      `),
      pool.query(`
        SELECT ieq.investigacion_id, eq.*
        FROM investigacion_equipos ieq
        JOIN equipos eq ON eq.id = ieq.equipo_id
      `)
    ]);

    const investigadoresByInv = {};
    for (const row of ieRes.rows) {
      if (!investigadoresByInv[row.investigacion_id]) investigadoresByInv[row.investigacion_id] = [];
      const { investigacion_id, ...est } = row;
      investigadoresByInv[row.investigacion_id].push(est);
    }

    const equiposByInv = {};
    for (const row of ieqRes.rows) {
      if (!equiposByInv[row.investigacion_id]) equiposByInv[row.investigacion_id] = [];
      const { investigacion_id, ...eq } = row;
      equiposByInv[investigacion_id].push(eq);
    }

    const investigaciones = invRes.rows.map(inv => {
      const invEstudiantes = investigadoresByInv[inv.id] || [];
      const invEquipos = equiposByInv[inv.id] || [];
      return {
        ...inv,
        investigadores: invEstudiantes,
        investigadores_ids: invEstudiantes.map(e => e.id),
        equipos: invEquipos,
        equipos_ids: invEquipos.map(e => e.id)
      };
    });

    res.json(investigaciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/investigaciones', async (req, res) => {
  const { titulo, tipo, estado, descripcion, fecha_inicio, fecha_fin, investigadores_ids, equipos_ids } = req.body;
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    
    // Convert empty strings to null for date fields
    const processedFechaInicio = fecha_inicio === '' ? null : fecha_inicio;
    const processedFechaFin = fecha_fin === '' ? null : fecha_fin;
    
    const invResult = await client.query(
      'INSERT INTO investigaciones (titulo, tipo, estado, descripcion, fecha_inicio, fecha_fin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [titulo, tipo, estado || 'en_progreso', descripcion, processedFechaInicio, processedFechaFin]
    );
    const inv = invResult.rows[0];
    
    // Insertar investigadores
    if (investigadores_ids && investigadores_ids.length > 0) {
      for (const estId of investigadores_ids) {
        await client.query(
          'INSERT INTO investigacion_estudiantes (investigacion_id, estudiante_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [inv.id, estId]
        );
      }
    }
    
    // Insertar equipos y marcar como OCUPADO
    if (equipos_ids && equipos_ids.length > 0) {
      for (const eqId of equipos_ids) {
        await client.query(
          'INSERT INTO investigacion_equipos (investigacion_id, equipo_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [inv.id, eqId]
        );
        await client.query(
          "UPDATE equipos SET estado = 'ocupado' WHERE id = $1",
          [eqId]
        );
      }
    }
    
    await client.query('COMMIT');
    res.status(201).json(inv);
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

app.put('/api/investigaciones/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, tipo, estado, descripcion, fecha_inicio, fecha_fin, investigadores_ids, equipos_ids } = req.body;
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    
    // Convert empty strings to null for date fields
    const processedFechaInicio = fecha_inicio === '' ? null : fecha_inicio;
    const processedFechaFin = fecha_fin === '' ? null : fecha_fin;
    
    // Get current equipos in this investigation
    const currentEquiposRes = await client.query(
      'SELECT equipo_id FROM investigacion_equipos WHERE investigacion_id = $1',
      [id]
    );
    const currentEquipoIds = currentEquiposRes.rows.map(r => r.equipo_id);
    
    // Extract new equipo ids
    const newEquipoIds = equipos_ids || [];
    
    // Find equipos to remove: in current but not in new
    const equiposToRemove = currentEquipoIds.filter(eqId => !newEquipoIds.includes(eqId));
    
    // Find equipos to add: in new but not in current
    const equiposToAdd = newEquipoIds.filter(eqId => !currentEquipoIds.includes(eqId));
    
    const invResult = await client.query(
      'UPDATE investigaciones SET titulo = $1, tipo = $2, estado = $3, descripcion = $4, fecha_inicio = $5, fecha_fin = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [titulo, tipo, estado, descripcion, processedFechaInicio, processedFechaFin, id]
    );
    if (invResult.rows.length === 0) throw new Error('Investigación no encontrada');
    const inv = invResult.rows[0];
    
    // Actualizar investigadores
    await client.query('DELETE FROM investigacion_estudiantes WHERE investigacion_id = $1', [id]);
    if (investigadores_ids && investigadores_ids.length > 0) {
      for (const estId of investigadores_ids) {
        await client.query(
          'INSERT INTO investigacion_estudiantes (investigacion_id, estudiante_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, estId]
        );
      }
    }
    
    // Actualizar equipos
    // Remove old ones
    for (const eqId of equiposToRemove) {
      await client.query('DELETE FROM investigacion_equipos WHERE investigacion_id = $1 AND equipo_id = $2', [id, eqId]);
      // Check if equipo is still in any other active investigation or préstamo before marking disponible
      const stillInUseRes = await client.query(`
        SELECT COUNT(*) 
        FROM investigacion_equipos ie 
        JOIN investigaciones i ON ie.investigacion_id = i.id 
        WHERE ie.equipo_id = $1 AND i.estado != 'finalizado'
        UNION ALL
        SELECT COUNT(*) 
        FROM prestamos 
        WHERE equipo_id = $1 AND fecha_devolucion IS NULL
      `, [eqId]);
      const totalInUse = stillInUseRes.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
      if (totalInUse === 0) {
        await client.query("UPDATE equipos SET estado = 'disponible' WHERE id = $1", [eqId]);
      }
    }
    // Add new ones
    for (const eqId of equiposToAdd) {
      await client.query(
        'INSERT INTO investigacion_equipos (investigacion_id, equipo_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [id, eqId]
      );
      await client.query("UPDATE equipos SET estado = 'ocupado' WHERE id = $1", [eqId]);
    }
    
    // If investigation is finalizado, mark all its equipos as disponible if not used elsewhere
    if (estado === 'finalizado') {
      for (const eqId of newEquipoIds) {
        const stillInUseRes = await client.query(`
          SELECT COUNT(*) 
          FROM investigacion_equipos ie 
          JOIN investigaciones i ON ie.investigacion_id = i.id 
          WHERE ie.equipo_id = $1 AND i.estado != 'finalizado' AND i.id != $2
          UNION ALL
          SELECT COUNT(*) 
          FROM prestamos 
          WHERE equipo_id = $1 AND fecha_devolucion IS NULL
        `, [eqId, id]);
        const totalInUse = stillInUseRes.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
        if (totalInUse === 0) {
          await client.query("UPDATE equipos SET estado = 'disponible' WHERE id = $1", [eqId]);
        }
      }
    }
    
    await client.query('COMMIT');
    res.json(inv);
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

app.delete('/api/investigaciones/:id', async (req, res) => {
  const { id } = req.params;
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    
    // Get equipos in this investigation first
    const equiposToCheckRes = await client.query(
      'SELECT equipo_id FROM investigacion_equipos WHERE investigacion_id = $1',
      [id]
    );
    const equiposToCheck = equiposToCheckRes.rows.map(r => r.equipo_id);
    
    // Delete the investigation (cascades to join tables if we have ON DELETE CASCADE, but let's do manually)
    await client.query('DELETE FROM investigacion_equipos WHERE investigacion_id = $1', [id]);
    await client.query('DELETE FROM investigacion_estudiantes WHERE investigacion_id = $1', [id]);
    await client.query('DELETE FROM investigaciones WHERE id = $1', [id]);
    
    // Check each equipo and mark as disponible if not used elsewhere
    for (const eqId of equiposToCheck) {
      const stillInUseRes = await client.query(`
        SELECT COUNT(*) 
        FROM investigacion_equipos ie 
        JOIN investigaciones i ON ie.investigacion_id = i.id 
        WHERE ie.equipo_id = $1 AND i.estado != 'finalizado'
        UNION ALL
        SELECT COUNT(*) 
        FROM prestamos 
        WHERE equipo_id = $1 AND fecha_devolucion IS NULL
      `, [eqId]);
      const totalInUse = stillInUseRes.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
      if (totalInUse === 0) {
        await client.query("UPDATE equipos SET estado = 'disponible' WHERE id = $1", [eqId]);
      }
    }
    
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
        (SELECT COUNT(*) FROM equipos WHERE tipo_item = 'reactivo') as total_reactivos,
        (SELECT COUNT(*) FROM equipos WHERE COALESCE(cantidad, 1) <= COALESCE(stock_minimo, 1)) as stock_bajo_count,
        (SELECT COUNT(*) FROM investigaciones) as total_investigaciones,
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
      totalReactivos: parseInt(row.total_reactivos || 0),
      stockBajoCount: parseInt(row.stock_bajo_count || 0),
      totalInvestigaciones: parseInt(row.total_investigaciones || 0),
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
