import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Card, { type TicketCard } from './CARDPROP/CARD'
import { fetchTickets, selectTicket } from '../../REDUX/ticketsSlice'
import type { AppDispatch, RootState } from '../../REDUX/store'

const columns = [
  {
    id: 'tickets',
    title: 'TICKET',
  },
  {
    id: 'milestones',
    title: 'HITOS',
  },
  {
    id: 'tasks',
    title: 'TAREAS',
  },
  {
    id: 'recurring-tasks',
    title: 'TAREAS PERIÓDICAS',
  },
]

export default function Menu() {
  const { items: tickets, status, error } = useSelector((state: RootState) => state.tickets)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const [showFinished, setShowFinished] = useState(false)

  const visibleTickets = showFinished
    ? tickets.filter((ticket) => ticket.estado === 'resuelto' || ticket.estado === 'cerrado')
    : tickets

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTickets())
    }
  }, [dispatch, status])

  const openTicket = (ticketId: string) => {
    dispatch(selectTicket(ticketId))
    navigate(`/editar-ticket/${ticketId}`)
  }

  return (
    <main className="min-vh-100 d-flex flex-column bg-secondary bg-opacity-50">
      {/* Header rojo superior */}
      <div className="bg-danger py-3">
        <div className="container d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-light btn-sm px-4"
            onClick={() => setShowFinished((current) => !current)}
            disabled={status === 'loading'}
          >
            {status === 'loading'
              ? 'Cargando…'
              : 'Ver Historial'}
          </button>
        </div>
      </div>

      <div className="container-fluid flex-grow-1 pb-3">
        <div className="row g-3 px-3">
          {columns.map((column) => (
            <div key={column.id} className="col-12 col-sm-6 col-lg-3">
              <section className="h-100 bg-white border border-2 border-danger rounded-3 p-3">
                <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                  <button
                    type="button"
                    className="btn btn-danger text-truncate px-3 py-2"
                    disabled
                    style={{ cursor: 'default' }}
                  >
                    {column.title}
                  </button>

                  <Link to="/crearticket" className="btn btn-primary btn-sm">
                    Nuevo
                  </Link>
                </div>

                <div className="d-flex flex-column gap-2">
                  {column.id === 'tickets' && status === 'loading' && (
                    <span className="small text-secondary">Cargando tickets…</span>
                  )}
                  {column.id === 'tickets' && status === 'failed' && (
                    <span className="small text-danger">{error}</span>
                  )}
                  {visibleTickets
                    .filter((ticket) => ticket.columnId === column.id)
                    .map((ticket) => {
                      const card: TicketCard = {
                        id: String(ticket.id),
                        title: ticket.titulo,
                        user: ticket.colaborador || ticket.creadoPor,
                        date: new Date(ticket.fechaCreacion).toLocaleDateString('es-AR'),
                        description: ticket.descripcion,
                        frequency: ticket.frecuencia
                          ? `Cada ${ticket.frecuencia.numero} ${ticket.frecuencia.periodo.toLowerCase()}`
                          : undefined,
                      }

                      return (
                        <Card
                          key={card.id}
                          card={card}
                          onClick={() => openTicket(card.id)}
                        />
                      )
                    })}
                  {column.id === 'tickets' && status === 'succeeded' && visibleTickets.length === 0 && (
                    <span className="small text-secondary">
                      {showFinished ? 'No hay tickets terminados.' : 'No hay tickets para mostrar.'}
                    </span>
                  )}
                </div>
              </section>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
