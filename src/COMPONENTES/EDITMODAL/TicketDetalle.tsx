import React from 'react';
import { 
  TICKET_STATE_COLORS, 
  PRIORIDAD_COLORS,
  formatCatalogLabel 
} from './ticketStates';
import type { Ticket } from './types';

interface TicketDetalleProps {
  ticket: Ticket | null;
}

const TicketDetalle: React.FC<TicketDetalleProps> = ({ ticket }) => {
  if (!ticket) return null;

  const estadoNormalizado = (ticket.estado || 'abierto').toLowerCase();
  const stateColor = TICKET_STATE_COLORS[estadoNormalizado] || 'secondary';
  const stateLabel = formatCatalogLabel(ticket.estado);

  const prioridadNormalizada = (ticket.prioridad || 'media').toLowerCase();
  const prioridadColor = PRIORIDAD_COLORS[prioridadNormalizada] || 'secondary';
  const prioridadLabel = formatCatalogLabel(ticket.prioridad);

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-2">
        {ticket.identificador && (
          <span className="badge bg-dark font-monospace">{ticket.identificador}</span>
        )}
        <h4 className="mb-0">{ticket.titulo}</h4>
      </div>

      <div className="mb-3 d-flex flex-wrap gap-2 align-items-center mt-2">
        <span className={`badge bg-${stateColor}`}>{stateLabel}</span>

        {ticket.prioridad && (
          <span className={`badge bg-${prioridadColor}`}>
            <i className="bi bi-flag-fill me-1"></i>
            {prioridadLabel}
          </span>
        )}

        {ticket.colaborador && (
          <span className="badge bg-light text-dark border">
            <i className="bi bi-person-fill text-info me-1"></i> {ticket.colaborador}
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
          {ticket.correo && ticket.correo !== ticket.creadoPor && (
            <span>Contacto: <strong>{ticket.correo}</strong></span>
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
