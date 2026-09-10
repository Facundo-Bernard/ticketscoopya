import React from 'react';
import { Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import type { RootState } from '../../REDUX/store';
import { getOperatorIdentity } from '../../UTILS/storageUtils';
import TicketDetalle from './DETALLE/TicketDetalle';
import ModalTicketFooter from './DETALLE/ModalTicketFooter';
import TicketEditView from './EDITAR/TicketEditView';
import { useModalTicketOperations } from './modalTicketOperations';
import { LockIcon } from '../COMUN/Icons';
import type { Ticket } from '../../TYPES';

export interface ModalTicketProps {
  ticket: Ticket | null;
  isOpen: boolean;
  isClosing?: boolean;
  initialEditing?: boolean;
  onClose: () => void;
  onTicketUpdated?: (ticket: Ticket) => void | Promise<void>;
  onDelete?: (ticket: Ticket) => void;
  onLock?: (ticket: Ticket) => Promise<boolean>;
  onUnlock?: (ticket: Ticket) => Promise<void>;
}

export const ModalTicket: React.FC<ModalTicketProps> = ({
  ticket,
  isOpen,
  isClosing = false,
  initialEditing = false,
  onClose,
  onTicketUpdated,
  onDelete,
  onLock,
  onUnlock,
}) => {
  const locks = useSelector((state: RootState) => state.tickets.locks || {});
  const currentLock = ticket ? locks[String(ticket.id)] : null;
  const myIdentity = (getOperatorIdentity() || '').toLowerCase();
  const isLockedByOther = Boolean(
    currentLock && 
    currentLock.usuario && 
    currentLock.usuario.toLowerCase() !== myIdentity
  );

  const {
    isEditing,
    isTerminado,
    lockError,
    clearLockError,
    toggleEditMode,
    handleCancelEdit,
    handleSave,
    handleModalClose,
    handleReactivar
  } = useModalTicketOperations({
    ticket,
    isOpen,
    initialEditing: initialEditing && !isLockedByOther,
    isLockedByOther,
    lockedBy: currentLock?.usuario,
    onClose,
    onTicketUpdated,
    onLock,
    onUnlock,
  });

  if (!isOpen || !ticket) return null;

  return (
    <div
      className={`modal fade show d-block modal-wrapper-custom ${isClosing ? 'modal-closing' : ''}`}
      tabIndex={-1}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (isClosing) return;
        if (e.target === e.currentTarget) handleModalClose();
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
                  <button type="button" className="btn-close" onClick={handleModalClose} aria-label="Cerrar"></button>
                </div>

                <div className="modal-body p-4">
                  {lockError && (
                    <Alert variant="warning" dismissible onClose={clearLockError} className="d-flex align-items-center gap-2 mb-3">
                      <LockIcon size={20} className="text-warning-emphasis flex-shrink-0" />
                      <div>{lockError}</div>
                    </Alert>
                  )}

                  {currentLock && isLockedByOther && (
                    <Alert variant="warning" className="d-flex align-items-center gap-2 mb-3">
                      <LockIcon size={20} className="text-warning-emphasis flex-shrink-0" />
                      <div>
                        Este ticket está siendo editado por <strong>{currentLock.usuario}</strong> en este momento. La edición está bloqueada para evitar sobreescritura.
                      </div>
                    </Alert>
                  )}

                  <TicketDetalle ticket={ticket} />
                </div>

                <ModalTicketFooter
                  isTerminado={isTerminado}
                  isLockedByOther={isLockedByOther}
                  lockedBy={currentLock?.usuario}
                  onClose={handleModalClose}
                  onEdit={() => toggleEditMode(true)}
                  onReactivar={handleReactivar}
                  onDelete={onDelete ? () => {
                    handleModalClose();
                    onDelete(ticket);
                  } : undefined}
                />
              </>
            )}
          </div>
        </div>
      </div>
  );
};

export default ModalTicket;
