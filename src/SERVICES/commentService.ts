import { api } from './api';
import type { 
  TicketComment, 
  CommentCreatePayload, 
  CommentCountResponse, 
  CommentFilters 
} from '../TYPES';

export const commentService = {
  /**
   * Obtiene la lista de comentarios paginados de un ticket.
   */
  getComments: async (
    ticketId: string | number,
    filters?: CommentFilters
  ): Promise<TicketComment[]> => {
    const response = await api.get<TicketComment[]>(`/tickets/${ticketId}/comments`, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Obtiene el conteo total de comentarios de un ticket de forma ultrarrápida.
   */
  getCommentsCount: async (
    ticketId: string | number,
    filters?: CommentFilters
  ): Promise<number> => {
    const response = await api.get<CommentCountResponse>(`/tickets/${ticketId}/comments/count`, {
      params: filters,
    });
    return response.data.total;
  },

  /**
   * Publica un nuevo comentario en el ticket.
   */
  createComment: async (
    ticketId: string | number,
    payload: CommentCreatePayload
  ): Promise<TicketComment> => {
    const response = await api.post<TicketComment>(
      `/tickets/${ticketId}/comments`,
      payload
    );
    return response.data;
  },

  /**
   * Elimina un comentario por ID.
   */
  deleteComment: async (
    ticketId: string | number,
    commentId: string
  ): Promise<void> => {
    await api.delete(`/tickets/${ticketId}/comments/${commentId}`);
  },
};

export default commentService;
