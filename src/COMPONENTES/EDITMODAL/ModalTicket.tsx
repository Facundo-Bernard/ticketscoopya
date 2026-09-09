import React from 'react';
import TicketDetalle from './DETALLE/TicketDetalle';
import ModalTicketFooter from './DETALLE/ModalTicketFooter';
import TicketEditView from './EDITAR/TicketEditView';
import { useModalTicketOperations } from './modalTicketOperations';
import type { Ticket } from '../../TYPES';

export interface ModalTicketProps {
  ticket: Ticket | null;
  isOpen: boolean;
  initialEditing?: boolean;
  onClose: () => void;
  onTicketUpdated?: (ticket: Ticket) => void | Promise<void>;
  onDelete?: (ticket: Ticket) => void;
}

export const ModalTicket: React.FC<ModalTicketProps> = ({
  ticket,
  isOpen,
  initialEditing = false,
  onClose,
  onTicketUpdated,
  onDelete
}) => {
  const {
    isEditing,
    isTerminado,
    toggleEditMode,
    handleCancelEdit,
    handleSave,
    handleReactivar
  } = useModalTicketOperations({
    ticket,
    isOpen,
    initialEditing,
    onClose,
    onTicketUpdated
  });

  if (!isOpen || !ticket) return null;

  return (
    <>
      <div className="modal-backdrop fade show modal-backdrop-custom"></div>
      <div
        className="modal fade show d-block modal-wrapper-custom"
        tabIndex={-1}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-4 shadow-lg overflow-hidden modal-top-accent">
            {isEditing ? (
              <TicketEditView
                ticket={ticket}
                onCancel={handleCancelEdit}
                onSave={handleSave}
              />
            ) : (
              <>
                <div className="modal-header d-flex justify-content-between align-items-center py-3 bg-white border-bottom">
                  <h5 className="modal-title fw-bold mb-0 text-dark">
                    Detalle del Ticket
                  </h5>
                  <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar"></button>
                </div>

                <div className="modal-body p-4">
                  <TicketDetalle ticket={ticket} />
                </div>

                <ModalTicketFooter
                  isTerminado={isTerminado}
                  onClose={onClose}
                  onEdit={() => toggleEditMode(true)}
                  onReactivar={handleReactivar}
                  onDelete={onDelete ? () => {
                    onClose();
                    onDelete(ticket);
                  } : undefined}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalTicket;
