import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../REDUX/store';
import {
  addTicketFromStream,
  updateTicketFromStream,
  removeTicketFromStream,
  setTicketLock,
  clearTicketLock,
  markTicketAsDeleting,
} from '../REDUX/ticketsSlice';
import { mapBackendToFrontendTicket } from '../SERVICES/ticketService';
import { api, API_BASE_URL } from '../SERVICES/api';
import type { Ticket } from '../TYPES';

export interface UseTicketStreamOptions {
  onResync?: () => void;
  onTicketEvent?: (kind: 'created' | 'updated', ticket: Ticket) => void;
}

const HIDDEN_RESYNC_THRESHOLD_MS = 10_000;
const AUTH_CHECK_THROTTLE_MS = 15_000;

/**
 * Hook para escuchar tickets en tiempo real mediante Server-Sent Events (SSE):
 * - Resincroniza automáticamente al reconectar, al volver a la pestaña tras >10s inactiva o al recuperar conexión.
 * - Detecta sesiones expiradas (401) en errores SSE para redirigir a /login.
 */
export function useTicketStream(options?: UseTicketStreamOptions): void {
  const dispatch = useDispatch<AppDispatch>();
  const onResyncRef = useRef(options?.onResync);
  const onTicketEventRef = useRef(options?.onTicketEvent);

  useEffect(() => {
    onResyncRef.current = options?.onResync;
    onTicketEventRef.current = options?.onTicketEvent;
  }, [options?.onResync, options?.onTicketEvent]);

  useEffect(() => {
    // Seguridad: jamás activar stream ni pedir notificaciones en el portal de usuarios finales
    if (typeof window !== 'undefined' && window.location.pathname.includes('usuario')) {
      return;
    }

    const streamUrl = `${API_BASE_URL}/tickets/stream`;
    let eventSource: EventSource | null = null;
    let hasConnectedOnce = false;
    let hiddenSince: number | null = null;
    let lastAuthCheckAt = 0;

    const handleNuevoTicket = (event: MessageEvent) => {
      try {
        if (!event.data || event.data.trim() === '' || event.data.trim() === 'ping') {
          return;
        }
        const rawData = JSON.parse(event.data);
        const ticket = mapBackendToFrontendTicket(rawData);
        dispatch(addTicketFromStream(ticket));
        onTicketEventRef.current?.('created', ticket);
      } catch (err) {
        console.error('Error procesando evento SSE nuevo_ticket:', err);
      }
    };

    const handleTicketActualizado = (event: MessageEvent) => {
      try {
        if (!event.data || event.data.trim() === '' || event.data.trim() === 'ping') return;
        const rawData = JSON.parse(event.data);
        const ticket = mapBackendToFrontendTicket(rawData);
        dispatch(updateTicketFromStream(ticket));
        onTicketEventRef.current?.('updated', ticket);
      } catch (err) {
        console.error('Error procesando evento SSE ticket_actualizado:', err);
      }
    };

    const handleTicketEliminado = (event: MessageEvent) => {
      try {
        if (!event.data || event.data.trim() === '' || event.data.trim() === 'ping') return;
        const rawData = JSON.parse(event.data);
        const ticketId = rawData.id || rawData.ticket_id;
        if (ticketId) {
          dispatch(markTicketAsDeleting(ticketId));
          setTimeout(() => {
            dispatch(removeTicketFromStream({ id: ticketId }));
            window.dispatchEvent(
              new CustomEvent('tickets:deleted_from_stream', {
                detail: { ticketId: String(ticketId) },
              }),
            );
          }, 400);
        }
      } catch (err) {
        console.error('Error procesando evento SSE ticket_eliminado:', err);
      }
    };

    const handleTicketBloqueado = (event: MessageEvent) => {
      try {
        if (!event.data || event.data.trim() === '' || event.data.trim() === 'ping') return;
        const rawData = JSON.parse(event.data);
        if (rawData.ticket_id) {
          dispatch(setTicketLock({
            ticketId: String(rawData.ticket_id),
            identificador: rawData.identificador,
            usuario: rawData.usuario,
            expiraEnSegundos: rawData.expira_en_segundos,
          }));
        }
      } catch (err) {
        console.error('Error procesando evento SSE ticket_bloqueado:', err);
      }
    };

    const handleTicketDesbloqueado = (event: MessageEvent) => {
      try {
        if (!event.data || event.data.trim() === '' || event.data.trim() === 'ping') return;
        const rawData = JSON.parse(event.data);
        const ticketId = rawData.ticket_id || rawData.id;
        if (ticketId) {
          dispatch(clearTicketLock({ ticketId }));
        }
      } catch (err) {
        console.error('Error procesando evento SSE ticket_desbloqueado:', err);
      }
    };

    const handleNuevoComentario = (event: MessageEvent) => {
      try {
        if (!event.data || event.data.trim() === '' || event.data.trim() === 'ping') return;
        const rawData = JSON.parse(event.data);
        const ticketId = rawData.ticket_id || rawData.ticketId;
        const comentario = rawData.comentario || rawData;
        if (ticketId && comentario) {
          window.dispatchEvent(
            new CustomEvent('sse:nuevo_comentario', {
              detail: { ticket_id: String(ticketId), comentario },
            }),
          );
        }
      } catch (err) {
        console.error('Error procesando evento SSE nuevo_comentario:', err);
      }
    };

    const handleComentarioEliminado = (event: MessageEvent) => {
      try {
        if (!event.data || event.data.trim() === '' || event.data.trim() === 'ping') return;
        const rawData = JSON.parse(event.data);
        const ticketId = rawData.ticket_id || rawData.ticketId;
        const commentId = rawData.comment_id || rawData.commentId || rawData.id;
        if (ticketId && commentId) {
          window.dispatchEvent(
            new CustomEvent('sse:comentario_eliminado', {
              detail: { ticket_id: String(ticketId), comment_id: String(commentId) },
            }),
          );
        }
      } catch (err) {
        console.error('Error procesando evento SSE comentario_eliminado:', err);
      }
    };

    const handleCodigoAccesoActualizado = (event: MessageEvent) => {
      try {
        if (!event.data || event.data.trim() === '' || event.data.trim() === 'ping') return;
        const rawData = JSON.parse(event.data);
        window.dispatchEvent(
          new CustomEvent('tickets:requester_code_updated', {
            detail: rawData,
          }),
        );
      } catch (err) {
        console.error('Error procesando evento SSE codigo_acceso_actualizado:', err);
      }
    };

    const closeStream = () => {
      if (!eventSource) return;
      eventSource.removeEventListener('nuevo_ticket', handleNuevoTicket as EventListener);
      eventSource.removeEventListener('ticket_creado', handleNuevoTicket as EventListener);
      eventSource.removeEventListener('ticket_actualizado', handleTicketActualizado as EventListener);
      eventSource.removeEventListener('ticket_eliminado', handleTicketEliminado as EventListener);
      eventSource.removeEventListener('ticket_bloqueado', handleTicketBloqueado as EventListener);
      eventSource.removeEventListener('ticket_desbloqueado', handleTicketDesbloqueado as EventListener);
      eventSource.removeEventListener('nuevo_comentario', handleNuevoComentario as EventListener);
      eventSource.removeEventListener('comentario_eliminado', handleComentarioEliminado as EventListener);
      eventSource.removeEventListener('codigo_acceso_actualizado', handleCodigoAccesoActualizado as EventListener);
      eventSource.close();
      eventSource = null;
    };

    const connectStream = () => {
      closeStream();
      const es = new EventSource(streamUrl, { withCredentials: true });
      eventSource = es;

      es.addEventListener('nuevo_ticket', handleNuevoTicket as EventListener);
      es.addEventListener('ticket_creado', handleNuevoTicket as EventListener);
      es.onmessage = handleNuevoTicket;
      es.addEventListener('ticket_actualizado', handleTicketActualizado as EventListener);
      es.addEventListener('ticket_eliminado', handleTicketEliminado as EventListener);
      es.addEventListener('ticket_bloqueado', handleTicketBloqueado as EventListener);
      es.addEventListener('ticket_desbloqueado', handleTicketDesbloqueado as EventListener);
      es.addEventListener('nuevo_comentario', handleNuevoComentario as EventListener);
      es.addEventListener('comentario_eliminado', handleComentarioEliminado as EventListener);
      es.addEventListener('codigo_acceso_actualizado', handleCodigoAccesoActualizado as EventListener);

      es.onopen = () => {
        if (hasConnectedOnce) {
          onResyncRef.current?.();
        }
        hasConnectedOnce = true;
      };

      es.onerror = () => {
        const now = Date.now();
        if (now - lastAuthCheckAt >= AUTH_CHECK_THROTTLE_MS) {
          lastAuthCheckAt = now;
          // Si la sesión expiró, el interceptor de Axios redirige a /login en lugar de quedar en loop
          api.get('/auth/me').catch(() => {});
        }
      };
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenSince = Date.now();
        return;
      }

      const wasHiddenMs = hiddenSince ? Date.now() - hiddenSince : 0;
      hiddenSince = null;

      if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
        connectStream();
        onResyncRef.current?.();
      } else if (wasHiddenMs >= HIDDEN_RESYNC_THRESHOLD_MS) {
        onResyncRef.current?.();
      }
    };

    const handleOnline = () => {
      if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
        connectStream();
      }
      onResyncRef.current?.();
    };

    connectStream();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      closeStream();
    };
  }, [dispatch]);
}

export default useTicketStream;
