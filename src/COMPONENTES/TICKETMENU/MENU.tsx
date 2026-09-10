import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchTickets, 
  saveTicket, 
  deleteTicket, 
  markTicketAsRead, 
  lockTicket, 
  unlockTicket, 
  checkTicketLock,
  markTicketAsDeleting,
  unmarkTicketAsDeleting,
  markTicketAsUpdated,
  addTicketFromStream,
} from '../../REDUX/ticketsSlice'
import type { AppDispatch, RootState } from '../../REDUX/store'
import { ModalTicket, ModalConfirmarEliminar } from '../EDITMODAL'
import { TicketCreator } from '../CREATEMODAL'
import type { Ticket } from '../../TYPES'
import { TICKET_COLUMNS } from '../../TYPES'
import { useModal, useTicketStream } from '../../hooks'
import { getOperatorIdentity } from '../../UTILS/storageUtils'
import MenuHeader from './MenuHeader'
import BoardColumn from './BoardColumn'

const columns = TICKET_COLUMNS

interface TicketModalData {
  ticket: Ticket;
  isEditing?: boolean;
}

export default function Menu() {
  // Escucha de tickets en tiempo real vía Server-Sent Events y notificaciones (solo operadores)
  useTicketStream()

  const { items: tickets, status, error, locks } = useSelector((state: RootState) => state.tickets)
  const dispatch = useDispatch<AppDispatch>()
  const [showFinished, setShowFinished] = useState(false)
  const myEmail = (getOperatorIdentity() || '').toLowerCase()

  // Modal para ver detalles o editar ticket existente
  const {
    isOpen: isDetailOpen,
    isClosing: isDetailClosing,
    selectedData: detailModalData,
    openModal: openDetailModal,
    closeModal: closeDetailModal
  } = useModal<TicketModalData>()

  // Modal para crear nuevo ticket de soporte
  const {
    isOpen: isCreateOpen,
    isClosing: isCreateClosing,
    selectedData: createColumnId,
    openModal: openCreateModal,
    closeModal: closeCreateModal
  } = useModal<number>()

  // Modal de confirmación para eliminar ticket
  const {
    isOpen: isDeleteOpen,
    isClosing: isDeleteClosing,
    selectedData: ticketToDelete,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal
  } = useModal<Ticket>()

  const [isDeleting, setIsDeleting] = useState(false)

  const handleOpenTicket = (ticket: Ticket, isEditing: boolean = false) => {
    if (ticket.leido === false) {
      dispatch(markTicketAsRead(ticket.id))
    }
    dispatch(checkTicketLock(ticket.id))

    const lock = locks?.[String(ticket.id)]
    const isLocked = Boolean(lock && lock.usuario && lock.usuario.toLowerCase() !== myEmail)

    openDetailModal({ 
      ticket: { ...ticket, leido: true }, 
      isEditing: isEditing && !isLocked 
    })
  }

  const handleRequestDelete = (ticket: Ticket) => {
    const lock = locks?.[String(ticket.id)]
    if (lock && lock.usuario && lock.usuario.toLowerCase() !== myEmail) {
      alert(`No se puede eliminar el ticket porque está siendo editado por ${lock.usuario}.`)
      return
    }
    openDeleteModal(ticket)
  }

  const handleLockTicket = async (ticket: Ticket): Promise<boolean> => {
    try {
      await dispatch(lockTicket({ ticketId: ticket.id, usuario: myEmail || 'Operador' })).unwrap()
      return true
    } catch (err) {
      console.error('No se pudo bloquear el ticket:', err)
      return false
    }
  }

  const handleUnlockTicket = async (ticket: Ticket): Promise<void> => {
    try {
      await dispatch(unlockTicket({ ticketId: ticket.id, usuario: myEmail || 'Operador' })).unwrap()
    } catch (err) {
      console.error('No se pudo desbloquear el ticket:', err)
    }
  }

  const visibleTickets = showFinished
    ? tickets.filter((ticket) => {
        const estado = (ticket.estado || 'abierto').toLowerCase();
        return estado === 'resuelto' || estado === 'cerrado';
      })
    : tickets.filter((ticket) => {
        const estado = (ticket.estado || 'abierto').toLowerCase();
        return estado !== 'resuelto' && estado !== 'cerrado';
      });

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTickets())
    }
  }, [dispatch, status])

  const handleTicketCreated = (nuevoTicket?: Ticket) => {
    if (nuevoTicket && nuevoTicket.id) {
      dispatch(addTicketFromStream(nuevoTicket))
    }
    dispatch(fetchTickets())
    closeCreateModal()
  }

  const handleTicketUpdated = async (updatedTicket: Ticket) => {
    if (updatedTicket && updatedTicket.id) {
      dispatch(markTicketAsUpdated(updatedTicket.id))
    }
    await dispatch(saveTicket(updatedTicket)).unwrap()
    dispatch(fetchTickets())
  }

  const handleConfirmDelete = async () => {
    if (!ticketToDelete) return
    const ticketId = ticketToDelete.id
    const lock = locks?.[String(ticketId)]
    if (lock && lock.usuario && lock.usuario.toLowerCase() !== myEmail) {
      alert(`No se puede eliminar el ticket porque está siendo editado por ${lock.usuario}.`)
      closeDeleteModal()
      return
    }

    // 1. Iniciar animación de salida en la tarjeta y cerrar modal de confirmación
    dispatch(markTicketAsDeleting(ticketId))
    closeDeleteModal()

    try {
      setIsDeleting(true)
      // 2. Ejecutar la llamada a la API (que aguarda los 400ms para completar la animación fluida)
      await dispatch(deleteTicket(ticketId)).unwrap()
    } catch (err: any) {
      console.error('Error al eliminar ticket:', err)
      dispatch(unmarkTicketAsDeleting(ticketId))
      alert(typeof err === 'string' ? err : 'Error al eliminar el ticket. Es posible que esté siendo editado por otro usuario.')
    } finally {
      setIsDeleting(false)
    }
  }

  const deleteLock = ticketToDelete ? locks?.[String(ticketToDelete.id)] : null
  const isDeleteLocked = Boolean(
    deleteLock && deleteLock.usuario && deleteLock.usuario.toLowerCase() !== myEmail
  )

  return (
    <main className="min-vh-100 d-flex flex-column">
      <MenuHeader
        showFinished={showFinished}
        isLoading={status === 'loading'}
        onToggleHistory={() => setShowFinished((current) => !current)}
      />

      <div className="container-fluid flex-grow-1 pb-4">
        <div className="row g-3 px-3">
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              tickets={visibleTickets.filter((ticket) => Number(ticket.columnId) === Number(column.id))}
              isLoading={status === 'loading'}
              errorMessage={error}
              showFinished={showFinished}
              onCreateTicket={openCreateModal}
              onEditTicket={(ticket) => handleOpenTicket(ticket, true)}
              onViewTicket={(ticket) => handleOpenTicket(ticket, false)}
              onDeleteTicket={handleRequestDelete}
            />
          ))}
        </div>
      </div>

      {/* Modal de Detalle / Edición / Reactivación */}
      <ModalTicket
        ticket={
          detailModalData?.ticket
            ? (tickets.find((t) => String(t.id) === String(detailModalData.ticket.id)) ?? detailModalData.ticket)
            : null
        }
        isOpen={isDetailOpen}
        isClosing={isDetailClosing}
        initialEditing={detailModalData?.isEditing ?? false}
        onClose={closeDetailModal}
        onTicketUpdated={handleTicketUpdated}
        onDelete={(ticket) => handleRequestDelete(ticket)}
        onLock={handleLockTicket}
        onUnlock={handleUnlockTicket}
      />

      {/* Modal de Creación de Ticket para Soporte */}
      <TicketCreator
        isOpen={isCreateOpen}
        isClosing={isCreateClosing}
        initialColumna={createColumnId ?? 1}
        onClose={closeCreateModal}
        onSuccess={handleTicketCreated}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ModalConfirmarEliminar
        isOpen={isDeleteOpen}
        isClosing={isDeleteClosing}
        ticketTitulo={ticketToDelete?.titulo}
        ticketIdentificador={ticketToDelete?.identificador || (ticketToDelete ? `TK-${ticketToDelete.id}` : undefined)}
        isDeleting={isDeleting}
        isLockedByOther={isDeleteLocked}
        lockedBy={deleteLock?.usuario}
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </main>
  )
}


