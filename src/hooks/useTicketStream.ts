import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../REDUX/store';
import { addTicketFromStream } from '../REDUX/ticketsSlice';
import { mapBackendToFrontendTicket } from '../SERVICES/ticketService';
import { API_BASE_URL } from '../SERVICES/api';

/**
 * Hook para escuchar tickets creados en tiempo real mediante Server-Sent Events (SSE)
 * e integrarlos inmediatamente en Redux y en notificaciones nativas de escritorio.
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

    const handleTicketEvent = (event: MessageEvent) => {
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
        console.error('Error procesando evento SSE de ticket:', err);
      }
    };

    // Escuchamos el evento específico 'nuevo_ticket' que emite el backend y 'message' por compatibilidad
    eventSource.addEventListener('nuevo_ticket', handleTicketEvent as EventListener);
    eventSource.addEventListener('ticket_creado', handleTicketEvent as EventListener);
    eventSource.addEventListener('message', handleTicketEvent as EventListener);
    eventSource.onmessage = handleTicketEvent;

    eventSource.onerror = (err) => {
      console.warn('Conexión SSE interrumpida. EventSource reconectará automáticamente.', err);
    };

    // 3. Limpieza al desmontar
    return () => {
      eventSource.removeEventListener('nuevo_ticket', handleTicketEvent as EventListener);
      eventSource.removeEventListener('ticket_creado', handleTicketEvent as EventListener);
      eventSource.removeEventListener('message', handleTicketEvent as EventListener);
      eventSource.close();
    };
  }, [dispatch]);
}

export default useTicketStream;
