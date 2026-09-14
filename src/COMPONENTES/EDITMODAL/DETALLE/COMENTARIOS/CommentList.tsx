import React from 'react';
import type { TicketComment } from '../../../../TYPES';
import CommentItem from './CommentItem';
import { MessageSquareIcon } from '../../../COMUN/Icons';

interface CommentListProps {
  comments: TicketComment[];
  currentOperator: string;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onDelete: (commentId: string) => Promise<void>;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  currentOperator,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onDelete,
}) => {
  if (loading && comments.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center gap-2 py-4 text-muted small">
        <span className="spinner-border spinner-border-sm text-secondary" role="status" aria-hidden="true" />
        <span>Cargando comentarios...</span>
      </div>
    );
  }

  if (!loading && comments.length === 0) {
    return (
      <div className="text-center py-4 px-3 bg-light rounded-3 border border-dashed mb-3">
        <div className="text-secondary opacity-75 mb-2">
          <MessageSquareIcon size={24} />
        </div>
        <p className="text-muted small mb-1 fw-medium">
          No hay comentarios aún en este ticket.
        </p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-2.5 mb-3">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentOperator={currentOperator}
          onDelete={onDelete}
        />
      ))}

      {hasMore && (
        <div className="text-center mt-1">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary px-3 py-1 fw-medium d-inline-flex align-items-center gap-2"
            style={{ fontSize: '12px', borderRadius: '6px' }}
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                <span>Cargando anteriores...</span>
              </>
            ) : (
              <span>Cargar comentarios anteriores</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(CommentList);
