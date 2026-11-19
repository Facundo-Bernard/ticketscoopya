import React from 'react';
import { EditIcon, TrashIcon, UserIcon } from '../COMUN/Icons';
import type { OperatorUser } from '../../SERVICES/userService';
import type { OperatorFormState } from './useOperadoresManager';

export interface OperadoresModalProps {
  isOpen: boolean;
  users: OperatorUser[];
  currentUserEmail: string;
  isLoading: boolean;
  isSaving: boolean;
  editingUser: OperatorUser | null;
  confirmDeleteId: string | null;
  form: OperatorFormState;
  onClose: () => void;
  onChangeForm: React.Dispatch<React.SetStateAction<OperatorFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  onStartEdit: (user: OperatorUser) => void;
  onCancelEdit: () => void;
  onToggleActive: (user: OperatorUser) => void;
  onRequestDelete: (userId: string | null) => void;
  onConfirmDelete: (user: OperatorUser) => void;
}

export const OperadoresModal: React.FC<OperadoresModalProps> = ({
  isOpen,
  users,
  currentUserEmail,
  isLoading,
  isSaving,
  editingUser,
  confirmDeleteId,
  form,
  onClose,
  onChangeForm,
  onSubmit,
  onStartEdit,
  onCancelEdit,
  onToggleActive,
  onRequestDelete,
  onConfirmDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block modal-wrapper-custom"
      tabIndex={-1}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content rounded-4 shadow-lg overflow-hidden modal-top-accent">
          <div className="modal-header d-flex justify-content-between align-items-center py-3 bg-white">
            <div className="d-flex align-items-center gap-2">
              <UserIcon size={18} style={{ color: 'var(--coopya-red)' }} />
              <h5 className="modal-title fw-bold mb-0 text-dark">Gestión de Operadores</h5>
              <span className="badge bg-light text-secondary border">{users.length}</span>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isSaving}
              aria-label="Cerrar"
            />
          </div>

          <div className="modal-body p-4">
            {/* Formulario Crear / Editar */}
            <form onSubmit={onSubmit} className="p-3 mb-4 bg-light rounded-3 border">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0 text-dark">
                  {editingUser ? `Editar operador: ${editingUser.email}` : 'Nuevo Operador'}
                </h6>
                {editingUser && (
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-secondary p-0"
                    onClick={onCancelEdit}
                    disabled={isSaving}
                  >
                    Cancelar edición
                  </button>
                )}
              </div>

              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold mb-1" htmlFor="op-nombre">
                    Nombre completo
                  </label>
                  <input
                    id="op-nombre"
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ej: Laura Gómez"
                    value={form.nombre}
                    onChange={(e) => onChangeForm((p) => ({ ...p, nombre: e.target.value }))}
                    required
                    minLength={2}
                    disabled={isSaving}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold mb-1" htmlFor="op-email">
                    Correo electrónico
                  </label>
                  <input
                    id="op-email"
                    type="email"
                    className="form-control form-control-sm"
                    placeholder="operador@coopya.com"
                    value={form.email}
                    onChange={(e) => onChangeForm((p) => ({ ...p, email: e.target.value }))}
                    required
                    disabled={isSaving || Boolean(editingUser)}
                    readOnly={Boolean(editingUser)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold mb-1" htmlFor="op-rol">
                    Rol
                  </label>
                  <select
                    id="op-rol"
                    className="form-select form-select-sm"
                    value={form.rol}
                    onChange={(e) =>
                      onChangeForm((p) => ({
                        ...p,
                        rol: e.target.value === 'admin' ? 'admin' : 'operador',
                      }))
                    }
                    disabled={isSaving}
                  >
                    <option value="operador">Operador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="col-md-5">
                  <label className="form-label small fw-semibold mb-1" htmlFor="op-pass">
                    {editingUser ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                  </label>
                  <input
                    id="op-pass"
                    type="password"
                    className="form-control form-control-sm"
                    placeholder={editingUser ? 'Dejar vacío para mantener' : 'Mínimo 3 caracteres'}
                    value={form.password}
                    onChange={(e) => onChangeForm((p) => ({ ...p, password: e.target.value }))}
                    required={!editingUser}
                    minLength={editingUser && !form.password ? undefined : 3}
                    disabled={isSaving}
                  />
                </div>

                <div className="col-md-3 d-flex align-items-end">
                  <button
                    type="submit"
                    className="btn btn-coopya-red btn-sm w-100 fw-semibold"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Guardando…' : editingUser ? 'Guardar' : 'Crear'}
                  </button>
                </div>
              </div>
            </form>

            {/* Listado */}
            {isLoading ? (
              <div className="text-center text-secondary py-4 small">Cargando operadores…</div>
            ) : users.length === 0 ? (
              <div className="text-center text-secondary py-4 small">No hay usuarios registrados.</div>
            ) : (
              <div className="list-group">
                {users.map((u) => {
                  const isSelf = u.email.toLowerCase() === currentUserEmail;
                  const isConfirming = confirmDeleteId === u.id;
                  return (
                    <div
                      key={u.id}
                      className="list-group-item d-flex flex-wrap justify-content-between align-items-center gap-2 py-2"
                    >
                      <div className="min-w-0">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="fw-semibold text-dark">{u.nombre}</span>
                          <span
                            className={`badge ${
                              u.rol === 'admin' ? 'bg-primary-subtle text-primary' : 'bg-light text-secondary border'
                            }`}
                          >
                            {u.rol === 'admin' ? 'Admin' : 'Operador'}
                          </span>
                          <span
                            className={`badge ${
                              u.activo ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'
                            }`}
                          >
                            {u.activo ? 'Activo' : 'Inactivo'}
                          </span>
                          {isSelf && <span className="badge bg-warning-subtle text-warning-emphasis">Vos</span>}
                        </div>
                        <small className="text-muted">{u.email}</small>
                      </div>

                      <div className="d-flex align-items-center gap-1">
                        {isConfirming ? (
                          <>
                            <span className="small text-danger me-1">¿Eliminar?</span>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm py-0 px-2"
                              onClick={() => onConfirmDelete(u)}
                              disabled={isSaving}
                            >
                              Sí
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm py-0 px-2"
                              onClick={() => onRequestDelete(null)}
                              disabled={isSaving}
                            >
                              No
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm py-1 px-2"
                              onClick={() => onStartEdit(u)}
                              disabled={isSaving}
                              title="Editar operador"
                            >
                              <EditIcon size={13} />
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm py-1 px-2 ${
                                u.activo ? 'btn-outline-warning' : 'btn-outline-success'
                              }`}
                              onClick={() => onToggleActive(u)}
                              disabled={isSaving || isSelf}
                              title={u.activo ? 'Desactivar cuenta' : 'Activar cuenta'}
                            >
                              {u.activo ? 'Desactivar' : 'Activar'}
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm py-1 px-2"
                              onClick={() => onRequestDelete(u.id)}
                              disabled={isSaving || isSelf}
                              title="Eliminar operador"
                            >
                              <TrashIcon size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperadoresModal;
