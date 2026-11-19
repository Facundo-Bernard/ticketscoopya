import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../SERVICES/api';
import { clearClientEmail, setClientEmail } from '../UTILS/storageUtils';
import {
  mapBackendToRequesterTicket,
  requesterService,
} from '../SERVICES/requesterService';
import type { RequesterTicket } from '../TYPES';

const HIDDEN_RESYNC_THRESHOLD_MS = 10_000;

function extractErrorMessage(err: unknown, fallback: string): string {
  const axiosErr = err as {
    response?: { data?: { message?: string; detail?: string } };
    message?: string;
  };
  return (
    axiosErr?.response?.data?.message ||
    axiosErr?.response?.data?.detail ||
    axiosErr?.message ||
    fallback
  );
}

export function useRequesterTickets() {
  const [tickets, setTickets] = useState<RequesterTicket[]>([]);
  const [linkedEmail, setLinkedEmail] = useState<string | null>(null);
  const [localTicketsCount, setLocalTicketsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [streamVersion, setStreamVersion] = useState<number>(0);
  const hiddenSinceRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await requesterService.getMyTickets();
      setTickets(data.items);
      setLinkedEmail(data.linkedEmail);
      if (data.linkedEmail) {
        setClientEmail(data.linkedEmail);
      }
      setLocalTicketsCount(data.localTicketsCount);
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudieron cargar tus solicitudes.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reconnectStream = useCallback(() => {
    setStreamVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(async () => {
      if (active) {
        await refresh();
      }
    });
    return () => {
      active = false;
    };
  }, [refresh]);

  useEffect(() => {
    const streamUrl = `${API_BASE_URL}/requester/stream`;
    let eventSource: EventSource | null = null;
    let hasConnectedOnce = false;

    const handleNewOrUpdate = (event: MessageEvent) => {
      try {
        if (!event.data || event.data.trim() === '' || event.data.trim() === 'ping') {
          return;
        }
        const raw = JSON.parse(event.data);
        const mapped = mapBackendToRequesterTicket(raw);
        setTickets((prev) => {
          const exists = prev.some((item) => item.id === mapped.id);
          if (exists) {
            return prev.map((item) => (item.id === mapped.id ? mapped : item));
          }
          return [mapped, ...prev];
        });
      } catch (err) {
        console.error('Error procesando SSE de solicitante:', err);
      }
    };

    const handleDeleted = (event: MessageEvent) => {
      try {
        if (!event.data || event.data.trim() === '' || event.data.trim() === 'ping') {
          return;
        }
        const raw = JSON.parse(event.data);
        const ticketId = String(raw.id || '');
        if (!ticketId) return;
        setTickets((prev) => prev.filter((item) => item.id !== ticketId));
      } catch (err) {
        console.error('Error procesando SSE ticket_eliminado de solicitante:', err);
      }
    };

    const closeStream = () => {
      if (!eventSource) return;
      eventSource.removeEventListener('nuevo_ticket', handleNewOrUpdate as EventListener);
      eventSource.removeEventListener('ticket_actualizado', handleNewOrUpdate as EventListener);
      eventSource.removeEventListener('ticket_eliminado', handleDeleted as EventListener);
      eventSource.close();
      eventSource = null;
    };

    const connectStream = () => {
      closeStream();
      const es = new EventSource(streamUrl, { withCredentials: true });
      eventSource = es;

      es.addEventListener('nuevo_ticket', handleNewOrUpdate as EventListener);
      es.addEventListener('ticket_actualizado', handleNewOrUpdate as EventListener);
      es.addEventListener('ticket_eliminado', handleDeleted as EventListener);

      es.onopen = () => {
        if (hasConnectedOnce) {
          void refresh();
        }
        hasConnectedOnce = true;
      };
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenSinceRef.current = Date.now();
        return;
      }
      const wasHiddenMs = hiddenSinceRef.current ? Date.now() - hiddenSinceRef.current : 0;
      hiddenSinceRef.current = null;

      if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
        connectStream();
        void refresh();
      } else if (wasHiddenMs >= HIDDEN_RESYNC_THRESHOLD_MS) {
        void refresh();
      }
    };

    const handleOnline = () => {
      if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
        connectStream();
      }
      void refresh();
    };

    let lastFocusSyncAt = Date.now();
    const handleFocus = () => {
      if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
        connectStream();
        void refresh();
        lastFocusSyncAt = Date.now();
      } else if (Date.now() - lastFocusSyncAt >= HIDDEN_RESYNC_THRESHOLD_MS) {
        void refresh();
        lastFocusSyncAt = Date.now();
      }
    };

    connectStream();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('focus', handleFocus);
      closeStream();
    };
  }, [refresh, streamVersion]);

  const requestCode = useCallback(async (correo: string) => {
    return await requesterService.requestAccessCode(correo);
  }, []);

  const verifyCode = useCallback(async (correo: string, codigo: string) => {
    const data = await requesterService.verifyAccessCode(correo, codigo);
    setTickets(data.items);
    setLinkedEmail(data.linkedEmail);
    if (data.linkedEmail) {
      setClientEmail(data.linkedEmail);
    }
    setLocalTicketsCount(data.localTicketsCount);
    reconnectStream();
    return data;
  }, [reconnectStream]);

  const unlinkHistory = useCallback(async () => {
    await requesterService.unlinkHistory();
    clearClientEmail();
    setLinkedEmail(null);
    await refresh();
    reconnectStream();
  }, [refresh, reconnectStream]);

  return {
    tickets,
    linkedEmail,
    localTicketsCount,
    isLoading,
    error,
    refresh,
    reconnectStream,
    requestCode,
    verifyCode,
    unlinkHistory,
  };
}

export default useRequesterTickets;
