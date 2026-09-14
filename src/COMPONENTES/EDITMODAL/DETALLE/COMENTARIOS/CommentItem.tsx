import React, { useState } from 'react';
import type { TicketComment } from '../../../../TYPES';
import { TrashIcon, UserIcon } from '../../../COMUN/Icons';

interface CommentItemProps {
  comment: TicketComment;
  currentOperator?: string;
  onDelete: (commentId: string) => Promise<void>;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const formattedDate = new Date(comment.fecha_creacion).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } catch {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="comment-item-card p-3 rounded-3 bg-white border shadow-sm">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex align-items-center min-w-0">
          <UserIcon size={14} className="text-primary flex-shrink-0 me-2" />
          <span className="fw-semibold small text-dark text-truncate" title={comment.autor}>
            {comment.autor}
          </span>
        </div>

        <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-2">
          <span className="text-muted small" style={{ fontSize: '11px' }}>
            {formattedDate}
          </span>

          {confirmDelete ? (
            <div className="d-flex align-items-center gap-1 ms-1">
              <span className="text-danger small" style={{ fontSize: '11px' }}>¿Borrar?</span>
              <button
                type="button"
                className="btn btn-xs btn-danger px-1.5 py-0 fw-semibold"
                style={{ fontSize: '10px' }}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? '...' : 'Sí'}
              </button>
              <button
                type="button"
                className="btn btn-xs btn-outline-secondary px-1 py-0"
                style={{ fontSize: '10px' }}
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-link text-danger p-0 ms-1 comment-delete-btn d-inline-flex align-items-center gap-1 text-decoration-none"
              title="Eliminar comentario"
              onClick={() => setConfirmDelete(true)}
            >
              <TrashIcon size={12} />
              <span style={{ fontSize: '11px' }}>Borrar</span>
            </button>
          )}
        </div>
      </div>

      <div
        className="comment-item-body text-dark small"
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          lineHeight: '1.5',
          fontSize: '13px',
        }}
      >
        {comment.mensaje}
      </div>
    </div>
  );
};

export default React.memo(CommentItem);
