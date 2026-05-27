-- SCHEMA PARA SISTEMA DE GESTIÓN DE INVENTARIOS
-- Ejecutar este SQL en Supabase (SQL Editor)

-- 1. Tabla de Ambientes (laboratorios, salas, etc.)
CREATE TABLE IF NOT EXISTS ambientes (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT,
  ubicacion VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Categorías de Equipos
CREATE TABLE IF NOT EXISTS categorias_equipos (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Equipos
CREATE TABLE IF NOT EXISTS equipos (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  codigo VARCHAR(100) NOT NULL UNIQUE,
  ambiente_id BIGINT NOT NULL REFERENCES ambientes(id) ON DELETE CASCADE,
  categoria_id BIGINT NOT NULL REFERENCES categorias_equipos(id) ON DELETE CASCADE,
  descripcion TEXT,
  estado VARCHAR(50) DEFAULT 'disponible', -- disponible, ocupado, en_mantenimiento
  fecha_adquisicion DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Estudiantes
CREATE TABLE IF NOT EXISTS estudiantes (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  matricula VARCHAR(100) NOT NULL UNIQUE,
  carrera VARCHAR(255),
  estado VARCHAR(50) DEFAULT 'activo', -- activo, inactivo
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Préstamos (Histórico)
CREATE TABLE IF NOT EXISTS prestamos (
  id BIGSERIAL PRIMARY KEY,
  equipo_id BIGINT NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  estudiante_id BIGINT NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  fecha_prestamo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_devolucion TIMESTAMP,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX idx_equipos_ambiente ON equipos(ambiente_id);
CREATE INDEX idx_equipos_categoria ON equipos(categoria_id);
CREATE INDEX idx_equipos_estado ON equipos(estado);
CREATE INDEX idx_prestamos_equipo ON prestamos(equipo_id);
CREATE INDEX idx_prestamos_estudiante ON prestamos(estudiante_id);
CREATE INDEX idx_prestamos_fecha ON prestamos(fecha_prestamo);
CREATE INDEX idx_prestamos_devolucion ON prestamos(fecha_devolucion);

-- 6. RPC Function: Registrar Préstamo
-- Esta función automatiza: 1) crear registro en préstamos, 2) cambiar estado de equipo a "ocupado"
CREATE OR REPLACE FUNCTION registrar_prestamo(
  equipo_id BIGINT,
  estudiante_id BIGINT,
  fecha_prestamo TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
RETURNS prestamos AS $$
DECLARE
  nuevo_prestamo prestamos;
BEGIN
  -- Verificar que el equipo esté disponible
  IF (SELECT estado FROM equipos WHERE id = equipo_id) != 'disponible' THEN
    RAISE EXCEPTION 'El equipo no está disponible para préstamo';
  END IF;

  -- Crear el registro de préstamo
  INSERT INTO prestamos (equipo_id, estudiante_id, fecha_prestamo)
  VALUES (equipo_id, estudiante_id, fecha_prestamo)
  RETURNING * INTO nuevo_prestamo;

  -- Cambiar estado del equipo a ocupado
  UPDATE equipos SET estado = 'ocupado', updated_at = CURRENT_TIMESTAMP
  WHERE id = equipo_id;

  RETURN nuevo_prestamo;
END;
$$ LANGUAGE plpgsql;

-- 7. RPC Function: Devolver Préstamo
-- Esta función: 1) actualiza fecha_devolucion, 2) cambia estado de equipo a "disponible"
CREATE OR REPLACE FUNCTION devolver_prestamo(prestamo_id BIGINT)
RETURNS prestamos AS $$
DECLARE
  prestamo_actualizado prestamos;
  equipo_id_var BIGINT;
BEGIN
  -- Obtener el ID del equipo
  SELECT equipo_id INTO equipo_id_var FROM prestamos WHERE id = prestamo_id;

  -- Actualizar el préstamo
  UPDATE prestamos 
  SET fecha_devolucion = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
  WHERE id = prestamo_id
  RETURNING * INTO prestamo_actualizado;

  -- Cambiar estado del equipo a disponible
  UPDATE equipos SET estado = 'disponible', updated_at = CURRENT_TIMESTAMP
  WHERE id = equipo_id_var;

  RETURN prestamo_actualizado;
END;
$$ LANGUAGE plpgsql;

-- 8. OPCIONAL: Tabla de Usuarios (para autenticación de admin)
-- Nota: Usa el sistema de auth de Supabase. Este es solo para metadatos
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'admin',
  nombre VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar admin inicial (cambiar credenciales después)
-- Las credenciales reales se crean a través de Supabase Auth UI o API
INSERT INTO usuarios (email, rol, nombre) 
VALUES ('admin@escuela-iq.edu', 'admin', 'Administrador') 
ON CONFLICT DO NOTHING;

-- 9. Views útiles para reportes

-- Vista: Equipos con información relacionada
CREATE OR REPLACE VIEW view_equipos_completo AS
SELECT 
  e.id,
  e.nombre,
  e.codigo,
  e.estado,
  a.nombre as ambiente,
  c.nombre as categoria,
  e.descripcion,
  e.fecha_adquisicion
FROM equipos e
LEFT JOIN ambientes a ON e.ambiente_id = a.id
LEFT JOIN categorias_equipos c ON e.categoria_id = c.id;

-- Vista: Préstamos activos
CREATE OR REPLACE VIEW view_prestamos_activos AS
SELECT 
  p.id,
  p.fecha_prestamo,
  e.nombre as equipo,
  e.codigo,
  est.nombre as estudiante,
  est.matricula,
  CURRENT_DATE - DATE(p.fecha_prestamo) as dias_prestado
FROM prestamos p
LEFT JOIN equipos e ON p.equipo_id = e.id
LEFT JOIN estudiantes est ON p.estudiante_id = est.id
WHERE p.fecha_devolucion IS NULL
ORDER BY p.fecha_prestamo;

-- Vista: Estadísticas por ambiente
CREATE OR REPLACE VIEW view_estadisticas_ambiente AS
SELECT 
  a.nombre,
  COUNT(e.id) as total_equipos,
  SUM(CASE WHEN e.estado = 'disponible' THEN 1 ELSE 0 END) as disponibles,
  SUM(CASE WHEN e.estado = 'ocupado' THEN 1 ELSE 0 END) as ocupados,
  SUM(CASE WHEN e.estado = 'en_mantenimiento' THEN 1 ELSE 0 END) as mantenimiento
FROM ambientes a
LEFT JOIN equipos e ON a.id = e.ambiente_id
GROUP BY a.id, a.nombre;

-- Habilitar RLS (Row Level Security) - Opcional pero recomendado
ALTER TABLE ambientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestamos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS (opcional - para administrador)
-- Todos los administradores pueden ver y modificar todo
CREATE POLICY "admin_all_access" ON ambientes FOR ALL USING (true);
CREATE POLICY "admin_all_access" ON categorias_equipos FOR ALL USING (true);
CREATE POLICY "admin_all_access" ON equipos FOR ALL USING (true);
CREATE POLICY "admin_all_access" ON estudiantes FOR ALL USING (true);
CREATE POLICY "admin_all_access" ON prestamos FOR ALL USING (true);
