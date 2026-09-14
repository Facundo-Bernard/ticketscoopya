import React, { useState } from 'react';
import { useTicketComments } from '../../../../hooks/useTicketComments';
import { getOperatorIdentity } from '../../../../UTILS/storageUtils';
import { ChevronRightIcon } from '../../../COMUN/Icons';
import CommentList from './CommentList';
import CommentForm from './CommentForm';

interface TicketComentariosProps {
  ticketId: string | number;
}

export const TicketComentarios: React.FC<TicketComentariosProps> = ({ ticketId }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const currentOperator = getOperatorIdentity();

  const {
    comments,
    totalCount,
    loading,
    loadingMore,
    hasMore,
    isSubmitting,
    loadMoreComments,
    addComment,
    deleteComment,
  } = useTicketComments(ticketId);

  const handleAddComment = async (mensaje: string) => {
    await addComment(currentOperator, mensaje);
  };

  return (
    <div className="ticket-comentarios-section mb-3">
      <div className="d-flex align-items-center mb-2">
        <button
          type="button"
          className="attachment-collapse-trigger"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="Alternar visualización de comentarios e historial"
        >
          <span className={`attachment-chevron ${isOpen ? 'is-open' : ''}`}>
            <ChevronRightIcon size={14} />
          </span>
          <strong className="text-dark">Comentarios e Historial:</strong>
          {!loading && (
            <span
              className="badge bg-light text-secondary border rounded-pill"
              style={{ fontSize: '11px' }}
            >
              {totalCount}
            </span>
          )}
        </button>
      </div>

      <div className={`attachment-collapse-wrapper ${isOpen ? 'is-open' : ''}`}>
        <div className="attachment-collapse-inner">
          <div className="pt-1 pb-1">
            <CommentList
              comments={comments}
              currentOperator={currentOperator}
              loading={loading}
              loadingMore={loadingMore}
              hasMore={hasMore}
              onLoadMore={loadMoreComments}
              onDelete={deleteComment}
            />

            <CommentForm
              onSubmit={handleAddComment}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TicketComentarios);
