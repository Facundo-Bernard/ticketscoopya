import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  formatCatalogLabel,
  TICKET_STATE_COLORS,
} from '../TICKETMENU/ticketStates';
import {
  formatFileSize,
  getAttachmentMeta,
  getCategoryBadgeInfo,
  resolveAttachmentMeta,
  type AttachmentMeta,
} from '../../UTILS/attachmentUtils';
import AttachmentIcon from '../COMUN/AttachmentIcon';
import { DownloadIcon, ExternalLinkIcon, ZoomInIcon } from '../COMUN/Icons';
import type { RequesterTicket } from '../../TYPES';

export interface RequesterTicketModalProps {
  ticket: RequesterTicket | null;
  onClose: () => void;
}

function getProgressStep(estado: string): { step: number; hint: string } {
  const norm = estado.toLowerCase();
  if (norm === 'resuelto' || norm === 'cerrado') {
    return { step: 3, hint: 'Tu solicitud ya fue resuelta.' };
  }
  if (norm === 'en_progreso') {
    return { step: 2, hint: 'El equipo técnico está trabajando en tu solicitud.' };
  }
  return { step: 1, hint: 'Recibimos tu solicitud y está en cola para ser revisada.' };
}

export const RequesterTicketModal: React.FC<RequesterTicketModalProps> = ({
  ticket,
  onClose,
}) => {
  const backdropMouseDownRef = useRef(false);
  const imagenes = useMemo(() => ticket?.imagenes ?? [], [ticket?.imagenes]);
  const initialMetas = useMemo(() => imagenes.map(getAttachmentMeta), [imagenes]);
  const attachmentsKey = imagenes.join('|');
  const hasUnresolved = initialMetas.some((m) => !m.ext && !m.isLocal);
  const [asyncResult, setAsyncResult] = useState<{ key: string; metas: AttachmentMeta[] } | null>(null);

  useEffect(() => {
    if (!ticket) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ticket, onClose]);

  useEffect(() => {
    if (!ticket || !hasUnresolved) return;

    let mounted = true;
    Promise.all(imagenes.map((item) => resolveAttachmentMeta(item)))
      .then((metas) => {
        if (mounted) {
          setAsyncResult({ key: attachmentsKey, metas });
        }
      })
      .catch(() => {
        if (mounted) {
          setAsyncResult({ key: attachmentsKey, metas: initialMetas });
        }
      });

    return () => {
      mounted = false;
    };
  }, [ticket, hasUnresolved, attachmentsKey, imagenes, initialMetas]);

  if (!ticket) return null;

  const isResolving = hasUnresolved && asyncResult?.key !== attachmentsKey;
  const resolvedAttachments = asyncResult?.key === attachmentsKey ? asyncResult.metas : initialMetas;
  const estadoNorm = (ticket.estado || 'abierto').toLowerCase();
  const stateColor = TICKET_STATE_COLORS[estadoNorm] || 'secondary';
  const stateLabel = formatCatalogLabel(ticket.estado || 'abierto');
  const progress = getProgressStep(estadoNorm);

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
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-4 shadow-lg overflow-hidden modal-top-accent">
          <div className="modal-header d-flex justify-content-between align-items-start bg-white border-bottom py-3 px-4">
            <div className="d-flex flex-column gap-2 pe-3">
              <div className="d-flex flex-wrap align-items-center gap-2">
                {ticket.identificador && (
                  <span className="badge bg-dark font-monospace">{ticket.identificador}</span>
                )}
                <span className={`badge bg-${stateColor}`}>{stateLabel}</span>
              </div>
              <h5 className="modal-title fw-bold text-dark mb-0 text-break">
                {ticket.titulo}
              </h5>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Cerrar"
            />
          </div>

          <div className="modal-body p-4">
            {/* Progreso simple del estado */}
            <div className="p-3 rounded-3 bg-light border mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2 small fw-semibold">
                <span className={progress.step >= 1 ? 'text-dark' : 'text-muted'}>
                  1. Recibido
                </span>
                <span className={progress.step >= 2 ? 'text-dark' : 'text-muted'}>
                  2. En progreso
                </span>
                <span className={progress.step >= 3 ? 'text-success' : 'text-muted'}>
                  3. {estadoNorm === 'cerrado' ? 'Cerrado' : 'Resuelto'}
                </span>
              </div>
              <div className="progress" style={{ height: '6px' }}>
                <div
                  className={`progress-bar ${progress.step === 3 ? 'bg-success' : progress.step === 2 ? 'bg-warning' : 'bg-info'}`}
                  role="progressbar"
                  style={{ width: `${(progress.step / 3) * 100}%` }}
                  aria-valuenow={progress.step}
                  aria-valuemin={1}
                  aria-valuemax={3}
                />
              </div>
              <div className="small text-secondary mt-2 mb-0">{progress.hint}</div>
            </div>

            {/* Descripción */}
            <div className="mb-4">
              <strong className="d-block mb-1 text-dark">Descripción:</strong>
              <p
                className="text-secondary mb-0 text-break"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {ticket.descripcion}
              </p>
            </div>

            {/* Archivos adjuntos enviados */}
            {imagenes.length > 0 && (
              <div className="mb-4">
                <strong className="d-block mb-2 text-dark">
                  Archivos enviados ({imagenes.length})
                </strong>

                {isResolving ? (
                  <div className="text-muted small py-2 d-flex align-items-center gap-2">
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    Cargando archivos adjuntos...
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {resolvedAttachments.map((att, idx) => {
                      const badgeInfo = getCategoryBadgeInfo(att.category);
                      const canPreviewInline =
                        att.category === 'image' || att.category === 'pdf' || att.category === 'text';

                      return (
                        <div
                          key={`${att.url}-${idx}`}
                          className="border rounded-3 p-2 bg-light d-flex flex-column gap-2"
                        >
                          {att.category === 'image' && (
                            <div className="bg-white rounded border text-center p-2">
                              <img
                                src={att.url}
                                alt={att.name}
                                className="img-fluid rounded"
                                style={{ maxHeight: '220px', objectFit: 'contain' }}
                              />
                            </div>
                          )}

                          <div className="d-flex align-items-center justify-content-between gap-2 px-1 flex-wrap">
                            <div className="d-flex align-items-center gap-2 min-w-0">
                              <div
                                className="d-inline-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  backgroundColor: badgeInfo.bgColor,
                                  color: badgeInfo.color,
                                  border: `1px solid ${badgeInfo.borderColor}`,
                                }}
                              >
                                <AttachmentIcon category={att.category} size={15} />
                              </div>
                              <div className="min-w-0">
                                <div className="small fw-medium text-dark text-truncate" title={att.name}>
                                  {att.name}
                                </div>
                                <div className="text-muted" style={{ fontSize: '11px' }}>
                                  {badgeInfo.label}
                                  {att.size !== undefined ? ` • ${formatFileSize(att.size)}` : ''}
                                </div>
                              </div>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                              {att.category === 'image' ? (
                                <a
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                                  style={{ fontSize: '12px' }}
                                >
                                  <ZoomInIcon size={12} />
                                  Ampliar
                                </a>
                              ) : (
                                canPreviewInline && (
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                                    style={{ fontSize: '12px' }}
                                  >
                                    <ExternalLinkIcon size={12} />
                                    Ver
                                  </a>
                                )
                              )}
                              <a
                                href={att.url}
                                download={att.name}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                                style={{ fontSize: '12px' }}
                              >
                                <DownloadIcon size={12} />
                                Descargar
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <hr className="my-3" />
            <div className="d-flex flex-wrap justify-content-between text-muted small gap-2">
              <span>
                <strong>Enviado:</strong> {new Date(ticket.fechaCreacion).toLocaleString()}
              </span>
              {ticket.fechaModificacion && (
                <span>
                  <strong>Última actualización:</strong>{' '}
                  {new Date(ticket.fechaModificacion).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="modal-footer bg-light py-2 px-4 border-top">
            <button
              type="button"
              className="btn btn-sm btn-coopya-red px-4"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequesterTicketModal;
