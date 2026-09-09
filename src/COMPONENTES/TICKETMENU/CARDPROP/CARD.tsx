import CardActionsMenu from './CardActionsMenu'
import { getInitials, getPriorityBadge } from './cardUtils'

export type TicketCard = {
  id: string
  title: string
  user: string
  date: string
  description: string
  priority?: string
  frequency?: string
}

export default function Card({ 
  card, 
  onClick, 
  onViewMore,
  onDelete
}: { 
  card: TicketCard; 
  onClick: () => void; 
  onViewMore?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="ticket-card p-3 text-start w-100">
      {/* Encabezado: ID + Prioridad (izq) y Fecha + Menú 3 Puntos (der) */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-light text-secondary border rounded-2 fw-semibold">
            {card.id}
          </span>
          {getPriorityBadge(card.priority)}
        </div>

        <div className="d-flex align-items-center gap-2">
          <small className="text-secondary">{card.date}</small>
          <CardActionsMenu
            ticketTitle={card.title}
            onEdit={onClick}
            onDelete={onDelete}
          />
        </div>
      </div>

      {/* Título del Ticket */}
      <h6 className="fw-bold text-dark mb-1 lh-sm">{card.title}</h6>

      {/* Descripción (2 líneas) */}
      <p className="small text-secondary mb-3 line-clamp-2">{card.description}</p>

      {/* Pie de tarjeta: Usuario asignado (izq) y Frecuencia / Ver más (der) */}
      <div className="d-flex justify-content-between align-items-center pt-2 border-top border-light">
        <div className="d-flex align-items-center gap-2">
          <div className="avatar-circle" title={card.user}>
            {getInitials(card.user)}
          </div>
          <span className="small text-dark fw-medium text-truncate truncate-name">
            {card.user}
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          {card.frequency && (
            <div className="d-flex align-items-center gap-1 badge bg-light text-secondary border fw-normal py-1 px-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{card.frequency}</span>
            </div>
          )}

          <button
            type="button"
            className="btn-view-ticket"
            onClick={(e) => {
              e.stopPropagation()
              onViewMore?.()
            }}
          >
            Ver más
          </button>
        </div>
      </div>
    </div>
  )
}


