import { api, getFileUrl } from './api';
import type { Ticket } from '../COMPONENTES/EDITMODAL/types';

export interface BackendTicketResponse {
  id: string;
  identificador: string;
  titulo: string;
  descripcion: string;
  correo: string;
  prioridad: string;
  estado: string;
  asignar?: string | null;
  imagenes: string[];
  fecha_creacion: string;
  fecha_edicion?: string | null;
  frecuencia?: any;
}

export interface TicketFilterParams {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: string;
  prioridad?: string;
  asignar?: string;
  skip?: number;
  limit?: number;
}

export interface CreateTicketInput {
  titulo: string;
  descripcion: string;
  correo: string;
  prioridad?: string;
  asignar?: string;
  files?: File[];
  frecuencia?: any;
}

export interface UpdateTicketInput {
  titulo?: string;
  descripcion?: string;
  estado?: string;
  prioridad?: string;
  colaborador?: string;
  asignar?: string;
  frecuencia?: any;
}

// Mapper de Backend (snake_case) a Frontend (camelCase)
export const mapBackendToFrontendTicket = (raw: BackendTicketResponse): Ticket => {
  return {
    id: raw.id,
    identificador: raw.identificador,
    titulo: raw.titulo || '',
    descripcion: raw.descripcion || '',
    estado: raw.estado || 'abierto',
    prioridad: raw.prioridad || 'media',
    colaborador: raw.asignar || '',
    creadoPor: raw.correo || '',
    correo: raw.correo || '',
    imagenes: (raw.imagenes || []).map(getFileUrl),
    fechaCreacion: raw.fecha_creacion,
    fechaModificacion: raw.fecha_edicion || raw.fecha_creacion,
    fechaCierre: raw.estado === 'cerrado' || raw.estado === 'resuelto' ? (raw.fecha_edicion || null) : null,
    frecuencia: raw.frecuencia
  };
};

export const ticketService = {
  // Obtener lista de tickets con filtros opcionales
  async getTickets(params?: TicketFilterParams): Promise<Ticket[]> {
    const response = await api.get<BackendTicketResponse[]>('/tickets/', { params });
    return response.data.map(mapBackendToFrontendTicket);
  },

  // Obtener un ticket puntual por ID
  async getTicketById(id: string | number): Promise<Ticket> {
    const response = await api.get<BackendTicketResponse>(`/tickets/${id}`);
    return mapBackendToFrontendTicket(response.data);
  },

  // Crear nuevo ticket con soporte multipart/form-data
  async createTicket(input: CreateTicketInput): Promise<Ticket> {
    const formData = new FormData();
    formData.append('titulo', input.titulo);
    formData.append('descripcion', input.descripcion);
    formData.append('correo', input.correo);

    if (input.prioridad) {
      formData.append('prioridad', input.prioridad.toLowerCase());
    }
    if (input.asignar) {
      formData.append('asignar', input.asignar);
    }
    if (input.files && input.files.length > 0) {
      input.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await api.post<BackendTicketResponse>('/tickets/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return mapBackendToFrontendTicket(response.data);
  },

  // Actualizar parcialmente campos del ticket (PATCH)
  async updateTicket(id: string | number, input: UpdateTicketInput): Promise<Ticket> {
    const payload: Record<string, any> = {};

    if (input.titulo !== undefined) payload.titulo = input.titulo;
    if (input.descripcion !== undefined) payload.descripcion = input.descripcion;
    if (input.estado !== undefined) payload.estado = input.estado.toLowerCase();
    if (input.prioridad !== undefined) payload.prioridad = input.prioridad.toLowerCase();
    if (input.colaborador !== undefined) payload.asignar = input.colaborador;
    if (input.asignar !== undefined) payload.asignar = input.asignar;
    if (input.frecuencia !== undefined) payload.frecuencia = input.frecuencia;

    const response = await api.patch<BackendTicketResponse>(`/tickets/${id}`, payload);
    return mapBackendToFrontendTicket(response.data);
  },

  // Eliminar un ticket completo
  async deleteTicket(id: string | number): Promise<void> {
    await api.delete(`/tickets/${id}`);
  },

  // Eliminar una imagen específica de un ticket
  async deleteTicketImage(ticketId: string | number, fileId: string): Promise<void> {
    await api.delete(`/tickets/${ticketId}/images/${fileId}`);
  }
};
