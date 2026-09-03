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
  frecuencia?: Frecuencia;
}

export interface OptionItem {
  value: string;
  label: string;
}
