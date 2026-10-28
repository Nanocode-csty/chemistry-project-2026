// Utilidades para Unidades de Medida, Presentaciones y Cálculo de Totales de Laboratorio (LABCAM)

export const TIPOS_ITEM = [
  { value: 'reactivo', label: 'Reactivo Químico' },
  { value: 'material', label: 'Material / Cristalería' },
  { value: 'equipo', label: 'Equipo / Instrumento' },
  { value: 'seguridad', label: 'Seguridad / EPP' },
];

export const PRESENTACIONES = [
  { value: 'Frasco', label: 'Frasco' },
  { value: 'Botella', label: 'Botella' },
  { value: 'Galón', label: 'Galón' },
  { value: 'Ampolla', label: 'Ampolla' },
  { value: 'Caja', label: 'Caja' },
  { value: 'Sobre', label: 'Sobre' },
  { value: 'Paquete', label: 'Paquete' },
  { value: 'Kit', label: 'Kit / Set' },
  { value: 'Rollo', label: 'Rollo' },
  { value: 'Unidad', label: 'Unidad' },
];

export const UNIDADES_MEDIDA_GRUPOS = [
  {
    grupo: 'Masa / Peso',
    opciones: [
      { value: 'mg', label: 'Miligramos (mg)' },
      { value: 'g', label: 'Gramos (g)' },
      { value: 'kg', label: 'Kilogramos (kg)' },
    ],
  },
  {
    grupo: 'Volumen / Capacidad',
    opciones: [
      { value: 'µL', label: 'Microlitros (µL)' },
      { value: 'mL', label: 'Mililitros (mL)' },
      { value: 'L', label: 'Litros (L)' },
      { value: 'gal', label: 'Galones (gal)' },
    ],
  },
  {
    grupo: 'Conteo / Presentación',
    opciones: [
      { value: 'und', label: 'Unidades (und)' },
      { value: 'frascos', label: 'Frascos' },
      { value: 'cajas', label: 'Cajas' },
      { value: 'kits', label: 'Kits' },
      { value: 'paquetes', label: 'Paquetes' },
      { value: 'rollos', label: 'Rollos' },
    ],
  },
  {
    grupo: 'Químicas / Concentración',
    opciones: [
      { value: 'M', label: 'Molar (M)' },
      { value: 'N', label: 'Normal (N)' },
      { value: '% p/p', label: 'Porcentaje peso/peso (% p/p)' },
      { value: '% v/v', label: 'Porcentaje volumen/volumen (% v/v)' },
      { value: '% p/v', label: 'Porcentaje peso/volumen (% p/v)' },
      { value: 'ppm', label: 'Partes por millón (ppm)' },
    ],
  },
];

export const UNIDADES_MEDIDA_FLAT = UNIDADES_MEDIDA_GRUPOS.flatMap((g) => g.opciones);

// Factores de conversión para sumar distintos frascos del mismo reactivo/material
const MASS_TO_MG = {
  mg: 1,
  g: 1000,
  kg: 1000000,
};

const VOLUME_TO_ML = {
  'µL': 0.001,
  uL: 0.001,
  mL: 1,
  ml: 1,
  L: 1000,
  l: 1000,
  gal: 3785.41,
};

export function formatNumber(num) {
  if (num === null || num === undefined || Number.isNaN(Number(num))) return '0';
  const n = Number(num);
  if (Number.isInteger(n)) return n.toLocaleString('es-PE');
  return n.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function pluralizePresentacion(presentacion = 'Unidad', cantidad = 1) {
  const count = Number(cantidad) || 1;
  if (count === 1) return presentacion || 'Unidad';
  const p = (presentacion || 'Unidad').trim();
  if (p.toLowerCase() === 'unidad') return 'Unidades';
  if (p.toLowerCase() === 'galón') return 'Galones';
  if (p.endsWith('s')) return p;
  return `${p}s`;
}

/**
 * Calcula el desglose de un ítem individual (ej. 3 Frascos x 100 mg = 300 mg)
 */
export function getItemTotalInfo(item) {
  const cantidad = Number(item?.cantidad ?? 1) || 0;
  const capacidad = Number(item?.capacidad ?? 1) || 1;
  const unidad = item?.unidad_medida || 'und';
  const presentacion = item?.presentacion || 'Unidad';
  const totalNeto = cantidad * capacidad;

  // Si es un equipo o unidad simple (Unidad x 1 und)
  const isSimpleUnit =
    (presentacion === 'Unidad' || !presentacion) &&
    capacidad === 1 &&
    (unidad === 'und' || !unidad);

  const presentacionLabel = isSimpleUnit
    ? `${formatNumber(cantidad)} ${unidad}`
    : `${ presentacion } × ${formatNumber(capacidad)} ${unidad}`;

  const envasesLabel = `${formatNumber(cantidad)} ${pluralizePresentacion(presentacion, cantidad)}`;

  let totalFormatted = `${formatNumber(totalNeto)} ${unidad}`;
  let equivalencia = null;

  if (unidad === 'mg' && totalNeto >= 1000) {
    equivalencia = `${formatNumber(totalNeto / 1000)} g`;
  } else if (unidad === 'g' && totalNeto >= 1000) {
    equivalencia = `${formatNumber(totalNeto / 1000)} kg`;
  } else if (unidad === 'mL' && totalNeto >= 1000) {
    equivalencia = `${formatNumber(totalNeto / 1000)} L`;
  } else if (unidad === 'µL' && totalNeto >= 1000) {
    equivalencia = `${formatNumber(totalNeto / 1000)} mL`;
  }

  return {
    cantidad,
    capacidad,
    unidad,
    presentacion,
    totalNeto,
    isSimpleUnit,
    presentacionLabel,
    envasesLabel,
    totalFormatted,
    equivalencia,
    fullTotalLabel: equivalencia ? `${totalFormatted} (${equivalencia})` : totalFormatted,
    desgloseLabel: isSimpleUnit
      ? `${formatNumber(cantidad)} ${pluralizePresentacion(presentacion, cantidad)}`
      : `${formatNumber(cantidad)} ${pluralizePresentacion(presentacion, cantidad)} × ${formatNumber(capacidad)} ${unidad} = ${totalFormatted}`,
  };
}

/**
 * Agrupa múltiples lotes/frascos del mismo reactivo o material y calcula el Total Consolidado
 * convirtiendo unidades compatibles (mg/g/kg y µL/mL/L).
 */
export function consolidateInventoryTotals(items = []) {
  const groups = new Map();

  for (const item of items) {
    const cleanName = (item.nombre || 'Sin Nombre').trim();
    const formula = (item.formula_quimica || '').trim().toUpperCase();
    const tipo = item.tipo_item || 'equipo';
    // Agrupar por nombre normalizado + tipo (o fórmula si es reactivo)
    const groupKey = `${tipo}::${cleanName.toLowerCase()}`;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        key: groupKey,
        nombre: cleanName,
        formula_quimica: formula || null,
        concentracion: item.concentracion || null,
        tipo_item: tipo,
        categoria_nombre: item.categoria?.nombre || 'General',
        lotesCount: 0,
        totalEnvases: 0,
        disponiblesCount: 0,
        stockBajoLotes: 0,
        ambientesSet: new Set(),
        codigos: [],
        desglosePresentaciones: [],
        massTotalMg: 0,
        hasMass: false,
        massUnitsUsed: new Set(),
        volumeTotalMl: 0,
        hasVolume: false,
        volumeUnitsUsed: new Set(),
        otherTotalsByUnit: {},
      });
    }

    const group = groups.get(groupKey);
    const info = getItemTotalInfo(item);

    group.lotesCount += 1;
    group.totalEnvases += info.cantidad;
    if (item.estado === 'disponible') group.disponiblesCount += 1;
    if (info.cantidad <= (Number(item.stock_minimo) || 1)) group.stockBajoLotes += 1;
    if (item.ambiente?.nombre) group.ambientesSet.add(item.ambiente.nombre);
    if (item.codigo) group.codigos.push(item.codigo);
    if (!group.formula_quimica && formula) group.formula_quimica = formula;
    if (!group.concentracion && item.concentracion) group.concentracion = item.concentracion;

    group.desglosePresentaciones.push(
      info.isSimpleUnit
        ? `${info.cantidad} und (${item.codigo})`
        : `${info.cantidad} ${pluralizePresentacion(info.presentacion, info.cantidad)} × ${formatNumber(info.capacidad)} ${info.unidad}`
    );

    if (MASS_TO_MG[info.unidad] !== undefined) {
      group.hasMass = true;
      group.massUnitsUsed.add(info.unidad);
      group.massTotalMg += info.totalNeto * MASS_TO_MG[info.unidad];
    } else if (VOLUME_TO_ML[info.unidad] !== undefined) {
      group.hasVolume = true;
      group.volumeUnitsUsed.add(info.unidad);
      group.volumeTotalMl += info.totalNeto * VOLUME_TO_ML[info.unidad];
    } else {
      const u = info.unidad || 'und';
      group.otherTotalsByUnit[u] = (group.otherTotalsByUnit[u] || 0) + info.totalNeto;
    }
  }

  return Array.from(groups.values()).map((g) => {
    const totalsParts = [];

    if (g.hasMass) {
      // Si solo usó mg y es menor a 1000 g, mostrar en mg (y equivalencia en g si >= 1000 mg)
      if (g.massUnitsUsed.size === 1 && g.massUnitsUsed.has('mg')) {
        const mg = g.massTotalMg;
        totalsParts.push(
          mg >= 1000
            ? `${formatNumber(mg)} mg (${formatNumber(mg / 1000)} g)`
            : `${formatNumber(mg)} mg`
        );
      } else if (g.massTotalMg >= 1000000) {
        const kg = g.massTotalMg / 1000000;
        const gVal = g.massTotalMg / 1000;
        totalsParts.push(`${formatNumber(kg)} kg (${formatNumber(gVal)} g)`);
      } else if (g.massTotalMg >= 1000) {
        const gVal = g.massTotalMg / 1000;
        totalsParts.push(`${formatNumber(gVal)} g`);
      } else {
        totalsParts.push(`${formatNumber(g.massTotalMg)} mg`);
      }
    }

    if (g.hasVolume) {
      if (g.volumeUnitsUsed.size === 1 && g.volumeUnitsUsed.has('mL')) {
        const ml = g.volumeTotalMl;
        totalsParts.push(
          ml >= 1000
            ? `${formatNumber(ml)} mL (${formatNumber(ml / 1000)} L)`
            : `${formatNumber(ml)} mL`
        );
      } else if (g.volumeTotalMl >= 1000) {
        const lVal = g.volumeTotalMl / 1000;
        const mlVal = g.volumeTotalMl;
        totalsParts.push(`${formatNumber(lVal)} L (${formatNumber(mlVal)} mL)`);
      } else {
        totalsParts.push(`${formatNumber(g.volumeTotalMl)} mL`);
      }
    }

    for (const [unit, sumVal] of Object.entries(g.otherTotalsByUnit)) {
      totalsParts.push(`${formatNumber(sumVal)} ${unit}`);
    }

    return {
      ...g,
      ambientes: Array.from(g.ambientesSet).join(', ') || 'No asignado',
      desgloseTexto: g.desglosePresentaciones.join(' + '),
      cantidadTotalConsolidada: totalsParts.join(' | ') || `${g.totalEnvases} und`,
    };
  });
}
