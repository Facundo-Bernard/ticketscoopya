import { api } from './api';
import type { AuthUser } from './authService';

export interface OperatorUser extends AuthUser {
  fechaCreacion?: string;
  ultimoLogin?: string | null;
}

export interface CreateOperatorInput {
  email: string;
  nombre: string;
  password: string;
  rol: 'operador' | 'admin';
}

export interface UpdateOperatorInput {
  nombre?: string;
  rol?: 'operador' | 'admin';
  activo?: boolean;
  password?: string;
}

export const userService = {
  async listUsers(): Promise<OperatorUser[]> {
    const response = await api.get<OperatorUser[]>('/auth/users');
    return response.data;
  },

  async createUser(input: CreateOperatorInput): Promise<OperatorUser> {
    const response = await api.post<OperatorUser>('/auth/users', {
      email: input.email.trim().toLowerCase(),
      nombre: input.nombre.trim(),
      password: input.password,
      rol: input.rol,
    });
    return response.data;
  },

  async updateUser(userId: string, input: UpdateOperatorInput): Promise<OperatorUser> {
    const payload: UpdateOperatorInput = {};
    if (input.nombre !== undefined) payload.nombre = input.nombre.trim();
    if (input.rol !== undefined) payload.rol = input.rol;
    if (input.activo !== undefined) payload.activo = input.activo;
    if (input.password !== undefined && input.password.trim() !== '') {
      payload.password = input.password;
    }
    const response = await api.patch<OperatorUser>(`/auth/users/${userId}`, payload);
    return response.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/auth/users/${userId}`);
  },
};

export default userService;
