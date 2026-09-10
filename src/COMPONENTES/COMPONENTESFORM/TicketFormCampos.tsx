import React from 'react';
import { useCatalogs } from '../../COMPOSABLES/useCatalogs';
import { TICKET_COLUMNS } from '../../TYPES';
import { UserCheckIcon } from '../COMUN/Icons';

export interface TicketFormData {
  titulo: string;
  descripcion: string;
  colaborador?: string;
  asignar?: string;
  email?: string;
  correo?: string;
  estado?: string;
  prioridad?: string;
  columnId?: number | string;
  columna?: number | string;
}

export interface TicketFormCamposProps {
  formData: TicketFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  isSaving?: boolean;
  showAsignar?: boolean;
  showColumna?: boolean;
  showEstado?: boolean;
  showEmail?: boolean;
  emailReadonly?: boolean;
  hasStoredEmail?: boolean;
  showPrioridad?: boolean;
}

export const TicketFormCampos: React.FC<TicketFormCamposProps> = ({
  formData,
  onChange,
  isSaving = false,
  showAsignar = true,
  showColumna = true,
  showEstado = true,
  showEmail = false,
  emailReadonly = false,
  hasStoredEmail = false,
  showPrioridad = true
}) => {
  const { estados, prioridades, asignables, isLoading } = useCatalogs();
  const safeEstados = Array.isArray(estados) ? estados : [];
  const safePrioridades = Array.isArray(prioridades) ? prioridades : [];
  const safeAsignables = Array.isArray(asignables) ? asignables : [];

  const assignedValue = formData.colaborador ?? formData.asignar ?? '';
  const emailValue = formData.email ?? formData.correo ?? '';
  const columnValue = formData.columnId ?? formData.columna ?? 1;

  const visibleSelectorsCount = (showPrioridad ? 1 : 0) + (showColumna ? 1 : 0) + (showEstado ? 1 : 0);
  const selectorColClass = visibleSelectorsCount === 3 ? 'col-md-4' : visibleSelectorsCount === 2 ? 'col-md-6' : 'col-12';

  return (
    <>
      {/* Fila 1: Título + Asignar (si aplica) */}
      <div className="row mb-3 align-items-end">
        <div className={showAsignar ? 'col-md-8' : 'col-12'}>
          <label className="form-label-coopya">
            Título
          </label>
          <input
            type="text"
            className="form-control"
            name="titulo"
            value={formData.titulo}
            onChange={onChange}
            placeholder="Ingrese el título del ticket"
            required
            disabled={isSaving}
          />
        </div>

        {showAsignar && (
          <div className="col-md-4 mt-3 mt-md-0">
            <label className="form-label-coopya">
              Asignar Técnico
            </label>
            <select
              className="form-select"
              name="colaborador"
              value={assignedValue}
              onChange={onChange}
              disabled={isSaving || isLoading}
            >
              <option value="">{isLoading ? 'Cargando técnicos...' : 'Sin asignar'}</option>
              {safeAsignables.map((c) => (
                <option key={c.value} value={c.label || c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Fila 2: Email (opcional, para creadores de ticket o readonly) */}
      {showEmail && (
        <div className="mb-3">
          {hasStoredEmail && emailValue ? (
            <div className="p-3 bg-light rounded-3 border d-flex align-items-center gap-3">
              <UserCheckIcon size={24} className="text-primary flex-shrink-0" />
              <div>
                <span className="small text-muted d-block">Solicitante</span>
                <span className="fw-semibold text-dark">{emailValue}</span>
              </div>
            </div>
          ) : (
            <>
              <label className="form-label-coopya">
                Email del solicitante (Obligatorio)
              </label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={emailValue}
                onChange={onChange}
                placeholder="ejemplo@coopya.com"
                required
                disabled={isSaving || emailReadonly}
                readOnly={emailReadonly}
              />
            </>
          )}
        </div>
      )}

      {/* Fila 3: Descripción */}
      <div className="mb-3">
        <label className="form-label-coopya">
          Contanos qué pasó y/o peganos una imagen
        </label>
        <textarea
          className="form-control"
          rows={4}
          name="descripcion"
          value={formData.descripcion}
          onChange={onChange}
          placeholder="Ingrese la descripción detallada del ticket"
          required
          disabled={isSaving}
        />
      </div>

      {/* Fila 4: Selectores (Prioridad, Columna, Estado) */}
      {visibleSelectorsCount > 0 && (
        <div className="row mb-3">
          {/* Prioridad */}
          {showPrioridad && (
            <div className={`${selectorColClass} mb-2 mb-md-0`}>
              <label className="form-label-coopya">
                Prioridad
              </label>
              <select
                className="form-select"
                name="prioridad"
                value={formData.prioridad ? formData.prioridad.toLowerCase() : 'media'}
                onChange={onChange}
                disabled={isSaving || isLoading}
              >
                {isLoading && <option value="">Cargando prioridades...</option>}
                {safePrioridades.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Columna (solo para Técnicos o Edición) */}
          {showColumna && (
            <div className={`${selectorColClass} mb-2 mb-md-0`}>
              <label className="form-label-coopya">
                Columna
              </label>
              <select
                className="form-select"
                name="columnId"
                value={columnValue}
                onChange={onChange}
                disabled={isSaving}
              >
                {TICKET_COLUMNS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Estado (solo para Edición) */}
          {showEstado && (
            <div className={selectorColClass}>
              <label className="form-label-coopya">
                Estado
              </label>
              <select
                className="form-select"
                name="estado"
                value={formData.estado ? formData.estado.toLowerCase() : 'abierto'}
                onChange={onChange}
                disabled={isSaving || isLoading}
              >
                {isLoading && <option value="">Cargando estados...</option>}
                {safeEstados.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default TicketFormCampos;
