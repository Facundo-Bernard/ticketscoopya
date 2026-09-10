import React, { useState, useRef, useEffect } from 'react';
import { LockIcon, EditIcon, TrashIcon } from '../../COMUN/Icons';

export interface CardActionsMenuProps {
  ticketTitle: string;
  onEdit: () => void;
  onDelete?: () => void;
  isLockedByOther?: boolean;
  lockedBy?: string;
}

export const CardActionsMenu: React.FC<CardActionsMenuProps> = ({
  ticketTitle,
  onEdit,
  onDelete,
  isLockedByOther = false,
  lockedBy,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="position-relative" ref={menuRef}>
      <button
        type="button"
        className="btn-icon-subtle"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((prev) => !prev);
        }}
        title="Opciones del ticket"
        aria-label={`Opciones para ${ticketTitle}`}
        aria-expanded={menuOpen}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {menuOpen && (
        <div className="card-menu-dropdown">
          <button
            type="button"
            className={`card-menu-item ${isLockedByOther ? 'opacity-50 text-muted' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (isLockedByOther) return;
              setMenuOpen(false);
              onEdit();
            }}
            title={isLockedByOther ? `Bloqueado para edición por ${lockedBy}` : undefined}
          >
            {isLockedByOther ? <LockIcon size={14} /> : <EditIcon size={14} />}
            <span>{isLockedByOther ? 'En edición' : 'Editar'}</span>
          </button>

          <button
            type="button"
            className={`card-menu-item danger ${isLockedByOther ? 'opacity-50 text-muted' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (isLockedByOther) return;
              setMenuOpen(false);
              onDelete?.();
            }}
            title={isLockedByOther ? `No se puede eliminar: en edición por ${lockedBy}` : undefined}
          >
            {isLockedByOther ? <LockIcon size={14} /> : <TrashIcon size={14} />}
            <span>{isLockedByOther ? 'Bloqueado' : 'Eliminar'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CardActionsMenu;
