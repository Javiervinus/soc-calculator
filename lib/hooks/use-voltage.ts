'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/lib/supabase/client';
import { CURRENT_USER_ID, CURRENT_BATTERY_PROFILE_ID } from '@/lib/constants/user-constants';

/**
 * Hook para obtener y actualizar el voltaje
 * Ahora usa solo React Query con persistencia nativa
 */
export function useVoltage() {
  const supabase = getSupabase();

  const query = useQuery({
    queryKey: ['voltage', CURRENT_USER_ID],
    queryFn: async () => {
      console.log('🔄 [VOLTAGE] Fetching from Supabase (client-side)...');
      const { data, error } = await supabase
        .from('user_preferences')
        .select('id, current_voltage')
        .eq('id', CURRENT_USER_ID)
        .single();

      if (error) {
        console.error('❌ [VOLTAGE] Error obteniendo voltaje:', error);
        throw error;
      }

      const voltage = data?.current_voltage || 13.2;
      console.log('✅ [VOLTAGE] Fetched from Supabase:', voltage);
      return voltage;
    },
    // Usar misma configuración que el provider
    staleTime: 0, // Siempre considera datos stale para refetch en background
    gcTime: 1000 * 60 * 60 * 24, // 24h en memoria (igual al provider)
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: 'always',
    retry: 1,
  });

  // Debug detallado del origen de datos
  const dataSource = query.data !== undefined 
    ? (query.isFetching ? 'CACHED_DATA + BACKGROUND_FETCH' : 'CACHED_DATA')
    : (query.isFetching ? 'FETCHING_FIRST_TIME' : 'NO_DATA');

  console.log(`🎯 [VOLTAGE] Data Source: ${dataSource}`, {
    voltage: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    status: query.status,
    fetchStatus: query.fetchStatus,
    dataUpdatedAt: query.dataUpdatedAt ? new Date(query.dataUpdatedAt).toLocaleTimeString() : 'Never',
  });

  // Debug localStorage React Query cache
  if (typeof window !== 'undefined') {
    const cacheKey = 'soc-calculator-cache';
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const voltageQuery = parsed.clientState?.queries?.find((q: any) => 
          q.queryKey && q.queryKey[0] === 'voltage'
        );
        console.log('📦 [VOLTAGE] LocalStorage cache status:', voltageQuery ? 'FOUND' : 'NOT_FOUND');
        if (voltageQuery) {
          console.log('📦 [VOLTAGE] Cached value:', voltageQuery.state?.data);
          console.log('📦 [VOLTAGE] Cache timestamp:', new Date(voltageQuery.state?.dataUpdatedAt || 0).toLocaleTimeString());
        }
      } catch (e) {
        console.log('📦 [VOLTAGE] Cache parse error:', e);
      }
    } else {
      console.log('📦 [VOLTAGE] LocalStorage: EMPTY');
    }
  }

  return {
    voltage: query.data ?? 13.2,
    // Con SSR + HydrationBoundary, isLoading solo es true en primera carga real
    isLoading: query.isLoading,
    // isFetching es true cuando está fetcheando en background
    isFetching: query.isFetching,
    error: query.error,
  };
}

/**
 * Mutation para actualizar el voltaje
 */
export function useUpdateVoltage() {
  const queryClient = useQueryClient();
  const supabase = getSupabase();

  return useMutation({
    mutationFn: async (voltage: number) => {
      // Obtener los puntos de la tabla SOC del caché para calcular el SOC
      const batteryProfileData = queryClient.getQueryData<any>(['battery-profile', CURRENT_BATTERY_PROFILE_ID]);
      let calculatedSoc: number | null = null;
      
      if (batteryProfileData?.voltageSOCPoints && batteryProfileData.voltageSOCPoints.length > 0) {
        const points = batteryProfileData.voltageSOCPoints;
        const sortedPoints = [...points].sort((a: any, b: any) => b.voltage - a.voltage);
        
        // Buscar el SOC correspondiente al voltaje
        for (let i = 0; i < sortedPoints.length - 1; i++) {
          const higher = sortedPoints[i];
          const lower = sortedPoints[i + 1];
          
          if (voltage === higher.voltage) {
            calculatedSoc = higher.soc;
            break;
          }
          
          if (voltage > lower.voltage && voltage < higher.voltage) {
            // Interpolación lineal
            const range = higher.voltage - lower.voltage;
            const position = voltage - lower.voltage;
            const socRange = higher.soc - lower.soc;
            calculatedSoc = Math.round((lower.soc + (position / range) * socRange) * 10) / 10;
            break;
          }
        }
        
        // Si el voltaje está fuera de rango
        if (calculatedSoc === null) {
          if (voltage >= sortedPoints[0].voltage) {
            calculatedSoc = 100;
          } else if (voltage <= sortedPoints[sortedPoints.length - 1].voltage) {
            calculatedSoc = 0;
          }
        }
      }
      
      console.log('📊 [VOLTAGE] Calculated SOC:', calculatedSoc, 'for voltage:', voltage);

      // 1. Actualizar el voltaje actual en user_preferences
      const { data, error } = await supabase
        .from('user_preferences')
        .update({ current_voltage: voltage })
        .eq('id', CURRENT_USER_ID)
        .select('current_voltage')
        .single();

      if (error) throw error;

      // 2. Insertar un nuevo registro en voltage_readings como bitácora con SOC calculado
      const { error: readingError } = await supabase
        .from('voltage_readings')
        .insert({
          profile_id: CURRENT_BATTERY_PROFILE_ID,
          voltage: voltage,
          is_manual_entry: true,
          calculated_soc: calculatedSoc,
          notes: null
        });

      if (readingError) {
        console.error('Error insertando voltage reading:', readingError);
      }

      return data.current_voltage;
    },
    onMutate: async (voltage) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: ['voltage', CURRENT_USER_ID] });
      
      // Obtener datos anteriores para rollback
      const previousVoltage = queryClient.getQueryData<number>(['voltage', CURRENT_USER_ID]);
      
      // Actualización optimista del caché de React Query
      queryClient.setQueryData(['voltage', CURRENT_USER_ID], voltage);
      
      return { previousVoltage };
    },
    onError: (err, voltage, context) => {
      // Revertir en caso de error
      if (context?.previousVoltage !== undefined) {
        queryClient.setQueryData(['voltage', CURRENT_USER_ID], context.previousVoltage);
      }
      console.error('Error actualizando voltaje:', err);
    },
    onSuccess: (newVoltage: number | null, variables) => {
      if (newVoltage === null) return;
      // Forzar actualización inmediata del badge
      console.log('⚡ [VOLTAGE] Voltaje actualizado exitosamente, actualizando badge...');

      // Invalidar la query del PWA-SOC para forzar recálculo inmediato
      queryClient.invalidateQueries({ queryKey: ['pwa-soc', CURRENT_USER_ID] });

      // También enviar mensaje directo al Service Worker si está disponible
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        // Calcular el SOC aquí mismo si tenemos los datos en caché
        const batteryProfileData = queryClient.getQueryData<any>(['battery-profile', CURRENT_BATTERY_PROFILE_ID]);
        if (batteryProfileData?.voltageSOCPoints) {
          const points = batteryProfileData.voltageSOCPoints;
          const sortedPoints = [...points].sort((a: any, b: any) => b.voltage - a.voltage);

          let calculatedSoc: number | null = null;
          for (let i = 0; i < sortedPoints.length - 1; i++) {
            const higher = sortedPoints[i];
            const lower = sortedPoints[i + 1];

            if (newVoltage === higher.voltage) {
              calculatedSoc = higher.soc;
              break;
            }

            if (newVoltage > lower.voltage && newVoltage < higher.voltage) {
              const range = higher.voltage - lower.voltage;
              const position = newVoltage - lower.voltage;
              const socRange = higher.soc - lower.soc;
              calculatedSoc = Math.round((lower.soc + (position / range) * socRange) * 10) / 10;
              break;
            }
          }

          if (calculatedSoc === null) {
            if (newVoltage >= sortedPoints[0].voltage) {
              calculatedSoc = 100;
            } else if (newVoltage <= sortedPoints[sortedPoints.length - 1].voltage) {
              calculatedSoc = 0;
            }
          }

          // Enviar SOC al Service Worker para actualizar el badge (sin notificación)
          if (calculatedSoc !== null) {
            console.log('📤 [VOLTAGE] Enviando SOC al Service Worker para badge:', calculatedSoc);
            navigator.serviceWorker.controller.postMessage({
              type: 'UPDATE_BADGE',
              soc: calculatedSoc,
              // NO enviamos notificación aquí para evitar spam
            });
          }
        }
      }
    },
    onSettled: () => {
      // Revalidar después de la mutación
      queryClient.invalidateQueries({ queryKey: ['voltage', CURRENT_USER_ID] });
    },
  });
}