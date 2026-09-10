import React, { useEffect, useRef } from 'react';
import { Alert } from 'react-bootstrap';
import { useTicketForm } from './useTicketForm';
import { TICKET_COLUMNS, type Ticket } from '../../TYPES';
import { TicketFormCampos, TicketFormImagenes, TicketFormFooter, TicketFrecuencia } from '../COMPONENTESFORM';

export interface TicketCreatorModalProps {
  isOpen: boolean;
  initialColumna?: number;
  onClose: () => void;
  onSuccess?: (ticket: Ticket) => void;
}

export const TicketCreator: React.FC<TicketCreatorModalProps> = ({
  isOpen,
  initialColumna = 1,
  onClose,
  onSuccess
}) => {
  const {
    ticketData,
    isSubmitting,
    errorMessage,
    successMessage,
    handleInputChange,
    handleImageUpload,
    handleRemoveImage,
    handleFrecuenciaChange,
    resetForm,
    handleSubmit
  } = useTicketForm({ initialColumna, onSuccess });

  const prevIsOpenRef = useRef(isOpen);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      resetForm(initialColumna);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialColumna, resetForm]);

  if (!isOpen) return null;

  const columnaActual = TICKET_COLUMNS.find((c) => Number(c.id) === Number(ticketData.columna));

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          if (e.target === e.currentTarget && !isSubmitting) onClose();
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
                onClick={onClose}
                disabled={isSubmitting}
                aria-label="Cerrar"
              ></button>
            </div>

            <div className="modal-body p-4">
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
                  onCancel={onClose}
                  isSaving={isSubmitting}
                  submitLabel="Crear Ticket"
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketCreator;
