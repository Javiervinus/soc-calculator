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

      // NO mostrar ninguna notificación intrusiva para Android
      // Todo se maneja desde la página PWA

      // NO mostrar notificación para iOS tampoco
      // Los usuarios pueden ir a la página PWA si necesitan configurar algo
    }
  }, [isSupported, isBadgeSupported, currentSOC, isAndroid, notificationsEnabled, hasShownAndroidMessage, hasShownIOSMessage, toggleNotifications, requestNotificationPermission, notificationPermission]);

  // Este componente no renderiza nada, solo inicializa la PWA
  return null;
}