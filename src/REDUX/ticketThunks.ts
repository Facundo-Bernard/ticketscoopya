import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Ticket, TicketLock } from '../TYPES'
import { ticketService } from '../SERVICES/ticketService'

export const messageFromError = (error: unknown): string =>
  error instanceof Error ? error.message : 'No se pudo completar la solicitud.'

/**
 * 1. Obtener todos los tickets
 */
export const fetchTickets = createAsyncThunk<Ticket[], void, { rejectValue: string }>(
  'tickets/fetchTickets',
  async (_, { rejectWithValue }) => {
    try {
      return await ticketService.getTickets()
    } catch (error) {
      return rejectWithValue(messageFromError(error))
    }
  },
)

/**
 * 2. Obtener un ticket por ID
 */
export const fetchTicketById = createAsyncThunk<Ticket, string, { rejectValue: string }>(
  'tickets/fetchTicketById',
  async (ticketId, { rejectWithValue }) => {
    try {
      return await ticketService.getTicketById(ticketId)
    } catch (error) {
      return rejectWithValue(messageFromError(error))
    }
  },
)

/**
 * 3. Guardar cambios en un ticket existente
 */
export const saveTicket = createAsyncThunk<Ticket, Ticket, { rejectValue: string }>(
  'tickets/saveTicket',
  async (ticket, { rejectWithValue }) => {
    try {
      const updatedTicket = await ticketService.updateTicket(ticket.id, {
        titulo: ticket.titulo,
        descripcion: ticket.descripcion,
        estado: ticket.estado,
        prioridad: ticket.prioridad,
        colaborador: ticket.colaborador,
        frecuencia: ticket.frecuencia,
        columnId: ticket.columnId,
        columna: ticket.columna || ticket.columnId,
      })

      return {
        ...updatedTicket,
        columnId: updatedTicket.columnId || ticket.columnId,
      }
    } catch (error) {
      return rejectWithValue(messageFromError(error))
    }
  },
)

/**
 * 4. Eliminar un ticket
 */
export const deleteTicket = createAsyncThunk<string | number, string | number, { rejectValue: string }>(
  'tickets/deleteTicket',
  async (ticketId, { rejectWithValue }) => {
    try {
      await ticketService.deleteTicket(ticketId)
      // Pausa para permitir que la animación CSS de eliminación (400ms) se reproduzca por completo
      await new Promise((resolve) => setTimeout(resolve, 400))
      return ticketId
    } catch (error) {
      return rejectWithValue(messageFromError(error))
    }
  },
)

/**
 * 5. Marcar ticket como leído
 */
export const markTicketAsRead = createAsyncThunk<Ticket, string | number, { rejectValue: string }>(
  'tickets/markAsRead',
  async (ticketId, { rejectWithValue }) => {
    try {
      return await ticketService.markAsRead(ticketId)
    } catch (error) {
      return rejectWithValue(messageFromError(error))
    }
  },
)

/**
 * 6. Bloquear ticket para edición exclusiva (concurrencia)
 */
export const lockTicket = createAsyncThunk<
  TicketLock,
  { ticketId: string | number; usuario: string },
  { rejectValue: string }
>(
  'tickets/lockTicket',
  async ({ ticketId, usuario }, { rejectWithValue }) => {
    try {
      const res = await ticketService.lockTicket(ticketId, usuario)
      return {
        ticketId: String(res.ticket_id || ticketId),
        usuario: res.usuario || usuario,
        expiraEnSegundos: res.expira_en_segundos,
      }
    } catch (error: any) {
      const msg = error.response?.data?.detail || messageFromError(error)
      return rejectWithValue(msg)
    }
  },
)

/**
 * 7. Liberar bloqueo de edición
 */
export const unlockTicket = createAsyncThunk<
  string | number,
  { ticketId: string | number; usuario?: string },
  { rejectValue: string }
>(
  'tickets/unlockTicket',
  async ({ ticketId, usuario }, { rejectWithValue }) => {
    try {
      await ticketService.unlockTicket(ticketId, usuario)
      return ticketId
    } catch (error) {
      return rejectWithValue(messageFromError(error))
    }
  },
)

/**
 * 8. Consultar estado atómico de bloqueo de un ticket
 */
export const checkTicketLock = createAsyncThunk<
  { ticketId: string; bloqueado: boolean; usuario?: string },
  string | number
>(
  'tickets/checkTicketLock',
  async (ticketId) => {
    try {
      const res = await ticketService.getLockStatus(ticketId)
      return {
        ticketId: String(ticketId),
        bloqueado: Boolean(res.bloqueado),
        usuario: res.usuario,
      }
    } catch {
      return {
        ticketId: String(ticketId),
        bloqueado: false,
      }
    }
  },
)
