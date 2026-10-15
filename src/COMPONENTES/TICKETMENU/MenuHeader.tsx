import React from 'react';
import Header from '../HEADER/Header';
import { authService } from '../../SERVICES/authService';

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
  const user = authService.getUser();

  return (
    <Header subtitle="Mesa de Ayuda y Gestión de Tickets" className="mb-0">
      <div className="d-flex align-items-center gap-2">
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

        {user && (
          <div className="d-flex align-items-center gap-2 border-start ps-2 ms-1">
            <span
              className="badge bg-light text-dark border px-2 py-1 text-truncate d-none d-md-inline"
              style={{ maxWidth: '160px', fontSize: '11.5px' }}
              title={user.email}
            >
              👤 {user.nombre || user.email}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger px-2 py-1 fw-medium"
              style={{ fontSize: '12px' }}
              onClick={() => authService.logout()}
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </Header>
  );
};

export default MenuHeader;
