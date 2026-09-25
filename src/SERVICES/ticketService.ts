import { api, getFileUrl } from './api';
import type { CreateTicketInput, Ticket } from '../TYPES';

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
  leido?: boolean;
  columna?: number | string;
  column_id?: number | string;
  columnId?: number | string;
}

export interface TicketFilterParams {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: string;
  prioridad?: string;
  asignar?: string;
  columna?: number;
  leido?: boolean;
  q?: string;
  incluir_resueltos?: boolean;
  skip?: number;
  limit?: number;
}

/** Respuesta paginada devuelta por GET /tickets/ */
export interface TicketPagedResponse {
  total: number;
  skip: number;
  limit: number;
  items: Ticket[];
}

export interface UpdateTicketInput {
  titulo?: string;
  descripcion?: string;
  estado?: string;
  prioridad?: string;
  colaborador?: string;
  asignar?: string;
  frecuencia?: any;
  columnId?: number | string;
  columna?: number | string;
}

export interface TicketImageChanges {
  newFiles: File[];
  removedFileIds: string[];
}

// Mapper de Backend (snake_case) a Frontend (camelCase)
export const mapBackendToFrontendTicket = (raw: BackendTicketResponse): Ticket => {
  const rawCol = raw.columna ?? raw.column_id ?? raw.columnId;
  const parsedCol =
    rawCol !== undefined && rawCol !== null
      ? (typeof rawCol === 'number' ? rawCol : isNaN(Number(rawCol)) ? rawCol : Number(rawCol))
      : undefined;

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
    frecuencia: raw.frecuencia,
    leido: raw.leido !== undefined ? Boolean(raw.leido) : true,
    columnId: parsedCol,
    columna: parsedCol,
  };
};

export const ticketService = {
  // Obtener lista de tickets con filtros (devuelve respuesta paginada)
  async getTicketsPaged(params?: TicketFilterParams): Promise<TicketPagedResponse> {
    const response = await api.get<{ total: number; skip: number; limit: number; items: any[] }>('/tickets/', { params });
    const data = response.data;
    return {
      total: data.total,
      skip: data.skip,
      limit: data.limit,
      items: data.items.map(mapBackendToFrontendTicket),
    };
  },

  // Compatibilidad: obtener solo la lista de items
  async getTickets(params?: TicketFilterParams): Promise<Ticket[]> {
    const paged = await ticketService.getTicketsPaged(params);
    return paged.items;
  },

  // Obtener un ticket puntual por ID
  async getTicketById(id: string | number): Promise<Ticket> {
    const response = await api.get<BackendTicketResponse>(`/tickets/${id}`);
    return mapBackendToFrontendTicket(response.data);
  },

  // Marcar ticket como leído en el backend
  async markAsRead(id: string | number): Promise<Ticket> {
    const response = await api.patch<BackendTicketResponse>(`/tickets/${id}/read`);
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
    if (input.columnId !== undefined || input.columna !== undefined) {
      const col = input.columnId ?? input.columna;
      formData.append('columna', String(col));
    }
    if (input.files && input.files.length > 0) {
      input.files.forEach((file) => {
        formData.append('files', file);
      });
    }
    if (input.frecuencia && input.frecuencia.periodo && input.frecuencia.periodo !== 'No recurrente') {
      const frecuenciaPayload = {
        numero: Number(input.frecuencia.numero) || 1,
        periodo: input.frecuencia.periodo,
      };
      formData.append('frecuencia', JSON.stringify(frecuenciaPayload));
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
    if (input.frecuencia !== undefined) {
      if (input.frecuencia && input.frecuencia.periodo && input.frecuencia.periodo !== 'No recurrente') {
        payload.frecuencia = {
          numero: Number(input.frecuencia.numero) || 1,
          periodo: input.frecuencia.periodo,
        };
      } else {
        payload.frecuencia = null;
      }
    }
    if (input.columnId !== undefined || input.columna !== undefined) {
      const col = input.columnId ?? input.columna;
      const numCol = typeof col === 'number' ? col : isNaN(Number(col)) ? col : Number(col);
      payload.columna = numCol;
      payload.columnId = numCol;
    }

    const response = await api.patch<BackendTicketResponse>(`/tickets/${id}`, payload);
    return mapBackendToFrontendTicket(response.data);
  },

  // Adjuntar imágenes a un ticket existente mediante el endpoint multipart dedicado.
  async uploadTicketImages(ticketId: string | number, files: File[]): Promise<Ticket> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await api.post<BackendTicketResponse>(
      `/tickets/${ticketId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return mapBackendToFrontendTicket(response.data);
  },

  // Eliminar un ticket completo
  async deleteTicket(id: string | number): Promise<void> {
    await api.delete(`/tickets/${id}`);
  },

  // Eliminar una imagen específica de un ticket
  async deleteTicketImage(ticketId: string | number, fileId: string): Promise<Ticket> {
    const response = await api.delete<BackendTicketResponse>(`/tickets/${ticketId}/images/${fileId}`);
    return mapBackendToFrontendTicket(response.data);
  },

  // Bloquear ticket para edición exclusiva (concurrencia)
  async lockTicket(id: string | number, usuario: string): Promise<{ status: string; ticket_id: string; usuario: string; expira_en_segundos: number }> {
    const response = await api.post(`/tickets/${id}/bloquear`, { usuario });
    return response.data;
  },

  // Liberar bloqueo de edición de un ticket
  async unlockTicket(id: string | number, usuario?: string): Promise<{ status: string; ticket_id: string }> {
    const response = await api.post(`/tickets/${id}/desbloquear`, usuario ? { usuario } : {});
    return response.data;
  },

  // Consultar estado de bloqueo de un ticket
  async getLockStatus(id: string | number): Promise<{ bloqueado: boolean; usuario?: string; expira_en?: string }> {
    const response = await api.get(`/tickets/${id}/bloqueo`);
    return response.data;
  }
};
