import CardActionsMenu from './CardActionsMenu'
import { getPriorityBadge } from './cardUtils'

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
    <div 
      className="ticket-card p-3 text-start w-100"
      onClick={onViewMore}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onViewMore?.();
        }
      }}
    >
      {/* Encabezado: ID + Prioridad (izq) y Fecha + Menú 3 Puntos (der) */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-light text-secondary border rounded-2 fw-semibold">
            {card.id}
          </span>
          {getPriorityBadge(card.priority)}
        </div>

        <div className="d-flex align-items-center gap-2">
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

      {/* Pie de tarjeta: Usuario asignado (izq) y Fecha de creación / Frecuencia (der) */}
      <div className="d-flex justify-content-between align-items-center pt-2 border-top border-light">
        <div className="d-flex align-items-center gap-1 min-w-0">
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={card.user === 'Sin Asignar' ? 'text-secondary opacity-50 flex-shrink-0' : 'text-primary flex-shrink-0'}
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span className={`small text-truncate truncate-name ${card.user === 'Sin Asignar' ? 'text-muted fst-italic' : 'text-dark fw-medium'}`}>
            {card.user}
          </span>
        </div>

        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          {card.frequency && (
            <div className="d-flex align-items-center gap-1 badge bg-light text-secondary border fw-normal py-1 px-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{card.frequency}</span>
            </div>
          )}

          {card.date && (
            <div 
              className="d-flex align-items-center gap-1 text-secondary small"
              title={`Fecha de creación: ${card.date}`}
            >
              <svg 
                width="13" 
                height="13" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-secondary opacity-75"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{card.date}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


