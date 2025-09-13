'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '@/lib/supabase/client';
import { CURRENT_USER_ID, CURRENT_BATTERY_PROFILE_ID } from '@/lib/constants/user-constants';
import { interpolateSOC } from '@/lib/battery-calculations';

interface UsePWAOptions {
  updateInterval?: number; // Intervalo de actualización en ms (default: 60000 = 1 min)
  enableNotifications?: boolean; // Habilitar notificaciones para Android
}

export function usePWA(options: UsePWAOptions = {}) {
  const { updateInterval = 60000, enableNotifications = false } = options;
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(enableNotifications);
  const [isAndroid, setIsAndroid] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const supabase = getSupabase();

  // Query para obtener el SOC actual
  const { data: socData } = useQuery({
    queryKey: ['pwa-soc', CURRENT_USER_ID],
    queryFn: async () => {
      // Obtener voltaje actual
      const { data: userData, error: userError } = await supabase
        .from('user_preferences')
        .select('current_voltage')
        .eq('id', CURRENT_USER_ID)
        .single();

      if (userError || !userData || userData.current_voltage === null) {
        console.error('Error obteniendo voltaje:', userError);
        return null;
      }

      // Obtener perfil de batería
      const { data: profileData, error: profileError } = await supabase
        .from('battery_profiles')
        .select('voltage_soc_table_id')
        .eq('id', CURRENT_BATTERY_PROFILE_ID)
        .single();

      if (profileError || !profileData || !profileData.voltage_soc_table_id) {
        console.error('Error obteniendo perfil:', profileError);
        return null;
      }

      // Obtener puntos SOC
      const { data: socPoints, error: pointsError } = await supabase
        .from('voltage_soc_points')
        .select('voltage, soc')
        .eq('table_id', profileData.voltage_soc_table_id)
        .order('voltage', { ascending: false });

      if (pointsError || !socPoints || socPoints.length === 0) {
        console.error('Error obteniendo puntos SOC:', pointsError);
        return null;
      }

      // Calcular SOC
      const socTable = socPoints as Array<{ voltage: number; soc: number }>;
      const { soc } = interpolateSOC(userData.current_voltage, socTable);

      return soc;
    },
    refetchInterval: updateInterval,
    staleTime: updateInterval - 5000, // Considerar stale 5 segundos antes del refetch
  });

  // Detectar Android y registrar Service Worker
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Detectar si es Android
      const userAgent = navigator.userAgent.toLowerCase();
      const isAndroidDevice = /android/.test(userAgent);
      setIsAndroid(isAndroidDevice);

      // Verificar permisos de notificación
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }

      // Registrar Service Worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registrado:', registration);
            swRegistrationRef.current = registration;
          })
          .catch((error) => {
            console.error('Error registrando Service Worker:', error);
          });
      }
    }
  }, []);

  // Actualizar el badge cuando cambie el SOC
  useEffect(() => {
    if (typeof window !== 'undefined' && socData !== null && socData !== undefined) {
      // Actualizar badge directamente si está disponible
      if ('setAppBadge' in navigator) {
        (navigator as any).setAppBadge(Math.round(socData))
          .then(() => {
            console.log('Badge actualizado:', Math.round(socData));
          })
          .catch((error: any) => {
            console.error('Error actualizando badge:', error);
          });
      }

      // Enviar mensaje al Service Worker (incluye opción de notificación para Android)
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'UPDATE_BADGE',
          soc: socData,
          showNotification: isAndroid && notificationsEnabled && notificationPermission === 'granted',
        });
      }
    }
  }, [socData, isAndroid, notificationsEnabled, notificationPermission]);

  // Función para actualizar manualmente el badge
  const updateBadge = (soc: number) => {
    if ('setAppBadge' in navigator) {
      (navigator as any).setAppBadge(Math.round(soc));
    }

    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'UPDATE_BADGE',
        soc,
      });
    }
  };

  // Función para limpiar el badge
  const clearBadge = () => {
    if ('clearAppBadge' in navigator) {
      (navigator as any).clearAppBadge();
    }

    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'UPDATE_BADGE',
        soc: null,
      });
    }
  };

  // Función para solicitar permisos de notificación
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission;
    }
    return 'denied';
  };

  // Función para habilitar/deshabilitar notificaciones
  const toggleNotifications = async (enable: boolean) => {
    if (enable && notificationPermission !== 'granted') {
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        return false;
      }
    }

    setNotificationsEnabled(enable);

    // Si se deshabilitan, limpiar notificaciones existentes
    if (!enable && navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_NOTIFICATIONS',
      });
    }

    return true;
  };

  return {
    isSupported: typeof window !== 'undefined' && 'serviceWorker' in navigator,
    isBadgeSupported: typeof window !== 'undefined' && 'setAppBadge' in navigator,
    isAndroid,
    currentSOC: socData,
    notificationsEnabled,
    notificationPermission,
    updateBadge,
    clearBadge,
    toggleNotifications,
    requestNotificationPermission,
  };
}