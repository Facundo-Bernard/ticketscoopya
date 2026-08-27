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
}
