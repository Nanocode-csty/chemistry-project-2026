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
  imagen_url TEXT,
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
-- Nota: En local se usa un ID autogenerado. En Supabase se vincula a auth.users
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
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
  e.imagen_url,
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

-- CMS: GESTIÓN DE CONTENIDO WEB

-- 10. Tabla de Multimedia (Imágenes y Videos)
CREATE TABLE IF NOT EXISTS cms_multimedia (
  id BIGSERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  titulo VARCHAR(255),
  tipo VARCHAR(50) DEFAULT 'publicacion', -- banner, publicacion, perfil, logo
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Tabla de Nosotros
CREATE TABLE IF NOT EXISTS cms_nosotros (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(255) DEFAULT 'Acerca de Nosotros',
  subtitulo TEXT,
  descripcion TEXT,
  miembros_conteo VARCHAR(50) DEFAULT '+45',
  miembros_descripcion TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Tabla de Valores
CREATE TABLE IF NOT EXISTS cms_valores (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Tabla de Misión y Visión
CREATE TABLE IF NOT EXISTS cms_mision_vision (
  id BIGSERIAL PRIMARY KEY,
  mision TEXT NOT NULL,
  vision TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Tabla de Círculo Dorado
CREATE TABLE IF NOT EXISTS cms_circulo_dorado (
  id BIGSERIAL PRIMARY KEY,
  proposito_titulo VARCHAR(255) DEFAULT '¿Por qué lo hacemos?',
  proposito_descripcion TEXT,
  proceso_titulo VARCHAR(255) DEFAULT '¿Cómo lo hacemos?',
  proceso_descripcion TEXT,
  resultados_titulo VARCHAR(255) DEFAULT '¿Qué hacemos?',
  resultados_descripcion TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Tabla de Evolución (Timeline)
CREATE TABLE IF NOT EXISTS cms_evolucion (
  id BIGSERIAL PRIMARY KEY,
  periodo VARCHAR(100) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Tabla de Noticias (CMS)
CREATE TABLE IF NOT EXISTS cms_noticias (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  contenido TEXT,
  categoria VARCHAR(100),
  imagen_url TEXT,
  fecha DATE DEFAULT CURRENT_DATE,
  destacada BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cms_config (
  id BIGSERIAL PRIMARY KEY,
  noticias_limite INT DEFAULT 3,
  investigaciones_limite INT DEFAULT 4,
  servicios_limite INT DEFAULT 4,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos iniciales CMS
INSERT INTO cms_config (noticias_limite, investigaciones_limite, servicios_limite)
VALUES (3, 4, 4) ON CONFLICT DO NOTHING;

INSERT INTO cms_nosotros (subtitulo, descripcion, miembros_conteo, miembros_descripcion)
VALUES (
  'Somos un laboratorio de investigación e innovación científica',
  'Somos un equipo de investigación orientado a generar nuevas Tecnologías Químicas y Ambientales para solucionar problemas de la Industria y Medio Ambiente.',
  '+45 Miembros',
  'realizando investigación científica: Investigadores, Tesistas, Pasantes'
) ON CONFLICT DO NOTHING;

INSERT INTO cms_mision_vision (mision, vision)
VALUES (
  'Desarrollar tecnologías innovadoras y sostenibles enfocadas en resolver problemas ambientales e industriales. Impulsamos la formación de capital humano altamente capacitado, generando soluciones de vanguardia para la industria y la sociedad, alineadas con los Objetivos de Desarrollo Sostenible.',
  'Ser un referente internacional en investigación aplicada, innovación tecnológica y formación de talento, liderando el desarrollo de soluciones sostenibles en catalizadores, adsorbentes y generación de energía, contribuyendo al progreso industrial y al bienestar social en armonía con el medio ambiente en alianza con instituciones internacionales.'
) ON CONFLICT DO NOTHING;

INSERT INTO cms_circulo_dorado (proposito_descripcion, proceso_descripcion, resultados_descripcion)
VALUES (
  'Lo hacemos porque creemos en el desarrollo sostenible y la responsabilidad de crear tecnologías que mitiguen el impacto ambiental, mientras impulsamos la ciencia, la industria y la sociedad hacia un futuro más ecológico y eficiente.',
  'Implementamos investigación multidisciplinaria y tecnologías emergentes, aplicando procesos de intensificación y escalamiento para la industria. Trabajamos en colaboración con estudiantes, promoviendo la formación de capital humano y patentando nuestras innovaciones para asegurar un impacto sostenible.',
  'Desarrollamos tecnologías innovadoras en catalizadores, adsorbentes y nuevos materiales, algunas ya en ejecución en industrias. Nos enfocamos en la investigación y creación de soluciones que resuelvan problemas medioambientales, generación de energía y reciclaje de materiales.'
) ON CONFLICT DO NOTHING;

INSERT INTO cms_valores (titulo, descripcion, orden) VALUES
('Honestidad', 'Actuamos con transparencia, siendo sinceros en nuestras acciones y palabras, promoviendo la confianza en cada decisión.', 1),
('Objetividad', 'Tomamos decisiones basadas en hechos y datos, sin influencias externas ni sesgos personales, buscando siempre la verdad.', 2),
('Integridad', 'Mantenemos coherencia entre lo que decimos y hacemos, cumpliendo siempre nuestros compromisos con ética y transparencia.', 3),
('Respeto', 'Valoramos la diversidad y la dignidad de las personas, fomentando un ambiente de colaboración y empatía en todo momento.', 4),
('Responsabilidad', 'Asumimos las consecuencias de nuestras acciones, garantizando el cumplimiento de nuestros deberes con compromiso y dedicación.', 5),
('Imparcialidad', 'Tratamos a todos con equidad, sin favoritismos, tomando decisiones justas basadas únicamente en criterios objetivos y razonados.', 6);

INSERT INTO cms_evolucion (periodo, titulo, descripcion, orden) VALUES
('1992 - 2000', 'Creación y primeros desarrollos', 'Inicio del laboratorio y estudios en catálisis y adsorbentes.', 1),
('2000 - 2010', 'Enfoque en medio ambiente', 'Investigaciones orientadas a procesos que reducen la contaminación ambiental.', 2),
('2010 - 2020', 'Innovación tecnológica y patentes', 'Desarrollo de nuevas tecnologías y obtención de la primera patente.', 3),
('2020 - 2030', 'Nuevas tecnologías y formación', 'Énfasis en intensificación de procesos y desarrollo de capital humano.', 4),
('2030 - 2040', 'Expansión y sostenibilidad', 'Consolidación del laboratorio con nuevas líneas de investigación y auto-financiamiento', 5);

-- 17. Tabla de Hero (Principal)
CREATE TABLE IF NOT EXISTS cms_hero (
  id BIGSERIAL PRIMARY KEY,
  titulo_linea1 VARCHAR(255) DEFAULT 'CIENCIA',
  titulo_linea2 VARCHAR(255) DEFAULT 'QUE TRANSFORMA',
  titulo_linea3 VARCHAR(255) DEFAULT 'EL FUTURO.',
  descripcion TEXT,
  cta_primario_texto VARCHAR(100) DEFAULT 'PROGRAMA CIENTÍFICO',
  cta_primario_link VARCHAR(255) DEFAULT '/investigaciones',
  cta_secundario_texto VARCHAR(100) DEFAULT 'CASOS DE ÉXITO',
  cta_secundario_link VARCHAR(255) DEFAULT '/proyectos',
  imagen_url TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20. CMS Contacto
CREATE TABLE IF NOT EXISTS cms_contacto (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(255) DEFAULT 'CONECTA CON NOSOTROS',
  descripcion TEXT,
  email VARCHAR(255) DEFAULT 'contacto@escuelaiq.edu',
  telefono VARCHAR(255) DEFAULT '+51 (1) 456 7890',
  direccion TEXT DEFAULT 'Av. Universitaria 1234, Lima',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO cms_contacto (descripcion) VALUES ('Estamos listos para colaborar en tu próximo proyecto de ingeniería o responder tus dudas académicas con el más alto rigor científico.') ON CONFLICT DO NOTHING;

-- 18. CMS Estudiantes
CREATE TABLE IF NOT EXISTS cms_estudiantes_header (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(255) DEFAULT 'COMUNIDAD ACADÉMICA',
  descripcion TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cms_investigaciones (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  link VARCHAR(255),
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cms_papers (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  resumen TEXT,
  anio VARCHAR(10),
  revista VARCHAR(255),
  autores VARCHAR(255),
  doi VARCHAR(255),
  pdf_url TEXT,
  link VARCHAR(255),
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cms_patentes (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. CMS Profesionales (Liderazgo Industrial)
CREATE TABLE IF NOT EXISTS cms_profesionales_header (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(255) DEFAULT 'LIDERAZGO INDUSTRIAL',
  descripcion TEXT,
  alianza_titulo VARCHAR(255) DEFAULT 'ALIANZA ESTRATÉGICA',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cms_servicios (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  icono VARCHAR(50),
  link VARCHAR(255),
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cms_proyectos (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  empresa VARCHAR(255),
  imagen_url TEXT,
  anio VARCHAR(10),
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cms_concursos (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  premio VARCHAR(255),
  anio VARCHAR(10),
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cms_transferencia (
  id BIGSERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tecnologia VARCHAR(255),
  impacto TEXT,
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cms_stats (
  id BIGSERIAL PRIMARY KEY,
  valor VARCHAR(50) NOT NULL,
  etiqueta VARCHAR(255) NOT NULL,
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos iniciales
INSERT INTO cms_estudiantes_header (descripcion) VALUES ('Nuestros estudiantes lideran la investigación científica, transformando teoría avanzada en soluciones de impacto global y sostenible.') ON CONFLICT DO NOTHING;
INSERT INTO cms_profesionales_header (descripcion) VALUES ('Desarrollamos soluciones de ingeniería que optimizan la producción y reducen el impacto ambiental, respaldadas por certificaciones internacionales y un equipo multidisciplinario.') ON CONFLICT DO NOTHING;

INSERT INTO cms_investigaciones (titulo, descripcion, orden) VALUES 
('Síntesis de Biodiesel', 'Optimización de procesos de transesterificación usando catalizadores heterogéneos.', 1),
('Tratamiento de Aguas', 'Desarrollo de nuevos materiales adsorbentes para la remoción de metales pesados.', 2);

INSERT INTO cms_stats (valor, etiqueta, orden) VALUES 
('85+', 'Proyectos Ejecutados', 1),
('12', 'Países Alcanzados', 2);

INSERT INTO cms_servicios (titulo, orden) VALUES 
('Análisis de Fallas', 1),
('Optimización de Procesos', 2),
('Consultoría Ambiental', 3),
('Ensayos de Materiales', 4);

INSERT INTO cms_hero (descripcion, imagen_url)
VALUES (
  'Impulsamos la vanguardia científica con soluciones de ingeniería química que redefinen la sostenibilidad industrial a nivel global.',
  'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=1200'
) ON CONFLICT DO NOTHING;
