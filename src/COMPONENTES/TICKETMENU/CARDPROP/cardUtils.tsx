import type { ReactNode } from 'react';

/**
 * Obtiene las iniciales (1 o 2 letras) de un nombre de usuario o colaborador.
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Retorna el badge estilizado con colores sutiles de Bootstrap según la prioridad.
 */
export function getPriorityBadge(priority?: string): ReactNode {
  const p = priority?.toLowerCase();
  if (p === 'alta') {
    return <span className="badge bg-danger-subtle text-danger-emphasis border border-danger-subtle rounded-2">ALTA</span>;
  }
  if (p === 'baja') {
    return <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle rounded-2">BAJA</span>;
  }
  return <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-2">MEDIA</span>;
}
