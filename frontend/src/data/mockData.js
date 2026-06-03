export const mockInvestigaciones = [ 
  { 
    id: 1, 
    titulo: 'Biorremediación de efluentes textiles', 
    descripcion: 'Uso de microorganismos para degradar colorantes en aguas residuales de la industria textil.',
    contenidoDetallado: 'Este proyecto se enfoca en la utilización de cepas bacterianas autóctonas con capacidad enzimática para la decoloración de tintes azoicos, comunes en la industria textil peruana. El proceso busca una alternativa biotecnológica de bajo costo y alta eficiencia.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder video
    metodologia: 'Aislamiento de microorganismos, pruebas de toxicidad y diseño de biorreactor a escala piloto.',
    impacto: 'Reducción del 95% de la carga contaminante en efluentes industriales.'
  }, 
  { 
    id: 2, 
    titulo: 'Síntesis de nanopartículas para catálisis', 
    descripcion: 'Desarrollo de nanocatalizadores para reacciones de oxidación selectiva.',
    contenidoDetallado: 'Investigación sobre la síntesis verde de nanopartículas de plata y oro utilizando extractos vegetales. Estas partículas son aplicadas en procesos de catálisis heterogénea para la industria química fina.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    metodologia: 'Reducción química, caracterización por TEM/XRD and pruebas de actividad catalítica.',
    impacto: 'Incremento de la selectividad en un 30% comparado con catalizadores comerciales.'
  }, 
  { 
    id: 3, 
    titulo: 'Obtención de bioplásticos a partir de residuos agrícolas', 
    descripcion: 'Transformación de desechos de plátano y piña en polímeros biodegradables.',
    contenidoDetallado: 'Desarrollo de películas biodegradables a partir de almidón extraído de cáscaras de frutas. El proyecto aborda la problemática de los plásticos de un solo uso mediante la valorización de residuos orgánicos.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    metodologia: 'Extracción de polímeros, plastificación y extrusión de películas delgadas.',
    impacto: 'Alternativa 100% compostable a las bolsas plásticas convencionales.'
  }, 
]; 

export const mockPapers = [ 
  { 
    id: 1, 
    titulo: 'Degradación fotocatalítica de contaminantes emergentes', 
    autores: 'García, L., Pérez, M., Torres, J.', 
    revista: 'Chemical Engineering Journal', 
    anio: 2024, 
    resumen: 'Se evaluó la eficiencia de TiO2 dopado con nitrógeno en la eliminación de fármacos en agua.', 
  }, 
  { 
    id: 2, 
    titulo: 'Modelado matemático de reactores de lecho fluidizado', 
    autores: 'Reyes, C., Díaz, A.', 
    revista: 'Industrial & Engineering Chemistry Research', 
    anio: 2023, 
    resumen: 'Simulación CFD de perfiles de temperatura en reactores de craqueo catalítico.', 
  }, 
]; 

export const mockPatentes = [ 
  { id: 1, titulo: 'Sistema de tratamiento de aguas residuales con microalgas' }, 
  { id: 2, titulo: 'Método de obtención de bioetanol a partir de residuos de café' }, 
  { id: 3, titulo: 'Catalizador sólido para producción de biodiésel' }, 
]; 

export const mockProyectosIndustriales = [ 
  { 
    id: 1, 
    titulo: 'Optimización de procesos en refinería', 
    descripcion: 'Mejora de la eficiencia térmica en torres de destilación fraccionada.', 
    cliente: 'PetroPerú S.A.',
    contenidoDetallado: 'Auditoría energética y rediseño de intercambiadores de calor para maximizar la recuperación de energía en procesos de refinación de crudo pesado.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    resultados: 'Ahorro anual estimado de 1.2 millones de dólares en costos de combustible.'
  }, 
  { 
    id: 2, 
    titulo: 'Tratamiento de efluentes en planta minera', 
    descripcion: 'Implementación de sistema de coagulación-floculación avanzada.', 
    cliente: 'Minera Las Américas', 
    contenidoDetallado: 'Diseño e instalación de una planta de tratamiento de aguas ácidas de mina utilizando reactores de lecho fluidizado para la remoción de metales pesados.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    resultados: 'Cumplimiento del 100% de los estándares de calidad ambiental (ECA) para agua.'
  }, 
  { 
    id: 3, 
    titulo: 'Desarrollo de recubrimientos anticorrosivos', 
    descripcion: 'Formulación de pinturas base agua para protección de estructuras metálicas.', 
    cliente: 'Industrias Químicas del Pacífico', 
    contenidoDetallado: 'Investigación y desarrollo de una nueva línea de recubrimientos epóxicos libres de solventes orgánicos volátiles (VOC) para ambientes marinos de alta agresividad.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    resultados: 'Vida útil extendida de las estructuras en un 40% adicional.'
  }, 
]; 

export const mockConcursos = [ 
  { id: 1, nombre: 'Premio Nacional de Innovación Química', anio: 2024 }, 
  { id: 2, nombre: 'Concurso de Ingeniería de Procesos Sostenibles', anio: 2023 }, 
  { id: 3, nombre: 'Hackathon de Tecnología Ambiental', anio: 2023 }, 
  { id: 4, nombre: 'Reconocimiento a la Transferencia Tecnológica', anio: 2022 }, 
]; 

export const mockServicios = [ 
  { id: 1, titulo: 'Consultoría en procesos', descripcion: 'Asesoría técnica para optimización de plantas industriales.' }, 
  { id: 2, titulo: 'Análisis de laboratorio', descripcion: 'Servicios de caracterización química y fisicoquímica.' }, 
  { id: 3, titulo: 'Capacitaciones in-company', descripcion: 'Programas de formación a medida para empresas.' }, 
  { id: 4, titulo: 'Desarrollo de prototipos', descripcion: 'Escalamiento de productos desde laboratorio a planta piloto.' }, 
]; 

export const mockNoticias = [
  {
    id: 1,
    titulo: 'Inauguración de nuevo Laboratorio de Nanotecnología',
    fecha: '20 Mayo, 2026',
    categoria: 'Infraestructura',
    descripcion: 'Equipamiento de última generación para la investigación de nuevos materiales.',
    imagen: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6ad?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 2,
    titulo: 'Alianza estratégica con el sector minero para sostenibilidad',
    fecha: '15 Mayo, 2026',
    categoria: 'Institucional',
    descripcion: 'Desarrollo conjunto de procesos de remediación ambiental con microalgas.',
    imagen: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 3,
    titulo: 'Estudiantes ganan concurso internacional de innovación',
    fecha: '10 Mayo, 2026',
    categoria: 'Academia',
    descripcion: 'Proyecto de bioplásticos a partir de residuos agrícolas premiado en Europa.',
    imagen: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800'
  }
];
