import React from 'react'
import type { ActiveFilters } from './useTicketFilters'
import { TICKET_COLUMNS } from '../../../TYPES'

const PRIORIDADES = [
  { value: 'baja',    label: 'Baja',    color: '#0d6efd' },
  { value: 'media',   label: 'Media',   color: '#fd7e14' },
  { value: 'alta',    label: 'Alta',    color: '#dc3545' },
  { value: 'critica', label: 'Crítica', color: '#6c757d' },
]

interface FilterPanelProps {
  filters: ActiveFilters
  isOpen: boolean
  activeCount: number
  onToggle: () => void
  onChange: (patch: Partial<ActiveFilters>) => void
  onApply: (patch?: Partial<ActiveFilters>) => void
  onClear: () => void
}

/** Chip toggle pill reutilizable */
function Chip({
  label,
  active,
  color,
  onClick,
}: {
  label: string
  active: boolean
  color?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="filter-chip"
      data-active={active}
      style={active && color ? { backgroundColor: color, borderColor: color, color: '#fff' } : undefined}
      onClick={onClick}
    >
      {color && <span className="filter-chip-dot" style={{ backgroundColor: active ? '#fff' : color }} />}
      {label}
    </button>
  )
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  isOpen,
  activeCount,
  onToggle,
  onChange,
  onApply,
  onClear,
}) => {
  const activeCol = TICKET_COLUMNS.find((c) => String(c.id) === String(filters.columna))
  const activePrio = PRIORIDADES.find((p) => p.value === filters.prioridad)

  return (
    <div className="filter-bar-wrapper">
      {/* ── Trigger row ── */}
      <div className="filter-trigger-row">
        <div className="filter-trigger-left">
          <button
            id="filter-toggle-btn"
            type="button"
            className="filter-toggle-btn"
            aria-expanded={isOpen}
            aria-controls="filter-panel"
            onClick={onToggle}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M1.5 3h13a.5.5 0 0 1 0 1H10v9a.5.5 0 0 1-1 0V4H1.5a.5.5 0 0 1 0-1zm5 4h8a.5.5 0 0 1 0 1H9v4a.5.5 0 0 1-1 0V8H1.5a.5.5 0 0 1 0-1H6.5z"/>
            </svg>
            <span>Filtros</span>
            {activeCount > 0 && (
              <span className="filter-badge">{activeCount}</span>
            )}
            <svg
              className="filter-chevron"
              data-open={isOpen}
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>

          {/* Pastillas de filtros activos visibles de un vistazo */}
          {activeCount > 0 && (
            <div className="filter-active-summary">
              {filters.q.trim() && (
                <span className="filter-summary-pill">
                  Texto: &ldquo;{filters.q.trim()}&rdquo;
                  <button
                    type="button"
                    aria-label="Quitar filtro de texto"
                    onClick={() => onApply({ q: '' })}
                  >
                    ×
                  </button>
                </span>
              )}
              {activePrio && (
                <span className="filter-summary-pill">
                  <span className="filter-summary-dot" style={{ backgroundColor: activePrio.color }} />
                  {activePrio.label}
                  <button
                    type="button"
                    aria-label="Quitar filtro de prioridad"
                    onClick={() => onApply({ prioridad: '' })}
                  >
                    ×
                  </button>
                </span>
              )}
              {activeCol && (
                <span className="filter-summary-pill">
                  {activeCol.label}
                  <button
                    type="button"
                    aria-label="Quitar filtro de columna"
                    onClick={() => onApply({ columna: '' })}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.asignar.trim() && (
                <span className="filter-summary-pill">
                  Asig: {filters.asignar.trim()}
                  <button
                    type="button"
                    aria-label="Quitar filtro de asignado"
                    onClick={() => onApply({ asignar: '' })}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.leido !== '' && (
                <span className="filter-summary-pill">
                  {filters.leido ? 'Leídos' : 'No leídos'}
                  <button
                    type="button"
                    aria-label="Quitar filtro de lectura"
                    onClick={() => onApply({ leido: '' })}
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            className="filter-clear-all"
            onClick={onClear}
            title="Restablecer todos los filtros"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* ── Collapsible panel (CSS Grid con wrapper hermético para evitar fugas) ── */}
      <div
        id="filter-panel"
        className="filter-collapse-wrapper"
        data-open={isOpen}
        role="region"
        aria-labelledby="filter-toggle-btn"
      >
        <div className="filter-collapse-inner">
          <div className="filter-panel-content">
            {/* Búsqueda libre */}
            <div className="filter-group">
              <label className="filter-label" htmlFor="filter-q">
                Buscar
              </label>
              <div className="filter-input-icon-wrapper">
                <svg className="filter-input-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
                <input
                  id="filter-q"
                  type="search"
                  className="filter-input filter-input--with-icon"
                  placeholder="Título o descripción…"
                  value={filters.q}
                  onChange={(e) => onChange({ q: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onApply()
                  }}
                />
              </div>
            </div>

            {/* Prioridad */}
            <div className="filter-group">
              <span className="filter-label">Prioridad</span>
              <div className="filter-chips-row">
                {PRIORIDADES.map((p) => (
                  <Chip
                    key={p.value}
                    label={p.label}
                    active={filters.prioridad === p.value}
                    color={p.color}
                    onClick={() => {
                      const next = filters.prioridad === p.value ? '' : p.value
                      onApply({ prioridad: next })
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Columna */}
            <div className="filter-group">
              <span className="filter-label">Columna</span>
              <div className="filter-chips-row">
                {TICKET_COLUMNS.map((col) => (
                  <Chip
                    key={col.id}
                    label={col.label}
                    active={filters.columna === col.id}
                    onClick={() => {
                      const next = filters.columna === col.id ? '' : col.id
                      onApply({ columna: next })
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Asignado a */}
            <div className="filter-group">
              <label className="filter-label" htmlFor="filter-asignar">
                Asignado a
              </label>
              <div className="filter-input-row">
                <input
                  id="filter-asignar"
                  type="text"
                  className="filter-input"
                  placeholder="Nombre o correo…"
                  value={filters.asignar}
                  onChange={(e) => onChange({ asignar: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onApply()
                  }}
                />
                <button
                  type="button"
                  className="filter-apply-btn"
                  onClick={() => onApply()}
                >
                  Aplicar
                </button>
              </div>
            </div>

            {/* Estado de lectura */}
            <div className="filter-group">
              <span className="filter-label">Lectura</span>
              <div className="filter-chips-row">
                <Chip
                  label="No leídos"
                  active={filters.leido === false}
                  onClick={() => onApply({ leido: filters.leido === false ? '' : false })}
                />
                <Chip
                  label="Leídos"
                  active={filters.leido === true}
                  onClick={() => onApply({ leido: filters.leido === true ? '' : true })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterPanel
