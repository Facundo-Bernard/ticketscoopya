import { api, getFileUrl } from './api';
import type {
  AccessCodeItem,
  RequesterTicket,
  RequesterTicketsSession,
} from '../TYPES';

interface BackendRequesterTicket {
  id: string;
  identificador: string;
  titulo: string;
  descripcion: string;
  estado: string;
  imagenes?: string[];
  fecha_creacion: string;
  fecha_edicion?: string | null;
}

interface BackendRequesterSession {
  linked_email: string | null;
  local_tickets_count: number;
  items: BackendRequesterTicket[];
}

interface BackendAccessCodeItem {
  id: string;
  correo: string;
  codigo: string;
  estado: AccessCodeItem['estado'];
  solicitado_por: AccessCodeItem['solicitadoPor'];
  generado_por?: string | null;
  creado_en: string;
  expira_en: string;
  usado_en?: string | null;
}

export function mapBackendToRequesterTicket(raw: BackendRequesterTicket): RequesterTicket {
  return {
    id: String(raw.id),
    identificador: raw.identificador || '',
    titulo: raw.titulo || '',
    descripcion: raw.descripcion || '',
    estado: raw.estado || 'abierto',
    imagenes: (raw.imagenes || []).map(getFileUrl),
    fechaCreacion: raw.fecha_creacion,
    fechaModificacion: raw.fecha_edicion || raw.fecha_creacion,
  };
}

function mapSessionResponse(raw: BackendRequesterSession): RequesterTicketsSession {
  return {
    linkedEmail: raw.linked_email,
    localTicketsCount: raw.local_tickets_count || 0,
    items: (raw.items || []).map(mapBackendToRequesterTicket),
  };
}

function mapAccessCode(raw: BackendAccessCodeItem): AccessCodeItem {
  return {
    id: String(raw.id),
    correo: raw.correo,
    codigo: raw.codigo,
    estado: raw.estado,
    solicitadoPor: raw.solicitado_por,
    generadoPor: raw.generado_por ?? null,
    creadoEn: raw.creado_en,
    expiraEn: raw.expira_en,
    usadoEn: raw.usado_en ?? null,
  };
}

export const requesterService = {
  async getMyTickets(): Promise<RequesterTicketsSession> {
    const response = await api.get<BackendRequesterSession>('/requester/tickets');
    return mapSessionResponse(response.data);
  },

  async requestAccessCode(correo: string): Promise<{ message: string; expira_en: string }> {
    const response = await api.post<{ message: string; expira_en: string }>(
      '/requester/request-code',
      { correo: correo.trim().toLowerCase() },
    );
    return response.data;
  },

  async verifyAccessCode(correo: string, codigo: string): Promise<RequesterTicketsSession> {
    const response = await api.post<BackendRequesterSession>('/requester/verify-code', {
      correo: correo.trim().toLowerCase(),
      codigo: codigo.trim(),
    });
    return mapSessionResponse(response.data);
  },

  async unlinkHistory(): Promise<void> {
    await api.post('/requester/logout');
  },

  async listAccessCodes(q?: string): Promise<AccessCodeItem[]> {
    const params = q && q.trim() ? { q: q.trim() } : undefined;
    const response = await api.get<BackendAccessCodeItem[]>('/requester/codes', { params });
    return response.data.map(mapAccessCode);
  },

  async generateAccessCode(correo: string): Promise<AccessCodeItem> {
    const response = await api.post<BackendAccessCodeItem>('/requester/codes', {
      correo: correo.trim().toLowerCase(),
    });
    return mapAccessCode(response.data);
  },

  async revokeAccessCode(codeId: string): Promise<void> {
    await api.delete(`/requester/codes/${codeId}`);
  },
};

export default requesterService;
