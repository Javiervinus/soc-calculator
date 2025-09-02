'use client';

import { CURRENT_BATTERY_PROFILE_ID } from '@/lib/constants/user-constants';
import { getSupabase } from '@/lib/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Tables } from '@/lib/supabase/database.types';

export type SolarSystemConfig = Tables<'solar_system_config'>;

/**
 * Hook para manejar la configuración del sistema solar
 * Usa solo React Query sin Zustand, siguiendo el patrón de migración
 */
export function useSolarConfig() {
  const supabase = getSupabase();
  const queryClient = useQueryClient();

  // Query para obtener la configuración solar
  const query = useQuery({
    queryKey: ['solar-config', CURRENT_BATTERY_PROFILE_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solar_system_config')
        .select('*')
        .eq('profile_id', CURRENT_BATTERY_PROFILE_ID)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error obteniendo configuración solar:', error);
        throw error;
      }

      return data;
    },
    // OPTIMIZACIÓN: La configuración solar cambia muy poco
    staleTime: 1000 * 60 * 60 * 4, // Considera datos frescos por 4 horas
    gcTime: 1000 * 60 * 60 * 24, // 24h en memoria
    refetchOnMount: false, // NO refetch automático al montar si los datos no están stale
    refetchOnWindowFocus: false, // NO fetch cuando la ventana obtiene foco
    refetchOnReconnect: false, // NO fetch cuando se reconecta
    retry: 1,
  });

  // Mutation para actualizar la configuración
  const updateMutation = useMutation({
    mutationFn: async (config: Partial<SolarSystemConfig>) => {
      // Verificar si existe configuración
      const { data: existing } = await supabase
        .from('solar_system_config')
        .select('id')
        .eq('profile_id', CURRENT_BATTERY_PROFILE_ID)
        .maybeSingle();

      if (existing) {
        // Actualizar configuración existente
        const { data, error } = await supabase
          .from('solar_system_config')
          .update(config)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Crear nueva configuración
        const { data, error } = await supabase
          .from('solar_system_config')
          .insert({
            ...config,
            profile_id: CURRENT_BATTERY_PROFILE_ID
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['solar-config', CURRENT_BATTERY_PROFILE_ID] 
      });
      toast.success('Configuración solar actualizada');
    },
    onError: (error) => {
      console.error('Error actualizando configuración solar:', error);
      toast.error('Error al actualizar la configuración solar');
    }
  });

  return {
    solarConfig: query.data,
    // Con SSR + HydrationBoundary, isLoading funciona correctamente
    isLoading: query.isLoading,
    error: query.error,
    updateSolarConfig: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}