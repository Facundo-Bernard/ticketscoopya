import React, { useState, useEffect, startTransition } from 'react';
import TicketDetalle from '../TICKETMENU/TicketDetalle';
import TicketEditView from './TicketEditView';
import type { Ticket } from '../../TYPES';

export interface ModalTicketProps {
  ticket: Ticket | null;
  isOpen: boolean;
  initialEditing?: boolean;
  onClose: () => void;
  onTicketUpdated?: (ticket: Ticket) => void;
  onDelete?: (ticket: Ticket) => void;
}

export const ModalTicket: React.FC<ModalTicketProps> = ({
  ticket,
  isOpen,
  initialEditing = false,
  onClose,
  onTicketUpdated,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(initialEditing);

  useEffect(() => {
    if (isOpen) {
      setIsEditing(initialEditing);
    }
  }, [isOpen, initialEditing]);

  if (!isOpen || !ticket) return null;

  const isTerminado = ticket.estado === 'cerrado' || ticket.estado === 'resuelto';

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
    onTicketUpdated?.({
      ...ticket,
      estado: 'abierto',
      fechaModificacion: new Date().toISOString(),
      fechaCierre: null
    });
    onClose();
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-4 shadow-lg overflow-hidden modal-top-accent">
            {isEditing ? (
              <TicketEditView
                ticket={ticket}
                onCancel={handleCancelEdit}
                onSave={handleSave}
              />
            ) : (
              <>
                <div className="modal-header d-flex justify-content-between align-items-center py-3 bg-white">
                  <h5 className="modal-title fw-bold mb-0 text-primary">
                    Detalle del Ticket
                  </h5>
                  <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar"></button>
                </div>

                <div className="modal-body p-4">
                  <TicketDetalle ticket={ticket} />
                </div>

                <div className="modal-footer d-flex justify-content-between align-items-center">
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                    onClick={() => {
                      onClose();
                      onDelete?.(ticket);
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span>Eliminar ticket</span>
                  </button>

                  <div className="d-flex align-items-center gap-2">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                      Cerrar
                    </button>
                    {isTerminado ? (
                      <button type="button" className="btn btn-warning" onClick={handleReactivar}>
                        Reactivar
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => toggleEditMode(true)}
                      >
                        Editar
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalTicket;
