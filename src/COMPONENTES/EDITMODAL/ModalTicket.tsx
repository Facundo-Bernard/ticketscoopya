import React, { useState, useEffect } from 'react';
import TicketDetalle from './TicketDetalle';
import TicketForm from './TicketForm';
import { TICKET_STATES } from './ticketStates';
import type { Ticket } from './types';

interface ModalTicketProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onTicketUpdated: (ticket: Ticket) => void;
}

const ModalTicket: React.FC<ModalTicketProps> = ({ ticket, isOpen, onClose, onTicketUpdated }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);

  const handleEditClick = (): void => {
    setIsEditing(true);
  };

  const handleCancelEdit = (): void => {
    setIsEditing(false);
  };

  const handleSave = (ticketModificado: Ticket): void => {
    onTicketUpdated(ticketModificado);
    setIsEditing(false);
    onClose();
  };

  const handleReactivar = (): void => {
    if (!ticket) return;
    onTicketUpdated({
      ...ticket,
      estado: TICKET_STATES.PENDIENTE,
      fechaModificacion: new Date().toISOString(),
      fechaCierre: null
    });
    onClose();
  };

  if (!isOpen || !ticket) return null;

  const isTerminado = ticket.estado === TICKET_STATES.TERMINADO;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      <div 
        className="modal fade show d-block" 
        tabIndex={-1} 
        style={{ zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          if (e.target === e.currentTarget && !isEditing) onClose();
        }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content" style={{ borderRadius: '8px', border: 'none' }}>
            {isEditing ? (
              <div className="modal-body p-4">
                <TicketForm
                  ticket={ticket}
                  onCancel={handleCancelEdit}
                  onSave={handleSave}
                />
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <h5 className="modal-title">Detalle del Ticket</h5>
                  <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                </div>
                
                <div className="modal-body">
                  <TicketDetalle ticket={ticket} />
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Cerrar
                  </button>
                  {isTerminado ? (
                    <button type="button" className="btn btn-warning" onClick={handleReactivar}>
                      Reactivar
                    </button>
                  ) : (
                    <button type="button" className="btn btn-primary" onClick={handleEditClick}>
                      Editar
                    </button>
                  )}
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
