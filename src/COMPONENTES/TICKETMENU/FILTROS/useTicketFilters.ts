import { useState, useCallback, useTransition } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../../REDUX/store'
import { fetchAllColumns } from '../../../REDUX/ticketsSlice'

export interface ActiveFilters {
  q: string
  prioridad: string   // '' | 'baja' | 'media' | 'alta' | 'critica'
  asignar: string
  columna: number | ''
  leido: boolean | ''  // '' = todos, true = leído, false = no leído
}

const DEFAULT_FILTERS: ActiveFilters = {
  q: '',
  prioridad: '',
  asignar: '',
  columna: '',
  leido: '',
}

export const TICKETS_PER_COLUMN = 4

export function useTicketFilters(incluirResueltos: boolean) {
  const dispatch = useDispatch<AppDispatch>()
  const [isPending, startTransition] = useTransition()
  const [filters, setFilters] = useState<ActiveFilters>(DEFAULT_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const activeCount = [
    filters.q.trim(),
    filters.prioridad,
    filters.asignar.trim(),
    filters.columna !== '' ? String(filters.columna) : '',
    filters.leido !== '' ? String(filters.leido) : '',
  ].filter(Boolean).length

  const applyFilters = useCallback(
    (next: ActiveFilters) => {
      setFilters(next)
      startTransition(() => {
        dispatch(fetchAllColumns({ filters: next, incluirResueltos, pageSize: TICKETS_PER_COLUMN }))
      })
    },
    [dispatch, incluirResueltos],
  )

  const handleChange = useCallback(
    (patch: Partial<ActiveFilters>) => {
      setFilters((prev) => {
        const next = { ...prev, ...patch }
        return next
      })
    },
    [],
  )

  const handleApply = useCallback(
    (patch?: Partial<ActiveFilters>) => {
      setFilters((prev) => {
        const next = { ...prev, ...(patch ?? {}) }
        startTransition(() => {
          dispatch(fetchAllColumns({ filters: next, incluirResueltos, pageSize: TICKETS_PER_COLUMN }))
        })
        return next
      })
    },
    [dispatch, incluirResueltos],
  )

  const clearFilters = useCallback(() => {
    applyFilters(DEFAULT_FILTERS)
  }, [applyFilters])

  const toggleFiltersOpen = useCallback(() => {
    setFiltersOpen((v) => !v)
  }, [])

  return {
    filters,
    filtersOpen,
    activeCount,
    isPending,
    pageSize: TICKETS_PER_COLUMN,
    handleChange,
    handleApply,
    clearFilters,
    toggleFiltersOpen,
    applyFilters,
  }
}
