const CLIENT_EMAIL_KEY = 'coopya_cliente_email';

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
