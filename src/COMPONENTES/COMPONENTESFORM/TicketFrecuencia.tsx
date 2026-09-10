import React from 'react';
import { PERIODOS_FRECUENCIA } from '../TICKETMENU/ticketStates';
import type { Frecuencia, PeriodoFrecuencia } from '../../TYPES';

interface TicketFrecuenciaProps {
  frecuencia?: Frecuencia | null;
  onChange: (frecuencia: Frecuencia | undefined) => void;
  disabled?: boolean;
}

export const TicketFrecuencia: React.FC<TicketFrecuenciaProps> = ({ 
  frecuencia, 
  onChange,
  disabled = false
}) => {
  const isRecurrente = frecuencia?.periodo && frecuencia.periodo !== 'No recurrente';

  const handlePeriodoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoPeriodo = e.target.value as PeriodoFrecuencia;
    if (nuevoPeriodo === 'No recurrente') {
      onChange(undefined);
    } else {
      onChange({
        numero: frecuencia?.numero || 1,
        periodo: nuevoPeriodo
      });
    }
  };

  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange({
      numero: val === '' ? '' : Number(val),
      periodo: frecuencia?.periodo || 'Días'
    });
  };

  return (
    <div className="card border-0 bg-light p-3 rounded mb-3">
      <h6 className="form-label-coopya-muted">Configuración de Recurrencia</h6>
      <div className="row g-2 align-items-center">
        <div className="col-auto">
          <label className="form-label mb-0 me-2 text-secondary small">Repetir cada:</label>
        </div>
        
        {isRecurrente && (
          <div className="col-auto">
            <input 
              type="number" 
              className="form-control form-control-sm recurrence-input-number"
              min="1"
              value={frecuencia?.numero === '' ? '' : frecuencia?.numero || ''}
              onChange={handleNumeroChange}
              disabled={disabled}
            />
          </div>
        )}
        
        <div className="col-auto">
          <select 
            className="form-select form-select-sm"
            value={frecuencia?.periodo || 'No recurrente'}
            onChange={handlePeriodoChange}
            disabled={disabled}
          >
            {PERIODOS_FRECUENCIA.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TicketFrecuencia;
