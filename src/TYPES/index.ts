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
  colaboradores?: string[];
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

export interface CreateTicketInput {
  titulo: string;
  descripcion: string;
  correo: string;
  prioridad?: string;
  asignar?: string | string[];
  files?: File[];
  frecuencia?: Frecuencia;
  columnId?: number | string;
  columna?: number | string;
  hp_company_field?: string;
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

export function normalizeColaboradores(raw?: string | string[] | null): string[] {
  if (!raw) return [];
  const items: string[] = [];
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      items.push(...normalizeColaboradores(entry));
    }
  } else if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          for (const p of parsed) {
            if (typeof p === 'string') items.push(...normalizeColaboradores(p));
          }
        } else {
          items.push(...trimmed.split(','));
        }
      } catch {
        items.push(...trimmed.split(','));
      }
    } else {
      items.push(...trimmed.split(','));
    }
  }
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const clean = item.trim();
    const key = clean.toLowerCase();
    if (clean && !seen.has(key)) {
      seen.add(key);
      result.push(clean);
    }
  }
  return result;
}

export * from './comment';
