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
('Almacén General', 'Almacén principal de equipos y reactivos', 'Edificio C, Planta Baja')
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
INSERT INTO estudiantes (nombre, email, matricula, carrera, ciclo, estado) VALUES 
('Juan Pérez García', 'juan.perez@unitru.edu.pe', '2021000001', 'Ingeniería Química', 7, 'activo'),
('María López Rodríguez', 'maria.lopez@unitru.edu.pe', '2021000002', 'Ingeniería Química', 7, 'activo'),
('Carlos Martínez Sánchez', 'carlos.martinez@unitru.edu.pe', '2020000005', 'Ingeniería Química', 9, 'activo'),
('Ana González Pérez', 'ana.gonzalez@unitru.edu.pe', '2022000010', 'Ingeniería Química', 5, 'activo'),
('Roberto Díaz Gómez', 'roberto.diaz@unitru.edu.pe', '2020000015', 'Ingeniería Química', 8, 'activo'),
('Laura Fernández Ruiz', 'laura.fernandez@unitru.edu.pe', '2021000020', 'Ingeniería Química', 6, 'activo'),
('Pedro Jiménez Torres', 'pedro.jimenez@unitru.edu.pe', '2022000025', 'Ingeniería Química', 5, 'activo'),
('Sofía Martín Romero', 'sofia.martin@unitru.edu.pe', '2020000030', 'Ingeniería Química', 10, 'activo')
ON CONFLICT DO NOTHING;

-- 4. Insertar Equipos, Materiales y Reactivos Químicos
INSERT INTO equipos (
  nombre, codigo, ambiente_id, categoria_id, descripcion, estado, fecha_adquisicion,
  tipo_item, presentacion, capacidad, unidad_medida, cantidad, stock_minimo, formula_quimica, concentracion, fecha_vencimiento
) VALUES 
('Microscopio Óptico Nikon', 'MICRO-001', 1, 1, 'Microscopio óptico binocular con aumento 400x', 'disponible', '2023-01-15', 'equipo', 'Unidad', 1, 'und', 2, 1, NULL, NULL, NULL),
('Microscopio Electrónico SEM', 'MICRO-002', 2, 1, 'Microscopio electrónico de barrido', 'disponible', '2022-08-20', 'equipo', 'Unidad', 1, 'und', 1, 1, NULL, NULL, NULL),
('Espectrofotómetro UV-Vis', 'ESPEC-001', 3, 4, 'Espectrofotómetro de doble haz', 'disponible', '2023-03-10', 'equipo', 'Unidad', 1, 'und', 1, 1, NULL, NULL, NULL),
('Cromatógrafo de Gases', 'CROMG-001', 3, 4, 'Cromatógrafo de gases con detector FID', 'disponible', '2022-11-05', 'equipo', 'Unidad', 1, 'und', 1, 1, NULL, NULL, NULL),
('Balanza Analítica 0.1mg', 'BALAN-001', 1, 5, 'Balanza analítica de precisión 0.1mg', 'disponible', '2023-02-28', 'equipo', 'Unidad', 1, 'und', 2, 1, NULL, NULL, NULL),
('Balanza Analítica 0.01mg', 'BALAN-002', 2, 5, 'Balanza analítica de precisión 0.01mg', 'disponible', '2022-07-12', 'equipo', 'Unidad', 1, 'und', 1, 1, NULL, NULL, NULL),
('Matraz Volumétrico Clase A', 'CRIST-001', 1, 2, 'Matraces volumétricos de vidrio borosilicato 250 mL', 'disponible', '2023-04-01', 'material', 'Unidad', 250, 'mL', 10, 3, NULL, 'Clase A', NULL),
('Matraz Volumétrico Clase A', 'CRIST-002', 1, 2, 'Matraces volumétricos de vidrio borosilicato 500 mL', 'disponible', '2023-04-01', 'material', 'Unidad', 500, 'mL', 6, 2, NULL, 'Clase A', NULL),
('Pipetas Automáticas Multicanal', 'CRIST-003', 2, 2, 'Set de pipetas automáticas de volumen variable', 'disponible', '2023-05-15', 'material', 'Kit', 10, 'mL', 4, 1, NULL, NULL, NULL),
('pH Metro Digital', 'PHMET-001', 1, 5, 'Medidor de pH con electrodo combinado', 'disponible', '2023-02-10', 'equipo', 'Unidad', 1, 'und', 3, 1, NULL, NULL, NULL),
('Agitador Magnético con Calentamiento', 'AGITA-001', 1, 5, 'Agitador magnético con placa calefactora hasta 380°C', 'disponible', '2022-12-01', 'equipo', 'Unidad', 1, 'und', 4, 1, NULL, NULL, NULL),
('Horno de Mufla', 'HORNO-001', 4, 5, 'Horno de mufla hasta 1200°C', 'disponible', '2022-09-20', 'equipo', 'Unidad', 1, 'und', 1, 1, NULL, NULL, NULL),
('Centrífuga Refrigerada', 'CENTR-001', 2, 4, 'Centrífuga refrigerada de alta velocidad', 'disponible', '2023-01-25', 'equipo', 'Unidad', 1, 'und', 1, 1, NULL, NULL, NULL),
('Guantes de Nitrilo', 'SEGUR-001', 5, 6, 'Caja de guantes de nitrilo libres de polvo talla M', 'disponible', '2023-06-01', 'seguridad', 'Caja', 100, 'und', 8, 2, NULL, NULL, NULL),
('Lentes de Seguridad Anti-Empañante', 'SEGUR-002', 5, 6, 'Lentes de policarbonato para protección química', 'disponible', '2023-05-20', 'seguridad', 'Unidad', 1, 'und', 15, 5, NULL, NULL, NULL),
('Bata de Laboratorio Ignífuga', 'SEGUR-003', 5, 6, 'Bata de laboratorio anti-llama', 'disponible', '2023-04-15', 'seguridad', 'Unidad', 1, 'und', 10, 3, NULL, NULL, NULL),
('Nitrato de Plata', 'REACT-001', 1, 3, 'Reactivo analítico para titulaciones argentométricas (Presentación 100 mg)', 'disponible', '2025-01-10', 'reactivo', 'Frasco', 100, 'mg', 3, 2, 'AgNO3', '99.8% PA', '2027-06-30'),
('Nitrato de Plata', 'REACT-002', 1, 3, 'Reactivo analítico para titulaciones argentométricas (Presentación 200 mg)', 'disponible', '2025-02-15', 'reactivo', 'Frasco', 200, 'mg', 2, 1, 'AgNO3', '99.8% PA', '2027-08-15'),
('Ácido Sulfúrico Concentrado', 'REACT-003', 1, 3, 'Ácido mineral fuerte grado reactivo ACS en botella ámbar', 'disponible', '2025-03-01', 'reactivo', 'Botella', 1, 'L', 4, 2, 'H2SO4', '98% p/p', '2028-03-01'),
('Ácido Sulfúrico Concentrado', 'REACT-004', 4, 3, 'Ácido mineral fuerte grado reactivo ACS presentación 500 mL', 'disponible', '2025-03-10', 'reactivo', 'Frasco', 500, 'mL', 3, 2, 'H2SO4', '98% p/p', '2028-03-10'),
('Hidróxido de Sodio en Lentejas', 'REACT-005', 1, 3, 'Base fuerte en pellets para preparación de soluciones estándar', 'disponible', '2025-01-20', 'reactivo', 'Frasco', 500, 'g', 5, 2, 'NaOH', '99.0% PA', '2027-12-31'),
('Hidróxido de Sodio en Lentejas', 'REACT-006', 2, 3, 'Base fuerte en pellets presentación de 1 kg', 'disponible', '2025-02-05', 'reactivo', 'Frasco', 1, 'kg', 2, 1, 'NaOH', '99.0% PA', '2027-12-31'),
('Etanol Absoluto', 'REACT-007', 2, 3, 'Solvente orgánico de alta pureza para análisis e instrumental', 'disponible', '2025-04-12', 'reactivo', 'Galón', 4, 'L', 3, 1, 'C2H5OH', '99.9% v/v', '2027-05-01'),
('Fenolftaleína Indicador', 'REACT-008', 1, 3, 'Solución indicadora ácido-base en etanol', 'disponible', '2025-01-18', 'reactivo', 'Frasco', 100, 'mL', 4, 2, 'C20H14O4', '1% p/v', '2026-12-15'),
('Ácido Clorhídrico Fumante', 'REACT-009', 4, 3, 'Ácido clorhídrico grado analítico 37%', 'disponible', '2025-02-22', 'reactivo', 'Botella', 2.5, 'L', 2, 2, 'HCl', '37% p/p', '2027-09-30')
ON CONFLICT DO NOTHING;

-- ============================================
-- ¡Listo! Datos de prueba insertados correctamente
-- ============================================
