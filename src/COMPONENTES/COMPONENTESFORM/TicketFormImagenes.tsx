import React, { useMemo } from 'react';
import {
  getAttachmentMeta,
  formatFileSize,
  getCategoryBadgeInfo,
  type AttachmentMeta,
} from '../../UTILS/attachmentUtils';
import AttachmentIcon from '../COMUN/AttachmentIcon';

interface TicketFormImagenesProps {
  imagenes: (string | File)[];
  isSaving?: boolean;
  onAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (idx: number) => void;
}

export const TicketFormImagenes: React.FC<TicketFormImagenesProps> = ({
  imagenes,
  isSaving = false,
  onAdd,
  onRemove,
}) => {
  const processedAttachments = useMemo<AttachmentMeta[]>(() => {
    return imagenes.map((item) => getAttachmentMeta(item));
  }, [imagenes]);

  return (
    <div className="mb-4">
      <div className="d-flex align-items-baseline gap-2 mb-2">
        <label className="form-label-coopya mb-0">
          Archivos y documentos adjuntos
        </label>
        <span className="text-muted small" style={{ fontSize: '11px' }}>
          (Fotos, PDF, Excel, CSV, TXT hasta 25 MB)
        </span>
      </div>

      <div className="d-flex flex-wrap gap-2 align-items-center">
        {processedAttachments.map((att, idx) => {
          const isImage = att.category === 'image';

          if (isImage) {
            return (
              <div
                key={idx}
                className="image-thumbnail-box shadow-sm"
                title={att.name}
              >
                <img src={att.url} alt={att.name} />
                <button
                  type="button"
                  className="image-remove-badge"
                  onClick={() => onRemove(idx)}
                  disabled={isSaving}
                  aria-label="Eliminar imagen"
                  title="Eliminar imagen"
                >
                  ×
                </button>
              </div>
            );
          }

          const badgeInfo = getCategoryBadgeInfo(att.category);

          return (
            <div
              key={idx}
              className="document-thumbnail-box shadow-sm"
              style={{
                borderTop: `3px solid ${badgeInfo.color}`,
                backgroundColor: badgeInfo.bgColor,
                borderColor: badgeInfo.borderColor,
              }}
              title={att.name}
            >
              <div className="d-flex align-items-center justify-content-between w-100">
                <span
                  className={`badge ${badgeInfo.badgeClass} d-inline-flex align-items-center gap-1 py-1 px-1.5`}
                  style={{ fontSize: '10px', fontWeight: 700 }}
                >
                  <AttachmentIcon category={att.category} size={13} />
                  {badgeInfo.label}
                </span>

                <button
                  type="button"
                  className="image-remove-badge"
                  onClick={() => onRemove(idx)}
                  disabled={isSaving}
                  aria-label={`Eliminar ${att.name}`}
                  title="Eliminar archivo"
                >
                  ×
                </button>
              </div>

              <div className="mt-1 w-100 overflow-hidden">
                <div
                  className="text-truncate small fw-semibold text-dark lh-sm"
                  style={{ fontSize: '11px' }}
                >
                  {att.name}
                </div>
                {att.size ? (
                  <span className="text-muted" style={{ fontSize: '10px' }}>
                    {formatFileSize(att.size)}
                  </span>
                ) : (
                  <span className="text-muted" style={{ fontSize: '10px' }}>
                    Adjunto
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Botón dashed para subir archivos */}
        <input
          type="file"
          accept="image/*,.pdf,.xlsx,.xls,.csv,.txt,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,text/plain"
          multiple
          id="ticketFormImageInput"
          onChange={onAdd}
          disabled={isSaving}
          className="d-none"
        />
        <label
          htmlFor="ticketFormImageInput"
          className={`image-upload-dropzone ${isSaving ? 'disabled' : ''}`}
          title="Añadir imágenes, PDFs o planillas Excel/CSV"
        >
          <span className="image-upload-icon">+</span>
          <span className="image-upload-text">Adjuntar</span>
        </label>
      </div>
    </div>
  );
};

export default TicketFormImagenes;
