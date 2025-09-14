// Service Worker para SOC Calculator PWA
const CACHE_NAME = 'soc-calculator-v1';
const urlsToCache = [
  '/',
  '/predictions',
  '/manifest.json',
  '/icon.svg',
];

// Variables para el badge
let badgeInterval = null;
let currentSOC = null;

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

  // Iniciar actualización periódica del badge
  startBadgeUpdates();
});

// Función para actualizar el badge periódicamente
function startBadgeUpdates() {
  // Limpiar intervalo previo si existe
  if (badgeInterval) {
    clearInterval(badgeInterval);
  }

  // Actualizar inmediatamente
  updateBadgeFromAPI();

  // Actualizar cada minuto
  badgeInterval = setInterval(() => {
    updateBadgeFromAPI();
  }, 60000); // 1 minuto
}

// Función para obtener el SOC desde Supabase (para sincronización entre dispositivos)
async function fetchSOCFromSupabase() {
  try {
    console.log('🔄 [SW] Consultando SOC desde Supabase...');

    // Construir la URL de la API de Supabase
    const SUPABASE_URL = 'https://aaceknnsrcjhspwpotao.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhY2Vrbm5zcmNqaHNwd3BvdGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzNjQ0MzcsImV4cCI6MjA1Mzk0MDQzN30.z8RJVmZvXF0I0QdC3-iB5T9fIIsBpmsBRQy6gBh-QQs';
    const CURRENT_USER_ID = 'd51dbd52-d285-415b-b99f-ab399e828dff';
    const CURRENT_BATTERY_PROFILE_ID = '1e60ecb6-b0e0-48e1-a265-bed99de33ffc';

    // Obtener el voltaje actual
    const voltageResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/user_preferences?id=eq.${CURRENT_USER_ID}&select=current_voltage`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!voltageResponse.ok) {
      throw new Error('Error obteniendo voltaje');
    }

    const voltageData = await voltageResponse.json();
    const currentVoltage = voltageData[0]?.current_voltage;

    if (currentVoltage === null || currentVoltage === undefined) {
      console.log('❌ [SW] No se pudo obtener el voltaje');
      return null;
    }

    console.log('✅ [SW] Voltaje obtenido:', currentVoltage);

    // Obtener el perfil de batería para saber qué tabla SOC usar
    const profileResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/battery_profiles?id=eq.${CURRENT_BATTERY_PROFILE_ID}&select=voltage_soc_table_id`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!profileResponse.ok) {
      throw new Error('Error obteniendo perfil de batería');
    }

    const profileData = await profileResponse.json();
    const tableId = profileData[0]?.voltage_soc_table_id;

    if (!tableId) {
      console.log('❌ [SW] No se pudo obtener el ID de la tabla SOC');
      return null;
    }

    // Obtener los puntos de la tabla SOC REAL de la base de datos
    const socTableResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/voltage_soc_points?table_id=eq.${tableId}&order=voltage.desc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!socTableResponse.ok) {
      throw new Error('Error obteniendo tabla SOC');
    }

    const socTable = await socTableResponse.json();
    console.log('✅ [SW] Tabla SOC obtenida con', socTable.length, 'puntos');

    // Calcular SOC por interpolación usando la tabla REAL
    let calculatedSoc = null;

    // Primero buscar coincidencia exacta
    const exactMatch = socTable.find(point => point.voltage === currentVoltage);
    if (exactMatch) {
      calculatedSoc = exactMatch.soc;
      console.log('✅ [SW] SOC exacto encontrado:', calculatedSoc);
    } else {
      // Si no hay coincidencia exacta, interpolar
      for (let i = 0; i < socTable.length - 1; i++) {
        const higher = socTable[i];
        const lower = socTable[i + 1];

        if (currentVoltage < higher.voltage && currentVoltage > lower.voltage) {
          // Interpolación lineal
          const range = higher.voltage - lower.voltage;
          const position = currentVoltage - lower.voltage;
          const socRange = higher.soc - lower.soc;
          calculatedSoc = Math.round((lower.soc + (position / range) * socRange) * 10) / 10;
          console.log('✅ [SW] SOC interpolado:', calculatedSoc);
          break;
        }
      }

      // Si está fuera de rango
      if (calculatedSoc === null) {
        if (currentVoltage >= socTable[0].voltage) {
          calculatedSoc = socTable[0].soc; // Máximo SOC
        } else if (currentVoltage <= socTable[socTable.length - 1].voltage) {
          calculatedSoc = socTable[socTable.length - 1].soc; // Mínimo SOC
        }
      }
    }

    return calculatedSoc;
  } catch (error) {
    console.error('❌ [SW] Error obteniendo SOC desde Supabase:', error);
    return null;
  }
}

// Función para obtener el SOC y actualizar el badge
async function updateBadgeFromAPI() {
  try {
    // Intentar obtener el SOC desde Supabase para sincronización
    const socFromSupabase = await fetchSOCFromSupabase();

    if (socFromSupabase !== null) {
      currentSOC = socFromSupabase;
      console.log('✅ [SW] SOC sincronizado desde Supabase:', currentSOC);

      // Actualizar el badge con el valor sincronizado
      if ('setAppBadge' in self.navigator) {
        self.navigator.setAppBadge(Math.round(currentSOC));
        console.log('✅ [SW] Badge actualizado desde Supabase:', Math.round(currentSOC));
      }
    } else if (currentSOC !== null && 'setAppBadge' in self.navigator) {
      // Si no se pudo obtener de Supabase, usar el valor almacenado
      self.navigator.setAppBadge(Math.round(currentSOC));
    }

    // Notificar a todos los clientes para que actualicen
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => {
      client.postMessage({
        type: 'SOC_UPDATED',
        soc: currentSOC
      });
    });
  } catch (error) {
    console.error('Error actualizando badge desde SW:', error);
  }
}

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
    const isManualNotificationUpdate = event.data.isManualUpdate || false;

    // Guardar el SOC actual
    if (socValue !== undefined && socValue !== null) {
      currentSOC = socValue;
      console.log('🔄 Service Worker: SOC recibido:', currentSOC);

      // Actualizar el badge inmediatamente y varias veces
      const socRounded = Math.round(socValue);

      // Función para actualizar el badge
      const performBadgeUpdate = () => {
        if ('setAppBadge' in self.navigator) {
          self.navigator.setAppBadge(socRounded)
            .then(() => {
              console.log('✅ Service Worker: Badge actualizado a', socRounded);
            })
            .catch((error) => {
              console.error('❌ Service Worker: Error actualizando badge:', error);
            });
        }
      };

      // Actualizar inmediatamente
      performBadgeUpdate();

      // Actualizar varias veces para asegurar que iOS lo registre
      setTimeout(performBadgeUpdate, 100);
      setTimeout(performBadgeUpdate, 500);
      setTimeout(performBadgeUpdate, 1000);
      setTimeout(performBadgeUpdate, 2000);

      // Continuar actualizando periódicamente por 10 segundos
      let updateCount = 0;
      const interval = setInterval(() => {
        performBadgeUpdate();
        updateCount++;
        if (updateCount >= 10) {
          clearInterval(interval);
        }
      }, 1000);
    } else if (socValue === null) {
      // Limpiar el badge si no hay valor
      if ('setAppBadge' in self.navigator) {
        self.navigator.clearAppBadge();
      }
    }
  }

  // Manejo separado para notificaciones manuales de Android
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const socValue = event.data.soc;
    console.log('🔔 [SW] Solicitud de notificación recibida con SOC:', socValue);

    if (socValue !== undefined && socValue !== null) {
      const socRounded = Math.round(socValue);
      const batteryLevel = socRounded >= 80 ? '🔋' :
                           socRounded >= 50 ? '🔋' :
                           socRounded >= 20 ? '🪫' : '🪫';

      // Notificación persistente para Android
      self.registration.showNotification('SOC Calculator', {
        body: `${batteryLevel} Batería: ${socRounded}%`,
        icon: '/icon-192x192.png', // Usar PNG para mejor compatibilidad
        badge: '/icon-192x192.png',
        silent: true,
        tag: 'soc-status', // Reemplaza la notificación anterior
        renotify: false, // No volver a notificar con sonido
        requireInteraction: false, // No requiere interacción del usuario
        vibrate: [100], // Vibración corta
        data: {
          soc: socRounded,
          timestamp: Date.now()
        }
      }).then(() => {
        console.log('✅ [SW] Notificación mostrada con SOC:', socRounded);
      }).catch(error => {
        console.error('❌ [SW] Error mostrando notificación:', error);
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