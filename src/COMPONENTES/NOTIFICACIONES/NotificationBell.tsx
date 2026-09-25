import React, { useState } from 'react'
import { usePushNotifications } from '../../hooks/usePushNotifications'

export const NotificationBell: React.FC = () => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    sendTest,
  } = usePushNotifications()

  const [menuOpen, setMenuOpen] = useState(false)
  const [testSent, setTestSent] = useState(false)

  if (!isSupported) {
    return null
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      setMenuOpen((prev) => !prev)
    } else {
      const ok = await subscribe()
      if (ok) {
        setMenuOpen(true)
      }
    }
  }

  const handleSendTest = async () => {
    try {
      await sendTest()
      setTestSent(true)
      setTimeout(() => setTestSent(false), 4000)
    } catch {
      // Error manejado en hook
    }
  }

  const handleUnsubscribe = async () => {
    await unsubscribe()
    setMenuOpen(false)
  }

  return (
    <div className="position-relative d-inline-block">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isLoading || permission === 'denied'}
        className={`btn btn-sm d-inline-flex align-items-center gap-2 fw-medium ${
          isSubscribed
            ? 'btn-outline-success bg-success-subtle text-success-emphasis border-success'
            : 'btn-outline-secondary'
        }`}
        title={
          permission === 'denied'
            ? 'Notificaciones bloqueadas en el navegador'
            : isSubscribed
              ? 'Notificaciones activas en este dispositivo (Click para opciones)'
              : 'Activar notificaciones en este dispositivo'
        }
      >
        <span style={{ fontSize: '1rem', lineHeight: 1 }}>
          {isSubscribed ? '🔔' : '🔕'}
        </span>
        <span className="d-none d-sm-inline">
          {isLoading ? 'Conectando…' : isSubscribed ? 'Avisos activos' : 'Activar avisos'}
        </span>
        {isSubscribed && (
          <span
            className="rounded-circle bg-success"
            style={{ width: '7px', height: '7px', display: 'inline-block' }}
          />
        )}
      </button>

      {/* Popover flotante con opciones cuando está suscrito */}
      {menuOpen && isSubscribed && (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ zIndex: 1050 }}
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="position-absolute end-0 mt-2 p-3 bg-white rounded-3 shadow-lg border"
            style={{ width: '270px', zIndex: 1051 }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="fw-bold small text-dark">🔔 Notificaciones Móviles</span>
              <span className="badge bg-success-subtle text-success border border-success-subtle">
                Conectado
              </span>
            </div>

            <p className="text-secondary small mb-3 lh-sm" style={{ fontSize: '0.78rem' }}>
              Este dispositivo recibirá alertas en tiempo real de nuevos tickets y comentarios aunque la app esté cerrada.
            </p>

            <div className="d-grid gap-2">
              <button
                type="button"
                className="btn btn-sm btn-primary py-1 fw-medium"
                onClick={handleSendTest}
                disabled={isLoading}
              >
                {testSent ? '✓ ¡Notificación enviada!' : '🚀 Probar notificación push'}
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-danger py-1"
                onClick={handleUnsubscribe}
                disabled={isLoading}
              >
                Desactivar en este equipo
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationBell
