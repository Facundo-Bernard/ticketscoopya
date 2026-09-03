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
    <button
      type="button"
      className="card border-0 border-start border-4 border-danger shadow-sm text-start w-100"
      onClick={onClick}
      aria-label={`Editar ${card.title}`}
    >
      <div className="card-body p-3">
        <h3 className="h6 mb-2">{card.title}</h3>
        <p className="small text-secondary mb-3">{card.description}</p>

        <div className="d-flex flex-wrap gap-2 small text-secondary">
          <span>{card.user}</span>
          <span>{card.date}</span>
          {card.frequency && (
            <span className="badge text-bg-light border">{card.frequency}</span>
          )}
        </div>
      </div>
    </button>
  )
}
