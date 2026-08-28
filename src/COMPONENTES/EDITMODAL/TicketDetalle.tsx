import React from 'react';
import { TICKET_STATE_LABELS, TICKET_STATE_COLORS } from './ticketStates';
import type { Ticket } from './types';

interface TicketDetalleProps {
  ticket: Ticket | null;
}

const TicketDetalle: React.FC<TicketDetalleProps> = ({ ticket }) => {
  if (!ticket) return null;

  const stateColor = TICKET_STATE_COLORS[ticket.estado] || 'secondary';
  const stateLabel = TICKET_STATE_LABELS[ticket.estado] || ticket.estado;

  return (
    <div>
      <h4>{ticket.titulo}</h4>
      <div className="mb-3 d-flex gap-2 align-items-center">
        <span className={`badge bg-${stateColor}`}>{stateLabel}</span>
        {ticket.colaborador && (
          <span className="badge bg-info text-dark">
            <i className="bi bi-person-fill me-1"></i> {ticket.colaborador}
          </span>
        )}
        {ticket.frecuencia && ticket.frecuencia.periodo !== 'No recurrente' && (
          <span className="badge bg-secondary">
            <i className="bi bi-arrow-repeat me-1"></i> 
            Cada {ticket.frecuencia.numero} {ticket.frecuencia.periodo}
          </span>
        )}
      </div>
      <div className="mb-3">
        <strong>Descripción:</strong>
        <p className="mt-2" style={{ whiteSpace: 'pre-wrap' }}>
          {ticket.descripcion}
        </p>
      </div>
      
      {ticket.imagenes && ticket.imagenes.length > 0 && (
        <div className="mb-3">
          <strong>Imágenes Adjuntas:</strong>
          <div className="mt-2 d-flex flex-wrap gap-2 justify-content-center">
            {ticket.imagenes.map((img, idx) => (
              <img 
                key={idx}
                src={img} 
                alt={`Adjunto ${idx + 1}`} 
                className="img-fluid rounded border shadow-sm" 
                style={{ maxHeight: '200px', objectFit: 'contain' }}
              />
            ))}
          </div>
        </div>
      )}

      <hr className="mt-4 mb-3" />
      <div className="d-flex flex-wrap justify-content-between text-muted small gap-2">
        <div className="d-flex flex-column gap-1">
          {ticket.creadoPor && (
            <span>Creado por: <strong>{ticket.creadoPor}</strong></span>
          )}
        </div>
        <div className="d-flex flex-column gap-1 text-end">
          {ticket.fechaCreacion && (
            <span><strong>Creado:</strong> {new Date(ticket.fechaCreacion).toLocaleString()}</span>
          )}
          {ticket.fechaModificacion && (
            <span><strong>Modificado:</strong> {new Date(ticket.fechaModificacion).toLocaleString()}</span>
          )}
          {ticket.fechaCierre && (
            <span><strong>Cerrado:</strong> {new Date(ticket.fechaCierre).toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetalle;
