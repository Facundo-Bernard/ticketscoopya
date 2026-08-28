import React, { useState } from 'react';
import ModalTicket from '../ModalTicket';
import { useModal } from '../../../hooks/useModal';
import { TICKET_STATES, TICKET_STATE_COLORS, TICKET_STATE_LABELS } from '../ticketStates';
import type { Ticket } from '../types';

const M3TestEnvironment: React.FC = () => {
  const { isOpen, selectedData: ticket, openModal, closeModal } = useModal<Ticket>();

  const ticketInicial: Ticket = {
    id: 1,
    titulo: 'Configurar servidor de producción',
    descripcion: 'Necesitamos levantar una instancia en AWS y configurar Nginx.',
    estado: TICKET_STATES.EN_PROGRESO,
    prioridad: 'Media',
    colaborador: 'Facundo',
    creadoPor: 'Nicolas',
    imagenes: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800'],
    fechaCreacion: new Date(Date.now() - 86400000 * 2).toISOString(),
    fechaModificacion: new Date(Date.now() - 86400000 * 2).toISOString(),
    fechaCierre: null,
    frecuencia: { numero: 1, periodo: 'Meses' }
  };

  // Inicializar estado desde LocalStorage si existe
  const [ticketGuardado, setTicketGuardado] = useState<Ticket>(() => {
    const saved = localStorage.getItem('mockTicket');
    if (saved) {
      return { ...ticketInicial, ...JSON.parse(saved) };
    }
    return ticketInicial;
  });

  const handleTicketUpdated = (ticketActualizado: Ticket): void => {
    setTicketGuardado(ticketActualizado);
    localStorage.setItem('mockTicket', JSON.stringify(ticketActualizado));
    console.log('Ticket actualizado guardado en LocalStorage:', ticketActualizado);
  };

  const stateColor = TICKET_STATE_COLORS[ticketGuardado.estado] || 'secondary';
  const stateLabel = TICKET_STATE_LABELS[ticketGuardado.estado] || ticketGuardado.estado;

  return (
    <div className="container mt-5">
      <h3 className="mb-4 text-center">Tablero (Simulación Padre M1)</h3>

      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm border-1">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                <h5 className="card-title mb-0">{ticketGuardado.titulo}</h5>
                <span className={`badge bg-${stateColor}`}>{stateLabel}</span>
              </div>

              <p className="card-text text-muted small text-truncate" style={{ maxHeight: '40px', marginBottom: '8px' }}>
                {ticketGuardado.descripcion}
              </p>

              <div className="d-flex justify-content-between text-muted mb-3" style={{ fontSize: '0.75rem' }}>
                {ticketGuardado.fechaCreacion && (
                  <span><i className="bi bi-calendar3"></i> {new Date(ticketGuardado.fechaCreacion).toLocaleDateString()}</span>
                )}
                {ticketGuardado.fechaModificacion && (
                  <span><i className="bi bi-pencil-square"></i> {new Date(ticketGuardado.fechaModificacion).toLocaleDateString()}</span>
                )}
              </div>

              <div className="d-flex flex-wrap gap-2 mb-3">
                {ticketGuardado.colaborador && (
                  <span className="badge bg-light text-dark border">
                    <i className="bi bi-person-fill text-info me-1"></i>
                    {ticketGuardado.colaborador}
                  </span>
                )}

                {ticketGuardado.prioridad && (
                  <span className="badge bg-light text-dark border">
                    <i className="bi bi-flag-fill text-danger me-1"></i>
                    {ticketGuardado.prioridad}
                  </span>
                )}

                {ticketGuardado.frecuencia && ticketGuardado.frecuencia.periodo !== 'No recurrente' && (
                  <span className="badge bg-secondary">
                    <i className="bi bi-arrow-repeat me-1"></i>
                    Cada {ticketGuardado.frecuencia.numero} {ticketGuardado.frecuencia.periodo}
                  </span>
                )}
              </div>

              <button
                className="btn btn-outline-primary w-100 mt-2"
                onClick={() => openModal(ticketGuardado)}
              >
                Ver Más
              </button>
            </div>
          </div>
        </div>
      </div>

      <ModalTicket
        isOpen={isOpen}
        onClose={closeModal}
        ticket={ticket}
        onTicketUpdated={handleTicketUpdated}
      />
    </div>
  );
};

export default M3TestEnvironment;
