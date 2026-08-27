import React, { useState, useEffect } from 'react';
import { TICKET_STATES, TICKET_STATE_LABELS, COLABORADORES, PRIORIDADES } from './ticketStates';
import type { Ticket } from './types';

interface TicketFormProps {
  ticket: Ticket;
  onCancel: () => void;
  onSave: (ticket: Ticket) => void;
}

interface FormData {
  titulo: string;
  descripcion: string;
  estado: string;
  colaborador: string;
  prioridad: string;
  imagenes: string[];
}

const TicketForm: React.FC<TicketFormProps> = ({ ticket, onCancel, onSave }) => {
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descripcion: '',
    estado: TICKET_STATES.PENDIENTE,
    colaborador: '',
    prioridad: PRIORIDADES.MEDIA,
    imagenes: []
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (ticket) {
      setFormData({
        titulo: ticket.titulo || '',
        descripcion: ticket.descripcion || '',
        estado: ticket.estado || TICKET_STATES.PENDIENTE,
        colaborador: ticket.colaborador || '',
        prioridad: ticket.prioridad || PRIORIDADES.MEDIA,
        imagenes: ticket.imagenes || []
      });
    }
  }, [ticket]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        imagenes: [...prev.imagenes, reader.result as string]
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveImage = (idx: number): void => {
    setFormData((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSaving(true);
    //await new Promise((r) => setTimeout(r, 1000));
    const ahora = new Date().toISOString();
    const ticketFinal: Ticket = {
      ...ticket,
      ...formData,
      fechaModificacion: ahora,
      fechaCierre: formData.estado === TICKET_STATES.TERMINADO ? ahora : null
    };

    onSave(ticketFinal);
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <h2 style={{ color: '#002B5E', fontWeight: 700, fontSize: '26px', margin: 0 }}>Edición Ticket</h2>
      <hr className="my-3" />

      {/* Row 1: Título + Asignar */}
      <div className="row mb-4 align-items-end">
        <div className="col-8">
          <input
            type="text"
            className="form-control"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Titulo"
            required
            disabled={isSaving}
          />
        </div>
        <div className="col-4">
          <label className="form-label mb-1 fw-bold" style={{ color: '#002B5E', fontSize: '14px' }}>
            Asignar
          </label>
          <select
            className="form-select"
            name="colaborador"
            value={formData.colaborador}
            onChange={handleChange}
            disabled={isSaving}
          >
            <option value="">Seleccionar</option>
            {COLABORADORES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Descripción */}
      <div className="mb-4">
        <textarea
          className="form-control"
          rows={4}
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Contanos qué pasó y/o peganos una imagen"
          required
          disabled={isSaving}
          style={{ resize: 'none' }}
        />
      </div>

      {/* Row 3: Imágenes */}
      <div className="d-flex flex-wrap gap-2 align-items-center mb-4">
        {formData.imagenes.map((img, idx) => (
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
              onClick={() => handleRemoveImage(idx)}
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
          onChange={handleImageChange}
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

      {/* Row 4: Estado + Prioridad */}
      <div className="row mb-4">
        <div className="col-6">
          <label className="form-label mb-1 fw-bold" style={{ color: '#002B5E', fontSize: '14px' }}>
            Estado
          </label>
          <select
            className="form-select"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            disabled={isSaving}
          >
            {Object.entries(TICKET_STATES).map(([key, value]) => (
              <option key={key} value={value}>
                {TICKET_STATE_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <div className="col-6">
          <label className="form-label mb-1 fw-bold" style={{ color: '#002B5E', fontSize: '14px' }}>
            Prioridad
          </label>
          <select
            className="form-select"
            name="prioridad"
            value={formData.prioridad}
            onChange={handleChange}
            disabled={isSaving}
          >
            {Object.values(PRIORIDADES).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 5: Creador (izq) + Botones (der) */}
      <div className="d-flex justify-content-between align-items-end mt-3">
        {ticket.creadoPor && (
          <span className="text-muted" style={{ fontSize: '13px' }}>
            Creado por: <strong>{ticket.creadoPor}</strong>
          </span>
        )}

        <div className="d-flex gap-3 ms-auto">
          <button
            type="button"
            className="btn btn-outline-primary px-4"
            onClick={onCancel}
            disabled={isSaving}
          >
            Volver
          </button>
          <button
            type="submit"
            className="btn btn-primary px-4"
            disabled={isSaving}
          >
            {isSaving ? 'Guardando…' : 'Finalizar'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TicketForm;
