import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import type { AppDispatch } from '../../REDUX/store';
import { fetchCatalogs } from '../../REDUX/catalogThunks';
import { messageFromError } from '../../REDUX/errorUtils';
import { authService } from '../../SERVICES/authService';
import { userService, type OperatorUser } from '../../SERVICES/userService';

export interface OperatorFormState {
  email: string;
  nombre: string;
  password: string;
  rol: 'operador' | 'admin';
}

const EMPTY_FORM: OperatorFormState = {
  email: '',
  nombre: '',
  password: '',
  rol: 'operador',
};

export function useOperadoresManager() {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = authService.getUser();

  const [users, setUsers] = useState<OperatorUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<OperatorUser | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<OperatorFormState>(EMPTY_FORM);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const list = await userService.listUsers();
      setUsers(list);
    } catch (error: unknown) {
      toast.error(messageFromError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setConfirmDeleteId(null);
    setForm(EMPTY_FORM);
  };

  const startEdit = (user: OperatorUser) => {
    setEditingUser(user);
    setConfirmDeleteId(null);
    setForm({
      email: user.email,
      nombre: user.nombre,
      password: '',
      rol: user.rol === 'admin' ? 'admin' : 'operador',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      toast.error('Ingresá el nombre del operador.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingUser) {
        const updated = await userService.updateUser(editingUser.id, {
          nombre: form.nombre,
          rol: form.rol,
          password: form.password || undefined,
        });
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        toast.success(`Operador "${updated.nombre}" actualizado.`);
      } else {
        if (!form.email.trim() || form.password.length < 3) {
          toast.error('Completá correo y contraseña (mínimo 3 caracteres).');
          setIsSaving(false);
          return;
        }
        const created = await userService.createUser(form);
        setUsers((prev) => [created, ...prev]);
        toast.success(`Operador "${created.nombre}" creado.`);
      }

      resetForm();
      dispatch(fetchCatalogs({ force: true }));
    } catch (error: unknown) {
      toast.error(messageFromError(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (user: OperatorUser) => {
    setIsSaving(true);
    try {
      const updated = await userService.updateUser(user.id, { activo: !user.activo });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      toast.success(
        updated.activo
          ? `Cuenta "${updated.nombre}" activada.`
          : `Cuenta "${updated.nombre}" desactivada.`,
      );
      dispatch(fetchCatalogs({ force: true }));
    } catch (error: unknown) {
      toast.error(messageFromError(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (user: OperatorUser) => {
    setIsSaving(true);
    try {
      await userService.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setConfirmDeleteId(null);
      if (editingUser?.id === user.id) {
        resetForm();
      }
      toast.success(`Operador "${user.nombre}" eliminado.`);
      dispatch(fetchCatalogs({ force: true }));
    } catch (error: unknown) {
      toast.error(messageFromError(error));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    users,
    currentUserEmail: currentUser?.email?.toLowerCase() || '',
    isLoading,
    isSaving,
    editingUser,
    confirmDeleteId,
    form,
    setForm,
    setConfirmDeleteId,
    loadUsers,
    resetForm,
    startEdit,
    handleSubmit,
    handleToggleActive,
    handleDelete,
  };
}

export default useOperadoresManager;
