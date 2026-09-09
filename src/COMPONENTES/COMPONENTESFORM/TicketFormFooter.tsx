import React from 'react';
import { Spinner } from 'react-bootstrap';

interface TicketFormFooterProps {
  creadoPor?: string | null;
  onCancel: () => void;
  isSaving?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
}

export const TicketFormFooter: React.FC<TicketFormFooterProps> = ({
  creadoPor,
  onCancel,
  isSaving = false,
  submitLabel = 'Finalizar',
  cancelLabel = 'Volver',
  showCancel = true
}) => {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 pt-2 border-top">
      {creadoPor ? (
        <span className="footer-created-by">
          Creado por: <strong>{creadoPor}</strong>
        </span>
      ) : (
        <div></div>
      )}

      <div className="d-flex gap-2 ms-auto">
        {showCancel && (
          <button
            type="button"
            className="btn btn-outline-secondary px-4"
            onClick={onCancel}
            disabled={isSaving}
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          className="btn btn-coopya-red px-4 d-flex align-items-center justify-content-center"
          disabled={isSaving}
        >
          {isSaving && <Spinner size="sm" animation="border" className="me-2" />}
          {isSaving ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </div>
  );
};

export default TicketFormFooter;
