import { configureStore } from '@reduxjs/toolkit'
import ticketsReducer from './ticketsSlice'
import catalogsReducer from './catalogsSlice'

export const store = configureStore({
  reducer: {
    tickets: ticketsReducer,
    catalogs: catalogsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
