"use client";

import {
  CURRENT_BATTERY_PROFILE_ID,
  CURRENT_USER_ID,
} from "@/lib/constants/user-constants";
import { getSupabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

interface UsePWAOptions {
  updateInterval?: number; // Intervalo de actualización en ms (default: 60000 = 1 min)
  enableNotifications?: boolean; // Habilitar notificaciones para Android
}

export function usePWA(options: UsePWAOptions = {}) {
  const { updateInterval = 60000, enableNotifications = false } = options;
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] =
    useState(enableNotifications);
  const [isAndroid, setIsAndroid] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const supabase = getSupabase();

  // Query para obtener el SOC actual - optimizada pero simple
  const { data: socData } = useQuery({
    queryKey: ["pwa-soc", CURRENT_USER_ID],
    queryFn: async () => {
      console.log("🔄 [PWA] Obteniendo SOC para badge...");

      // Usar Promise.all para hacer las queries en paralelo
      const [voltageResult, profileResult] = await Promise.all([
        supabase
          .from("user_preferences")
          .select("current_voltage")
          .eq("id", CURRENT_USER_ID)
          .single(),
        supabase
          .from("battery_profiles")
          .select("voltage_soc_table_id")
          .eq("id", CURRENT_BATTERY_PROFILE_ID)
          .single(),
      ]);

      if (
        voltageResult.error ||
        !voltageResult.data ||
        voltageResult.data.current_voltage === null
      ) {
        console.error(
          "❌ [PWA] Error obteniendo voltaje:",
          voltageResult.error
        );
        return null;
      }

      if (profileResult.error || !profileResult.data?.voltage_soc_table_id) {
        console.error("❌ [PWA] Error obteniendo perfil:", profileResult.error);
        return null;
      }

      // Buscar el SOC directamente por voltaje exacto
      const currentVoltage = voltageResult.data.current_voltage;

      // Primero intentar buscar coincidencia exacta
      const { data: exactMatch, error: exactError } = await supabase
        .from("voltage_soc_points")
        .select("soc")
        .eq("table_id", profileResult.data.voltage_soc_table_id)
        .eq("voltage", currentVoltage)
        .single();

      if (!exactError && exactMatch) {
        console.log("✅ [PWA] SOC exacto encontrado:", exactMatch.soc);
        return exactMatch.soc;
      }

      // Si no hay coincidencia exacta, buscar los dos puntos más cercanos
      // Obtener el punto superior más cercano
      const [upperResult, lowerResult] = await Promise.all([
        supabase
          .from("voltage_soc_points")
          .select("voltage, soc")
          .eq("table_id", profileResult.data.voltage_soc_table_id)
          .gte("voltage", currentVoltage)
          .order("voltage", { ascending: true })
          .limit(1)
          .single(),
        supabase
          .from("voltage_soc_points")
          .select("voltage, soc")
          .eq("table_id", profileResult.data.voltage_soc_table_id)
          .lte("voltage", currentVoltage)
          .order("voltage", { ascending: false })
          .limit(1)
          .single()
      ]);

      // Si tenemos ambos puntos, interpolar
      if (!upperResult.error && !lowerResult.error && upperResult.data && lowerResult.data) {
        const upper = upperResult.data;
        const lower = lowerResult.data;

        // Si son el mismo punto (edge case), devolver el SOC
        if (upper.voltage === lower.voltage) {
          return upper.soc;
        }

        // Interpolar linealmente
        const range = upper.voltage - lower.voltage;
        const position = currentVoltage - lower.voltage;
        const ratio = position / range;
        const socRange = upper.soc - lower.soc;
        const interpolatedSOC = lower.soc + (socRange * ratio);
        const soc = Math.round(interpolatedSOC * 10) / 10;

        console.log("✅ [PWA] SOC interpolado entre puntos cercanos:", soc);
        return soc;
      }

      // Si solo tenemos un punto (fuera de rango), usar ese
      if (!upperResult.error && upperResult.data) {
        console.log("✅ [PWA] SOC fuera de rango inferior, usando:", upperResult.data.soc);
        return upperResult.data.soc;
      }

      if (!lowerResult.error && lowerResult.data) {
        console.log("✅ [PWA] SOC fuera de rango superior, usando:", lowerResult.data.soc);
        return lowerResult.data.soc;
      }

      console.error("❌ [PWA] No se pudo obtener SOC");
      return null;
    },
    refetchInterval: updateInterval,
    staleTime: updateInterval - 5000, // Considerar stale 5 segundos antes del refetch
  });

  // Detectar plataforma y registrar Service Worker
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Detectar plataforma
      const userAgent = navigator.userAgent.toLowerCase();
      const isAndroidDevice = /android/.test(userAgent);
      const isIOS =
        /iphone|ipad|ipod/.test(userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

      setIsAndroid(isAndroidDevice);

      // Detectar si es PWA instalada
      const isPWA =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;

      if (isPWA) {
        console.log("📱 [PWA] App instalada detectada");
        console.log(
          "📱 [PWA] Plataforma:",
          isIOS ? "iOS" : isAndroidDevice ? "Android" : "Desktop"
        );
      }

      // Verificar permisos de notificación
      if ("Notification" in window) {
        setNotificationPermission(Notification.permission);

        // En iOS, solicitar permisos si es PWA y no los tiene
        if (isIOS && isPWA && Notification.permission === "default") {
          console.log(
            "📱 [PWA iOS] Solicitando permisos de notificación para badges..."
          );
          // No solicitar automáticamente, dejar que el usuario lo haga
        }
      }

      // Registrar Service Worker
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("✅ [PWA] Service Worker registrado:", registration);
            swRegistrationRef.current = registration;
          })
          .catch((error) => {
            console.error("❌ [PWA] Error registrando Service Worker:", error);
          });

        // Escuchar mensajes del Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'REQUEST_SOC_UPDATE') {
            console.log("📱 [PWA] Service Worker solicitó actualización de SOC");
            // El efecto de actualización se encargará de esto
          }
        });
      }

      // Verificar soporte de Badge API
      if ("setAppBadge" in navigator) {
        console.log("✅ [PWA] Badge API soportada");
      } else {
        console.log("❌ [PWA] Badge API NO soportada en este navegador");
      }
    }
  }, []);

  // Actualizar el badge cuando cambie el SOC
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      socData !== null &&
      socData !== undefined
    ) {
      const socRounded = Math.round(socData);

      // Detectar si es iOS
      const isIOS =
        /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

      // Actualizar badge directamente si está disponible
      if ("setAppBadge" in navigator) {
        // iOS Safari requiere un número y permisos de notificación
        if (isIOS) {
          // En iOS, el badge solo funciona si:
          // 1. La app está instalada en la pantalla de inicio
          // 2. Se tiene permisos de notificación (a veces)
          // 3. Se pasa un número (no funciona sin argumento)
          (navigator as any)
            .setAppBadge(socRounded)
            .then(() => {
              console.log(`✅ [PWA iOS] Badge actualizado: ${socRounded}%`);
            })
            .catch((error: any) => {
              console.error("❌ [PWA iOS] Error actualizando badge:", error);
              console.log("💡 [PWA iOS] Verifica que:");
              console.log(
                "  1. La app esté instalada en la pantalla de inicio"
              );
              console.log("  2. Tengas iOS 16.4 o superior");
              console.log(
                "  3. Los permisos de notificación estén habilitados (opcional)"
              );
            });
        } else {
          // Para otras plataformas
          (navigator as any)
            .setAppBadge(socRounded)
            .then(() => {
              console.log(`✅ [PWA] Badge actualizado: ${socRounded}%`);
            })
            .catch((error: any) => {
              console.error("❌ [PWA] Error actualizando badge:", error);
            });
        }
      }

      // Enviar mensaje al Service Worker (incluye opción de notificación para Android)
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "UPDATE_BADGE",
          soc: socData,
          showNotification:
            isAndroid &&
            notificationsEnabled &&
            notificationPermission === "granted",
        });
      }
    }
  }, [socData, isAndroid, notificationsEnabled, notificationPermission]);

  // Función para actualizar manualmente el badge
  const updateBadge = (soc: number) => {
    if ("setAppBadge" in navigator) {
      (navigator as any).setAppBadge(Math.round(soc));
    }

    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "UPDATE_BADGE",
        soc,
      });
    }
  };

  // Función para limpiar el badge
  const clearBadge = () => {
    if ("clearAppBadge" in navigator) {
      (navigator as any).clearAppBadge();
    }

    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "UPDATE_BADGE",
        soc: null,
      });
    }
  };

  // Función para solicitar permisos de notificación
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission;
    }
    return "denied";
  };

  // Función para habilitar/deshabilitar notificaciones
  const toggleNotifications = async (enable: boolean) => {
    if (enable && notificationPermission !== "granted") {
      const permission = await requestNotificationPermission();
      if (permission !== "granted") {
        return false;
      }
    }

    setNotificationsEnabled(enable);

    // Si se deshabilitan, limpiar notificaciones existentes
    if (
      !enable &&
      navigator.serviceWorker &&
      navigator.serviceWorker.controller
    ) {
      navigator.serviceWorker.controller.postMessage({
        type: "CLEAR_NOTIFICATIONS",
      });
    }

    return true;
  };

  return {
    isSupported: typeof window !== "undefined" && "serviceWorker" in navigator,
    isBadgeSupported:
      typeof window !== "undefined" && "setAppBadge" in navigator,
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
