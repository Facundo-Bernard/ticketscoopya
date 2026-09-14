import React, { useState, useEffect, useMemo } from 'react';
import { 
  TICKET_STATE_COLORS, 
  PRIORIDAD_COLORS, 
  formatCatalogLabel 
} from '../../TICKETMENU/ticketStates';
import type { Ticket } from '../../../TYPES';
import { 
  FlagIcon, 
  UserIcon, 
  RepeatIcon, 
  ZoomInIcon,
  DownloadIcon,
  ExternalLinkIcon,
  ChevronRightIcon,
} from '../../COMUN/Icons';
import AttachmentIcon from '../../COMUN/AttachmentIcon';
import {
  getAttachmentMeta,
  resolveAttachmentMeta,
  getCategoryBadgeInfo,
  formatFileSize,
  type AttachmentMeta,
} from '../../../UTILS/attachmentUtils';
import { TicketComentarios } from './COMENTARIOS';

interface TicketDetalleProps {
  ticket: Ticket | null;
}

const TicketDetalle: React.FC<TicketDetalleProps> = ({ ticket }) => {
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState<boolean>(true);
  const initialMetas = useMemo(() => {
    return (ticket?.imagenes || []).map(getAttachmentMeta);
  }, [ticket?.imagenes]);

  const [asyncResolved, setAsyncResolved] = useState<AttachmentMeta[] | null>(null);
  const [isResolving, setIsResolving] = useState<boolean>(() => {
    return (ticket?.imagenes || []).some((item) => {
      const meta = getAttachmentMeta(item);
      return !meta.ext && !meta.isLocal;
    });
  });

  useEffect(() => {
    let isMounted = true;
    const hasUnresolved = (ticket?.imagenes || []).some((item) => {
      const meta = getAttachmentMeta(item);
      return !meta.ext && !meta.isLocal;
    });

    if (hasUnresolved) {
      setIsResolving(true);
      Promise.all((ticket?.imagenes || []).map((item) => resolveAttachmentMeta(item)))
        .then((metas) => {
          if (isMounted) {
            setAsyncResolved(metas);
            setIsResolving(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setIsResolving(false);
          }
        });
    } else {
      setIsResolving(false);
    }

    return () => {
      isMounted = false;
    };
  }, [ticket?.imagenes]);

  const resolvedAttachments = asyncResolved ?? initialMetas;

  if (!ticket) return null;

  const estadoNormalizado = (ticket.estado || 'abierto').toLowerCase();
  const stateColor = TICKET_STATE_COLORS[estadoNormalizado] || 'secondary';
  const stateLabel = formatCatalogLabel(ticket.estado);

  const prioridadNormalizada = (ticket.prioridad || 'media').toLowerCase();
  const prioridadColor = PRIORIDAD_COLORS[prioridadNormalizada] || 'secondary';
  const prioridadLabel = formatCatalogLabel(ticket.prioridad);

  return (
    <div>
      <div className="d-flex align-items-baseline gap-2 mb-2">
        {ticket.identificador && (
          <span className="badge bg-dark font-monospace flex-shrink-0">{ticket.identificador}</span>
        )}
        <h4 className="mb-0 text-break">{ticket.titulo}</h4>
      </div>

      <div className="mb-3 d-flex flex-wrap gap-2 align-items-center mt-2">
        <span className={`badge bg-${stateColor}`}>{stateLabel}</span>

        {ticket.colaborador && ticket.colaborador.trim() ? (
          <span className="badge bg-light text-dark border d-inline-flex align-items-center">
            <UserIcon size={13} className="me-1 text-primary" /> {ticket.colaborador}
          </span>
        ) : (
          <span className="badge bg-light text-secondary border d-inline-flex align-items-center">
            <UserIcon size={13} className="me-1 text-secondary opacity-75" /> Sin Asignar
          </span>
        )}

        {ticket.prioridad && (
          <span className={`badge bg-${prioridadColor} d-inline-flex align-items-center`}>
            <FlagIcon size={12} className="me-1" />
            {prioridadLabel}
          </span>
        )}

        {ticket.frecuencia && ticket.frecuencia.periodo !== 'No recurrente' && (
          <span className="badge bg-secondary d-inline-flex align-items-center">
            <RepeatIcon size={12} className="me-1" /> 
            Cada {ticket.frecuencia.numero} {ticket.frecuencia.periodo}
          </span>
        )}
      </div>

      <div className="mb-3">
        <strong>Descripción:</strong>
        <p className="mt-2 pre-wrap-text text-break">
          {ticket.descripcion}
        </p>
      </div>
      
      {((ticket.imagenes && ticket.imagenes.length > 0) || resolvedAttachments.length > 0) && (
        <div className="mb-4">
          <div className="d-flex align-items-center mb-2">
            <button
              type="button"
              className="attachment-collapse-trigger"
              onClick={() => setIsAttachmentsOpen((prev) => !prev)}
              aria-expanded={isAttachmentsOpen}
              aria-label="Alternar visualización de archivos adjuntos"
            >
              <span className={`attachment-chevron ${isAttachmentsOpen ? 'is-open' : ''}`}>
                <ChevronRightIcon size={14} />
              </span>
              <strong className="text-dark">Archivos Adjuntos:</strong>
              {!isResolving && (
                <span className="badge bg-light text-secondary border rounded-pill" style={{ fontSize: '11px' }}>
                  {resolvedAttachments.length}
                </span>
              )}
            </button>
          </div>

          <div className={`attachment-collapse-wrapper ${isAttachmentsOpen ? 'is-open' : ''}`}>
            <div className="attachment-collapse-inner">
              <div className="pt-1 pb-1">
                {isResolving && !asyncResolved ? (
                  <div className="d-flex align-items-center gap-2 text-muted small py-2 ps-2">
                    <span className="spinner-border spinner-border-sm text-secondary" role="status" aria-hidden="true" />
                    <span>Detectando archivos adjuntos...</span>
                  </div>
                ) : (
                  <div className="row g-2">
                    {resolvedAttachments.map((att, idx) => {
                      const isImage = att.category === 'image';
                      const badgeInfo = getCategoryBadgeInfo(att.category);
                      const canPreviewInline = att.category === 'pdf' || att.category === 'text';

                      return (
                        <div key={idx} className="col-12 col-md-6">
                          <div 
                            className="attachment-detail-card h-100"
                            style={{ borderLeft: `4px solid ${badgeInfo.color}` }}
                          >
                            <div className="attachment-detail-info">
                              {isImage ? (
                                <a
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="attachment-image-thumb-pill"
                                  title="Clic para ampliar imagen"
                                >
                                  <img
                                    src={att.url}
                                    alt={att.name || `Imagen ${idx + 1}`}
                                    className="attachment-thumb-img"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).classList.add('opacity-50');
                                    }}
                                  />
                                  <span className="attachment-thumb-zoom-badge" title="Ampliar">
                                    <ZoomInIcon size={10} />
                                  </span>
                                </a>
                              ) : (
                                <div
                                  className="attachment-icon-pill"
                                  style={{
                                    backgroundColor: badgeInfo.bgColor,
                                    border: `1.5px solid ${badgeInfo.borderColor}`,
                                  }}
                                >
                                  <AttachmentIcon category={att.category} size={20} />
                                </div>
                              )}

                              <div className="attachment-detail-text">
                                <div
                                  className="attachment-detail-name text-dark fw-semibold small"
                                  title={att.name}
                                >
                                  {att.name}
                                </div>
                                <div className="d-flex align-items-center gap-1.5 mt-0.5 text-nowrap">
                                  <span
                                    className={`badge ${badgeInfo.badgeClass}`}
                                    style={{ fontSize: '9px', fontWeight: 600 }}
                                  >
                                    {badgeInfo.label}
                                  </span>
                                  <span className="text-muted text-truncate" style={{ fontSize: '11px' }}>
                                    {badgeInfo.description}
                                    {att.size ? ` • ${formatFileSize(att.size)}` : ''}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="attachment-detail-actions">
                              {isImage ? (
                                <>
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm d-inline-flex align-items-center gap-1 px-2 py-1"
                                    title="Ampliar imagen"
                                    style={{
                                      fontSize: '12px',
                                      color: badgeInfo.color,
                                      borderColor: badgeInfo.borderColor,
                                      backgroundColor: '#ffffff',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    <ZoomInIcon size={12} />
                                    Ampliar
                                  </a>
                                  <a
                                    href={att.url}
                                    download={att.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 px-2 py-1"
                                    title={`Descargar ${att.name}`}
                                    style={{ fontSize: '12px', whiteSpace: 'nowrap' }}
                                  >
                                    <DownloadIcon size={12} />
                                    Descargar
                                  </a>
                                </>
                              ) : (
                                <>
                                  {canPreviewInline && (
                                    <a
                                      href={att.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-sm d-inline-flex align-items-center gap-1 px-2 py-1"
                                      title="Ver archivo en nueva pestaña"
                                      style={{
                                        fontSize: '12px',
                                        color: badgeInfo.color,
                                        borderColor: badgeInfo.borderColor,
                                        backgroundColor: '#ffffff',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      <ExternalLinkIcon size={12} />
                                      Ver
                                    </a>
                                  )}
                                  <a
                                    href={att.url}
                                    download={att.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 px-2 py-1"
                                    title={`Descargar ${att.name}`}
                                    style={{ fontSize: '12px', whiteSpace: 'nowrap' }}
                                  >
                                    <DownloadIcon size={12} />
                                    Descargar
                                  </a>
                                </>
                              )}
                            </div>
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
      )}

      {/* SECCIÓN DE COMENTARIOS E HISTORIAL */}
      <TicketComentarios ticketId={ticket.id} />

      <hr className="mt-4 mb-3" />
      <div className="d-flex flex-wrap justify-content-between text-muted small gap-2">
        <div className="d-flex flex-column gap-1">
          {ticket.creadoPor && (
            <span>Creado por: <strong>{ticket.creadoPor}</strong></span>
          )}
          {ticket.correo && ticket.correo !== ticket.creadoPor && (
            <span>Contacto: <strong>{ticket.correo}</strong></span>
          )}
        </div>
        <div className="d-flex flex-column gap-1 text-end">
          {ticket.fechaCreacion && (
            <span><strong>Creado:</strong> {new Date(ticket.fechaCreacion).toLocaleString()}</span>
          )}
          {ticket.fechaModificacion && (
            <span><strong>Modificado:</strong> {new Date(ticket.fechaModificacion).toLocaleString()}</span>
          )}
          {ticket.fechaCierre && (
            <span><strong>Cerrado:</strong> {new Date(ticket.fechaCierre).toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetalle;
