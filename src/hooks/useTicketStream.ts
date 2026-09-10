import { useEffect } from 'react';
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
import { API_BASE_URL } from '../SERVICES/api';

/**
 * Hook para escuchar tickets en tiempo real mediante Server-Sent Events (SSE):
 * - nuevo_ticket / ticket_creado: inserta el ticket en Redux y emite notificación de escritorio
 * - ticket_actualizado: actualiza en vivo el ticket en Redux (cambio de columna, prioridad, estado, etc.)
 * - ticket_eliminado: remueve el ticket del tablero de todos los operadores
 * - ticket_bloqueado: registra el candado de edición exclusiva de un operador
 * - ticket_desbloqueado: libera el candado de edición
 */
export function useTicketStream(): void {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Seguridad: jamás activar stream ni pedir notificaciones en el portal de usuarios finales
    if (typeof window !== 'undefined' && window.location.pathname.includes('usuario')) {
      return;
    }

    // 1. Solicitar permisos para notificaciones nativas de escritorio si aún no fue definido
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch((err) => {
        console.warn('Permiso de notificaciones denegado o no disponible:', err);
      });
    }

    // 2. Conectar al canal SSE del backend
    const streamUrl = `${API_BASE_URL}/tickets/stream`;
    const eventSource = new EventSource(streamUrl);

    // Handler para nuevo ticket creado
    const handleNuevoTicket = (event: MessageEvent) => {
      try {
        if (!event.data || event.data.trim() === '' || event.data.trim() === 'ping') {
          return;
        }

        const rawData = JSON.parse(event.data);
        const ticket = mapBackendToFrontendTicket(rawData);

        // A. Actualizar estado en el store de Redux
        dispatch(addTicketFromStream(ticket));

        // B. Emitir notificación de escritorio nativa del sistema operativo
        if ('Notification' in window && Notification.permission === 'granted') {
          const title = `🎫 Nuevo Ticket: ${ticket.identificador || `TK-${ticket.id}`}`;
          const body = `${ticket.titulo}\nSolicitado por: ${ticket.correo || ticket.creadoPor || 'Usuario'}`;

          const notification = new Notification(title, {
            body,
            icon: '/favicon.svg',
          });

          notification.onclick = () => {
            window.focus();
          };
        }
      } catch (err) {
        console.error('Error procesando evento SSE nuevo_ticket:', err);
      }
    };

    // Handler para ticket actualizado (edición, cambio de columna, reasignación)
    const handleTicketActualizado = (event: MessageEvent) => {
      try {
        if (!event.data || event.data.trim() === '' || event.data.trim() === 'ping') return;
        const rawData = JSON.parse(event.data);
        const ticket = mapBackendToFrontendTicket(rawData);
        dispatch(updateTicketFromStream(ticket));
      } catch (err) {
        console.error('Error procesando evento SSE ticket_actualizado:', err);
      }
    };

    // Handler para ticket eliminado
    const handleTicketEliminado = (event: MessageEvent) => {
      try {
        if (!event.data || event.data.trim() === '' || event.data.trim() === 'ping') return;
        const rawData = JSON.parse(event.data);
        const ticketId = rawData.id || rawData.ticket_id;
        if (ticketId) {
          dispatch(markTicketAsDeleting(ticketId));
          setTimeout(() => {
            dispatch(removeTicketFromStream({ id: ticketId }));
          }, 400);
        }
      } catch (err) {
        console.error('Error procesando evento SSE ticket_eliminado:', err);
      }
    };

    // Handler para ticket bloqueado (otro operador lo está editando)
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

    // Handler para ticket desbloqueado
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

    // Registro de listeners SSE
    eventSource.addEventListener('nuevo_ticket', handleNuevoTicket as EventListener);
    eventSource.addEventListener('ticket_creado', handleNuevoTicket as EventListener);
    eventSource.addEventListener('message', handleNuevoTicket as EventListener);
    eventSource.onmessage = handleNuevoTicket;

    eventSource.addEventListener('ticket_actualizado', handleTicketActualizado as EventListener);
    eventSource.addEventListener('ticket_eliminado', handleTicketEliminado as EventListener);
    eventSource.addEventListener('ticket_bloqueado', handleTicketBloqueado as EventListener);
    eventSource.addEventListener('ticket_desbloqueado', handleTicketDesbloqueado as EventListener);

    eventSource.onerror = (err) => {
      console.warn('Conexión SSE interrumpida. EventSource reconectará automáticamente.', err);
    };

    // 3. Limpieza al desmontar
    return () => {
      eventSource.removeEventListener('nuevo_ticket', handleNuevoTicket as EventListener);
      eventSource.removeEventListener('ticket_creado', handleNuevoTicket as EventListener);
      eventSource.removeEventListener('message', handleNuevoTicket as EventListener);
      eventSource.removeEventListener('ticket_actualizado', handleTicketActualizado as EventListener);
      eventSource.removeEventListener('ticket_eliminado', handleTicketEliminado as EventListener);
      eventSource.removeEventListener('ticket_bloqueado', handleTicketBloqueado as EventListener);
      eventSource.removeEventListener('ticket_desbloqueado', handleTicketDesbloqueado as EventListener);
      eventSource.close();
    };
  }, [dispatch]);
}

export default useTicketStream;
