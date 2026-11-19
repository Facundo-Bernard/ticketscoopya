import type { Frecuencia, PeriodoFrecuencia } from '../TYPES';

const CREATE_DRAFT_KEY = 'coopya_ticket_create_draft_v1';
const EDIT_DRAFTS_KEY = 'coopya_ticket_edit_drafts_v1';
const VALID_PERIODOS: readonly PeriodoFrecuencia[] = [
  'Días',
  'Semanas',
  'Meses',
  'Años',
  'No recurrente',
];

export interface CreateTicketDraft {
  titulo: string;
  descripcion: string;
  email: string;
  asignar: string;
  prioridad: string;
  columna: number;
  frecuencia?: Frecuencia;
}

export interface EditTicketDraft {
  titulo: string;
  descripcion: string;
  estado: string;
  colaborador: string;
  prioridad: string;
  columnId: number;
  frecuencia?: Frecuencia | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidPeriodo(value: unknown): value is PeriodoFrecuencia {
  return typeof value === 'string' && VALID_PERIODOS.some((p) => p === value);
}

function parseFrecuencia(raw: unknown): Frecuencia | undefined {
  if (!isRecord(raw) || !isValidPeriodo(raw.periodo)) {
    return undefined;
  }
  const num = raw.numero;
  if (num !== '' && (typeof num !== 'number' || !Number.isFinite(num))) {
    return undefined;
  }
  return {
    numero: num,
    periodo: raw.periodo,
  };
}

function parseCreateDraft(raw: unknown): CreateTicketDraft | null {
  if (!isRecord(raw)) return null;
  if (
    typeof raw.titulo !== 'string' ||
    typeof raw.descripcion !== 'string' ||
    typeof raw.email !== 'string' ||
    typeof raw.asignar !== 'string' ||
    typeof raw.prioridad !== 'string' ||
    typeof raw.columna !== 'number' ||
    !Number.isFinite(raw.columna)
  ) {
    return null;
  }

  return {
    titulo: raw.titulo,
    descripcion: raw.descripcion,
    email: raw.email,
    asignar: raw.asignar,
    prioridad: raw.prioridad,
    columna: raw.columna,
    frecuencia: parseFrecuencia(raw.frecuencia),
  };
}

function parseEditDraft(raw: unknown): EditTicketDraft | null {
  if (!isRecord(raw)) return null;
  if (
    typeof raw.titulo !== 'string' ||
    typeof raw.descripcion !== 'string' ||
    typeof raw.estado !== 'string' ||
    typeof raw.colaborador !== 'string' ||
    typeof raw.prioridad !== 'string' ||
    typeof raw.columnId !== 'number' ||
    !Number.isFinite(raw.columnId)
  ) {
    return null;
  }

  return {
    titulo: raw.titulo,
    descripcion: raw.descripcion,
    estado: raw.estado,
    colaborador: raw.colaborador,
    prioridad: raw.prioridad,
    columnId: raw.columnId,
    frecuencia: raw.frecuencia === null ? null : parseFrecuencia(raw.frecuencia),
  };
}

export function loadCreateTicketDraft(): CreateTicketDraft | null {
  try {
    const rawText = localStorage.getItem(CREATE_DRAFT_KEY);
    if (!rawText) return null;
    const parsed: unknown = JSON.parse(rawText);
    return parseCreateDraft(parsed);
  } catch (error) {
    console.warn('No se pudo leer el borrador de creación:', error);
    return null;
  }
}

export function saveCreateTicketDraft(draft: CreateTicketDraft): void {
  try {
    localStorage.setItem(CREATE_DRAFT_KEY, JSON.stringify(draft));
  } catch (error) {
    console.warn('No se pudo guardar el borrador de creación:', error);
  }
}

export function clearCreateTicketDraft(): void {
  try {
    localStorage.removeItem(CREATE_DRAFT_KEY);
  } catch (error) {
    console.warn('No se pudo limpiar el borrador de creación:', error);
  }
}

function readAllEditDrafts(): Record<string, EditTicketDraft> {
  try {
    const rawText = localStorage.getItem(EDIT_DRAFTS_KEY);
    if (!rawText) return {};
    const parsed: unknown = JSON.parse(rawText);
    if (!isRecord(parsed)) return {};

    const result: Record<string, EditTicketDraft> = {};
    for (const [key, val] of Object.entries(parsed)) {
      const valid = parseEditDraft(val);
      if (valid) {
        result[key] = valid;
      }
    }
    return result;
  } catch (error) {
    console.warn('No se pudo leer los borradores de edición:', error);
    return {};
  }
}

export function loadEditTicketDraft(ticketId: string | number): EditTicketDraft | null {
  const all = readAllEditDrafts();
  return all[String(ticketId)] ?? null;
}

export function saveEditTicketDraft(ticketId: string | number, draft: EditTicketDraft): void {
  try {
    const all = readAllEditDrafts();
    all[String(ticketId)] = draft;
    localStorage.setItem(EDIT_DRAFTS_KEY, JSON.stringify(all));
  } catch (error) {
    console.warn('No se pudo guardar el borrador de edición:', error);
  }
}

export function clearEditTicketDraft(ticketId: string | number): void {
  try {
    const all = readAllEditDrafts();
    const key = String(ticketId);
    if (!(key in all)) return;
    delete all[key];
    if (Object.keys(all).length === 0) {
      localStorage.removeItem(EDIT_DRAFTS_KEY);
    } else {
      localStorage.setItem(EDIT_DRAFTS_KEY, JSON.stringify(all));
    }
  } catch (error) {
    console.warn('No se pudo limpiar el borrador de edición:', error);
  }
}
