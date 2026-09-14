import React, { useState } from 'react';
import { SendIcon } from '../../../COMUN/Icons';

interface CommentFormProps {
  onSubmit: (mensaje: string) => Promise<void>;
  isSubmitting: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const [mensaje, setMensaje] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = mensaje.trim();
    if (!cleanText || isSubmitting) return;

    setErrorMsg(null);
    try {
      await onSubmit(cleanText);
      setMensaje('');
    } catch {
      setErrorMsg('No se pudo enviar el comentario. Por favor, reintentá.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enviar con Ctrl + Enter o Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form-container mt-2">
      {errorMsg && (
        <div className="alert alert-danger py-1 px-2 small mb-2" role="alert">
          {errorMsg}
        </div>
      )}

      <div className="border rounded-3 p-2 bg-white shadow-sm focus-within-ring">
        <textarea
          rows={2}
          className="form-control border-0 shadow-none p-1 small"
          style={{ resize: 'vertical', minHeight: '56px', fontSize: '13px' }}
          placeholder="Escribí un comentario o nota interna... (Ctrl + Enter para enviar)"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
          maxLength={2000}
        />

        <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-1">
          <span className="text-muted" style={{ fontSize: '11px' }}>
            Ctrl + Enter para enviar
          </span>

          <div className="d-flex align-items-center gap-2">
            <button
              type="submit"
              className="btn btn-sm btn-coopya-red px-3 d-inline-flex align-items-center gap-1.5 fw-semibold"
              style={{ fontSize: '12px', borderRadius: '6px' }}
              disabled={!mensaje.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <SendIcon size={12} />
                  <span>Comentar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default React.memo(CommentForm);
