import { ModalConfirmarEliminar, ModalTicket } from '../EDITMODAL'
import { TicketCreator } from '../CREATEMODAL'
import { TICKET_COLUMNS } from '../../TYPES'
import { useTicketsBoard } from '../../hooks'
import MenuHeader from './MenuHeader'
import BoardColumn from './BoardColumn'
import { FilterPanel } from './FILTROS'

const columns = TICKET_COLUMNS

export default function Menu() {
  const {
    status,
    error,
    showFinished,
    toggleHistory,
    filters,
    filtersOpen,
    filterCount,
    handleFilterChange,
    handleFilterApply,
    clearFilters,
    toggleFiltersOpen,
    byColumn,
    onColumnPageChange,
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
  } = useTicketsBoard()

  return (
    <main className="min-vh-100 d-flex flex-column">
      <MenuHeader
        showFinished={showFinished}
        isLoading={status === 'loading'}
        onToggleHistory={toggleHistory}
      />

      <FilterPanel
        filters={filters}
        isOpen={filtersOpen}
        activeCount={filterCount}
        onToggle={toggleFiltersOpen}
        onChange={handleFilterChange}
        onApply={handleFilterApply}
        onClear={clearFilters}
      />

      <div className="container-fluid flex-grow-1 pt-3 pb-4">
        <div className="row g-3 px-3">
          {columns.map((column) => {
            const colData = byColumn?.[column.id] || { items: [], total: 0, page: 1, pageSize: 4, isLoading: false }
            return (
              <BoardColumn
                key={column.id}
                column={column}
                tickets={colData.items}
                totalTickets={colData.total}
                currentPage={colData.page}
                pageSize={colData.pageSize}
                isLoading={colData.isLoading || status === 'loading'}
                errorMessage={error}
                showFinished={showFinished}
                onCreateTicket={createModal.openModal}
                onEditTicket={(ticket) => handleOpenTicket(ticket, true)}
                onViewTicket={(ticket) => handleOpenTicket(ticket, false)}
                onDeleteTicket={handleRequestDelete}
                onPageChange={(newPage) => onColumnPageChange(column.id, newPage)}
              />
            )
          })}
        </div>
      </div>

      <ModalTicket
        ticket={selectedTicket}
        isOpen={detailModal.isOpen}
        isClosing={detailModal.isClosing}
        initialEditing={detailModal.selectedData?.isEditing ?? false}
        onClose={detailModal.closeModal}
        onTicketUpdated={handleTicketUpdated}
        onDelete={handleRequestDelete}
        onLock={handleLockTicket}
        onUnlock={handleUnlockTicket}
      />

      <TicketCreator
        isOpen={createModal.isOpen}
        isClosing={createModal.isClosing}
        initialColumna={createModal.selectedData ?? 1}
        onClose={createModal.closeModal}
        onSuccess={handleTicketCreated}
      />

      <ModalConfirmarEliminar
        isOpen={deleteModal.isOpen}
        isClosing={deleteModal.isClosing}
        ticketTitulo={ticketToDelete?.titulo}
        ticketIdentificador={ticketToDelete?.identificador || (ticketToDelete ? `TK-${ticketToDelete.id}` : undefined)}
        isDeleting={isDeleting}
        isLockedByOther={isDeleteLocked}
        lockedBy={deleteLock?.usuario}
        onCancel={deleteModal.closeModal}
        onConfirm={handleConfirmDelete}
      />
    </main>
  )
}
