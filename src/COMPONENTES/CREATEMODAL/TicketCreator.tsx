import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useTicketForm } from './useTicketForm';
import { TICKET_COLUMNS, type Ticket } from '../../TYPES';
import { TicketFormCampos, TicketFormImagenes, TicketFormFooter, TicketFrecuencia } from '../COMPONENTESFORM';
import ModalConfirmarDescartar from '../COMUN/ModalConfirmarDescartar';

export interface TicketCreatorModalProps {
  isOpen: boolean;
  isClosing?: boolean;
  initialColumna?: number;
  onClose: () => void;
  onSuccess?: (ticket: Ticket) => void;
}

export const TicketCreator: React.FC<TicketCreatorModalProps> = ({
  isOpen,
  isClosing = false,
  initialColumna = 1,
  onClose,
  onSuccess
}) => {
  const {
    ticketData,
    isSubmitting,
    errorMessage,
    successMessage,
    hasUnsavedData,
    hasRecoveredDraft,
    handleInputChange,
    handleImageUpload,
    handleRemoveImage,
    handleFrecuenciaChange,
    initSession,
    discardDraft,
    handleSubmit
  } = useTicketForm({ initialColumna, isOpen, onSuccess });

  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const prevIsOpenRef = useRef(isOpen);
  const backdropMouseDownRef = useRef(false);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      initSession(initialColumna);
      setShowDiscardConfirm(false);
    } else if (!isOpen && prevIsOpenRef.current) {
      setShowDiscardConfirm(false);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialColumna, initSession]);

  const requestClose = useCallback(() => {
    if (isClosing || isSubmitting) return;
    if (hasUnsavedData) {
      setShowDiscardConfirm(true);
      return;
    }
    onClose();
  }, [isClosing, isSubmitting, hasUnsavedData, onClose]);

  const handleConfirmDiscard = useCallback(() => {
    setShowDiscardConfirm(false);
    discardDraft(initialColumna);
    onClose();
  }, [discardDraft, initialColumna, onClose]);

  useEffect(() => {
    if (!isOpen || showDiscardConfirm) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        requestClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showDiscardConfirm, requestClose]);

  if (!isOpen) return null;

  const columnaActual = TICKET_COLUMNS.find((c) => Number(c.id) === Number(ticketData.columna));

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
          requestClose();
        }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-4 shadow-lg overflow-hidden modal-top-accent">
            <div className="modal-header d-flex justify-content-between align-items-center py-3 bg-white">
              <div className="d-flex align-items-center gap-2">
                <h5 className="modal-title fw-bold mb-0 text-primary">
                  Nuevo Ticket (Interno)
                </h5>
                <span className="badge bg-light text-secondary border">
                  {columnaActual ? columnaActual.title : 'TICKET'}
                </span>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={requestClose}
                disabled={isSubmitting}
                aria-label="Cerrar"
              ></button>
            </div>

            <div className="modal-body p-4">
              {hasRecoveredDraft && (
                <div className="alert alert-light border d-flex justify-content-between align-items-center py-2 px-3 mb-3 small">
                  <span className="text-secondary">
                    Se recuperó tu borrador sin guardar.
                  </span>
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-danger text-decoration-none p-0 fw-semibold"
                    onClick={() => discardDraft(initialColumna)}
                    disabled={isSubmitting}
                  >
                    Limpiar borrador
                  </button>
                </div>
              )}

              {errorMessage && <Alert variant="danger" dismissible>{errorMessage}</Alert>}
              {successMessage && <Alert variant="success">{successMessage}</Alert>}

              <form onSubmit={handleSubmit}>
                <TicketFormCampos
                  formData={ticketData}
                  onChange={handleInputChange}
                  isSaving={isSubmitting}
                  showAsignar={true}
                  showColumna={true}
                  showEstado={false}
                  showEmail={true}
                  showPrioridad={true}
                />

                {Number(ticketData.columna) === 4 && (
                  <TicketFrecuencia
                    frecuencia={ticketData.frecuencia}
                    onChange={handleFrecuenciaChange}
                    disabled={isSubmitting}
                  />
                )}

                <TicketFormImagenes
                  imagenes={ticketData.imagenes}
                  onAdd={handleImageUpload}
                  onRemove={handleRemoveImage}
                  isSaving={isSubmitting}
                />

                <TicketFormFooter
                  onCancel={requestClose}
                  isSaving={isSubmitting}
                  submitLabel="Crear Ticket"
                />
              </form>
            </div>
          </div>
        </div>
      </div>

      <ModalConfirmarDescartar
        isOpen={showDiscardConfirm}
        title="¿Descartar ticket sin crear?"
        message="Tenés datos cargados en el nuevo ticket. Si cerrás ahora, se descartará el borrador."
        confirmLabel="Descartar y cerrar"
        continueLabel="Seguir cargando"
        onContinue={() => setShowDiscardConfirm(false)}
        onConfirmDiscard={handleConfirmDiscard}
      />
    </>
  );
};

export default TicketCreator;
