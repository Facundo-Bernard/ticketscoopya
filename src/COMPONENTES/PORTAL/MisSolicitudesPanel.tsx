import React, { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { getClientEmail } from '../../UTILS/storageUtils';
import {
  formatCatalogLabel,
  TICKET_STATE_COLORS,
} from '../TICKETMENU/ticketStates';
import RequesterTicketModal from './RequesterTicketModal';
import type { RequesterTicket } from '../../TYPES';

export interface MisSolicitudesPanelProps {
  tickets: RequesterTicket[];
  linkedEmail: string | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
  onRequestCode: (correo: string) => Promise<{ message: string; expira_en: string }>;
  onVerifyCode: (correo: string, codigo: string) => Promise<unknown>;
  onUnlinkHistory: () => Promise<void>;
}

function getApiError(err: unknown, fallback: string): string {
  const axiosErr = err as {
    response?: { data?: { message?: string; detail?: string } };
    message?: string;
  };
  return (
    axiosErr?.response?.data?.message ||
    axiosErr?.response?.data?.detail ||
    axiosErr?.message ||
    fallback
  );
}

export const MisSolicitudesPanel: React.FC<MisSolicitudesPanelProps> = ({
  tickets,
  linkedEmail,
  isLoading,
  error,
  onRefresh,
  onRequestCode,
  onVerifyCode,
  onUnlinkHistory,
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showSyncForm, setShowSyncForm] = useState<boolean>(false);
  const [syncEmail, setSyncEmail] = useState<string>(() => getClientEmail() || '');
  const [syncCode, setSyncCode] = useState<string>('');
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [syncErrorMsg, setSyncErrorMsg] = useState<string | null>(null);
  const [isRequestingCode, setIsRequestingCode] = useState<boolean>(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState<boolean>(false);
  const [isUnlinking, setIsUnlinking] = useState<boolean>(false);

  const selectedTicket = selectedTicketId
    ? tickets.find((t) => t.id === selectedTicketId) ?? null
    : null;

  const handleAskForCode = async () => {
    const cleanEmail = syncEmail.trim();
    if (!cleanEmail) {
      setSyncErrorMsg('Ingresá tu correo electrónico.');
      return;
    }
    setSyncErrorMsg(null);
    setSyncStatusMsg(null);
    setIsRequestingCode(true);
    try {
      const res = await onRequestCode(cleanEmail);
      setSyncStatusMsg(res.message);
    } catch (err) {
      setSyncErrorMsg(getApiError(err, 'No se pudo registrar la solicitud de código.'));
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleConfirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = syncEmail.trim();
    const cleanCode = syncCode.trim();
    if (!cleanEmail || !cleanCode) {
      setSyncErrorMsg('Completá tu correo y el código temporal.');
      return;
    }
    setSyncErrorMsg(null);
    setSyncStatusMsg(null);
    setIsVerifyingCode(true);
    try {
      await onVerifyCode(cleanEmail, cleanCode);
      setSyncCode('');
      setShowSyncForm(false);
    } catch (err) {
      setSyncErrorMsg(getApiError(err, 'Código inválido o vencido.'));
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleUnlink = async () => {
    setIsUnlinking(true);
    try {
      await onUnlinkHistory();
    } finally {
      setIsUnlinking(false);
    }
  };

  return (
    <>
      <div className="portal-card">
        <div className="p-4 border-bottom bg-white d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div>
            <h4 className="mb-1 fw-bold text-dark">Mis Solicitudes</h4>
            <p className="text-secondary small mb-0">
              Seguí el estado de tus tickets enviados en tiempo real.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary px-3"
            onClick={() => void onRefresh()}
            disabled={isLoading}
          >
            {isLoading ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>

        <div className="p-4">
          {/* Bloque de recuperación / vinculación de historial por código temporal */}
          {linkedEmail ? (
            <div className="alert alert-light border d-flex flex-wrap align-items-center justify-content-between gap-2 py-2 px-3 mb-4 small">
              <span className="text-dark">
                Historial vinculado al correo <strong>{linkedEmail}</strong>
              </span>
              <button
                type="button"
                className="btn btn-link btn-sm text-danger text-decoration-none p-0 fw-semibold"
                onClick={() => void handleUnlink()}
                disabled={isUnlinking}
              >
                {isUnlinking ? 'Desvinculando…' : 'Desvincular equipo'}
              </button>
            </div>
          ) : (
            <div className="border rounded-3 bg-light p-3 mb-4">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <span className="small text-secondary">
                  ¿Cambiaste de computadora o querés ver tus tickets anteriores?
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary fw-medium"
                  onClick={() => {
                    setShowSyncForm((prev) => !prev);
                    setSyncErrorMsg(null);
                  }}
                >
                  {showSyncForm ? 'Ocultar' : 'Recuperar historial con código'}
                </button>
              </div>

              {showSyncForm && (
                <form onSubmit={handleConfirmCode} className="mt-3 pt-3 border-top">
                  {syncErrorMsg && (
                    <Alert variant="danger" dismissible onClose={() => setSyncErrorMsg(null)} className="py-2 small">
                      {syncErrorMsg}
                    </Alert>
                  )}
                  {syncStatusMsg && (
                    <Alert variant="info" className="py-2 small">
                      {syncStatusMsg}
                    </Alert>
                  )}

                  <div className="row g-2 align-items-end">
                    <div className="col-md-5">
                      <label className="form-label small fw-semibold mb-1">
                        Tu correo electrónico
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        placeholder="tu.correo@coopya.com"
                        value={syncEmail}
                        onChange={(e) => setSyncEmail(e.target.value)}
                        disabled={isRequestingCode || isVerifyingCode}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary w-100"
                        onClick={() => void handleAskForCode()}
                        disabled={isRequestingCode || isVerifyingCode}
                      >
                        {isRequestingCode ? 'Pidiendo…' : '1. Pedir código'}
                      </button>
                    </div>

                    <div className="col-md-2">
                      <label className="form-label small fw-semibold mb-1">
                        Código (6 dígitos)
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm text-center font-monospace"
                        placeholder="000000"
                        value={syncCode}
                        onChange={(e) => setSyncCode(e.target.value)}
                        disabled={isVerifyingCode}
                        maxLength={12}
                      />
                    </div>

                    <div className="col-md-2">
                      <button
                        type="submit"
                        className="btn btn-sm btn-coopya-red w-100"
                        disabled={isVerifyingCode || !syncCode.trim()}
                      >
                        {isVerifyingCode ? 'Validando…' : '2. Entrar'}
                      </button>
                    </div>
                  </div>
                  <div className="form-text mt-2" style={{ fontSize: '11.5px' }}>
                    Tocá <strong>Pedir código</strong> y solicitáselo al equipo de Sistemas (dura 15 minutos y se usa una sola vez).
                  </div>
                </form>
              )}
            </div>
          )}

          {error && (
            <Alert variant="danger" className="small">
              {error}
            </Alert>
          )}

          {isLoading ? (
            <div className="text-center text-muted py-5 small">
              Cargando tus solicitudes…
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-5 px-3 border rounded-3 bg-light">
              <p className="fw-semibold text-dark mb-1">
                Todavía no hay solicitudes visibles en este navegador
              </p>
              <p className="text-secondary small mb-0">
                Cuando envíes un problema desde aquí o vincules tu historial con un código temporal, vas a ver su avance en esta lista.
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {tickets.map((ticket) => {
                const estadoNorm = (ticket.estado || 'abierto').toLowerCase();
                const stateColor = TICKET_STATE_COLORS[estadoNorm] || 'secondary';
                const stateLabel = formatCatalogLabel(ticket.estado || 'abierto');

                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className="btn text-start p-3 border rounded-3 bg-white shadow-sm d-flex flex-column gap-2 w-100"
                  >
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 w-100">
                      <div className="d-flex align-items-center gap-2 min-w-0">
                        {ticket.identificador && (
                          <span className="badge bg-dark font-monospace flex-shrink-0">
                            {ticket.identificador}
                          </span>
                        )}
                        <span className="fw-semibold text-dark text-truncate">
                          {ticket.titulo}
                        </span>
                      </div>
                      <span className={`badge bg-${stateColor} flex-shrink-0`}>
                        {stateLabel}
                      </span>
                    </div>

                    <p
                      className="text-secondary small mb-0 text-truncate w-100"
                      style={{ maxWidth: '100%' }}
                    >
                      {ticket.descripcion}
                    </p>

                    <div
                      className="d-flex flex-wrap justify-content-between align-items-center text-muted w-100"
                      style={{ fontSize: '11.5px' }}
                    >
                      <span>
                        Enviado: {new Date(ticket.fechaCreacion).toLocaleDateString()}{' '}
                        {new Date(ticket.fechaCreacion).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <div className="d-flex align-items-center gap-3">
                        {ticket.imagenes.length > 0 && (
                          <span>
                            {ticket.imagenes.length}{' '}
                            {ticket.imagenes.length === 1 ? 'archivo' : 'archivos'}
                          </span>
                        )}
                        <span className="text-primary fw-medium">Ver detalle →</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <RequesterTicketModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicketId(null)}
      />
    </>
  );
};

export default MisSolicitudesPanel;
