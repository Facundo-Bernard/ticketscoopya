import { api } from './api';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

const TOKEN_KEY = 'coopya_auth_token';
const USER_KEY = 'coopya_auth_user';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });

    const data = response.data;
    if (data.user) {
      // La autenticación se maneja vía cookie segura HttpOnly 'coopya_auth_token' emitida por el backend.
      // En el cliente únicamente persistimos los datos del perfil de usuario no sensibles.
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      localStorage.removeItem(TOKEN_KEY);
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignorar fallo de red y proceder con la desautenticación local
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.href = '/login';
    }
  },

  getToken(): string | null {
    // Al usar cookies HttpOnly protegidas contra XSS, el token no es accesible por JavaScript
    return null;
  },

  getUser(): AuthUser | null {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as AuthUser;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(USER_KEY);
  },

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.rol === 'admin';
  },
};

export default authService;
