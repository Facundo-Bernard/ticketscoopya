import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Ticket, TicketLock } from '../TYPES'
import { ticketService } from '../SERVICES/ticketService'

type StoredTicket = Ticket & { columnId: number }

type TicketsState = {
  items: StoredTicket[]
  selectedTicketId: string | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  locks: Record<string, TicketLock>
}

const initialState: TicketsState = {
  items: [],
  selectedTicketId: null,
  status: 'idle',
  error: null,
  locks: {},
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
    updateTicketFromStream(state, action: PayloadAction<Ticket>) {
      const stored = toStoredTicket(action.payload)
      const index = state.items.findIndex((ticket) => String(ticket.id) === String(stored.id))
      if (index !== -1) {
        state.items[index] = toStoredTicket(action.payload, state.items[index])
      } else {
        state.items.unshift(stored)
      }
    },
    removeTicketFromStream(state, action: PayloadAction<{ id: string | number }>) {
      const targetId = String(action.payload.id)
      state.items = state.items.filter((ticket) => String(ticket.id) !== targetId)
      delete state.locks[targetId]
    },
    setTicketLock(state, action: PayloadAction<TicketLock>) {
      state.locks[String(action.payload.ticketId)] = action.payload
    },
    clearTicketLock(state, action: PayloadAction<{ ticketId: string | number }>) {
      delete state.locks[String(action.payload.ticketId)]
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
      .addCase(lockTicket.fulfilled, (state, action) => {
        state.locks[String(action.payload.ticketId)] = action.payload
      })
      .addCase(unlockTicket.fulfilled, (state, action) => {
        delete state.locks[String(action.payload)]
      })
  },
})

export const { 
  selectTicket, 
  updateTicket, 
  addTicketFromStream, 
  updateTicketFromStream, 
  removeTicketFromStream, 
  setTicketLock, 
  clearTicketLock 
} = ticketsSlice.actions
export default ticketsSlice.reducer
