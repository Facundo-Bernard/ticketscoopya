import React from 'react';
import { PERIODOS_FRECUENCIA } from '../ticketStates';
import type { Frecuencia, PeriodoFrecuencia } from '../types';

interface TicketFrecuenciaProps {
  frecuencia?: Frecuencia;
  onChange: (frecuencia: Frecuencia | undefined) => void;
}

const TicketFrecuencia: React.FC<TicketFrecuenciaProps> = ({ frecuencia, onChange }) => {
  const isRecurrente = frecuencia?.periodo && frecuencia.periodo !== 'No recurrente';

  const handlePeriodoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoPeriodo = e.target.value as PeriodoFrecuencia;
    if (nuevoPeriodo === 'No recurrente') {
      onChange(undefined);
    } else {
      onChange({
        numero: frecuencia?.numero || 1, // Default to 1 if enabling recurrence
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
    <div className="card border-0 bg-light p-3 rounded mt-3">
      <h6 className="mb-3 text-muted fw-bold">Configuración de Recurrencia</h6>
      <div className="row g-2 align-items-center">
        <div className="col-auto">
          <label className="form-label mb-0 me-2 text-secondary">Repetir cada:</label>
        </div>
        
        {isRecurrente && (
          <div className="col-auto">
            <input 
              type="number" 
              className="form-control form-control-sm"
              style={{ width: '80px' }}
              min="1"
              value={frecuencia?.numero === '' ? '' : frecuencia?.numero || ''}
              onChange={handleNumeroChange}
            />
          </div>
        )}
        
        <div className="col-auto">
          <select 
            className="form-select form-select-sm"
            value={frecuencia?.periodo || 'No recurrente'}
            onChange={handlePeriodoChange}
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
