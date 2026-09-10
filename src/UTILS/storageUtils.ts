const CLIENT_EMAIL_KEY = 'coopya_cliente_email';
const OPERATOR_SESSION_KEY = 'coopya_operator_session_id';

/**
 * Obtiene el email del cliente guardado en LocalStorage de forma segura.
 */
export const getClientEmail = (): string | null => {
  try {
    const email = localStorage.getItem(CLIENT_EMAIL_KEY);
    return email && email.trim() ? email.trim() : null;
  } catch (error) {
    console.warn('No se pudo acceder a LocalStorage:', error);
    return null;
  }
};

/**
 * Obtiene la identidad del operador actual para concurrencia y bloqueos.
 * Si existe un email en LocalStorage se usa dicho correo.
 * Si no existe, genera y almacena un ID único por pestaña en SessionStorage
 * (por ejemplo 'Operador-3829') para permitir pruebas concurrentes entre pestañas
 * sin que colisionen con la misma identidad 'Operador'.
 */
export const getOperatorIdentity = (): string => {
  const email = getClientEmail();
  if (email) return email;

  try {
    let sessionId = sessionStorage.getItem(OPERATOR_SESSION_KEY);
    if (!sessionId) {
      sessionId = `Operador-${Math.floor(1000 + Math.random() * 9000)}`;
      sessionStorage.setItem(OPERATOR_SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return 'Operador';
  }
};

/**
 * Guarda el email del cliente en LocalStorage de forma segura.
 */
export const setClientEmail = (email: string): void => {
  try {
    if (email && email.trim()) {
      localStorage.setItem(CLIENT_EMAIL_KEY, email.trim());
    }
  } catch (error) {
    console.warn('No se pudo guardar en LocalStorage:', error);
  }
};

/**
 * Elimina el email del cliente en LocalStorage.
 */
export const clearClientEmail = (): void => {
  try {
    localStorage.removeItem(CLIENT_EMAIL_KEY);
  } catch (error) {
    console.warn('No se pudo eliminar de LocalStorage:', error);
  }
};
