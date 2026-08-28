import React from 'react';

interface TicketFormFooterProps {
  creadoPor?: string | null;
  onCancel: () => void;
  isSaving: boolean;
}

const TicketFormFooter: React.FC<TicketFormFooterProps> = ({ creadoPor, onCancel, isSaving }) => {
  return (
    <div className="d-flex justify-content-between align-items-end mt-3">
      {creadoPor && (
        <span className="text-muted" style={{ fontSize: '13px' }}>
          Creado por: <strong>{creadoPor}</strong>
        </span>
      )}

      <div className="d-flex gap-3 ms-auto">
        <button
          type="button"
          className="btn btn-outline-primary px-4"
          onClick={onCancel}
          disabled={isSaving}
        >
          Volver
        </button>
        <button
          type="submit"
          className="btn btn-primary px-4"
          disabled={isSaving}
        >
          {isSaving ? 'Guardando…' : 'Finalizar'}
        </button>
      </div>
    </div>
  );
};

export default TicketFormFooter;
