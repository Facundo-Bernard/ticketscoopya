import React from 'react';
import { useCatalogs } from '../../../COMPOSABLES/useCatalogs';

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
  const { estados, prioridades, asignables, isLoading } = useCatalogs();

  return (
    <>
      {/* Row 1: Título + Asignar */}
      <div className="row mb-4 align-items-end">
        <div className="col-8">
          <label className="form-label mb-1 fw-bold" style={{ color: '#002B5E', fontSize: '14px' }}>
            Título
          </label>
          <input
            type="text"
            className="form-control"
            name="titulo"
            value={formData.titulo}
            onChange={onChange}
            placeholder="Título del ticket"
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
            disabled={isSaving || isLoading}
          >
            <option value="">{isLoading ? 'Cargando técnicos...' : 'Seleccionar'}</option>
            {asignables.map((c) => (
              <option key={c.value} value={c.label || c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Descripción */}
      <div className="mb-4">
        <label className="form-label mb-1 fw-bold" style={{ color: '#002B5E', fontSize: '14px' }}>
          Descripción
        </label>
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
            value={formData.estado ? formData.estado.toLowerCase() : ''}
            onChange={onChange}
            disabled={isSaving || isLoading}
          >
            {isLoading && <option value="">Cargando estados...</option>}
            {estados.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
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
            value={formData.prioridad ? formData.prioridad.toLowerCase() : ''}
            onChange={onChange}
            disabled={isSaving || isLoading}
          >
            {isLoading && <option value="">Cargando prioridades...</option>}
            {prioridades.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default TicketFormCampos;
