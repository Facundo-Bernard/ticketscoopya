import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Ticket, TicketLock } from '../TYPES'
import {
  fetchTickets,
  fetchColumnTickets,
  fetchAllColumns,
  fetchTicketById,
  createTicket,
  saveTicket,
  saveTicketWithImages,
  deleteTicket,
  markTicketAsRead,
  lockTicket,
  unlockTicket,
  checkTicketLock,
} from './ticketThunks'

// Re-exportamos los thunks para compatibilidad total con los componentes existentes
export {
  fetchTickets,
  fetchColumnTickets,
  fetchAllColumns,
  fetchTicketById,
  createTicket,
  saveTicket,
  saveTicketWithImages,
  deleteTicket,
  markTicketAsRead,
  lockTicket,
  unlockTicket,
  checkTicketLock,
}

type StoredTicket = Ticket & { columnId: number }

export type ColumnPaginationState = {
  items: StoredTicket[]
  total: number
  page: number
  pageSize: number
  isLoading: boolean
}

const createDefaultColumn = (_col?: number): ColumnPaginationState => ({
  items: [],
  total: 0,
  page: 1,
  pageSize: 4,
  isLoading: false,
})

export type TicketsState = {
  items: StoredTicket[]
  byColumn: Record<number, ColumnPaginationState>
  total: number
  skip: number
  limit: number
  selectedTicketId: string | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  locks: Record<string, TicketLock>
  deletingIds: string[]
  recentIds: string[]
  updatedIds: string[]
}

const initialState: TicketsState = {
  items: [],
  byColumn: {
    1: createDefaultColumn(1),
    2: createDefaultColumn(2),
    3: createDefaultColumn(3),
    4: createDefaultColumn(4),
  },
  total: 0,
  skip: 0,
  limit: 50,
  selectedTicketId: null,
  status: 'idle',
  error: null,
  locks: {},
  deletingIds: [],
  recentIds: [],
  updatedIds: [],
}

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

const upsertTicketInState = (state: TicketsState, ticket: Ticket): StoredTicket => {
  const stored = toStoredTicket(ticket)
  const idStr = String(stored.id)
  const targetCol = stored.columnId

  // 1. Limpiar de otras columnas si cambió de columna
  for (const colId of Object.keys(state.byColumn)) {
    const colNum = Number(colId)
    if (colNum !== targetCol) {
      const colState = state.byColumn[colNum]
      if (colState) {
        const prevLen = colState.items.length
        colState.items = colState.items.filter((t) => String(t.id) !== idStr)
        if (colState.items.length < prevLen) {
          colState.total = Math.max(0, colState.total - 1)
        }
      }
    }
  }

  // 2. Insertar o actualizar en la columna de destino
  if (!state.byColumn[targetCol]) {
    state.byColumn[targetCol] = createDefaultColumn(targetCol)
  }
  const colState = state.byColumn[targetCol]
  const colIndex = colState.items.findIndex((t) => String(t.id) === idStr)

  if (colIndex !== -1) {
    colState.items[colIndex] = stored
  } else {
    // Si estamos en la página 1, se coloca al inicio de la columna visible
    if (colState.page === 1) {
      colState.items.unshift(stored)
      if (colState.items.length > colState.pageSize) {
        colState.items.pop()
      }
    }
    colState.total += 1
  }

  // 3. Mantener sincronizado state.items y state.total global
  const mainIndex = state.items.findIndex((t) => String(t.id) === idStr)
  if (mainIndex === -1) {
    state.items.unshift(stored)
  } else {
    state.items[mainIndex] = stored
  }
  state.total = Object.values(state.byColumn).reduce((acc, c) => acc + c.total, 0)

  return stored
}

const removeTicketFromState = (state: TicketsState, targetId: string) => {
  state.items = state.items.filter((ticket) => String(ticket.id) !== targetId)
  state.deletingIds = state.deletingIds.filter((id) => id !== targetId)
  state.recentIds = state.recentIds.filter((id) => id !== targetId)
  state.updatedIds = state.updatedIds.filter((id) => id !== targetId)
  delete state.locks[targetId]

  for (const colId of Object.keys(state.byColumn)) {
    const colNum = Number(colId)
    const colState = state.byColumn[colNum]
    if (colState) {
      const prevLen = colState.items.length
      colState.items = colState.items.filter((ticket) => String(ticket.id) !== targetId)
      if (colState.items.length < prevLen) {
        colState.total = Math.max(0, colState.total - 1)
      }
    }
  }
  state.total = Object.values(state.byColumn).reduce((acc, c) => acc + c.total, 0)
}

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    selectTicket(state, action: PayloadAction<string>) {
      state.selectedTicketId = action.payload
    },
    updateTicket(state, action: PayloadAction<Ticket>) {
      upsertTicketInState(state, action.payload)
    },
    addTicketFromStream(state, action: PayloadAction<Ticket>) {
      const stored = upsertTicketInState(state, action.payload)
      const idStr = String(stored.id)
      if (!state.recentIds.includes(idStr)) {
        state.recentIds.push(idStr)
      }
    },
    updateTicketFromStream(state, action: PayloadAction<Ticket>) {
      const stored = upsertTicketInState(state, action.payload)
      const idStr = String(stored.id)
      if (!state.updatedIds.includes(idStr)) {
        state.updatedIds.push(idStr)
      }
    },
    removeTicketFromStream(state, action: PayloadAction<{ id: string | number }>) {
      removeTicketFromState(state, String(action.payload.id))
    },
    setTicketLock(state, action: PayloadAction<TicketLock>) {
      state.locks[String(action.payload.ticketId)] = action.payload
    },
    clearTicketLock(state, action: PayloadAction<{ ticketId: string | number }>) {
      delete state.locks[String(action.payload.ticketId)]
    },
    markTicketAsDeleting(state, action: PayloadAction<string | number>) {
      const idStr = String(action.payload)
      if (!state.deletingIds.includes(idStr)) {
        state.deletingIds.push(idStr)
      }
    },
    unmarkTicketAsDeleting(state, action: PayloadAction<string | number>) {
      const idStr = String(action.payload)
      state.deletingIds = state.deletingIds.filter((id) => id !== idStr)
    },
    markTicketAsRecent(state, action: PayloadAction<string | number>) {
      const idStr = String(action.payload)
      if (!state.recentIds.includes(idStr)) {
        state.recentIds.push(idStr)
      }
    },
    unmarkTicketAsRecent(state, action: PayloadAction<string | number>) {
      const idStr = String(action.payload)
      state.recentIds = state.recentIds.filter((id) => id !== idStr)
    },
    markTicketAsUpdated(state, action: PayloadAction<string | number>) {
      const idStr = String(action.payload)
      if (!state.updatedIds.includes(idStr)) {
        state.updatedIds.push(idStr)
      }
    },
    unmarkTicketAsUpdated(state, action: PayloadAction<string | number>) {
      const idStr = String(action.payload)
      state.updatedIds = state.updatedIds.filter((id) => id !== idStr)
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
        const payload = action.payload as any
        const isPaged = payload && Array.isArray(payload.items)
        const rawItems: Ticket[] = isPaged ? payload.items : (Array.isArray(payload) ? payload : [])

        if (isPaged) {
          state.total = payload.total ?? rawItems.length
          state.skip = payload.skip ?? 0
          state.limit = payload.limit ?? 50
        } else {
          state.total = rawItems.length
        }

        state.items = rawItems
          .filter((ticket) => !state.deletingIds.includes(String(ticket.id)))
          .map((ticket) => {
            const current = state.items.find((item) => item.id === ticket.id)
            return toStoredTicket(ticket, current)
          })
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'No se pudieron cargar los tickets.'
      })
      .addCase(fetchColumnTickets.pending, (state, action) => {
        const col = action.meta.arg.columna
        if (!state.byColumn[col]) {
          state.byColumn[col] = createDefaultColumn(col)
        }
        if (!action.meta.arg.silent) {
          state.byColumn[col].isLoading = true
        }
        state.error = null
      })
      .addCase(fetchColumnTickets.fulfilled, (state, action) => {
        const { columna, page, total, limit, items } = action.payload
        if (!state.byColumn[columna]) {
          state.byColumn[columna] = createDefaultColumn(columna)
        }
        const colState = state.byColumn[columna]
        colState.isLoading = false
        colState.page = page
        colState.total = total
        colState.pageSize = limit
        colState.items = items
          .filter((ticket) => !state.deletingIds.includes(String(ticket.id)))
          .map((ticket) => {
            const current = state.items.find((item) => item.id === ticket.id)
            return toStoredTicket(ticket, current)
          })

        // Reconstruir state.items con la unión de las 4 columnas
        state.items = Object.values(state.byColumn).flatMap((c) => c.items)
        state.total = Object.values(state.byColumn).reduce((acc, c) => acc + c.total, 0)
        state.status = 'succeeded'
      })
      .addCase(fetchColumnTickets.rejected, (state, action) => {
        const col = action.meta.arg.columna
        if (state.byColumn[col]) {
          state.byColumn[col].isLoading = false
        }
        state.error = action.payload ?? 'No se pudieron cargar los tickets de la columna.'
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
      .addCase(createTicket.pending, (state) => {
        state.error = null
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        const stored = upsertTicketInState(state, action.payload)
        const idStr = String(stored.id)
        if (!state.recentIds.includes(idStr)) {
          state.recentIds.push(idStr)
        }
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.error = action.payload ?? 'No se pudo crear el ticket.'
      })
      .addCase(saveTicket.pending, (state) => {
        state.error = null
      })
      .addCase(saveTicket.fulfilled, (state, action) => {
        const stored = upsertTicketInState(state, action.payload)
        const idStr = String(stored.id)
        if (!state.updatedIds.includes(idStr)) {
          state.updatedIds.push(idStr)
        }
      })
      .addCase(saveTicket.rejected, (state, action) => {
        state.error = action.payload ?? 'No se pudieron guardar los cambios.'
      })
      .addCase(saveTicketWithImages.fulfilled, (state, action) => {
        const stored = upsertTicketInState(state, action.payload)
        const idStr = String(stored.id)
        if (!state.updatedIds.includes(idStr)) {
          state.updatedIds.push(idStr)
        }
      })
      .addCase(saveTicketWithImages.rejected, (state, action) => {
        state.error = action.payload ?? 'No se pudieron guardar los cambios o las imágenes.'
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        removeTicketFromState(state, String(action.payload))
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.error = action.payload ?? 'No se pudo eliminar el ticket.'
        const targetId = String(action.meta.arg)
        state.deletingIds = state.deletingIds.filter((id) => id !== targetId)
      })
      .addCase(markTicketAsRead.pending, (state, action) => {
        const ticketId = String(action.meta.arg)
        const item = state.items.find((ticket) => String(ticket.id) === ticketId)
        if (item) {
          item.leido = true
        }
        for (const colState of Object.values(state.byColumn)) {
          const colItem = colState.items.find((ticket) => String(ticket.id) === ticketId)
          if (colItem) {
            colItem.leido = true
          }
        }
      })
      .addCase(markTicketAsRead.fulfilled, (state, action) => {
        upsertTicketInState(state, action.payload)
      })
      .addCase(lockTicket.fulfilled, (state, action) => {
        state.locks[String(action.payload.ticketId)] = action.payload
      })
      .addCase(unlockTicket.fulfilled, (state, action) => {
        delete state.locks[String(action.payload)]
      })
      .addCase(checkTicketLock.fulfilled, (state, action) => {
        const { ticketId, bloqueado, usuario } = action.payload
        if (bloqueado && usuario) {
          state.locks[ticketId] = {
            ticketId,
            usuario,
          }
        } else {
          delete state.locks[ticketId]
        }
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
  clearTicketLock,
  markTicketAsDeleting,
  unmarkTicketAsDeleting,
  markTicketAsRecent,
  unmarkTicketAsRecent,
  markTicketAsUpdated,
  unmarkTicketAsUpdated,
} = ticketsSlice.actions
export default ticketsSlice.reducer
