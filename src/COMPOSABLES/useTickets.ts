import { useState, useCallback, useEffect } from 'react';
import { 
  ticketService, 
  type CreateTicketInput, 
  type UpdateTicketInput, 
  type TicketFilterParams 
} from '../SERVICES/ticketService';
import type { Ticket } from '../COMPONENTES/EDITMODAL/types';

interface UseTicketsOptions {
  autoFetch?: boolean;
  initialFilters?: TicketFilterParams;
}

export function useTickets(options: UseTicketsOptions = { autoFetch: true }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TicketFilterParams | undefined>(options.initialFilters);

  const fetchTickets = useCallback(async (params?: TicketFilterParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketService.getTickets(params ?? filters);
      setTickets(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al obtener tickets';
      setError(msg);
      console.error('Error fetching tickets:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (options.autoFetch) {
      fetchTickets();
    }
  }, [fetchTickets, options.autoFetch]);

  const createTicket = useCallback(async (input: CreateTicketInput): Promise<Ticket> => {
    setIsLoading(true);
    setError(null);
    try {
      const nuevoTicket = await ticketService.createTicket(input);
      setTickets((prev) => [nuevoTicket, ...prev]);
      return nuevoTicket;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al crear ticket';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTicket = useCallback(async (id: string | number, input: UpdateTicketInput): Promise<Ticket> => {
    setIsLoading(true);
    setError(null);
    try {
      const actualizado = await ticketService.updateTicket(id, input);
      setTickets((prev) => prev.map((t) => (t.id === id ? actualizado : t)));
      return actualizado;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al actualizar ticket';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTicket = useCallback(async (id: string | number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await ticketService.deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al eliminar ticket';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    tickets,
    isLoading,
    error,
    filters,
    setFilters,
    fetchTickets,
    refreshTickets: fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket
  };
}
