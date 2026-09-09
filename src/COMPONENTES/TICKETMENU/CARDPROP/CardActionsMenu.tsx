import React, { useState, useRef, useEffect } from 'react';

export interface CardActionsMenuProps {
  ticketTitle: string;
  onEdit: () => void;
  onDelete?: () => void;
}

export const CardActionsMenu: React.FC<CardActionsMenuProps> = ({
  ticketTitle,
  onEdit,
  onDelete,
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
            className="card-menu-item"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              onEdit();
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
            <span>Editar</span>
          </button>

          <button
            type="button"
            className="card-menu-item danger"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              onDelete?.();
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>Eliminar</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CardActionsMenu;
