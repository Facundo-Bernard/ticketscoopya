import React from 'react';
import { LockIcon, TrashIcon, EditIcon, ReactivateIcon } from '../../COMUN/Icons';

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
          {isLockedByOther ? <LockIcon size={14} /> : <TrashIcon size={14} />}
          <span>{isLockedByOther ? 'Bloqueado' : 'Eliminar ticket'}</span>
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
            <ReactivateIcon size={14} />
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
            {isLockedByOther ? <LockIcon size={14} /> : <EditIcon size={14} />}
            <span>{isLockedByOther ? 'En edición' : 'Editar'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ModalTicketFooter;
