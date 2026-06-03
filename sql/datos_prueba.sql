-- ============================================
-- DATOS DE PRUEBA PARA SISTEMA DE INVENTARIOS
-- Ejecutar este SQL en Supabase SQL Editor
-- ============================================

-- 1. Insertar Ambientes
INSERT INTO ambientes (nombre, descripcion, ubicacion) VALUES 
('Laboratorio A - Química Orgánica', 'Laboratorio equipado para síntesis orgánica', 'Edificio A, Piso 1'),
('Laboratorio B - Bioquímica', 'Laboratorio para análisis bioquímicos', 'Edificio A, Piso 2'),
('Sala de Espectroscopía', 'Sala con equipos de espectrometría', 'Edificio B, Piso 1'),
('Laboratorio C - Físico-Química', 'Laboratorio para mediciones físicas', 'Edificio A, Piso 3'),
('Almacén General', 'Almacén principal de equipos', 'Edificio C, Planta Baja')
ON CONFLICT DO NOTHING;

-- 2. Insertar Categorías de Equipos
INSERT INTO categorias_equipos (nombre, descripcion) VALUES 
('Microscopios', 'Equipos de microscopía óptica y electrónica'),
('Cristalería', 'Material de vidrio para laboratorio'),
('Reactivos', 'Químicos y reactivos para experimentos'),
('Equipos Analíticos', 'Instrumentos para análisis químico'),
('Equipos de Medición', 'Instrumentos de medición física'),
('Seguridad', 'Equipos de protección personal')
ON CONFLICT DO NOTHING;

-- 3. Insertar Estudiantes
INSERT INTO estudiantes (nombre, email, matricula, carrera, estado) VALUES 
('Juan Pérez García', 'juan.perez@escuela-iq.edu', 'IQ2021-001', 'Ingeniería Química', 'activo'),
('María López Rodríguez', 'maria.lopez@escuela-iq.edu', 'IQ2021-002', 'Ingeniería Química', 'activo'),
('Carlos Martínez Sánchez', 'carlos.martinez@escuela-iq.edu', 'IQ2020-005', 'Ingeniería Química', 'activo'),
('Ana González Pérez', 'ana.gonzalez@escuela-iq.edu', 'IQ2022-010', 'Ingeniería Química', 'activo'),
('Roberto Díaz Gómez', 'roberto.diaz@escuela-iq.edu', 'IQ2020-015', 'Ingeniería Química', 'activo'),
('Laura Fernández Ruiz', 'laura.fernandez@escuela-iq.edu', 'IQ2021-020', 'Ingeniería Química', 'activo'),
('Pedro Jiménez Torres', 'pedro.jimenez@escuela-iq.edu', 'IQ2022-025', 'Ingeniería Química', 'activo'),
('Sofía Martín Romero', 'sofia.martin@escuela-iq.edu', 'IQ2020-030', 'Ingeniería Química', 'activo')
ON CONFLICT DO NOTHING;

-- 4. Insertar Equipos
INSERT INTO equipos (nombre, codigo, ambiente_id, categoria_id, descripcion, estado, fecha_adquisicion) VALUES 
('Microscopio Óptico Nikon', 'MICRO-001', 1, 1, 'Microscopio óptico binocular con aumento 400x', 'disponible', '2023-01-15'),
('Microscopio Electrónico SEM', 'MICRO-002', 2, 1, 'Microscopio electrónico de barrido', 'disponible', '2022-08-20'),
('Espectrofotómetro UV-Vis', 'ESPEC-001', 3, 4, 'Espectrofotómetro de doble haz', 'disponible', '2023-03-10'),
('Cromatógrafo de Gases', 'CROMG-001', 3, 4, 'Cromatógrafo de gases con detector FID', 'disponible', '2022-11-05'),
('Balanza Analítica', 'BALAN-001', 1, 5, 'Balanza analítica de precisión 0.1mg', 'disponible', '2023-02-28'),
('Balanza Analítica', 'BALAN-002', 2, 5, 'Balanza analítica de precisión 0.01mg', 'disponible', '2022-07-12'),
('Matraces Volumétricos (Set)', 'CRIST-001', 1, 2, 'Set de matraces volumétricos 10-1000mL', 'disponible', '2023-04-01'),
('Pipetas Automáticas', 'CRIST-002', 2, 2, 'Set de pipetas automáticas multicanal', 'disponible', '2023-05-15'),
('pH Metro Digital', 'PHMET-001', 1, 5, 'Medidor de pH con electrodo combinado', 'disponible', '2023-02-10'),
('Agitador Magnético', 'AGITA-001', 1, 5, 'Agitador magnético con calentamiento', 'disponible', '2022-12-01'),
('Horno de Mufla', 'HORNO-001', 4, 5, 'Horno de mufla hasta 1200°C', 'disponible', '2022-09-20'),
('Centrífuga de Laboratorio', 'CENTR-001', 2, 4, 'Centrífuga refrigerada', 'disponible', '2023-01-25'),
('Guantes de Látex (Caja)', 'SEGUR-001', 5, 6, 'Caja de guantes de látex talla M', 'disponible', '2023-06-01'),
('Lentes de Seguridad', 'SEGUR-002', 5, 6, 'Lentes de seguridad anti-empaste', 'disponible', '2023-05-20'),
('Bata de Laboratorio', 'SEGUR-003', 5, 6, 'Bata de laboratorio anti-llama', 'disponible', '2023-04-15')
ON CONFLICT DO NOTHING;

-- ============================================
-- ¡Listo! Datos de prueba insertados correctamente
-- ============================================
