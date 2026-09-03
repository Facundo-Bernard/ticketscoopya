import axios from 'axios';

// Prioriza VITE_API_URL (la variable configurada por tu compañero en Vercel)
const rawBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

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
