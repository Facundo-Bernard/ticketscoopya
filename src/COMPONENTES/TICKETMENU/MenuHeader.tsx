import React from 'react';
import Header from '../HEADER/Header';

export interface MenuHeaderProps {
  showFinished: boolean;
  isLoading: boolean;
  onToggleHistory: () => void;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({
  showFinished,
  isLoading,
  onToggleHistory,
}) => {
  return (
    <Header subtitle="Mesa de Ayuda y Gestión de Tickets">
      <button
        type="button"
        className={`btn btn-sm px-3 fw-medium ${showFinished ? 'btn-coopya-red' : 'btn-outline-secondary'}`}
        onClick={onToggleHistory}
        disabled={isLoading}
      >
        {isLoading
          ? 'Cargando…'
          : showFinished
            ? '← Ver Tablero Activo'
            : 'Ver Historial'}
      </button>
    </Header>
  );
};

export default MenuHeader;
