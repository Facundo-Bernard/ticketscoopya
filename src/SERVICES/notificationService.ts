import { api } from './api'

export interface VapidKeyResponse {
  public_key: string
}

export interface PushSubscriptionKeys {
  p256dh: string
  auth: string
}

export interface PushSubscriptionPayload {
  endpoint: string
  keys: PushSubscriptionKeys
  usuario_email?: string
}

export const notificationService = {
  async getVapidPublicKey(): Promise<string> {
    const res = await api.get<VapidKeyResponse>('/notifications/vapid-public-key')
    return res.data.public_key
  },

  async subscribe(payload: PushSubscriptionPayload): Promise<void> {
    await api.post('/notifications/subscribe', payload)
  },

  async unsubscribe(endpoint: string): Promise<void> {
    await api.post('/notifications/unsubscribe', null, { params: { endpoint } })
  },

  async sendTestPush(usuario_email?: string): Promise<{ status: string; sent_to_devices: number }> {
    const res = await api.post('/notifications/test', {
      title: '🔔 Prueba de Notificación Coopya',
      body: '¡Excelente! Las notificaciones push están funcionando correctamente en tu teléfono.',
      url: '/',
      usuario_email,
    })
    return res.data
  },
}
