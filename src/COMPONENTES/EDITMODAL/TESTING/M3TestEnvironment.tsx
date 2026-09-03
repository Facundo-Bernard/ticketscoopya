import React from 'react';
import ModalTicket from '../ModalTicket';
import { useModal } from '../../../hooks/useModal';
import { 
  TICKET_STATE_COLORS, 
  PRIORIDAD_COLORS, 
  formatCatalogLabel 
} from '../ticketStates';
import type { Ticket } from '../types';
import { useTickets } from '../../../COMPOSABLES/useTickets';

const M3TestEnvironment: React.FC = () => {
  const { isOpen, selectedData: ticket, openModal, closeModal } = useModal<Ticket>();
  const { tickets, isLoading, error, refreshTickets, updateTicket } = useTickets();

  // Mock de respaldo si no hay tickets en la base de datos
  const ticketRespaldo: Ticket = {
    id: 'mock-1',
    identificador: 'TCK-MOCK',
    titulo: 'Configurar servidor de producción (Mock)',
    descripcion: 'Necesitamos levantar una instancia en AWS y configurar Nginx.',
    estado: 'en_progreso',
    prioridad: 'media',
    colaborador: 'Facundo Bernard',
    creadoPor: 'nicolas@coopya.com',
    correo: 'nicolas@coopya.com',
    imagenes: [],
    fechaCreacion: new Date(Date.now() - 86400000 * 2).toISOString(),
    fechaModificacion: new Date(Date.now() - 86400000 * 2).toISOString(),
    fechaCierre: null,
    frecuencia: { numero: 1, periodo: 'Meses' }
  };

  const listaTickets = tickets.length > 0 ? tickets : [ticketRespaldo];

  const handleTicketUpdated = async (ticketActualizado: Ticket): Promise<void> => {
    try {
      if (ticketActualizado.id !== 'mock-1') {
        await updateTicket(ticketActualizado.id, {
          titulo: ticketActualizado.titulo,
          descripcion: ticketActualizado.descripcion,
          estado: ticketActualizado.estado,
          prioridad: ticketActualizado.prioridad,
          colaborador: ticketActualizado.colaborador,
          frecuencia: ticketActualizado.frecuencia
        });
      }
      console.log('Ticket actualizado con éxito:', ticketActualizado);
    } catch (err) {
      console.error('Error al actualizar ticket en backend:', err);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-0">Tablero de Tickets (Conectado a Backend)</h3>
          <small className="text-muted">
            {isLoading ? 'Cargando tickets...' : `Mostrando ${listaTickets.length} ticket(s)`}
          </small>
        </div>
        <button 
          className="btn btn-outline-primary btn-sm" 
          onClick={() => refreshTickets()}
          disabled={isLoading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          {isLoading ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>

      {error && (
        <div className="alert alert-warning py-2 mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          No se pudo conectar con el backend (<code>{error}</code>). Mostrando datos de respaldo.
        </div>
      )}

      <div className="row g-4">
        {listaTickets.map((t) => {
          const estadoNorm = (t.estado || 'abierto').toLowerCase();
          const stateColor = TICKET_STATE_COLORS[estadoNorm] || 'secondary';
          const stateLabel = formatCatalogLabel(t.estado);

          const prioridadNorm = (t.prioridad || 'media').toLowerCase();
          const prioridadColor = PRIORIDAD_COLORS[prioridadNorm] || 'secondary';
          const prioridadLabel = formatCatalogLabel(t.prioridad);

          return (
            <div key={t.id} className="col-md-6 col-lg-4">
              <div className="card shadow-sm h-100 border-1">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                    <h5 className="card-title mb-0 text-truncate" title={t.titulo}>
                      {t.identificador && <span className="text-muted small me-1">[{t.identificador}]</span>}
                      {t.titulo}
                    </h5>
                    <span className={`badge bg-${stateColor} text-capitalize`}>{stateLabel}</span>
                  </div>

                  <p 
                    className="card-text text-muted small" 
                    style={{ 
                      maxHeight: '48px', 
                      overflow: 'hidden', 
                      display: '-webkit-box', 
                      WebkitLineClamp: 2, 
                      WebkitBoxOrient: 'vertical' 
                    }}
                  >
                    {t.descripcion}
                  </p>

                  <div className="d-flex justify-content-between text-muted mb-3 mt-auto" style={{ fontSize: '0.75rem' }}>
                    {t.fechaCreacion && (
                      <span><i className="bi bi-calendar3 me-1"></i>{new Date(t.fechaCreacion).toLocaleDateString()}</span>
                    )}
                    {t.correo && (
                      <span className="text-truncate" style={{ maxWidth: '140px' }} title={t.correo}>
                        <i className="bi bi-envelope me-1"></i>{t.correo}
                      </span>
                    )}
                  </div>

                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {t.prioridad && (
                      <span className={`badge bg-${prioridadColor}`}>
                        <i className="bi bi-flag-fill me-1"></i>
                        {prioridadLabel}
                      </span>
                    )}

                    {t.colaborador && (
                      <span className="badge bg-light text-dark border">
                        <i className="bi bi-person-fill text-info me-1"></i>
                        {t.colaborador}
                      </span>
                    )}

                    {t.frecuencia && t.frecuencia.periodo !== 'No recurrente' && (
                      <span className="badge bg-secondary">
                        <i className="bi bi-arrow-repeat me-1"></i>
                        Cada {t.frecuencia.numero} {t.frecuencia.periodo}
                      </span>
                    )}

                    {t.imagenes && t.imagenes.length > 0 && (
                      <span className="badge bg-light text-dark border">
                        <i className="bi bi-image me-1"></i>
                        {t.imagenes.length} foto(s)
                      </span>
                    )}
                  </div>

                  <button
                    className="btn btn-outline-primary w-100 mt-2"
                    onClick={() => openModal(t)}
                  >
                    Ver / Editar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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
