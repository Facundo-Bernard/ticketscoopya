import React, { useEffect } from 'react';
import { AlertTriangleIcon } from './Icons';

export interface ModalConfirmarDescartarProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  continueLabel?: string;
  onContinue: () => void;
  onConfirmDiscard: () => void;
}

export const ModalConfirmarDescartar: React.FC<ModalConfirmarDescartarProps> = ({
  isOpen,
  title = '¿Descartar cambios sin guardar?',
  message = 'Tenés información cargada en el formulario. Si cerrás ahora, se descartarán los datos sin guardar.',
  confirmLabel = 'Descartar y cerrar',
  continueLabel = 'Seguir editando',
  onContinue,
  onConfirmDiscard,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onContinue();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onContinue]);

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block modal-confirm-wrapper"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="discard-confirm-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          e.stopPropagation();
        }
      }}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) {
          onContinue();
        }
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-dialog-confirm">
        <div className="modal-content rounded-4 shadow-lg overflow-hidden modal-top-accent">
          <div className="modal-body p-4">
            <div className="d-flex align-items-start gap-3">
              <div className="icon-box-danger">
                <AlertTriangleIcon size={22} />
              </div>
              <div>
                <h5 id="discard-confirm-title" className="fw-bold text-dark mb-1">
                  {title}
                </h5>
                <p className="text-secondary small mb-0">{message}</p>
              </div>
            </div>
          </div>

          <div className="modal-footer bg-light py-2 px-4 d-flex justify-content-end gap-2 border-top">
            <button
              type="button"
              className="btn btn-sm btn-outline-danger px-3 fw-semibold"
              onClick={onConfirmDiscard}
            >
              {confirmLabel}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-coopya-red px-3"
              onClick={onContinue}
            >
              {continueLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmarDescartar;
