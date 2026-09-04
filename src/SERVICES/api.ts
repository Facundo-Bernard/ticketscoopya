import axios from 'axios';

// La API debe configurarse explícitamente para evitar conexiones involuntarias
// al equipo de cada usuario en producción.
const rawBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;

if (!rawBase) {
  throw new Error(
    'Falta VITE_API_URL. Configurá el dominio público del backend Railway en las variables de entorno.',
  );
}

// Si la variable ya incluye /api/v1 la usamos directo; si no, la normalizamos
export const API_BASE_URL = rawBase.endsWith('/api/v1')
  ? rawBase
  : `${rawBase.replace(/\/+$/, '')}/api/v1`;

export const BACKEND_URL = rawBase.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper para resolver la URL completa de imágenes guardadas en GridFS
export const getFileUrl = (pathOrUrl: string): string => {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://') || pathOrUrl.startsWith('data:')) {
    return pathOrUrl;
  }
  return `${BACKEND_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
};
