import React from 'react';

export interface ModalTicketFooterProps {
  isTerminado?: boolean;
  isLockedByOther?: boolean;
  lockedBy?: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  onReactivar: () => void;
}

export const ModalTicketFooter: React.FC<ModalTicketFooterProps> = ({
  isTerminado = false,
  isLockedByOther = false,
  lockedBy,
  onClose,
  onEdit,
  onDelete,
  onReactivar,
}) => {
  return (
    <div className="modal-footer d-flex justify-content-between align-items-center py-3">
      {onDelete ? (
        <button
          type="button"
          className={`btn btn-sm d-inline-flex align-items-center gap-1 px-3 py-1 fw-medium ${isLockedByOther ? 'btn-outline-secondary opacity-50' : 'btn-outline-danger'}`}
          onClick={onDelete}
          disabled={isLockedByOther}
          title={isLockedByOther ? `Bloqueado para eliminar: en edición por ${lockedBy}` : undefined}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          <span>{isLockedByOther ? '🔒 Bloqueado' : 'Eliminar ticket'}</span>
        </button>
      ) : (
        <div></div>
      )}

      <div className="d-flex align-items-center gap-2">
        <button 
          type="button" 
          className="btn btn-outline-secondary px-4 fw-medium" 
          onClick={onClose}
        >
          Cerrar
        </button>

        {isTerminado ? (
          <button 
            type="button" 
            className="btn btn-warning px-4 fw-semibold text-dark d-inline-flex align-items-center gap-2" 
            onClick={onReactivar}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            <span>Reactivar</span>
          </button>
        ) : (
          <button
            type="button"
            className={`btn px-4 fw-semibold d-inline-flex align-items-center gap-2 ${isLockedByOther ? 'btn-secondary opacity-75' : 'btn-coopya-red'}`}
            onClick={onEdit}
            disabled={isLockedByOther}
            title={isLockedByOther ? `Bloqueado para edición por ${lockedBy}` : undefined}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
            <span>{isLockedByOther ? '🔒 En edición' : 'Editar'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ModalTicketFooter;
