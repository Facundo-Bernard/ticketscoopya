import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Ticket } from '../TYPES'
import { ticketService } from '../SERVICES/ticketService'

type StoredTicket = Ticket & { columnId: number }

type TicketsState = {
  items: StoredTicket[]
  selectedTicketId: string | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: TicketsState = {
  items: [],
  selectedTicketId: null,
  status: 'idle',
  error: null,
}

const messageFromError = (error: unknown) =>
  error instanceof Error ? error.message : 'No se pudo completar la solicitud.'

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

export const deleteTicket = createAsyncThunk<string | number, string | number, { rejectValue: string }>(
  'tickets/deleteTicket',
  async (ticketId, { rejectWithValue }) => {
    try {
      await ticketService.deleteTicket(ticketId)
      return ticketId
    } catch (error) {
      return rejectWithValue(messageFromError(error))
    }
  },
)

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

const toStoredTicket = (ticket: Ticket, current?: StoredTicket): StoredTicket => {
  const explicit = ticket.columnId ?? ticket.columna ?? current?.columnId;
  let resolved: number | undefined;

  if (explicit !== undefined && explicit !== null) {
    if (typeof explicit === 'number') {
      resolved = explicit;
    } else {
      const parsed = Number(explicit);
      if (!isNaN(parsed)) {
        resolved = parsed;
      } else {
        if (explicit === 'tickets') resolved = 1;
        else if (explicit === 'milestones') resolved = 2;
        else if (explicit === 'tasks') resolved = 3;
        else if (explicit === 'recurring-tasks') resolved = 4;
      }
    }
  }

  if (resolved === undefined) {
    resolved = (ticket.frecuencia && ticket.frecuencia.periodo !== 'No recurrente')
      ? 4 // TAREAS PERIÓDICAS
      : 1; // TICKET
  }

  return {
    ...ticket,
    columnId: resolved,
    columna: resolved,
  };
}

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    selectTicket(state, action: PayloadAction<string>) {
      state.selectedTicketId = action.payload
    },
    updateTicket(state, action: PayloadAction<Ticket>) {
      const index = state.items.findIndex((ticket) => ticket.id === action.payload.id)

      if (index !== -1) {
        state.items[index] = toStoredTicket(action.payload, state.items[index])
      }
    },
    addTicketFromStream(state, action: PayloadAction<Ticket>) {
      const stored = toStoredTicket(action.payload)
      const index = state.items.findIndex((ticket) => String(ticket.id) === String(stored.id))
      if (index === -1) {
        state.items.unshift(stored)
      } else {
        state.items[index] = toStoredTicket(action.payload, state.items[index])
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.map((ticket) => {
          const current = state.items.find((item) => item.id === ticket.id)
          return toStoredTicket(ticket, current)
        })
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'No se pudieron cargar los tickets.'
      })
      .addCase(fetchTicketById.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const index = state.items.findIndex((ticket) => ticket.id === action.payload.id)
        const nextTicket = toStoredTicket(action.payload, state.items[index])

        if (index === -1) {
          state.items.push(nextTicket)
        } else {
          state.items[index] = nextTicket
        }
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'No se pudo cargar el ticket.'
      })
      .addCase(saveTicket.pending, (state) => {
        state.error = null
      })
      .addCase(saveTicket.fulfilled, (state, action) => {
        const index = state.items.findIndex((ticket) => ticket.id === action.payload.id)

        if (index !== -1) {
          state.items[index] = toStoredTicket(action.payload, state.items[index])
        }
      })
      .addCase(saveTicket.rejected, (state, action) => {
        state.error = action.payload ?? 'No se pudieron guardar los cambios.'
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.items = state.items.filter((ticket) => String(ticket.id) !== String(action.payload))
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.error = action.payload ?? 'No se pudo eliminar el ticket.'
      })
      .addCase(markTicketAsRead.pending, (state, action) => {
        const ticketId = action.meta.arg
        const item = state.items.find((ticket) => String(ticket.id) === String(ticketId))
        if (item) {
          item.leido = true
        }
      })
      .addCase(markTicketAsRead.fulfilled, (state, action) => {
        const index = state.items.findIndex((ticket) => String(ticket.id) === String(action.payload.id))
        if (index !== -1) {
          state.items[index] = toStoredTicket(action.payload, state.items[index])
        }
      })
  },
})

export const { selectTicket, updateTicket, addTicketFromStream } = ticketsSlice.actions
export default ticketsSlice.reducer
