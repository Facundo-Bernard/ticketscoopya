import { useState, useEffect, useCallback, useRef } from 'react';
import commentService from '../SERVICES/commentService';
import type { TicketComment, CommentFilters } from '../TYPES';

const PAGE_SIZE = 3;

interface CommentsState {
  items: TicketComment[];
  total: number;
}

export function useTicketComments(ticketId: string | number | undefined) {
  const cleanTicketId = ticketId !== undefined && ticketId !== null ? String(ticketId) : '';
  const [commentState, setCommentState] = useState<CommentsState>({ items: [], total: 0 });
  const [loading, setLoading] = useState<boolean>(Boolean(cleanTicketId));
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const deletedIdsRef = useRef<Set<string>>(new Set());

  const appendUniqueComment = useCallback((comment: TicketComment) => {
    setCommentState((prev) => {
      if (prev.items.some((c) => c.id === comment.id)) {
        return prev;
      }
      return {
        items: [comment, ...prev.items],
        total: prev.total + 1,
      };
    });
  }, []);

  // 1. Carga inicial de comentarios y conteo total en paralelo (eliminando waterfalls)
  const fetchComments = useCallback(async (filters?: CommentFilters) => {
    if (!cleanTicketId) return;

    setLoading(true);
    setError(null);

    try {
      const [list, count] = await Promise.all([
        commentService.getComments(cleanTicketId, { skip: 0, limit: PAGE_SIZE, ...filters }),
        commentService.getCommentsCount(cleanTicketId, filters),
      ]);

      setCommentState({ items: list, total: count });
    } catch (err: unknown) {
      console.error('Error al cargar comentarios:', err);
      setError('No se pudieron cargar los comentarios.');
    } finally {
      setLoading(false);
    }
  }, [cleanTicketId]);

  useEffect(() => {
    if (!cleanTicketId) return;
    let active = true;
    deletedIdsRef.current.clear();

    Promise.all([
      commentService.getComments(cleanTicketId, { skip: 0, limit: PAGE_SIZE }),
      commentService.getCommentsCount(cleanTicketId),
    ])
      .then(([list, count]) => {
        if (!active) return;
        setCommentState({ items: list, total: count });
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        console.error('Error al cargar comentarios:', err);
        setError('No se pudieron cargar los comentarios.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [cleanTicketId]);

  // 2. Cargar más comentarios (Paginación hacia atrás)
  const loadMoreComments = useCallback(async () => {
    if (!cleanTicketId || loadingMore || commentState.items.length >= commentState.total) return;

    setLoadingMore(true);
    try {
      const older = await commentService.getComments(cleanTicketId, {
        skip: commentState.items.length,
        limit: PAGE_SIZE,
      });

      setCommentState((prev) => {
        const existingIds = new Set(prev.items.map((c) => c.id));
        const filtered = older.filter((c) => !existingIds.has(c.id));
        return {
          ...prev,
          items: [...prev.items, ...filtered],
        };
      });
    } catch (err: unknown) {
      console.error('Error al paginar comentarios:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [cleanTicketId, loadingMore, commentState.items.length, commentState.total]);

  // 3. Crear comentario
  const addComment = useCallback(async (autor: string, mensaje: string): Promise<TicketComment | undefined> => {
    if (!cleanTicketId || !mensaje.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newComment = await commentService.createComment(cleanTicketId, {
        autor: autor.trim(),
        mensaje: mensaje.trim(),
      });

      appendUniqueComment(newComment);
      return newComment;
    } catch (err: unknown) {
      console.error('Error al publicar comentario:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [cleanTicketId, isSubmitting, appendUniqueComment]);

  // 4. Eliminar comentario
  const deleteComment = useCallback(async (commentId: string): Promise<void> => {
    if (!cleanTicketId) return;

    try {
      await commentService.deleteComment(cleanTicketId, commentId);
      deletedIdsRef.current.add(commentId);
      setCommentState((prev) => ({
        items: prev.items.filter((c) => c.id !== commentId),
        total: Math.max(0, prev.total - 1),
      }));
    } catch (err: unknown) {
      console.error('Error al eliminar comentario:', err);
      throw err;
    }
  }, [cleanTicketId]);

  // 5. Sincronización en vivo silenciosa mediante eventos SSE (evitando doble conteo por eco propio)
  useEffect(() => {
    if (!cleanTicketId) return;

    const handleNuevoComentario = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (String(detail?.ticket_id) === cleanTicketId && detail?.comentario) {
        appendUniqueComment(detail.comentario as TicketComment);
      }
    };

    const handleComentarioEliminado = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (String(detail?.ticket_id) === cleanTicketId && detail?.comment_id) {
        const targetId = String(detail.comment_id);
        if (deletedIdsRef.current.has(targetId)) {
          deletedIdsRef.current.delete(targetId);
          return;
        }
        setCommentState((prev) => ({
          items: prev.items.filter((c) => c.id !== targetId),
          total: Math.max(0, prev.total - 1),
        }));
      }
    };

    window.addEventListener('sse:nuevo_comentario', handleNuevoComentario);
    window.addEventListener('sse:comentario_eliminado', handleComentarioEliminado);

    return () => {
      window.removeEventListener('sse:nuevo_comentario', handleNuevoComentario);
      window.removeEventListener('sse:comentario_eliminado', handleComentarioEliminado);
    };
  }, [cleanTicketId, appendUniqueComment]);

  return {
    comments: commentState.items,
    totalCount: commentState.total,
    loading,
    loadingMore,
    isSubmitting,
    error,
    hasMore: commentState.items.length < commentState.total,
    loadMoreComments,
    addComment,
    deleteComment,
    refetch: fetchComments,
  };
}

export default useTicketComments;
