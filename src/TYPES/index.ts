export type PeriodoFrecuencia = 'Días' | 'Semanas' | 'Meses' | 'Años' | 'No recurrente';

export interface Frecuencia {
  numero: number | '';
  periodo: PeriodoFrecuencia;
}

export interface Ticket {
  id: string | number;
  identificador?: string;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  colaborador: string;
  creadoPor: string;
  correo?: string;
  imagenes: string[];
  fechaCreacion: string;
  fechaModificacion: string;
  fechaCierre: string | null;
  leido?: boolean;
  frecuencia?: Frecuencia | null;
  columnId?: number | string;
  columna?: number | string;
}

export interface ColumnOption {
  id: number;
  title: string;
  label: string;
}

export const TICKET_COLUMNS: ColumnOption[] = [
  { id: 1, title: 'TICKET', label: 'Ticket' },
  { id: 2, title: 'HITOS', label: 'Hitos' },
  { id: 3, title: 'TAREAS', label: 'Tareas' },
  { id: 4, title: 'TAREAS PERIÓDICAS', label: 'Tareas periódicas' },
];

export interface OptionItem {
  value: string;
  label: string;
}

export interface TicketLock {
  ticketId: string;
  identificador?: string;
  usuario: string;
  expiraEnSegundos?: number;
}
