import React from 'react';
import { 
  TICKET_STATE_COLORS, 
  PRIORIDAD_COLORS, 
  formatCatalogLabel 
} from '../../TICKETMENU/ticketStates';
import { type Ticket, TICKET_COLUMNS } from '../../../TYPES';
import { 
  FlagIcon, 
  PinIcon, 
  UserIcon, 
  CalendarIcon, 
  RepeatIcon, 
  ZoomInIcon 
} from '../../COMUN/Icons';

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

  const columnaId = ticket.columnId ?? ticket.columna;
  const columnaLabel = TICKET_COLUMNS.find((c) => Number(c.id) === Number(columnaId))?.label || columnaId;

  return (
    <div>
      <div className="d-flex align-items-baseline gap-2 mb-2">
        {ticket.identificador && (
          <span className="badge bg-dark font-monospace flex-shrink-0">{ticket.identificador}</span>
        )}
        <h4 className="mb-0 text-break">{ticket.titulo}</h4>
      </div>

      <div className="mb-3 d-flex flex-wrap gap-2 align-items-center mt-2">
        <span className={`badge bg-${stateColor}`}>{stateLabel}</span>

        {ticket.prioridad && (
          <span className={`badge bg-${prioridadColor} d-inline-flex align-items-center`}>
            <FlagIcon size={12} className="me-1" />
            {prioridadLabel}
          </span>
        )}

        {columnaId && (
          <span className="badge bg-light text-dark border d-inline-flex align-items-center">
            <PinIcon size={12} className="me-1 text-secondary" />
            {columnaLabel}
          </span>
        )}

        {ticket.colaborador && ticket.colaborador.trim() ? (
          <span className="badge bg-light text-dark border d-inline-flex align-items-center">
            <UserIcon size={13} className="me-1 text-primary" /> {ticket.colaborador}
          </span>
        ) : (
          <span className="badge bg-light text-secondary border d-inline-flex align-items-center">
            <UserIcon size={13} className="me-1 text-secondary opacity-75" /> Sin Asignar
          </span>
        )}

        {ticket.fechaCreacion && (
          <span className="badge bg-light text-secondary border d-inline-flex align-items-center">
            <CalendarIcon size={12} className="me-1 text-secondary" />
            {new Date(ticket.fechaCreacion).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
        )}

        {ticket.frecuencia && ticket.frecuencia.periodo !== 'No recurrente' && (
          <span className="badge bg-secondary d-inline-flex align-items-center">
            <RepeatIcon size={12} className="me-1" /> 
            Cada {ticket.frecuencia.numero} {ticket.frecuencia.periodo}
          </span>
        )}
      </div>

      <div className="mb-3">
        <strong>Descripción:</strong>
        <p className="mt-2 pre-wrap-text text-break">
          {ticket.descripcion}
        </p>
      </div>
      
      {ticket.imagenes && ticket.imagenes.length > 0 && (
        <div className="mb-3">
          <strong>Imágenes Adjuntas:</strong>
          <div className="mt-2 d-flex flex-wrap gap-3 justify-content-start">
            {ticket.imagenes.map((img, idx) => (
              <a
                key={idx}
                href={img}
                target="_blank"
                rel="noopener noreferrer"
                title="Clic para ver en tamaño completo"
                className="d-inline-block position-relative text-decoration-none"
              >
                <img 
                  src={img} 
                  alt={`Adjunto ${idx + 1}`} 
                  className="img-fluid rounded border shadow-sm ticket-detail-attachment" 
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).classList.add('opacity-50');
                  }}
                />
                <span className="badge bg-dark bg-opacity-75 position-absolute bottom-0 end-0 m-1 badge-zoom d-inline-flex align-items-center">
                  <ZoomInIcon size={11} className="me-1" /> Ampliar
                </span>
              </a>
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
