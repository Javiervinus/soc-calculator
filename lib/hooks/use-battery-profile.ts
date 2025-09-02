'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/lib/supabase/client';
import { CURRENT_BATTERY_PROFILE_ID } from '@/lib/constants/user-constants';
import { toast } from 'sonner';
import type { Tables } from '@/lib/supabase/database.types';

export type VoltageSOCPoint = Tables<'voltage_soc_points'>;

/**
 * Hook para obtener el perfil de batería y tabla SOC
 * Usa el ID del perfil actual (constante por ahora, auth en el futuro)
 */
interface UpdateOptions {
  showToast?: boolean;
}

export function useBatteryProfile() {
  const supabase = getSupabase();

  const query = useQuery({
    queryKey: ['battery-profile', CURRENT_BATTERY_PROFILE_ID],
    queryFn: async () => {
      // 1. Obtener el perfil de batería directamente con su ID
      const { data: profile, error: profileError } = await supabase
        .from('battery_profiles')
        .select('*')
        .eq('id', CURRENT_BATTERY_PROFILE_ID)
        .single();

      if (profileError) {
        console.error('Error obteniendo perfil:', profileError);
        throw profileError;
      }

      // 2. Obtener los puntos de la tabla SOC si existe
      let voltageSOCPoints: VoltageSOCPoint[] = [];
      
      if (profile.voltage_soc_table_id) {
        const { data: points, error: pointsError } = await supabase
          .from('voltage_soc_points')
          .select('*')
          .eq('table_id', profile.voltage_soc_table_id)
          .order('voltage', { ascending: false });

        if (pointsError) {
          console.error('Error obteniendo puntos SOC:', pointsError);
        } else if (points) {
          voltageSOCPoints = points;
        }
      }

      return {
        profile,
        voltageSOCPoints,
      };
    },
    // OPTIMIZACIÓN: La tabla SOC y el perfil cambian muy poco
    staleTime: 1000 * 60 * 60 * 4, // Considera los datos frescos por 4 horas
    gcTime: 1000 * 60 * 60 * 24, // 24h en memoria
    refetchOnMount: false, // NO refetch automático al montar si los datos no están stale
    refetchOnWindowFocus: false, // NO refetch cuando la ventana obtiene foco
    refetchOnReconnect: false, // NO refetch cuando se reconecta
    retry: 1, // Solo reintentar una vez
  });

  // Mutation para actualizar el perfil CON ACTUALIZACIÓN OPTIMISTA
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: async ({ updates, options }: { 
      updates: Partial<Tables<'battery_profiles'>>;
      options?: UpdateOptions;
    }) => {
      const { data, error } = await supabase
        .from('battery_profiles')
        .update(updates)
        .eq('id', CURRENT_BATTERY_PROFILE_ID)
        .select()
        .single();

      if (error) throw error;
      return { data, options };
    },
    onMutate: async ({ updates }) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ 
        queryKey: ['battery-profile', CURRENT_BATTERY_PROFILE_ID] 
      });
      
      // Obtener datos actuales
      const previousData = queryClient.getQueryData<{
        profile: Tables<'battery_profiles'>;
        voltageSOCPoints: VoltageSOCPoint[];
      }>(['battery-profile', CURRENT_BATTERY_PROFILE_ID]);
      
      // Actualización optimista
      if (previousData) {
        queryClient.setQueryData(['battery-profile', CURRENT_BATTERY_PROFILE_ID], {
          ...previousData,
          profile: {
            ...previousData.profile,
            ...updates
          }
        });
      }
      
      return { previousData };
    },
    onError: (error, _variables, context) => {
      // Rollback en caso de error
      if (context?.previousData) {
        queryClient.setQueryData(
          ['battery-profile', CURRENT_BATTERY_PROFILE_ID],
          context.previousData
        );
      }
      console.error('Error actualizando perfil:', error);
      toast.error('Error al actualizar la configuración');
    },
    onSuccess: (result) => {
      // Invalidar query para refetch en background
      queryClient.invalidateQueries({ 
        queryKey: ['battery-profile', CURRENT_BATTERY_PROFILE_ID] 
      });
      
      // Solo mostrar toast si se solicita (no para el slider)
      if (result?.options?.showToast !== false) {
        toast.success('Configuración de batería actualizada');
      }
    },
  });

  // Wrapper para hacer más fácil el uso
  const updateBatteryProfile = (
    updates: Partial<Tables<'battery_profiles'>>,
    options?: UpdateOptions
  ) => {
    updateMutation.mutate({ updates, options });
  };

  return {
    profile: query.data?.profile,
    voltageSOCPoints: query.data?.voltageSOCPoints || [],
    // Con SSR + HydrationBoundary, isLoading funciona correctamente
    isLoading: query.isLoading,
    error: query.error,
    updateBatteryProfile,
    isUpdating: updateMutation.isPending,
  };
}