import { useState, useEffect, startTransition } from 'react';
import type { Ticket } from '../../TYPES';

export interface ModalTicketOperationsProps {
  ticket: Ticket | null;
  isOpen: boolean;
  initialEditing?: boolean;
  onClose: () => void;
  onTicketUpdated?: (ticket: Ticket) => void | Promise<void>;
}

export function useModalTicketOperations({
  ticket,
  isOpen,
  initialEditing = false,
  onClose,
  onTicketUpdated,
}: ModalTicketOperationsProps) {
  const [isEditing, setIsEditing] = useState<boolean>(initialEditing);

  useEffect(() => {
    if (isOpen) {
      setIsEditing(initialEditing);
    }
  }, [isOpen, initialEditing]);

  const isTerminado = ticket?.estado === 'cerrado' || ticket?.estado === 'resuelto';

  const toggleEditMode = (editing: boolean): void => {
    startTransition(() => {
      setIsEditing(editing);
    });
  };

  const handleCancelEdit = (): void => {
    if (initialEditing) {
      onClose();
    } else {
      toggleEditMode(false);
    }
  };

  const handleSave = async (ticketModificado: Ticket): Promise<void> => {
    await onTicketUpdated?.(ticketModificado);
    toggleEditMode(false);
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

  return {
    isEditing,
    isTerminado,
    toggleEditMode,
    handleCancelEdit,
    handleSave,
    handleReactivar,
  };
}

export const modalTicketOperations = useModalTicketOperations;
export default useModalTicketOperations;
