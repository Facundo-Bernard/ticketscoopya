import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  checkTicketLock,
  deleteTicket,
  fetchColumnTickets,
  fetchAllColumns,
  lockTicket,
  markTicketAsDeleting,
  markTicketAsRead,
  markTicketAsUpdated,
  saveTicket,
  saveTicketWithImages,
  unlockTicket,
  unmarkTicketAsDeleting,
} from '../../REDUX/ticketsSlice'
import type { AppDispatch, RootState } from '../../REDUX/store'
import type { Ticket } from '../../TYPES'
import type { TicketImageChanges } from '../../SERVICES/ticketService'
import { getOperatorIdentity } from '../../UTILS/storageUtils'
import { useModal } from '../../hooks/useModal'
import { useTicketStream } from '../../hooks/useTicketStream'
import { useTicketFilters, TICKETS_PER_COLUMN } from './FILTROS'

export interface TicketModalData {
  ticket: Ticket
  isEditing?: boolean
}

export function useTicketsBoard() {
  useTicketStream()

  const [showFinished, setShowFinished] = useState(false)

  const {
    filters,
    filtersOpen,
    activeCount: filterCount,
    isPending: isFilterPending,
    handleChange: handleFilterChange,
    handleApply: handleFilterApply,
    clearFilters,
    toggleFiltersOpen,
  } = useTicketFilters(showFinished)

  const { items: tickets, byColumn, status, error, locks } = useSelector((state: RootState) => state.tickets)
  const dispatch = useDispatch<AppDispatch>()
  const [isDeleting, setIsDeleting] = useState(false)
  const myEmail = (getOperatorIdentity() || '').toLowerCase()

  const handleColumnPageChange = (columna: number, newPage: number) => {
    dispatch(
      fetchColumnTickets({
        columna,
        page: newPage,
        pageSize: TICKETS_PER_COLUMN,
        filters,
        incluirResueltos: showFinished,
      }),
    )
  }

  const detailModal = useModal<TicketModalData>()
  const createModal = useModal<number>()
  const deleteModal = useModal<Ticket>()

  const handleOpenTicket = async (ticket: Ticket, isEditing: boolean = false) => {
    if (ticket.leido === false) {
      dispatch(markTicketAsRead(ticket.id))
    }

    const lockStatus = await dispatch(checkTicketLock(ticket.id)).unwrap()
    const isLocked = Boolean(
      lockStatus.bloqueado &&
      lockStatus.usuario &&
      lockStatus.usuario.toLowerCase() !== myEmail,
    )

    detailModal.openModal({
      ticket: { ...ticket, leido: true },
      isEditing: isEditing && !isLocked,
    })
  }

  const handleRequestDelete = (ticket: Ticket) => {
    const lock = locks[String(ticket.id)]
    if (lock?.usuario && lock.usuario.toLowerCase() !== myEmail) {
      alert(`No se puede eliminar el ticket porque está siendo editado por ${lock.usuario}.`)
      return
    }
    deleteModal.openModal(ticket)
  }

  const handleLockTicket = async (ticket: Ticket): Promise<boolean> => {
    try {
      await dispatch(lockTicket({ ticketId: ticket.id, usuario: myEmail || 'Operador' })).unwrap()
      return true
    } catch (error) {
      console.error('No se pudo bloquear el ticket:', error)
      return false
    }
  }

  const handleUnlockTicket = async (ticket: Ticket): Promise<void> => {
    try {
      await dispatch(unlockTicket({ ticketId: ticket.id, usuario: myEmail || 'Operador' })).unwrap()
    } catch (error) {
      console.error('No se pudo desbloquear el ticket:', error)
    }
  }

  useEffect(() => {
    if (status === 'idle') {
      // Tablero activo: consulta cada columna por separado con skip/limit
      dispatch(fetchAllColumns({ filters, incluirResueltos: false, pageSize: TICKETS_PER_COLUMN }))
    }
  }, [dispatch, status, filters])

  const handleTicketCreated = () => {
    createModal.closeModal()
    dispatch(fetchAllColumns({ filters, incluirResueltos: showFinished, pageSize: TICKETS_PER_COLUMN }))
  }

  const handleTicketUpdated = async (updatedTicket: Ticket, imageChanges?: TicketImageChanges) => {
    dispatch(markTicketAsUpdated(updatedTicket.id))
    if (imageChanges) {
      await dispatch(saveTicketWithImages({ ticket: updatedTicket, imageChanges })).unwrap()
    } else {
      await dispatch(saveTicket(updatedTicket)).unwrap()
    }
    dispatch(fetchAllColumns({ filters, incluirResueltos: showFinished, pageSize: TICKETS_PER_COLUMN }))
  }

  const handleConfirmDelete = async () => {
    const ticketToDelete = deleteModal.selectedData
    if (!ticketToDelete) return

    const ticketId = ticketToDelete.id
    const lock = locks[String(ticketId)]
    if (lock?.usuario && lock.usuario.toLowerCase() !== myEmail) {
      alert(`No se puede eliminar el ticket porque está siendo editado por ${lock.usuario}.`)
      deleteModal.closeModal()
      return
    }

    dispatch(markTicketAsDeleting(ticketId))
    deleteModal.closeModal()

    try {
      setIsDeleting(true)
      await dispatch(deleteTicket(ticketId)).unwrap()
      dispatch(fetchAllColumns({ filters, incluirResueltos: showFinished, pageSize: TICKETS_PER_COLUMN }))
    } catch (error: unknown) {
      console.error('Error al eliminar ticket:', error)
      dispatch(unmarkTicketAsDeleting(ticketId))
      alert(typeof error === 'string'
        ? error
        : 'Error al eliminar el ticket. Es posible que esté siendo editado por otro usuario.')
    } finally {
      setIsDeleting(false)
    }
  }

  const visibleTickets = showFinished
    ? tickets.filter((ticket) => ['resuelto', 'cerrado'].includes((ticket.estado || 'abierto').toLowerCase()))
    : tickets.filter((ticket) => !['resuelto', 'cerrado'].includes((ticket.estado || 'abierto').toLowerCase()))

  const ticketToDelete = deleteModal.selectedData
  const deleteLock = ticketToDelete ? locks[String(ticketToDelete.id)] : null
  const isDeleteLocked = Boolean(
    deleteLock?.usuario && deleteLock.usuario.toLowerCase() !== myEmail,
  )
  const detailModalData = detailModal.selectedData
  const selectedTicket = detailModalData?.ticket
    ? tickets.find((ticket) => String(ticket.id) === String(detailModalData.ticket.id)) ?? detailModalData.ticket
    : null

  return {
    visibleTickets,
    status,
    error,
    showFinished,
    // filtros
    filters,
    filtersOpen,
    filterCount,
    isFilterPending,
    handleFilterChange,
    handleFilterApply,
    clearFilters,
    toggleFiltersOpen,
    byColumn,
    onColumnPageChange: handleColumnPageChange,
    toggleHistory: () => {
        const nextShowFinished = !showFinished
        setShowFinished(nextShowFinished)
        dispatch(fetchAllColumns({ filters, incluirResueltos: nextShowFinished, pageSize: TICKETS_PER_COLUMN }))
      },
    detailModal,
    createModal,
    deleteModal,
    selectedTicket,
    ticketToDelete,
    isDeleting,
    isDeleteLocked,
    deleteLock,
    handleOpenTicket,
    handleRequestDelete,
    handleLockTicket,
    handleUnlockTicket,
    handleTicketCreated,
    handleTicketUpdated,
    handleConfirmDelete,
  }
}

export default useTicketsBoard
