import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../../REDUX/store'
import { unmarkTicketAsUpdated } from '../../../REDUX/ticketsSlice'
import CardActionsMenu from './CardActionsMenu'
import { getPriorityBadge } from './cardUtils'
import { LockIcon, PaperclipIcon } from '../../COMUN/Icons'

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
  hasImages?: boolean
  imagesCount?: number
}

export default function Card({ 
  card, 
  ticketId,
  onClick, 
  onViewMore, 
  onDelete,
  isDeleting = false,
  isRecentlyUpdated = false,
}: { 
  card: TicketCard; 
  ticketId?: string | number;
  onClick: () => void; 
  onViewMore?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  isRecentlyUpdated?: boolean;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const [showDesc, setShowDesc] = useState(false);
  const hasDescription = Boolean(card.description && card.description.trim());

  useEffect(() => {
    if (isRecentlyUpdated && ticketId) {
      const timer = setTimeout(() => {
        dispatch(unmarkTicketAsUpdated(ticketId));
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isRecentlyUpdated, ticketId, dispatch]);

  return (
    <div 
      className={`ticket-card p-3 text-start w-100 ${
        card.isNew ? 'ticket-card-unread' : ''
      } ${
        isDeleting ? 'ticket-card-deleting' : ''
      } ${isRecentlyUpdated ? 'ticket-card-updated' : ''}`}
      onClick={isDeleting ? undefined : onViewMore}
      role="button"
      tabIndex={isDeleting ? -1 : 0}
      onKeyDown={(e) => {
        if (isDeleting) return;
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
              <LockIcon size={12} className="text-warning-emphasis" />
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

      {/* Título del Ticket + Toggle de descripción si existe */}
      <div className="d-flex align-items-start justify-content-between gap-1 mb-1">
        <h6 
          className="fw-bold text-dark mb-0 lh-sm line-clamp-2 text-break" 
          title={card.title}
        >
          {card.title}
        </h6>

        {hasDescription && (
          <button
            type="button"
            className={`ticket-desc-toggle-btn ${showDesc ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowDesc((v) => !v);
            }}
            aria-expanded={showDesc}
            title={showDesc ? 'Ocultar descripción' : 'Ver descripción'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <svg
              className={`ticket-desc-chevron ${showDesc ? 'open' : ''}`}
              width="9"
              height="9"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        )}
      </div>

      {/* Descripción desplegable suavemente */}
      {hasDescription && (
        <div className={`ticket-card-desc-collapse ${showDesc ? 'show' : ''}`}>
          <div className="ticket-card-desc-inner">
            <p className="ticket-card-desc-text text-secondary text-break">
              {card.description}
            </p>
          </div>
        </div>
      )}

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

        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          {card.hasImages && (
            <span 
              className="ticket-attachment-indicator"
              title={card.imagesCount && card.imagesCount > 1 ? `${card.imagesCount} archivos adjuntos` : 'Tiene archivos adjuntos'}
            >
              <PaperclipIcon size={12} className="text-secondary" />
              {card.imagesCount && card.imagesCount > 1 ? (
                <span className="fw-semibold" style={{ fontSize: '11px' }}>{card.imagesCount}</span>
              ) : null}
            </span>
          )}

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
    </div>
  )
}


