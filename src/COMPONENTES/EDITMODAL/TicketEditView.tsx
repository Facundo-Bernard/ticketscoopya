import React from 'react';
import { Alert } from 'react-bootstrap';
import type { Ticket } from '../../TYPES';
import { useTicketEdit } from './useTicketEdit';
import {
  TicketFormCampos,
  TicketFormImagenes,
  TicketFrecuencia,
  TicketFormFooter
} from '../COMPONENTESFORM';

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
      <div className="modal-header d-flex justify-content-between align-items-center py-3 bg-white">
        <h5 className="modal-title fw-bold mb-0" style={{ color: '#002B5E' }}>
          Edición de Ticket
        </h5>
        <button
          type="button"
          className="btn-close"
          onClick={onCancel}
          disabled={isSaving}
          aria-label="Cerrar"
        ></button>
      </div>

      <div className="modal-body p-4">
        {errorMessage && <Alert variant="danger" dismissible>{errorMessage}</Alert>}

        {creatorEmail && (
          <div className="mb-3">
            <label className="form-label mb-1 fw-bold" style={{ color: '#002B5E', fontSize: '14px' }}>
              Correo de quien lo generó
            </label>
            <input
              type="email"
              className="form-control"
              value={creatorEmail}
              readOnly
              disabled
            />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <TicketFormCampos
            formData={formData}
            onChange={handleInputChange}
            isSaving={isSaving}
            showAsignar={true}
            showColumna={true}
            showEstado={true}
            showEmail={false}
            showPrioridad={true}
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
