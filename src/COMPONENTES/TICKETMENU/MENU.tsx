import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTickets, saveTicket, deleteTicket } from '../../REDUX/ticketsSlice'
import type { AppDispatch, RootState } from '../../REDUX/store'
import { ModalTicket, ModalConfirmarEliminar } from '../EDITMODAL'
import { TicketCreator } from '../CREATEMODAL'
import type { Ticket } from '../../TYPES'
import { TICKET_COLUMNS } from '../../TYPES'
import { useModal } from '../../hooks'
import MenuHeader from './MenuHeader'
import BoardColumn from './BoardColumn'

const columns = TICKET_COLUMNS

interface TicketModalData {
  ticket: Ticket;
  isEditing?: boolean;
}

export default function Menu() {
  const { items: tickets, status, error } = useSelector((state: RootState) => state.tickets)
  const dispatch = useDispatch<AppDispatch>()
  const [showFinished, setShowFinished] = useState(false)

  // Modal para ver detalles o editar ticket existente
  const {
    isOpen: isDetailOpen,
    selectedData: detailModalData,
    openModal: openDetailModal,
    closeModal: closeDetailModal
  } = useModal<TicketModalData>()

  // Modal para crear nuevo ticket de soporte
  const {
    isOpen: isCreateOpen,
    selectedData: createColumnId,
    openModal: openCreateModal,
    closeModal: closeCreateModal
  } = useModal<number>()

  // Modal de confirmación para eliminar ticket
  const {
    isOpen: isDeleteOpen,
    selectedData: ticketToDelete,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal
  } = useModal<Ticket>()

  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleTicketCreated = () => {
    dispatch(fetchTickets())
    closeCreateModal()
  }

  const handleTicketUpdated = async (updatedTicket: Ticket) => {
    await dispatch(saveTicket(updatedTicket)).unwrap()
    dispatch(fetchTickets())
  }

  const handleConfirmDelete = async () => {
    if (!ticketToDelete) return
    try {
      setIsDeleting(true)
      await dispatch(deleteTicket(ticketToDelete.id)).unwrap()
      closeDeleteModal()
    } catch (err) {
      console.error('Error al eliminar ticket:', err)
    } finally {
      setIsDeleting(false)
    }
  }

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
              onEditTicket={(ticket) => openDetailModal({ ticket, isEditing: true })}
              onViewTicket={(ticket) => openDetailModal({ ticket, isEditing: false })}
              onDeleteTicket={openDeleteModal}
            />
          ))}
        </div>
      </div>

      {/* Modal de Detalle / Edición / Reactivación */}
      <ModalTicket
        ticket={detailModalData?.ticket ?? null}
        isOpen={isDetailOpen}
        initialEditing={detailModalData?.isEditing ?? false}
        onClose={closeDetailModal}
        onTicketUpdated={handleTicketUpdated}
        onDelete={(ticket) => openDeleteModal(ticket)}
      />

      {/* Modal de Creación de Ticket para Soporte */}
      <TicketCreator
        isOpen={isCreateOpen}
        initialColumna={createColumnId ?? 1}
        onClose={closeCreateModal}
        onSuccess={handleTicketCreated}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ModalConfirmarEliminar
        isOpen={isDeleteOpen}
        ticketTitulo={ticketToDelete?.titulo}
        ticketIdentificador={ticketToDelete?.identificador || (ticketToDelete ? `TK-${ticketToDelete.id}` : undefined)}
        isDeleting={isDeleting}
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </main>
  )
}


