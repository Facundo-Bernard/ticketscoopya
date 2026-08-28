import React from 'react';
import { TICKET_STATES, TICKET_STATE_LABELS, COLABORADORES, PRIORIDADES } from '../ticketStates';

interface TicketFormCamposProps {
  formData: {
    titulo: string;
    descripcion: string;
    colaborador: string;
    estado: string;
    prioridad: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  isSaving: boolean;
}

const TicketFormCampos: React.FC<TicketFormCamposProps> = ({ formData, onChange, isSaving }) => {
  return (
    <>
      {/* Row 1: Título + Asignar */}
      <div className="row mb-4 align-items-end">
        <div className="col-8">
          <input
            type="text"
            className="form-control"
            name="titulo"
            value={formData.titulo}
            onChange={onChange}
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
            onChange={onChange}
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
          onChange={onChange}
          placeholder="Contanos qué pasó y/o peganos una imagen"
          required
          disabled={isSaving}
          style={{ resize: 'none' }}
        />
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
            onChange={onChange}
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
            onChange={onChange}
            disabled={isSaving}
          >
            {Object.values(PRIORIDADES).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default TicketFormCampos;
