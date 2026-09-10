import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../REDUX/store';
import { getClientEmail } from '../../UTILS/storageUtils';
import Card, { type TicketCard } from './CARDPROP/CARD';
import type { Ticket, ColumnOption } from '../../TYPES';

export interface BoardColumnProps {
  column: ColumnOption;
  tickets: Ticket[];
  isLoading?: boolean;
  errorMessage?: string | null;
  showFinished: boolean;
  onCreateTicket: (columnId: number) => void;
  onEditTicket: (ticket: Ticket) => void;
  onViewTicket: (ticket: Ticket) => void;
  onDeleteTicket: (ticket: Ticket) => void;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  column,
  tickets,
  isLoading = false,
  errorMessage = null,
  showFinished,
  onCreateTicket,
  onEditTicket,
  onViewTicket,
  onDeleteTicket,
}) => {
  const locks = useSelector((state: RootState) => state.tickets.locks || {});
  const myEmail = (getClientEmail() || '').toLowerCase();
  return (
    <div className="col-12 col-sm-6 col-lg-3">
      <section className="h-100 bg-white rounded-3 shadow-sm border border-light-subtle p-3">
        {/* Encabezado de Columna */}
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-light">
          <div className="d-flex align-items-center gap-2">
            <span className={`column-dot column-dot-${column.id}`} />
            <h6 className="mb-0 fw-bold text-dark text-uppercase">{column.title}</h6>
            <span className="badge rounded-pill bg-light text-secondary border">
              {tickets.length}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-coopya-red btn-sm d-flex align-items-center gap-1 fw-semibold"
            onClick={() => onCreateTicket(column.id)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo
          </button>
        </div>

        {/* Lista de Tarjetas */}
        <div className="d-flex flex-column gap-3">
          {isLoading && column.id === 1 && (
            <span className="small text-secondary">Cargando tickets…</span>
          )}

          {errorMessage && column.id === 1 && (
            <span className="small text-danger">{errorMessage}</span>
          )}

          {tickets.map((ticket) => {
            const lock = locks[String(ticket.id)];
            const isLockedByOther = Boolean(
              lock && lock.usuario && lock.usuario.toLowerCase() !== myEmail
            );
            const card: TicketCard = {
              id: String(ticket.identificador || `TK-${ticket.id}`),
              title: ticket.titulo,
              user: ticket.colaborador && ticket.colaborador.trim() ? ticket.colaborador.trim() : 'Sin Asignar',
              date: ticket.fechaCreacion
                ? (() => {
                    const d = new Date(ticket.fechaCreacion);
                    return isNaN(d.getTime())
                      ? ''
                      : d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  })()
                : '',
              description: ticket.descripcion,
              priority: ticket.prioridad,
              frequency: ticket.frecuencia && ticket.frecuencia.periodo && ticket.frecuencia.periodo !== 'No recurrente'
                ? `Cada ${ticket.frecuencia.numero} ${ticket.frecuencia.periodo.toLowerCase()}`
                : undefined,
              isNew: ticket.leido === false,
              lockedBy: lock?.usuario,
              isLockedByOther,
            };

            return (
              <Card
                key={card.id}
                card={card}
                onClick={() => onEditTicket(ticket)}
                onViewMore={() => onViewTicket(ticket)}
                onDelete={() => onDeleteTicket(ticket)}
              />
            );
          })}

          {!isLoading && tickets.length === 0 && (
            <span className="small text-secondary">
              {showFinished ? 'No hay tickets terminados.' : 'No hay tickets para mostrar.'}
            </span>
          )}
        </div>
      </section>
    </div>
  );
};

export default BoardColumn;
