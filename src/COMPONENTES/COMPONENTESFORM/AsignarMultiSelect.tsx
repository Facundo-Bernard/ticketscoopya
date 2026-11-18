import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { OptionItem } from '../../TYPES';

export interface AsignarMultiSelectProps {
  selected: string[];
  options: OptionItem[];
  isLoading?: boolean;
  disabled?: boolean;
  onChange: (next: string[]) => void;
}

export const AsignarMultiSelect: React.FC<AsignarMultiSelectProps> = ({
  selected,
  options,
  isLoading = false,
  disabled = false,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const mergedOptions = useMemo(() => {
    const items: { key: string; value: string; label: string }[] = [];
    const seen = new Set<string>();

    for (const opt of options) {
      const value = (opt.label || opt.value || '').trim();
      if (!value) continue;
      const key = value.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        items.push({ key, value, label: opt.label || opt.value });
      }
    }

    for (const sel of selected) {
      const clean = sel.trim();
      if (!clean) continue;
      const key = clean.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        items.push({ key, value: clean, label: clean });
      }
    }

    return items;
  }, [options, selected]);

  const isSelected = (value: string): boolean => {
    const target = value.trim().toLowerCase();
    return selected.some((s) => s.trim().toLowerCase() === target);
  };

  const toggleOption = (value: string) => {
    if (disabled) return;
    const target = value.trim().toLowerCase();
    if (isSelected(value)) {
      onChange(selected.filter((s) => s.trim().toLowerCase() !== target));
    } else {
      onChange([...selected, value]);
    }
  };

  const summaryText = isLoading
    ? 'Cargando técnicos...'
    : selected.length === 0
      ? 'Sin asignar'
      : selected.length === 1
        ? selected[0]
        : `${selected.length} técnicos (${selected.join(', ')})`;

  return (
    <div ref={containerRef} className="position-relative">
      <button
        type="button"
        className="form-select text-start d-flex align-items-center justify-content-between"
        onClick={() => !disabled && !isLoading && setIsOpen((prev) => !prev)}
        disabled={disabled || isLoading}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title={selected.length > 0 ? selected.join(', ') : 'Sin asignar'}
      >
        <span className={`text-truncate ${selected.length === 0 ? 'text-muted' : 'text-dark'}`}>
          {summaryText}
        </span>
      </button>

      {isOpen && (
        <div
          className="position-absolute start-0 w-100 bg-white border rounded-3 shadow-sm p-2 mt-1"
          style={{ zIndex: 1055, maxHeight: '220px', overflowY: 'auto' }}
          role="listbox"
          aria-multiselectable="true"
        >
          {mergedOptions.length === 0 ? (
            <div className="small text-muted px-2 py-1">No hay técnicos disponibles.</div>
          ) : (
            mergedOptions.map((opt) => {
              const checked = isSelected(opt.value);
              const checkboxId = `asignar-opt-${opt.key.replace(/[^a-z0-9_-]/gi, '_')}`;
              return (
                <label
                  key={opt.key}
                  htmlFor={checkboxId}
                  className="d-flex align-items-center gap-2 px-2 py-1 rounded-2 user-select-none"
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    id={checkboxId}
                    type="checkbox"
                    className="form-check-input mt-0 flex-shrink-0"
                    checked={checked}
                    onChange={() => toggleOption(opt.value)}
                    disabled={disabled}
                  />
                  <span className="small text-dark text-truncate">{opt.label}</span>
                </label>
              );
            })
          )}

          {selected.length > 0 && (
            <div className="border-top mt-2 pt-2 d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-link btn-sm text-decoration-none text-danger p-0"
                onClick={() => onChange([])}
                disabled={disabled}
              >
                Limpiar selección
              </button>
            </div>
          )}
        </div>
      )}

      {selected.length > 0 && (
        <div className="d-flex flex-wrap gap-1 mt-2">
          {selected.map((op) => (
            <span
              key={op}
              className="badge bg-light text-dark border d-inline-flex align-items-center gap-1 fw-normal"
            >
              <span>{op}</span>
              {!disabled && (
                <button
                  type="button"
                  className="btn-close"
                  style={{ fontSize: '0.55rem' }}
                  aria-label={`Quitar a ${op}`}
                  onClick={() => toggleOption(op)}
                />
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default AsignarMultiSelect;
