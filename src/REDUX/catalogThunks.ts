import { createAsyncThunk } from '@reduxjs/toolkit'
import { catalogService } from '../SERVICES/catalogService'
import type { OptionItem } from '../TYPES'
import type { RootState } from './store'
import { messageFromError } from './errorUtils'

export interface CatalogsPayload {
  estados: OptionItem[]
  prioridades: OptionItem[]
  asignables: OptionItem[]
}

export const fetchCatalogs = createAsyncThunk<
  CatalogsPayload,
  { force?: boolean } | undefined,
  { state: RootState; rejectValue: string }
>(
  'catalogs/fetchCatalogs',
  async (_, { rejectWithValue }) => {
    try {
      const [estados, prioridades, asignables] = await Promise.all([
        catalogService.getEstados(),
        catalogService.getPrioridades(),
        catalogService.getAsignables(),
      ])
      return { estados, prioridades, asignables }
    } catch (error) {
      return rejectWithValue(messageFromError(error))
    }
  },
  {
    condition: (options, { getState }) => {
      const status = getState().catalogs.status
      return options?.force === true || status === 'idle'
    },
  },
)
