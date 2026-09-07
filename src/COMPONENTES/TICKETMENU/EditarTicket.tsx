import { useEffect, useState, type FormEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import type { RootState } from '../../REDUX/store'
import { fetchTicketById, saveTicket, selectTicket } from '../../REDUX/ticketsSlice'
import type { AppDispatch } from '../../REDUX/store'
import { type Ticket, TICKET_COLUMNS } from '../EDITMODAL/types'

export default function EditarTicket() {
  const { ticketId } = useParams()
  const { selectedTicketId, status, error } = useSelector((state: RootState) => state.tickets)
  const id = ticketId ?? selectedTicketId
  const ticket = useSelector((state: RootState) =>
    state.tickets.items.find((item) => item.id === id),
  )
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  useEffect(() => {
    if (ticketId) {
      dispatch(selectTicket(ticketId))
      dispatch(fetchTicketById(ticketId))
    }
  }, [dispatch, ticketId])

  if (!id) {
    return <Navigate to="/" replace />
  }

  if (!ticket) {
    return (
      <main className="min-vh-100 bg-secondary bg-opacity-50 py-4">
        <div className="container" style={{ maxWidth: '850px' }}>
          <div className="card shadow border border-2 border-danger rounded-3 p-4 text-center">
            <p className={status === 'failed' ? 'text-danger mb-3' : 'text-secondary mb-3'}>
              {status === 'failed' ? error : 'Cargando ticket…'}
            </p>
            <button type="button" className="btn btn-outline-primary" onClick={() => navigate('/')}>
              Volver al menú
            </button>
          </div>
        </div>
      </main>
    )
  }

  return <TicketEditor key={`${ticket.id}-${ticket.fechaModificacion}`} ticket={ticket} />
}

function TicketEditor({ ticket }: { ticket: Ticket }) {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const [titulo, setTitulo] = useState(ticket.titulo)
  const [descripcion, setDescripcion] = useState(ticket.descripcion)
  const [colaborador, setColaborador] = useState(ticket.colaborador)
  const [estado, setEstado] = useState(ticket.estado)
  const [prioridad, setPrioridad] = useState(ticket.prioridad)
  const initialCol = ticket.columnId ?? ticket.columna ?? 1
  const initialColNum = typeof initialCol === 'number' ? initialCol : isNaN(Number(initialCol)) ? 1 : Number(initialCol)
  const [columna, setColumna] = useState<number>(initialColNum)
  const creatorEmail = ticket.correo || ticket.creadoPor

  const saveChanges = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const now = new Date().toISOString()

    try {
      await dispatch(
        saveTicket({
          ...ticket,
          titulo,
          descripcion,
          colaborador,
          estado,
          prioridad,
          columnId: columna,
          columna,
          fechaModificacion: now,
          fechaCierre: estado === 'cerrado' || estado === 'resuelto' ? now : null,
        }),
      ).unwrap()
      navigate('/')
    } catch {
      // El mensaje se muestra desde el estado de Redux.
    }
  }

  return (
    <main className="min-vh-100 bg-secondary bg-opacity-50 py-4">
      <div className="container" style={{ maxWidth: '850px' }}>
        <div className="card shadow border border-2 border-danger rounded-3 p-4">
          <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
            <div>
              <span className="badge bg-danger mb-2">{ticket.identificador}</span>
              <h4 className="mb-0 fw-bold">Editar ticket</h4>
            </div>
            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/')}>
              Volver
            </button>
          </div>

          <form onSubmit={saveChanges}>
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label fw-bold" htmlFor="titulo">
                  Título
                </label>
                <input
                  id="titulo"
                  className="form-control"
                  value={titulo}
                  onChange={(event) => setTitulo(event.target.value)}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold" htmlFor="colaborador">
                  Asignar
                </label>
                <input
                  id="colaborador"
                  className="form-control"
                  value={colaborador}
                  onChange={(event) => setColaborador(event.target.value)}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-bold" htmlFor="correo-creador">
                  Correo de quien lo generó
                </label>
                <input
                  id="correo-creador"
                  type="email"
                  className="form-control"
                  value={creatorEmail}
                  readOnly
                  aria-readonly="true"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-bold" htmlFor="descripcion">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  className="form-control"
                  rows={5}
                  value={descripcion}
                  onChange={(event) => setDescripcion(event.target.value)}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold" htmlFor="estado">
                  Estado
                </label>
                <select
                  id="estado"
                  className="form-select"
                  value={estado}
                  onChange={(event) => setEstado(event.target.value)}
                >
                  <option value="abierto">Abierto</option>
                  <option value="en_progreso">En progreso</option>
                  <option value="resuelto">Resuelto</option>
                  <option value="cerrado">Cerrado</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold" htmlFor="prioridad">
                  Prioridad
                </label>
                <select
                  id="prioridad"
                  className="form-select"
                  value={prioridad}
                  onChange={(event) => setPrioridad(event.target.value)}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold" htmlFor="columna">
                  Columna
                </label>
                <select
                  id="columna"
                  className="form-select"
                  value={columna}
                  onChange={(event) => setColumna(Number(event.target.value))}
                >
                  {TICKET_COLUMNS.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-3 mt-4">
              <button type="button" className="btn btn-outline-primary px-4" onClick={() => navigate('/')}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary px-4">
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
