import React from 'react';
import { Alert } from 'react-bootstrap';
import type { Ticket } from '../../../TYPES';
import { useTicketEdit } from './useTicketEdit';
import {
  TicketFormCampos,
  TicketFormImagenes,
  TicketFrecuencia,
  TicketFormFooter
} from '../../COMPONENTESFORM';

export interface TicketEditViewProps {
  ticket: Ticket;
  onCancel: () => void;
  onSave: (updatedTicket: Ticket) => void | Promise<void>;
}

export const TicketEditView: React.FC<TicketEditViewProps> = ({
  ticket,
  onCancel,
  onSave
}) => {
  const {
    formData,
    imagenes,
    isSaving,
    errorMessage,
    creatorEmail,
    handleInputChange,
    handleFrecuenciaChange,
    handleImageAdd,
    handleImageRemove,
    handleSubmit
  } = useTicketEdit(ticket, onSave);

  return (
    <>
      <div className="modal-header d-flex justify-content-between align-items-center py-3 bg-white border-bottom">
        <h5 className="modal-title fw-bold mb-0 text-dark">
          Editar Ticket {ticket.identificador ? `(${ticket.identificador})` : ''}
        </h5>
        <button type="button" className="btn-close" onClick={onCancel} aria-label="Cerrar"></button>
      </div>

      <div className="modal-body p-4">
        {errorMessage && (
          <Alert variant="danger" dismissible>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TicketFormCampos
            formData={formData}
            onChange={handleInputChange}
            isSaving={isSaving}
            showAsignar={true}
            showColumna={true}
            showEstado={true}
            showPrioridad={true}
            showEmail={false}
          />

          {Number(formData.columnId) === 4 && (
            <div className="mb-3">
              <TicketFrecuencia
                frecuencia={formData.frecuencia}
                onChange={handleFrecuenciaChange}
                disabled={isSaving}
              />
            </div>
          )}

          <TicketFormImagenes
            imagenes={imagenes}
            onAdd={handleImageAdd}
            onRemove={handleImageRemove}
            isSaving={isSaving}
          />

          <TicketFormFooter
            creadoPor={creatorEmail}
            onCancel={onCancel}
            isSaving={isSaving}
            submitLabel="Guardar cambios"
          />
        </form>
      </div>
    </>
  );
};

export default TicketEditView;
