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
 * Retorna el indicador de 3 píldoras horizontales sin texto según la prioridad.
 * - Baja: 1 activa (Celeste #0284c7), 2 inactivas
 * - Media: 2 activas (Ámbar #f59e0b), 1 inactiva
 * - Alta: 3 activas (Rosa Fucsia #db2777)
 */
export function getPriorityBadge(priority?: string): ReactNode {
  const p = priority?.toLowerCase() || 'media';
  const level = p === 'alta' ? 3 : p === 'baja' ? 1 : 2;
  const label = p === 'alta' ? 'Alta' : p === 'baja' ? 'Baja' : 'Media';
  const priorityClass = `priority-pills-${p === 'alta' ? 'alta' : p === 'baja' ? 'baja' : 'media'}`;

  return (
    <div 
      className={`priority-pills ${priorityClass}`} 
      title={`Prioridad: ${label}`}
      aria-label={`Prioridad: ${label}`}
    >
      <span className={`priority-pill ${level >= 1 ? 'active' : ''}`} />
      <span className={`priority-pill ${level >= 2 ? 'active' : ''}`} />
      <span className={`priority-pill ${level >= 3 ? 'active' : ''}`} />
    </div>
  );
}
