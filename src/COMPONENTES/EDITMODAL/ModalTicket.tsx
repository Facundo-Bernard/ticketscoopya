import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import type { RootState } from '../../REDUX/store';
import { getOperatorIdentity } from '../../UTILS/storageUtils';
import { clearEditTicketDraft } from '../../UTILS/ticketDraftStorage';
import TicketDetalle from './DETALLE/TicketDetalle';
import ModalTicketFooter from './DETALLE/ModalTicketFooter';
import TicketEditView from './EDITAR/TicketEditView';
import { useModalTicketOperations } from './modalTicketOperations';
import { LockIcon } from '../COMUN/Icons';
import ModalConfirmarDescartar from '../COMUN/ModalConfirmarDescartar';
import type { Ticket } from '../../TYPES';
import type { TicketImageChanges } from '../../SERVICES/ticketService';

export interface ModalTicketProps {
  ticket: Ticket | null;
  isOpen: boolean;
  isClosing?: boolean;
  initialEditing?: boolean;
  onClose: () => void;
  onTicketUpdated?: (ticket: Ticket, imageChanges?: TicketImageChanges) => void | Promise<void>;
  onDelete?: (ticket: Ticket) => void;
  onLock?: (ticket: Ticket) => Promise<boolean>;
  onUnlock?: (ticket: Ticket) => Promise<void>;
}

type PendingDiscardAction = 'close-modal' | 'cancel-edit' | null;

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

  const [hasUnsavedEdit, setHasUnsavedEdit] = useState<boolean>(false);
  const [hasDraftComment, setHasDraftComment] = useState<boolean>(false);
  const [pendingDiscardAction, setPendingDiscardAction] = useState<PendingDiscardAction>(null);
  const backdropMouseDownRef = useRef<boolean>(false);

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

  const effectiveUnsavedEdit = isOpen && isEditing && hasUnsavedEdit;
  const effectiveDraftComment = isOpen && !isEditing && hasDraftComment;
  const effectiveDiscardAction = isOpen ? pendingDiscardAction : null;
  const ticketId = ticket?.id;

  const closeModalAndReset = useCallback(() => {
    setHasUnsavedEdit(false);
    setHasDraftComment(false);
    setPendingDiscardAction(null);
    void handleModalClose();
  }, [handleModalClose]);

  const cancelEditAndReset = useCallback(() => {
    setHasUnsavedEdit(false);
    setPendingDiscardAction(null);
    void handleCancelEdit();
  }, [handleCancelEdit]);

  const requestModalClose = useCallback(() => {
    if (isClosing) return;
    if (effectiveUnsavedEdit || effectiveDraftComment) {
      setPendingDiscardAction('close-modal');
      return;
    }
    closeModalAndReset();
  }, [isClosing, effectiveUnsavedEdit, effectiveDraftComment, closeModalAndReset]);

  const requestCancelEdit = useCallback(() => {
    if (isClosing) return;
    if (effectiveUnsavedEdit) {
      setPendingDiscardAction('cancel-edit');
      return;
    }
    cancelEditAndReset();
  }, [isClosing, effectiveUnsavedEdit, cancelEditAndReset]);

  const handleConfirmDiscard = useCallback(() => {
    const action = effectiveDiscardAction;
    if (ticketId) {
      clearEditTicketDraft(ticketId);
    }

    if (action === 'cancel-edit') {
      cancelEditAndReset();
    } else if (action === 'close-modal') {
      closeModalAndReset();
    } else {
      setPendingDiscardAction(null);
    }
  }, [effectiveDiscardAction, ticketId, cancelEditAndReset, closeModalAndReset]);

  useEffect(() => {
    if (!isOpen || !ticketId || effectiveDiscardAction) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isEditing) {
          requestCancelEdit();
        } else {
          requestModalClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, ticketId, effectiveDiscardAction, isEditing, requestCancelEdit, requestModalClose]);

  if (!isOpen || !ticket) return null;

  const isCommentDiscard = effectiveDraftComment;
  const confirmModalTitle = isCommentDiscard
    ? '¿Descartar comentario sin enviar?'
    : '¿Descartar cambios sin guardar?';
  const confirmModalMessage = isCommentDiscard
    ? 'Tenés un comentario escrito sin enviar en este ticket. Si cerrás ahora, se perderá.'
    : `Modificaste los datos del ticket ${ticket.identificador || ''}. Si salís sin guardar, se perderán las modificaciones pendientes.`;
  const confirmLabel =
    effectiveDiscardAction === 'cancel-edit' && !initialEditing
      ? 'Descartar cambios'
      : 'Descartar y cerrar';

  return (
    <>
      <div
        className={`modal fade show d-block modal-wrapper-custom ${isClosing ? 'modal-closing' : ''}`}
        tabIndex={-1}
        onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
          backdropMouseDownRef.current = e.target === e.currentTarget;
        }}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          const startedOnBackdrop = backdropMouseDownRef.current;
          backdropMouseDownRef.current = false;
          if (!startedOnBackdrop || e.target !== e.currentTarget) return;
          requestModalClose();
        }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-4 shadow-lg overflow-hidden modal-top-accent">
            {isEditing ? (
              <TicketEditView
                key={String(ticket.id)}
                ticket={ticket}
                onCancel={requestCancelEdit}
                onSave={handleSave}
                onDirtyChange={setHasUnsavedEdit}
              />
            ) : (
              <>
                <div className="d-flex justify-content-end align-items-center pt-3 pe-3 pb-0 bg-white">
                  <button type="button" className="btn-close" onClick={requestModalClose} aria-label="Cerrar"></button>
                </div>

                <div className="modal-body px-4 pb-4 pt-1">
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

                  <TicketDetalle ticket={ticket} onCommentDraftChange={setHasDraftComment} />
                </div>

                <ModalTicketFooter
                  isTerminado={isTerminado}
                  isLockedByOther={isLockedByOther}
                  lockedBy={currentLock?.usuario}
                  onClose={requestModalClose}
                  onEdit={() => {
                    setHasDraftComment(false);
                    setHasUnsavedEdit(false);
                    void toggleEditMode(true);
                  }}
                  onReactivar={handleReactivar}
                  onDelete={onDelete ? () => {
                    closeModalAndReset();
                    onDelete(ticket);
                  } : undefined}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <ModalConfirmarDescartar
        isOpen={effectiveDiscardAction !== null}
        title={confirmModalTitle}
        message={confirmModalMessage}
        confirmLabel={confirmLabel}
        continueLabel={isCommentDiscard ? 'Seguir escribiendo' : 'Seguir editando'}
        onContinue={() => setPendingDiscardAction(null)}
        onConfirmDiscard={handleConfirmDiscard}
      />
    </>
  );
};

export default ModalTicket;
