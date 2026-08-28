import React from 'react';

interface TicketFormImagenesProps {
  imagenes: string[];
  isSaving: boolean;
  onAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (idx: number) => void;
}

const TicketFormImagenes: React.FC<TicketFormImagenesProps> = ({ imagenes, isSaving, onAdd, onRemove }) => {
  return (
    <div className="d-flex flex-wrap gap-2 align-items-center mb-4">
      {imagenes.map((img, idx) => (
        <div key={idx} className="position-relative" style={{ width: '120px', height: '80px' }}>
          <img
            src={img}
            alt={`Adjunto ${idx + 1}`}
            className="w-100 h-100 rounded"
            style={{ objectFit: 'cover' }}
          />
          <button
            type="button"
            className="btn btn-danger position-absolute top-0 end-0 rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '22px', height: '22px', padding: 0, fontSize: '14px', lineHeight: 1, transform: 'translate(35%, -35%)' }}
            onClick={() => onRemove(idx)}
            disabled={isSaving}
            aria-label="Eliminar imagen"
          >
            ×
          </button>
        </div>
      ))}

      {/* Botón dashed para subir imagen */}
      <input
        type="file"
        accept="image/*"
        id="editmodalImageInput"
        onChange={onAdd}
        disabled={isSaving}
        className="d-none"
      />
      <label
        htmlFor="editmodalImageInput"
        className="d-flex justify-content-center align-items-center rounded"
        style={{
          width: '120px',
          height: '80px',
          border: '1.5px dashed #adb5bd',
          cursor: 'pointer',
          fontSize: '28px',
          color: '#6c757d',
          backgroundColor: '#f8f9fa'
        }}
        title="Añadir imagen"
      >
        +
      </label>
    </div>
  );
};

export default TicketFormImagenes;
