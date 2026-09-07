export type TicketCard = {
  id: string
  title: string
  user: string
  date: string
  description: string
  frequency?: string
}

export default function Card({ 
  card, 
  onClick, 
  onViewMore 
}: { 
  card: TicketCard; 
  onClick: () => void; 
  onViewMore?: () => void;
}) {
  return (
    <div className="card border-2 border-dark shadow-sm text-start w-100">
      <div className="card-body p-3">
        {/* Parte superior: título y usuario (izquierda), fecha y lápiz (derecha) */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          {/* Izquierda: título + usuario */}
          <div className="d-flex align-items-center gap-2">
            <span className="fs-4">👤</span>
            <div>
              <h3 className="h6 mb-0 fw-bold">{card.title}</h3>
              <small className="text-secondary">{card.user}</small>
            </div>
          </div>

          {/* Derecha: fecha + lápiz */}
          <div className="d-flex align-items-center gap-2">
            <small className="text-secondary">{card.date}</small>
            <button
              type="button"
              className="btn btn-sm p-1"
              onClick={onClick}
              aria-label={`Editar ${card.title}`}
            >
              ✏️
            </button>
          </div>
        </div>

        {/* Centro: descripción */}
        <p className="small text-secondary mb-3">{card.description}</p>

        {/* Parte inferior: frecuencia + botón ver más */}
        <div className="d-flex justify-content-between align-items-center">
          {/* Izquierda: frecuencia con icono de reloj */}
          {card.frequency && (
            <div className="d-flex align-items-center gap-2 small text-secondary">
              <span>🕐</span>
              <span>{card.frequency}</span>
            </div>
          )}

          {/* Derecha: botón ver más pequeño */}
          <button
            type="button"
            className="btn btn-primary btn-sm"
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
