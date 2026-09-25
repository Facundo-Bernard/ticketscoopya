import React from 'react'
import { usePushNotifications } from '../../hooks/usePushNotifications'

export const NotificationBell: React.FC = () => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
  } = usePushNotifications()

  if (!isSupported) {
    return null
  }

  const handleToggle = async () => {
    if (isLoading) return
    if (isSubscribed) {
      await unsubscribe()
    } else {
      await subscribe()
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading || permission === 'denied'}
      data-active={isSubscribed}
      className="notification-bell-btn"
      title={
        permission === 'denied'
          ? 'Notificaciones bloqueadas en los ajustes del navegador'
          : isSubscribed
            ? 'Notificaciones push activas (Toca para desactivar)'
            : 'Toca para activar notificaciones push'
      }
    >
      {/* Icono SVG de Campana */}
      {isLoading ? (
        <svg
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="spinner-border spinner-border-sm"
          style={{ width: '13px', height: '13px', borderWidth: '2px' }}
          aria-hidden="true"
        />
      ) : isSubscribed ? (
        /* Campana activa */
        <svg
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
        </svg>
      ) : (
        /* Campana inactiva / tachada */
        <svg
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.164 14H15c-.299-.199-.557-.553-.78-1-.9-1.8-1.22-5.12-1.22-6 0-.264-.02-.524-.06-.776l-.938.938c.02.235.035.474.035.718 0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258H6.164zm5.586-10.293A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244l-1.026-1.026H4.22c.223-.447.481-.801.78-1C5.9 8.2 6.22 4.88 6.22 4c0-1.82 1.09-3.38 2.66-3.93a1 1 0 1 1 1.87 0c.5.176.96.46 1.34.823l-.707.707z"/>
          <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM1.354 1.354l13.293 13.293-.708.708L.646 2.062z"/>
        </svg>
      )}

      {/* Texto responsive */}
      <span className="d-none d-sm-inline">
        {isLoading ? 'Guardando…' : isSubscribed ? 'Avisos activos' : 'Activar avisos'}
      </span>

      {/* Punto indicador de estado activo */}
      {isSubscribed && (
        <span
          className="rounded-circle flex-shrink-0"
          style={{
            width: '6px',
            height: '6px',
            backgroundColor: 'var(--coopya-red)',
            display: 'inline-block',
          }}
        />
      )}
    </button>
  )
}

export default NotificationBell
