export type PeriodoFrecuencia = 'Días' | 'Semanas' | 'Meses' | 'Años' | 'No recurrente';

export interface Frecuencia {
  numero: number | '';
  periodo: PeriodoFrecuencia;
}

export interface Ticket {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  colaborador: string;
  creadoPor: string;
  imagenes: string[];
  fechaCreacion: string;
  fechaModificacion: string;
  fechaCierre: string | null;
  frecuencia?: Frecuencia;
}
