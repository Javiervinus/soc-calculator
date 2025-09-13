'use client';

import { usePWA } from '@/lib/hooks/use-pwa';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bell, BellOff, Smartphone } from 'lucide-react';

export function PWAInitializer() {
  const [hasShownAndroidMessage, setHasShownAndroidMessage] = useState(false);
  const [hasShownIOSMessage, setHasShownIOSMessage] = useState(false);
  const {
    isSupported,
    isBadgeSupported,
    isAndroid,
    currentSOC,
    notificationsEnabled,
    notificationPermission,
    toggleNotifications,
    requestNotificationPermission,
  } = usePWA({
    updateInterval: 60000, // Actualizar cada minuto
    enableNotifications: false, // Por defecto deshabilitado
  });

  useEffect(() => {
    if (isSupported) {
      console.log('PWA soportada');
      if (isBadgeSupported) {
        console.log('Badge API soportada');
        if (currentSOC !== null && currentSOC !== undefined) {
          console.log('SOC actual para badge:', currentSOC);
        }
      }

      // Mostrar mensaje informativo para usuarios Android (una sola vez)
      if (isAndroid && !hasShownAndroidMessage && !notificationsEnabled) {
        const storedMessage = localStorage.getItem('pwa-android-message-shown');
        if (!storedMessage) {
          setTimeout(() => {
            toast.info(
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span className="font-semibold">Android detectado</span>
                </div>
                <p className="text-sm">
                  En Android, el badge solo muestra un punto.
                  Puedes activar notificaciones para ver el SOC exacto.
                </p>
                <button
                  onClick={async () => {
                    const success = await toggleNotifications(true);
                    if (success) {
                      toast.success('Notificaciones activadas', {
                        icon: <Bell className="h-4 w-4" />,
                      });
                    } else {
                      toast.error('No se pudieron activar las notificaciones');
                    }
                  }}
                  className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded w-fit"
                >
                  Activar notificaciones
                </button>
              </div>,
              {
                duration: 10000,
                action: {
                  label: 'No volver a mostrar',
                  onClick: () => {
                    localStorage.setItem('pwa-android-message-shown', 'true');
                  },
                },
              }
            );
            setHasShownAndroidMessage(true);
          }, 3000); // Esperar 3 segundos después de cargar
        }
      }

      // Mostrar mensaje para iOS si es necesario
      const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
      const isPWA = window.matchMedia('(display-mode: standalone)').matches;

      if (isIOS && isPWA && !hasShownIOSMessage && isBadgeSupported) {
        const iosMessageShown = localStorage.getItem('pwa-ios-badge-message-shown');
        if (!iosMessageShown && notificationPermission === 'default') {
          setTimeout(() => {
            toast.info(
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🍎</span>
                  <span className="font-semibold">iPhone detectado</span>
                </div>
                <p className="text-sm">
                  Para ver el SOC en el ícono de la app, necesitas habilitar las notificaciones.
                </p>
                <button
                  onClick={async () => {
                    const permission = await requestNotificationPermission();
                    if (permission === 'granted') {
                      toast.success('¡Badges activados! El SOC aparecerá en el ícono.');
                    } else {
                      toast.error('Sin permisos, el badge no funcionará.');
                    }
                  }}
                  className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded w-fit"
                >
                  Habilitar badges
                </button>
              </div>,
              {
                duration: 10000,
                action: {
                  label: 'No mostrar de nuevo',
                  onClick: () => {
                    localStorage.setItem('pwa-ios-badge-message-shown', 'true');
                  },
                },
              }
            );
            setHasShownIOSMessage(true);
          }, 5000); // Esperar 5 segundos
        }
      }
    }
  }, [isSupported, isBadgeSupported, currentSOC, isAndroid, notificationsEnabled, hasShownAndroidMessage, hasShownIOSMessage, toggleNotifications, requestNotificationPermission, notificationPermission]);

  // Este componente no renderiza nada, solo inicializa la PWA
  return null;
}