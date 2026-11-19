import { useState, useEffect, useCallback, startTransition } from 'react';
import type { Ticket } from '../../TYPES';
import type { TicketImageChanges } from '../../SERVICES/ticketService';

export interface ModalTicketOperationsProps {
  ticket: Ticket | null;
  isOpen: boolean;
  initialEditing?: boolean;
  isLockedByOther?: boolean;
  lockedBy?: string;
  onClose: () => void;
  onTicketUpdated?: (ticket: Ticket, imageChanges?: TicketImageChanges) => void | Promise<void>;
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

  const requestLockAndEdit = useCallback(async (): Promise<boolean> => {
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
    } catch (err: unknown) {
      const detail = typeof err === 'string' ? err : `El ticket está siendo editado por ${lockedBy || 'otro usuario'}.`;
      setLockError(detail);
      return false;
    } finally {
      setIsLocking(false);
    }
  }, [ticket, isLockedByOther, lockedBy, onLock]);

  const releaseLock = useCallback(async (): Promise<void> => {
    if (!ticket || !onUnlock) return;
    try {
      await onUnlock(ticket);
    } catch {
      // Ignorar errores al liberar lock
    }
  }, [ticket, onUnlock]);

  useEffect(() => {
    if (!isOpen || !initialEditing || isLockedByOther || !ticket?.id) return;

    let active = true;
    Promise.resolve().then(async () => {
      if (!active) return;
      await requestLockAndEdit();
    });

    return () => {
      active = false;
    };
  }, [isOpen, initialEditing, isLockedByOther, ticket?.id, requestLockAndEdit]);

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
    setIsEditing(false);
    setLockError(null);
    if (initialEditing) {
      onClose();
    }
  };

  const handleSave = async (ticketModificado: Ticket, imageChanges: TicketImageChanges): Promise<void> => {
    await onTicketUpdated?.(ticketModificado, imageChanges);
    // Nota: El backend libera el bloqueo automáticamente al guardar la actualización y emite ticket_desbloqueado
    setIsEditing(false);
    setLockError(null);
    onClose();
  };

  const handleModalClose = async (): Promise<void> => {
    if (isEditing) {
      await releaseLock();
    }
    setIsEditing(false);
    setLockError(null);
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
