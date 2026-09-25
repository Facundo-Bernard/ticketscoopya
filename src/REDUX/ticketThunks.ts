import { createAsyncThunk } from '@reduxjs/toolkit'
import type { CreateTicketInput, Ticket, TicketLock } from '../TYPES'
import { ticketService, type TicketImageChanges, type TicketFilterParams, type TicketPagedResponse } from '../SERVICES/ticketService'
import { messageFromError } from './errorUtils'

export { messageFromError } from './errorUtils'

/**
 * 1. Obtener todos los tickets (soporte de filtros y paginacion)
 */
export const fetchTickets = createAsyncThunk<TicketPagedResponse, TicketFilterParams | undefined, { rejectValue: string }>(
  'tickets/fetchTickets',
  async (params, { rejectWithValue }) => {
    try {
      return await ticketService.getTicketsPaged(params)
    } catch (error) {
      return rejectWithValue(messageFromError(error))
    }
  },
)

export interface ColumnFetchPayload {
  columna: number
  page: number
  total: number
  skip: number
  limit: number
  items: Ticket[]
}

export interface FetchColumnArgs {
  columna: number
  page: number
  pageSize: number
  filters?: {
    q?: string
    prioridad?: string
    asignar?: string
    columna?: number | ''
    leido?: boolean | ''
  }
  incluirResueltos: boolean
  silent?: boolean
}

/**
 * Obtener tickets paginados para una columna específica (skip y limit reales en backend)
 */
export const fetchColumnTickets = createAsyncThunk<
  ColumnFetchPayload,
  FetchColumnArgs,
  { rejectValue: string }
>(
  'tickets/fetchColumnTickets',
  async ({ columna, page, pageSize, filters, incluirResueltos }, { rejectWithValue }) => {
    try {
      if (
        filters?.columna !== undefined &&
        filters?.columna !== '' &&
        Number(filters.columna) !== columna
      ) {
        return {
          columna,
          page: 1,
          total: 0,
          skip: 0,
          limit: pageSize,
          items: [],
        }
      }

      const params: TicketFilterParams = {
        columna,
        skip: (Math.max(1, page) - 1) * pageSize,
        limit: pageSize,
        incluir_resueltos: incluirResueltos,
      }
      if (filters?.q?.trim()) params.q = filters.q.trim()
      if (filters?.prioridad) params.prioridad = filters.prioridad
      if (filters?.asignar?.trim()) params.asignar = filters.asignar.trim()
      if (filters?.leido !== '' && filters?.leido !== undefined) {
        params.leido = filters.leido as boolean
      }

      const response = await ticketService.getTicketsPaged(params)
      return {
        columna,
        page,
        total: response.total,
        skip: response.skip,
        limit: response.limit,
        items: response.items,
      }
    } catch (error) {
      return rejectWithValue(messageFromError(error))
    }
  },
)

/**
 * Obtener la primera página de las 4 columnas en paralelo
 */
export const fetchAllColumns = createAsyncThunk<
  void,
  {
    filters?: FetchColumnArgs['filters']
    incluirResueltos: boolean
    pageSize?: number
    silent?: boolean
    resetPage?: boolean
  }
>(
  'tickets/fetchAllColumns',
  async ({ filters, incluirResueltos, pageSize = 4, silent = false, resetPage = false }, { dispatch, getState }) => {
    const columns = [1, 2, 3, 4]
    const state = getState() as any
    await Promise.all(
      columns.map((columna) => {
        const colPage = resetPage ? 1 : (state?.tickets?.byColumn?.[columna]?.page || 1)
        return dispatch(
          fetchColumnTickets({
            columna,
            page: colPage,
            pageSize,
            filters,
            incluirResueltos,
            silent,
          }),
        )
      }),
    )
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

/** Crear un ticket y guardar la respuesta en el estado compartido. */
export const createTicket = createAsyncThunk<Ticket, CreateTicketInput, { rejectValue: string }>(
  'tickets/createTicket',
  async (input, { rejectWithValue }) => {
    try {
      return await ticketService.createTicket(input)
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
 * Guarda los campos del ticket y sincroniza sus imágenes con los endpoints dedicados.
 * El backend no permite adjuntos dentro del PATCH JSON del ticket.
 */
export const saveTicketWithImages = createAsyncThunk<
  Ticket,
  { ticket: Ticket; imageChanges: TicketImageChanges },
  { rejectValue: string }
>(
  'tickets/saveTicketWithImages',
  async ({ ticket, imageChanges }, { rejectWithValue }) => {
    try {
      let updatedTicket = await ticketService.updateTicket(ticket.id, {
        titulo: ticket.titulo,
        descripcion: ticket.descripcion,
        estado: ticket.estado,
        prioridad: ticket.prioridad,
        colaborador: ticket.colaborador,
        frecuencia: ticket.frecuencia,
        columnId: ticket.columnId,
        columna: ticket.columna || ticket.columnId,
      })

      for (const fileId of imageChanges.removedFileIds) {
        updatedTicket = await ticketService.deleteTicketImage(ticket.id, fileId)
      }

      if (imageChanges.newFiles.length > 0) {
        updatedTicket = await ticketService.uploadTicketImages(ticket.id, imageChanges.newFiles)
      }

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
