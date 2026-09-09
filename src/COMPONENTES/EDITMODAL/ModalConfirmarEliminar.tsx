import React from 'react';

export interface ModalConfirmarEliminarProps {
  isOpen: boolean;
  ticketTitulo?: string;
  ticketIdentificador?: string;
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ModalConfirmarEliminar: React.FC<ModalConfirmarEliminarProps> = ({
  isOpen,
  ticketTitulo,
  ticketIdentificador,
  isDeleting = false,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop fade show modal-backdrop-confirm"></div>
      <div
        className="modal fade show d-block modal-confirm-wrapper"
        tabIndex={-1}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
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
                className="btn btn-sm btn-danger px-3 d-flex align-items-center gap-1"
                onClick={onConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Eliminando…</span>
                  </>
                ) : (
                  <span>Sí, Eliminar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalConfirmarEliminar;
