import { useState, useEffect, useCallback } from 'react';
import commentService from '../SERVICES/commentService';
import type { TicketComment, CommentFilters } from '../TYPES';

const PAGE_SIZE = 3;

export function useTicketComments(ticketId: string | number | undefined) {
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cleanTicketId = ticketId !== undefined && ticketId !== null ? String(ticketId) : '';

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

      setComments(list);
      setTotalCount(count);
    } catch (err: unknown) {
      console.error('Error al cargar comentarios:', err);
      setError('No se pudieron cargar los comentarios.');
    } finally {
      setLoading(false);
    }
  }, [cleanTicketId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // 2. Cargar más comentarios (Paginación de 10 en 10 hacia atrás)
  const loadMoreComments = useCallback(async () => {
    if (!cleanTicketId || loadingMore || comments.length >= totalCount) return;

    setLoadingMore(true);
    try {
      const older = await commentService.getComments(cleanTicketId, {
        skip: comments.length,
        limit: PAGE_SIZE,
      });

      setComments((prev) => {
        // Evitar duplicados si llegaron comentarios concurrentemente
        const existingIds = new Set(prev.map((c) => c.id));
        const filtered = older.filter((c) => !existingIds.has(c.id));
        return [...prev, ...filtered];
      });
    } catch (err: unknown) {
      console.error('Error al paginar comentarios:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [cleanTicketId, loadingMore, comments.length, totalCount]);

  // 3. Crear comentario
  const addComment = useCallback(async (autor: string, mensaje: string): Promise<TicketComment | undefined> => {
    if (!cleanTicketId || !mensaje.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newComment = await commentService.createComment(cleanTicketId, {
        autor: autor.trim(),
        mensaje: mensaje.trim(),
      });

      setComments((prev) => {
        if (prev.some((c) => c.id === newComment.id)) return prev;
        return [newComment, ...prev];
      });
      setTotalCount((prev) => prev + 1);

      return newComment;
    } catch (err: unknown) {
      console.error('Error al publicar comentario:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [cleanTicketId, isSubmitting]);

  // 4. Eliminar comentario
  const deleteComment = useCallback(async (commentId: string): Promise<void> => {
    if (!cleanTicketId) return;

    try {
      await commentService.deleteComment(cleanTicketId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (err: unknown) {
      console.error('Error al eliminar comentario:', err);
      throw err;
    }
  }, [cleanTicketId]);

  // 5. Sincronización en vivo silenciosa mediante eventos SSE (sin alertas de escritorio)
  useEffect(() => {
    if (!cleanTicketId) return;

    const handleNuevoComentario = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (String(detail?.ticket_id) === cleanTicketId && detail?.comentario) {
        const commentData = detail.comentario as TicketComment;
        setComments((prev) => {
          if (prev.some((c) => c.id === commentData.id)) return prev;
          return [commentData, ...prev];
        });
        setTotalCount((prev) => prev + 1);
      }
    };

    const handleComentarioEliminado = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (String(detail?.ticket_id) === cleanTicketId && detail?.comment_id) {
        const targetId = String(detail.comment_id);
        setComments((prev) => prev.filter((c) => c.id !== targetId));
        setTotalCount((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('sse:nuevo_comentario', handleNuevoComentario);
    window.addEventListener('sse:comentario_eliminado', handleComentarioEliminado);

    return () => {
      window.removeEventListener('sse:nuevo_comentario', handleNuevoComentario);
      window.removeEventListener('sse:comentario_eliminado', handleComentarioEliminado);
    };
  }, [cleanTicketId]);

  return {
    comments,
    totalCount,
    loading,
    loadingMore,
    isSubmitting,
    error,
    hasMore: comments.length < totalCount,
    loadMoreComments,
    addComment,
    deleteComment,
    refetch: fetchComments,
  };
}

export default useTicketComments;
