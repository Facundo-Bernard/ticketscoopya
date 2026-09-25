import { useState, useEffect, useCallback } from 'react'
import { notificationService } from '../SERVICES/notificationService'
import { getOperatorIdentity } from '../UTILS/storageUtils'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  const myEmail = getOperatorIdentity() || ''

  // Verificar soporte y suscripción existente
  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window

    setIsSupported(supported)

    if (supported) {
      setPermission(Notification.permission)

      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => {
          setIsSubscribed(Boolean(sub))
        })
        .catch((err) => {
          console.warn('Error al verificar suscripción push:', err)
        })
    }
  }, [])

  // Suscribir este dispositivo a Notificaciones Push
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      alert('Tu navegador o dispositivo no soporta notificaciones push en segundo plano.')
      return false
    }

    setIsLoading(true)
    try {
      // 1. Solicitar permiso al usuario
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') {
        alert('Se denegó el permiso para enviar notificaciones.')
        setIsLoading(false)
        return false
      }

      // 2. Obtener clave pública VAPID del backend
      const vapidKey = await notificationService.getVapidPublicKey()
      const convertedKey = urlBase64ToUint8Array(vapidKey)

      // 3. Registrar suscripción en el PushManager del Service Worker
      const reg = await navigator.serviceWorker.ready
      let sub = await reg.pushManager.getSubscription()

      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey as unknown as BufferSource,
        })
      }

      const subJson = sub.toJSON()
      if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
        throw new Error('No se pudieron obtener las credenciales de cifrado del navegador.')
      }

      // 4. Enviar suscripción a MongoDB en el backend
      await notificationService.subscribe({
        endpoint: subJson.endpoint,
        keys: {
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
        },
        usuario_email: myEmail || undefined,
      })

      setIsSubscribed(true)
      return true
    } catch (error) {
      console.error('Error al suscribir a notificaciones push:', error)
      alert('No se pudo activar las notificaciones push en este dispositivo.')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported, myEmail])

  // Desuscribir este dispositivo
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false

    setIsLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()

      if (sub) {
        const endpoint = sub.endpoint
        await sub.unsubscribe()
        await notificationService.unsubscribe(endpoint).catch(() => {})
      }

      setIsSubscribed(false)
      return true
    } catch (error) {
      console.error('Error al cancelar suscripción push:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  // Enviar notificación push de prueba
  const sendTest = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await notificationService.sendTestPush(myEmail || undefined)
      return res
    } catch (error) {
      console.error('Error al enviar push de prueba:', error)
      alert('Error al enviar la notificación de prueba.')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [myEmail])

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    sendTest,
  }
}
