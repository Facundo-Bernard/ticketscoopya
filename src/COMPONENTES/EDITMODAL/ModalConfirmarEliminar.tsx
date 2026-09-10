import React from 'react';
import { LockIcon } from '../COMUN/Icons';

export interface ModalConfirmarEliminarProps {
  isOpen: boolean;
  isClosing?: boolean;
  ticketTitulo?: string;
  ticketIdentificador?: string;
  isDeleting?: boolean;
  isLockedByOther?: boolean;
  lockedBy?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ModalConfirmarEliminar: React.FC<ModalConfirmarEliminarProps> = ({
  isOpen,
  isClosing = false,
  ticketTitulo,
  ticketIdentificador,
  isDeleting = false,
  isLockedByOther = false,
  lockedBy,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`modal fade show d-block modal-confirm-wrapper ${isClosing ? 'modal-closing' : ''}`}
      tabIndex={-1}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (isClosing) return;
        if (e.target === e.currentTarget && !isDeleting) onCancel();
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-dialog-confirm">
        <div className="modal-content rounded-4 shadow-lg overflow-hidden modal-top-accent">
          <div className="modal-body p-4">
            <div className="d-flex align-items-start gap-3">
              <div className="icon-box-danger">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>
              <div>
                <h5 className="fw-bold text-dark mb-1">¿Eliminar Ticket?</h5>
                <p className="text-secondary small mb-0">
                  ¿Estás seguro de que deseas eliminar permanentemente el ticket{' '}
                  <strong className="text-dark">
                    {ticketIdentificador || ticketTitulo || 'seleccionado'}
                  </strong>
                  ? Esta acción no se puede deshacer.
                </p>

                {isLockedByOther && (
                  <div className="alert alert-warning py-2 px-3 small d-flex align-items-center gap-2 mt-3 mb-0">
                    <LockIcon size={16} className="text-warning-emphasis flex-shrink-0" />
                    <span>
                      No se puede eliminar: el ticket está siendo editado por <strong>{lockedBy}</strong>.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer bg-light py-2 px-4 d-flex justify-content-end gap-2 border-top">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-3"
              onClick={onCancel}
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`btn btn-sm px-3 d-flex align-items-center gap-1 ${isLockedByOther ? 'btn-secondary opacity-75' : 'btn-danger'}`}
              onClick={onConfirm}
              disabled={isDeleting || isLockedByOther}
              title={isLockedByOther ? `Bloqueado: en edición por ${lockedBy}` : undefined}
            >
              {isDeleting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Eliminando…</span>
                </>
              ) : isLockedByOther ? (
                <>
                  <LockIcon size={14} />
                  <span>Bloqueado</span>
                </>
              ) : (
                <span>Sí, Eliminar</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmarEliminar;
