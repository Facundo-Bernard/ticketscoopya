import { useState, useEffect, startTransition } from 'react';
import type { Ticket } from '../../TYPES';

export interface ModalTicketOperationsProps {
  ticket: Ticket | null;
  isOpen: boolean;
  initialEditing?: boolean;
  isLockedByOther?: boolean;
  lockedBy?: string;
  onClose: () => void;
  onTicketUpdated?: (ticket: Ticket) => void | Promise<void>;
  onLock?: (ticket: Ticket) => Promise<boolean>;
  onUnlock?: (ticket: Ticket) => Promise<void>;
}

export function useModalTicketOperations({
  ticket,
  isOpen,
  initialEditing = false,
  isLockedByOther = false,
  lockedBy,
  onClose,
  onTicketUpdated,
  onLock,
  onUnlock,
}: ModalTicketOperationsProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [lockError, setLockError] = useState<string | null>(null);
  const [isLocking, setIsLocking] = useState<boolean>(false);

  const isTerminado = ticket?.estado === 'cerrado' || ticket?.estado === 'resuelto';

  const requestLockAndEdit = async (): Promise<boolean> => {
    if (!ticket) return false;
    if (isLockedByOther) {
      setLockError(`El ticket está siendo editado por ${lockedBy || 'otro usuario'}.`);
      return false;
    }
    setLockError(null);
    setIsLocking(true);
    try {
      if (onLock) {
        const success = await onLock(ticket);
        if (!success) {
          setLockError(`El ticket está siendo editado por ${lockedBy || 'otro usuario'}.`);
          return false;
        }
      }
      startTransition(() => {
        setIsEditing(true);
      });
      return true;
    } catch (err: any) {
      const detail = typeof err === 'string' ? err : `El ticket está siendo editado por ${lockedBy || 'otro usuario'}.`;
      setLockError(detail);
      return false;
    } finally {
      setIsLocking(false);
    }
  };

  const releaseLock = async (): Promise<void> => {
    if (!ticket || !onUnlock) return;
    try {
      await onUnlock(ticket);
    } catch {
      // Ignorar errores al liberar lock
    }
  };

  useEffect(() => {
    if (isOpen) {
      setLockError(null);
      if (initialEditing && !isLockedByOther) {
        requestLockAndEdit();
      } else {
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
      setLockError(null);
    }
  }, [isOpen, initialEditing, isLockedByOther, ticket?.id]);

  const toggleEditMode = async (editing: boolean): Promise<void> => {
    if (editing) {
      await requestLockAndEdit();
    } else {
      await releaseLock();
      startTransition(() => {
        setIsEditing(false);
      });
    }
  };

  const handleCancelEdit = async (): Promise<void> => {
    await releaseLock();
    if (initialEditing) {
      onClose();
    } else {
      setIsEditing(false);
    }
  };

  const handleSave = async (ticketModificado: Ticket): Promise<void> => {
    await onTicketUpdated?.(ticketModificado);
    // Nota: El backend libera el bloqueo automáticamente al guardar la actualización y emite ticket_desbloqueado
    setIsEditing(false);
    onClose();
  };

  const handleModalClose = async (): Promise<void> => {
    if (isEditing) {
      await releaseLock();
    }
    onClose();
  };

  const handleReactivar = (): void => {
    if (!ticket) return;
    onTicketUpdated?.({
      ...ticket,
      estado: 'abierto',
      fechaModificacion: new Date().toISOString(),
      fechaCierre: null,
    });
    onClose();
  };

  const clearLockError = () => {
    setLockError(null);
  };

  return {
    isEditing,
    isTerminado,
    lockError,
    isLocking,
    clearLockError,
    toggleEditMode,
    handleCancelEdit,
    handleSave,
    handleModalClose,
    handleReactivar,
  };
}

export const modalTicketOperations = useModalTicketOperations;
export default useModalTicketOperations;
