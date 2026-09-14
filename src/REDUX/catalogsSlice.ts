import { createSlice } from '@reduxjs/toolkit'
import type { OptionItem } from '../TYPES'
import { fetchCatalogs } from './catalogThunks'

type CatalogsState = {
  estados: OptionItem[]
  prioridades: OptionItem[]
  asignables: OptionItem[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: CatalogsState = {
  estados: [],
  prioridades: [],
  asignables: [],
  status: 'idle',
  error: null,
}

const catalogsSlice = createSlice({
  name: 'catalogs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalogs.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCatalogs.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.estados = action.payload.estados
        state.prioridades = action.payload.prioridades
        state.asignables = action.payload.asignables
      })
      .addCase(fetchCatalogs.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'No se pudieron cargar los catálogos.'
      })
  },
})

export default catalogsSlice.reducer
