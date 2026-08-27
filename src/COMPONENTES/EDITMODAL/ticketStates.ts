/* ---- Las constantes tal vez se tengan que mover para abarcar al sistema de forma
 mas general, ya que se utilizan en el registro del ticket. ---- */

// ---- Estados ----
export const TICKET_STATES: Record<string, string> = {
  PENDIENTE: 'PENDIENTE',
  EN_PROGRESO: 'EN_PROGRESO',
  TERMINADO: 'TERMINADO'
};

export const TICKET_STATE_LABELS: Record<string, string> = {
  [TICKET_STATES.PENDIENTE]: 'Pendiente',
  [TICKET_STATES.EN_PROGRESO]: 'En Progreso',
  [TICKET_STATES.TERMINADO]: 'Terminado'
};

export const TICKET_STATE_COLORS: Record<string, string> = {
  [TICKET_STATES.PENDIENTE]: 'secondary',
  [TICKET_STATES.EN_PROGRESO]: 'primary',
  [TICKET_STATES.TERMINADO]: 'success'
};

export const COLABORADORES: string[] = [
  'Nicolas',
  'Facundo',
  'Nahuel'
];

export const PRIORIDADES: Record<string, string> = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja'
};
