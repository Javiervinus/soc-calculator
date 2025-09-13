// Service Worker para SOC Calculator PWA
const CACHE_NAME = 'soc-calculator-v1';
const urlsToCache = [
  '/',
  '/predictions',
  '/manifest.json',
  '/icon.svg',
];

// Instalar el Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache abierto');
      return cache.addAll(urlsToCache);
    })
  );
  // Activar inmediatamente
  self.skipWaiting();
});

// Activar el Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Tomar control inmediatamente
  self.clients.claim();
});

// Interceptar peticiones - estrategia network-first
self.addEventListener('fetch', (event) => {
  // Solo cachear peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }

  // No cachear peticiones a Supabase
  if (event.request.url.includes('supabase')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, la clonamos y la guardamos en cache
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Si falla la red, intentar desde cache
        return caches.match(event.request);
      })
  );
});

// Mensaje desde el cliente para actualizar el badge
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_BADGE') {
    const socValue = event.data.soc;
    const showNotification = event.data.showNotification;

    // Actualizar el badge (en iOS muestra número, en Android muestra punto)
    if ('setAppBadge' in self.navigator) {
      if (socValue !== undefined && socValue !== null) {
        // Mostrar el SOC como número en el badge (iOS) o punto (Android)
        self.navigator.setAppBadge(Math.round(socValue));
      } else {
        // Limpiar el badge si no hay valor
        self.navigator.clearAppBadge();
      }
    }

    // Para Android: Mostrar notificación persistente si está habilitado
    if (showNotification && socValue !== undefined && socValue !== null) {
      const socRounded = Math.round(socValue);
      const batteryLevel = socRounded >= 80 ? '🔋' :
                           socRounded >= 50 ? '🔋' :
                           socRounded >= 20 ? '🪫' : '🪫';

      // Notificación silenciosa y persistente
      self.registration.showNotification('SOC Calculator', {
        body: `${batteryLevel} Batería: ${socRounded}%`,
        icon: '/icon-192x192.svg',
        badge: '/icon-192x192.svg',
        silent: true,
        tag: 'soc-status', // Reemplaza la notificación anterior
        renotify: false, // No volver a notificar
        requireInteraction: false, // No requiere interacción
        data: {
          soc: socRounded,
          timestamp: Date.now()
        }
      }).catch(error => {
        console.error('Error mostrando notificación:', error);
      });
    }
  }

  // Limpiar notificaciones
  if (event.data && event.data.type === 'CLEAR_NOTIFICATIONS') {
    self.registration.getNotifications({ tag: 'soc-status' })
      .then(notifications => {
        notifications.forEach(n => n.close());
      });
  }
});

// Click en la notificación - abrir la app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});