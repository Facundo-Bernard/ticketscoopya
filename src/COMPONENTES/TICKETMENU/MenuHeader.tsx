import React, { useCallback, useEffect, useState } from 'react';
import Header from '../HEADER/Header';
import { authService } from '../../SERVICES/authService';
import requesterService from '../../SERVICES/requesterService';
import { AccessCodesModal, OperadoresModal, useOperadoresManager } from '../USUARIOS';

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
  const isAdmin = authService.isAdmin();
  const [isOperatorsOpen, setIsOperatorsOpen] = useState(false);
  const [isAccessCodesOpen, setIsAccessCodesOpen] = useState(false);
  const [pendingCodesCount, setPendingCodesCount] = useState(0);
  const operators = useOperadoresManager();

  const refreshPendingCodesCount = useCallback(async () => {
    if (!user) return;
    try {
      const list = await requesterService.listAccessCodes();
      setPendingCodesCount(list.filter((c) => c.estado === 'pendiente').length);
    } catch {
      // Ignorar si no está autenticado o fallo temporal
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.resolve().then(async () => {
      if (active) {
        await refreshPendingCodesCount();
      }
    });

    const handleCodeEvent = () => {
      void refreshPendingCodesCount();
    };
    window.addEventListener('tickets:requester_code_updated', handleCodeEvent);
    return () => {
      active = false;
      window.removeEventListener('tickets:requester_code_updated', handleCodeEvent);
    };
  }, [user, refreshPendingCodesCount]);

  const handleOpenOperators = () => {
    operators.resetForm();
    setIsOperatorsOpen(true);
    void operators.loadUsers();
  };

  const handleCloseOperators = () => {
    setIsOperatorsOpen(false);
    operators.resetForm();
  };

  return (
    <>
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
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-3 fw-medium d-inline-flex align-items-center gap-1"
              onClick={() => setIsAccessCodesOpen(true)}
              title="Códigos temporales de historial para solicitantes"
            >
              <span>Códigos</span>
              {pendingCodesCount > 0 && (
                <span
                  className="badge rounded-pill"
                  style={{
                    fontSize: '10px',
                    backgroundColor: 'var(--coopya-red)',
                    color: '#ffffff',
                  }}
                >
                  {pendingCodesCount}
                </span>
              )}
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              className="btn btn-sm btn-coopya-red px-3"
              onClick={handleOpenOperators}
            >
              Operadores
            </button>
          )}

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

      {user && (
        <AccessCodesModal
          isOpen={isAccessCodesOpen}
          onClose={() => setIsAccessCodesOpen(false)}
          onCodesChanged={setPendingCodesCount}
        />
      )}

      {isAdmin && (
        <OperadoresModal
          isOpen={isOperatorsOpen}
          users={operators.users}
          currentUserEmail={operators.currentUserEmail}
          isLoading={operators.isLoading}
          isSaving={operators.isSaving}
          editingUser={operators.editingUser}
          confirmDeleteId={operators.confirmDeleteId}
          form={operators.form}
          onClose={handleCloseOperators}
          onChangeForm={operators.setForm}
          onSubmit={operators.handleSubmit}
          onStartEdit={operators.startEdit}
          onCancelEdit={operators.resetForm}
          onToggleActive={operators.handleToggleActive}
          onRequestDelete={operators.setConfirmDeleteId}
          onConfirmDelete={operators.handleDelete}
        />
      )}
    </>
  );
};

export default MenuHeader;
