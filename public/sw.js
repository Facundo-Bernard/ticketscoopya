// Service Worker para Tickets Coopya (PWA)
const CACHE_NAME = 'coopya-tickets-v1';

// Instalación inmediata del Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activación y toma de control de los clientes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        }),
      ),
    ),
  );
  self.clients.claim();
});

// Manejador de peticiones
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no sean GET o que vayan al backend /api/
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  // Network first con fallback a cache para recursos estáticos
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      }),
  );
});

// Soporte para Notificaciones Push (Web Push API)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || '🎫 Tickets Coopya';
    const options = {
      body: payload.body || 'Nuevo evento en el sistema de tickets',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200],
      data: {
        url: payload.url || '/',
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('🎫 Tickets Coopya', {
        body: text,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
      }),
    );
  }
});

// Click en notificación push -> Abrir o enfocar la app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    }),
  );
});
