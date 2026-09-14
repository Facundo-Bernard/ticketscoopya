import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  checkTicketLock,
  deleteTicket,
  fetchTickets,
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

export interface TicketModalData {
  ticket: Ticket
  isEditing?: boolean
}

export function useTicketsBoard() {
  useTicketStream()

  const { items: tickets, status, error, locks } = useSelector((state: RootState) => state.tickets)
  const dispatch = useDispatch<AppDispatch>()
  const [showFinished, setShowFinished] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const myEmail = (getOperatorIdentity() || '').toLowerCase()

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
      dispatch(fetchTickets())
    }
  }, [dispatch, status])

  const handleTicketCreated = () => {
    createModal.closeModal()
  }

  const handleTicketUpdated = async (updatedTicket: Ticket, imageChanges?: TicketImageChanges) => {
    dispatch(markTicketAsUpdated(updatedTicket.id))
    if (imageChanges) {
      await dispatch(saveTicketWithImages({ ticket: updatedTicket, imageChanges })).unwrap()
    } else {
      await dispatch(saveTicket(updatedTicket)).unwrap()
    }
    dispatch(fetchTickets())
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
    toggleHistory: () => setShowFinished((current) => !current),
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
