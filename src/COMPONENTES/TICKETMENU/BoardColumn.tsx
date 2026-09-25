import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../REDUX/store';
import { getOperatorIdentity } from '../../UTILS/storageUtils';
import Card, { type TicketCard } from './CARDPROP/CARD';
import type { Ticket, ColumnOption } from '../../TYPES';

export interface BoardColumnProps {
  column: ColumnOption;
  tickets: Ticket[];
  totalTickets: number;
  currentPage: number;
  pageSize?: number;
  isLoading?: boolean;
  errorMessage?: string | null;
  showFinished: boolean;
  onCreateTicket: (columnId: number) => void;
  onEditTicket: (ticket: Ticket) => void;
  onViewTicket: (ticket: Ticket) => void;
  onDeleteTicket: (ticket: Ticket) => void;
  onPageChange: (newPage: number) => void;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  column,
  tickets,
  totalTickets,
  currentPage,
  pageSize = 4,
  isLoading = false,
  errorMessage,
  showFinished,
  onCreateTicket,
  onEditTicket,
  onViewTicket,
  onDeleteTicket,
  onPageChange,
}) => {
  const {
    locks = {},
    deletingIds = [],
    updatedIds = [],
  } = useSelector((state: RootState) => state.tickets);
  const myEmail = (getOperatorIdentity() || '').toLowerCase();

  // Paginación real con backend (tickets ya viene limitado a pageSize por la API)
  const totalPages = Math.max(1, Math.ceil(totalTickets / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const from = totalTickets === 0 ? 0 : startIndex + 1;
  const to = Math.min(startIndex + pageSize, totalTickets);

  return (
    <div className="col-12 col-sm-6 col-lg-3">
      <section className="h-100 d-flex flex-column bg-white rounded-3 shadow-sm border border-light-subtle p-3">
        {/* Encabezado de Columna */}
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-light">
          <div className="d-flex align-items-center gap-2">
            <span className={`column-dot column-dot-${column.id}`} />
            <h6 className="mb-0 fw-bold text-dark text-uppercase">{column.title}</h6>
            <span className="badge rounded-pill bg-light text-secondary border">
              {totalTickets}
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
        <div className="d-flex flex-column gap-3 flex-grow-1">
          {isLoading && column.id === 1 && (
            <span className="small text-secondary">Cargando tickets…</span>
          )}

          {errorMessage && column.id === 1 && (
            <span className="small text-danger">{errorMessage}</span>
          )}

          {tickets.map((ticket) => {
            const ticketIdStr = String(ticket.id);
            const lock = locks[ticketIdStr];
            const isLockedByOther = Boolean(
              lock && lock.usuario && lock.usuario.toLowerCase() !== myEmail
            );
            const isDeleting = deletingIds.includes(ticketIdStr);
            const isRecentlyUpdated = updatedIds.includes(ticketIdStr);

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
              hasImages: Boolean(ticket.imagenes && ticket.imagenes.length > 0),
              imagesCount: ticket.imagenes ? ticket.imagenes.length : 0,
            };

            return (
              <Card
                key={card.id}
                ticketId={ticket.id}
                card={card}
                isDeleting={isDeleting}
                isRecentlyUpdated={isRecentlyUpdated}
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

        {/* Paginación al pie de la columna (cuando hay más de 1 página) */}
        {totalPages > 1 && (
          <div className="column-pagination-footer mt-auto pt-2 border-top d-flex align-items-center justify-content-between">
            <span className="column-pagination-info">
              {from}&ndash;{to} de {totalTickets}
            </span>

            <div className="d-flex align-items-center gap-1">
              <button
                type="button"
                className="column-pagination-btn"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => onPageChange(currentPage - 1)}
                aria-label="Página anterior"
                title="Página anterior"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                </svg>
              </button>

              <span className="column-pagination-page-indicator">
                {isLoading ? '…' : `${currentPage} / ${totalPages}`}
              </span>

              <button
                type="button"
                className="column-pagination-btn"
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => onPageChange(currentPage + 1)}
                aria-label="Página siguiente"
                title="Página siguiente"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default BoardColumn;
