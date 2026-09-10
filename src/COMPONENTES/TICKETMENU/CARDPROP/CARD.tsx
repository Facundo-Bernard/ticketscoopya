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
  isNew?: boolean
  lockedBy?: string
  isLockedByOther?: boolean
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
      className={`ticket-card p-3 text-start w-100 ${card.isNew ? 'ticket-card-unread' : ''}`}
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
      {/* Encabezado: ID + Prioridad + Candado (si está bloqueado) + Indicador "Nuevo" (izq) y Menú 3 Puntos (der) */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="badge bg-light text-secondary border rounded-2 fw-semibold">
            {card.id}
          </span>
          {getPriorityBadge(card.priority)}
          {card.lockedBy && (
            <span 
              className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-2 d-inline-flex align-items-center gap-1"
              title={`En edición por ${card.lockedBy}`}
            >
              <span>🔒</span>
              <span className="text-truncate" style={{ maxWidth: '90px' }}>{card.lockedBy}</span>
            </span>
          )}
          {card.isNew && (
            <span className="d-inline-flex align-items-center gap-1 ms-1" title="Ticket nuevo / no leído">
              <span className="ticket-pulse-dot" />
              <span className="small text-success fw-semibold" style={{ fontSize: '11px' }}>Nuevo</span>
            </span>
          )}
        </div>

        <div className="d-flex align-items-center gap-2">
          <CardActionsMenu
            ticketTitle={card.title}
            onEdit={onClick}
            onDelete={onDelete}
            isLockedByOther={card.isLockedByOther}
            lockedBy={card.lockedBy}
          />
        </div>
      </div>

      {/* Título del Ticket */}
      <h6 
        className="fw-bold text-dark mb-1 lh-sm line-clamp-2 text-break" 
        title={card.title}
      >
        {card.title}
      </h6>

      {/* Descripción (2 líneas) */}
      <p className="small text-secondary mb-2 line-clamp-2 text-break">{card.description}</p>

      {/* Fila Intermedia Dedicada: Frecuencia Periódica (Alternativa 1B) */}
      {card.frequency && (
        <div className="mb-2 pt-1">
          <span className="ticket-frequency-chip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            {card.frequency}
          </span>
        </div>
      )}

      {/* Pie de tarjeta: Usuario asignado (izq) y Fecha de creación (der) - Cero Solapamiento */}
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

        {card.date && (
          <div 
            className="d-flex align-items-center gap-1 text-secondary small flex-shrink-0"
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
  )
}


