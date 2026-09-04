import pencilIcon from '../../assets/pencil-icon.png'
import clockIcon from '../../assets/clock-icon.png'

export type TicketCard = {
  id: string
  title: string
  user: string
  date: string
  description: string
  frequency?: string
}

export default function Card({ card, onClick }: { card: TicketCard; onClick: () => void }) {
  return (
    <div className="card border-2 border-danger shadow-sm text-start w-100">
      <div className="card-body p-3 position-relative">
        {/* Icono de lápiz en esquina superior derecha */}
        <button
          type="button"
          className="btn btn-sm position-absolute top-0 end-0 m-2 p-1"
          onClick={onClick}
          aria-label={`Editar ${card.title}`}
        >
          <img src={pencilIcon} alt="Editar" style={{ width: '20px', height: '20px' }} />
        </button>

        {/* Título */}
        <h3 className="h5 mb-2 fw-bold">{card.title}</h3>

        {/* Usuario con icono */}
        <div className="d-flex align-items-center gap-2 mb-2 small text-secondary">
          <span>👤</span>
          <span>{card.user}</span>
        </div>

        {/* Fecha */}
        <div className="small text-secondary mb-3">
          {card.date}
        </div>

        {/* Descripción */}
        <p className="small text-secondary mb-3">{card.description}</p>

        {/* Frecuencia con icono de reloj */}
        {card.frequency && (
          <div className="d-flex align-items-center gap-2 mb-3 small text-secondary">
            <img src={clockIcon} alt="Frecuencia" style={{ width: '16px', height: '16px' }} />
            <span>{card.frequency}</span>
          </div>
        )}

        {/* Botón Ver más */}
        <button
          type="button"
          className="btn btn-primary btn-sm w-100"
          onClick={(e) => {
            e.stopPropagation()
            // Aquí podrías agregar lógica para "ver más"
          }}
        >
          Ver más
        </button>
      </div>
    </div>
  )
}
