import React, { useMemo } from 'react';

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
  onRemove
}) => {
  // Generar URLs para los objetos File de forma segura
  const processedImages = useMemo(() => {
    return imagenes.map((img) => {
      if (typeof img === 'string') {
        return { url: img, name: 'Imagen adjunta' };
      }
      return { url: URL.createObjectURL(img), name: img.name };
    });
  }, [imagenes]);

  return (
    <div className="mb-4">
      <label className="form-label-coopya">
        Imágenes adjuntas
      </label>

      <div className="d-flex flex-wrap gap-2 align-items-center">
        {processedImages.map((img, idx) => (
          <div 
            key={idx} 
            className="image-thumbnail-box shadow-sm" 
            title={img.name}
          >
            <img
              src={img.url}
              alt={img.name}
            />
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
        ))}

        {/* Botón dashed para subir nueva imagen */}
        <input
          type="file"
          accept="image/*"
          multiple
          id="ticketFormImageInput"
          onChange={onAdd}
          disabled={isSaving}
          className="d-none"
        />
        <label
          htmlFor="ticketFormImageInput"
          className={`image-upload-dropzone ${isSaving ? 'disabled' : ''}`}
          title="Añadir imágenes"
        >
          <span className="image-upload-icon">+</span>
          <span className="image-upload-text">Adjuntar</span>
        </label>
      </div>
    </div>
  );
};

export default TicketFormImagenes;
