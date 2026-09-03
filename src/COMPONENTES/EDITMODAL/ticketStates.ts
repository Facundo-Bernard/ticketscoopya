/* ---- Estilos Visuales de Tickets ---- 
   Las colecciones de Estados, Prioridades y Técnicos Asignables 
   han sido deprecadas en favor de los catálogos dinámicos del backend (/api/v1/catalogs).
*/

// Mapeo puramente estético de colores Bootstrap según el estado
export const TICKET_STATE_COLORS: Record<string, string> = {
  abierto: 'info',
  en_progreso: 'warning',
  resuelto: 'success',
  cerrado: 'secondary'
};

// Mapeo puramente estético de colores Bootstrap según la prioridad
export const PRIORIDAD_COLORS: Record<string, string> = {
  baja: 'secondary',
  media: 'info',
  alta: 'warning',
  critica: 'danger'
};

// Períodos de Frecuencia (exclusivo para configuración de recurrencia en EditModal)
export const PERIODOS_FRECUENCIA: string[] = ['No recurrente', 'Días', 'Semanas', 'Meses', 'Años'];

// Helper para formatear valores en caso de que no venga un label explícito
export const formatCatalogLabel = (value: string): string => {
  if (!value) return '';
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
