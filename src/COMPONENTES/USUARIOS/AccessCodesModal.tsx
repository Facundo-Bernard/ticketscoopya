import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { toast } from 'sonner';
import requesterService from '../../SERVICES/requesterService';
import type { AccessCodeItem } from '../../TYPES';

export interface AccessCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCodesChanged?: (pendingCount: number) => void;
}

function formatRemaining(expiraEn: string): string {
  const diffMs = new Date(expiraEn).getTime() - Date.now();
  if (diffMs <= 0) return 'Vencido';
  const mins = Math.ceil(diffMs / 60_000);
  return `Vence en ${mins} min`;
}

function getStatusBadge(estado: AccessCodeItem['estado']): { cls: string; label: string } {
  switch (estado) {
    case 'pendiente':
      return { cls: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle', label: 'Pendiente' };
    case 'usado':
      return { cls: 'bg-success-subtle text-success border border-success-subtle', label: 'Usado' };
    case 'revocado':
      return { cls: 'bg-danger-subtle text-danger border border-danger-subtle', label: 'Revocado' };
    default:
      return { cls: 'bg-light text-secondary border', label: 'Vencido' };
  }
}

export const AccessCodesModal: React.FC<AccessCodesModalProps> = ({
  isOpen,
  onClose,
  onCodesChanged,
}) => {
  const [codes, setCodes] = useState<AccessCodeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const backdropMouseDownRef = useRef(false);

  const loadCodes = useCallback(async (query?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const list = await requesterService.listAccessCodes(query);
      setCodes(list);
      const pending = list.filter((c) => c.estado === 'pendiente').length;
      onCodesChanged?.(pending);
    } catch {
      setErrorMsg('No se pudieron cargar los códigos temporales.');
    } finally {
      setIsLoading(false);
    }
  }, [onCodesChanged]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const timer = setTimeout(() => {
      if (active) {
        void loadCodes(searchQuery);
      }
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isOpen, loadCodes, searchQuery]);

  useEffect(() => {
    if (!isOpen) return;

    const handleLiveUpdate = () => {
      void loadCodes(searchQuery);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('tickets:requester_code_updated', handleLiveUpdate);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('tickets:requester_code_updated', handleLiveUpdate);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, searchQuery, loadCodes, onClose]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = targetEmail.trim().toLowerCase();
    if (!clean) return;
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const created = await requesterService.generateAccessCode(clean);
      setTargetEmail('');
      toast.success(`Código generado para ${created.correo}: ${created.codigo}`);
      await loadCodes(searchQuery);
    } catch {
      setErrorMsg('No se pudo generar el código. Verificá que el correo sea válido.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (item: AccessCodeItem) => {
    try {
      await navigator.clipboard.writeText(item.codigo);
      setCopiedId(item.id);
      setTimeout(() => {
        setCopiedId((prev) => (prev === item.id ? null : prev));
      }, 2000);
    } catch {
      toast.info(`Código: ${item.codigo}`);
    }
  };

  const handleRevoke = async (codeId: string) => {
    try {
      await requesterService.revokeAccessCode(codeId);
      await loadCodes(searchQuery);
    } catch {
      setErrorMsg('No se pudo revocar el código.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block modal-wrapper-custom"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        backdropMouseDownRef.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        const started = backdropMouseDownRef.current;
        backdropMouseDownRef.current = false;
        if (started && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content rounded-4 shadow-lg overflow-hidden modal-top-accent">
          <div className="modal-header d-flex justify-content-between align-items-center py-3 bg-white">
            <div>
              <h5 className="modal-title fw-bold mb-0 text-dark">
                Códigos de Acceso (Solicitantes)
              </h5>
              <small className="text-muted">
                Códigos temporales de 15 minutos y 1 solo uso para recuperar historial de tickets
              </small>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Cerrar"
            />
          </div>

          <div className="modal-body p-4">
            {errorMsg && (
              <Alert variant="danger" dismissible onClose={() => setErrorMsg(null)} className="py-2 small">
                {errorMsg}
              </Alert>
            )}

            {/* Generar código directo para un correo */}
            <form onSubmit={handleGenerate} className="border rounded-3 bg-light p-3 mb-4">
              <label className="form-label small fw-semibold text-dark mb-2">
                Generar código directo para un usuario
              </label>
              <div className="d-flex gap-2">
                <input
                  type="email"
                  className="form-control form-control-sm"
                  placeholder="usuario@coopya.com"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  disabled={isGenerating}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-sm btn-coopya-red px-3 flex-shrink-0"
                  disabled={isGenerating || !targetEmail.trim()}
                >
                  {isGenerating ? 'Generando…' : 'Generar código'}
                </button>
              </div>
            </form>

            {/* Filtro + Refresh */}
            <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
              <input
                type="search"
                className="form-control form-control-sm"
                style={{ maxWidth: '280px' }}
                placeholder="Buscar por correo…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => void loadCodes(searchQuery)}
                disabled={isLoading}
              >
                {isLoading ? 'Cargando…' : 'Actualizar'}
              </button>
            </div>

            {/* Lista de códigos */}
            {codes.length === 0 ? (
              <div className="text-center text-muted py-4 border rounded-3 bg-light small">
                {isLoading
                  ? 'Buscando códigos…'
                  : 'No hay solicitudes ni códigos recientes.'}
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {codes.map((item) => {
                  const badge = getStatusBadge(item.estado);
                  const isPending = item.estado === 'pendiente';

                  return (
                    <div
                      key={item.id}
                      className="border rounded-3 p-3 bg-white d-flex flex-wrap align-items-center justify-content-between gap-2"
                    >
                      <div className="d-flex flex-column gap-1 min-w-0">
                        <div className="d-flex flex-wrap align-items-center gap-2">
                          <strong className="text-dark small">{item.correo}</strong>
                          <span className={`badge rounded-pill ${badge.cls}`} style={{ fontSize: '11px' }}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="text-muted" style={{ fontSize: '11.5px' }}>
                          {item.solicitadoPor === 'usuario'
                            ? 'Pedido por el usuario'
                            : `Generado por ${item.generadoPor || 'operador'}`}
                          {' • '}
                          {isPending
                            ? formatRemaining(item.expiraEn)
                            : item.usadoEn
                              ? `Usado ${new Date(item.usadoEn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                              : `Creado ${new Date(item.creadoEn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <span
                          className={`badge font-monospace px-3 py-2 ${isPending ? 'bg-dark text-white' : 'bg-light text-muted border'}`}
                          style={{ fontSize: '14px', letterSpacing: '1.5px' }}
                        >
                          {item.codigo}
                        </span>

                        {isPending && (
                          <>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => void handleCopy(item)}
                            >
                              {copiedId === item.id ? '¡Copiado!' : 'Copiar'}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => void handleRevoke(item.id)}
                            >
                              Revocar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessCodesModal;
