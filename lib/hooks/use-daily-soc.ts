'use client';

import { CURRENT_BATTERY_PROFILE_ID } from '@/lib/constants/user-constants';
import { getSupabase } from '@/lib/supabase/client';
import { getTodayEcuadorDateString, formatEcuadorDateString, getGuayaquilTime } from '@/lib/timezone-utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook para manejar los registros diarios de SOC
 */
export function useDailySOC() {
  const supabase = getSupabase();
  const queryClient = useQueryClient();
  
  // Query para obtener el registro de hoy
  const todayQuery = useQuery({
    queryKey: ['daily-soc', CURRENT_BATTERY_PROFILE_ID, getTodayEcuadorDateString()],
    queryFn: async () => {
      const today = getTodayEcuadorDateString();
      
      const { data, error } = await supabase
        .from('daily_soc_records')
        .select('*')
        .eq('profile_id', CURRENT_BATTERY_PROFILE_ID)
        .eq('date', today)
        .maybeSingle(); // Usa maybeSingle en lugar de single para evitar error si no existe
      
      if (error && error.code !== 'PGRST116') { // PGRST116 es "no rows found"
        console.error('Error obteniendo SOC de hoy:', error);
        throw error;
      }
      
      return data;
    },
    staleTime: 0, // Siempre stale para refetch en background
    gcTime: 1000 * 60 * 60 * 24, // 24h en memoria
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });
  
  // Query para obtener el historial (últimos 90 días para tener más datos en el gráfico)
  const historyQuery = useQuery({
    queryKey: ['daily-soc-history', CURRENT_BATTERY_PROFILE_ID],
    queryFn: async () => {
      const now = getGuayaquilTime();
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const fromDate = formatEcuadorDateString(ninetyDaysAgo);
      
      const { data, error } = await supabase
        .from('daily_soc_records')
        .select('*')
        .eq('profile_id', CURRENT_BATTERY_PROFILE_ID)
        .gte('date', fromDate)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error obteniendo historial SOC:', error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 0, // Siempre stale para refetch en background
    gcTime: 1000 * 60 * 60 * 24, // 24h en memoria
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });
  
  // Mutation para guardar el SOC diario
  const saveMutation = useMutation({
    mutationFn: async ({ soc, voltage }: { soc: number; voltage: number }) => {
      const today = getTodayEcuadorDateString();
      
      // Verificar si ya existe un registro para hoy
      const { data: existing } = await supabase
        .from('daily_soc_records')
        .select('id')
        .eq('profile_id', CURRENT_BATTERY_PROFILE_ID)
        .eq('date', today)
        .maybeSingle();
      
      if (existing) {
        // Actualizar el registro existente
        const { data, error } = await supabase
          .from('daily_soc_records')
          .update({ 
            soc,
            voltage,
            created_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return { data, isUpdate: true };
      } else {
        // Crear nuevo registro
        const { data, error } = await supabase
          .from('daily_soc_records')
          .insert({
            profile_id: CURRENT_BATTERY_PROFILE_ID,
            date: today,
            soc,
            voltage
          })
          .select()
          .single();
        
        if (error) throw error;
        return { data, isUpdate: false };
      }
    },
    onSuccess: ({ data, isUpdate }) => {
      // Invalidar queries para actualizar la UI
      queryClient.invalidateQueries({ 
        queryKey: ['daily-soc', CURRENT_BATTERY_PROFILE_ID, getTodayEcuadorDateString()] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['daily-soc-history', CURRENT_BATTERY_PROFILE_ID] 
      });
      
      toast.success(
        isUpdate ? 'SOC actualizado' : 'SOC guardado exitosamente',
        {
          description: `SOC: ${data.soc}% • Voltaje: ${data.voltage}V`
        }
      );
    },
    onError: (error) => {
      console.error('Error guardando SOC:', error);
      toast.error('Error al guardar el SOC', {
        description: 'Por favor, intenta de nuevo'
      });
    }
  });
  
  return {
    // Datos
    todayEntry: todayQuery.data,
    history: historyQuery.data || [],
    
    // Estados de carga
    isLoadingToday: todayQuery.isLoading,
    isLoadingHistory: historyQuery.isLoading,
    
    // Función para guardar
    saveDailySOC: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    
    // Utilidades
    isSavedToday: !!todayQuery.data,
    todaySOC: todayQuery.data?.soc || null,
    todayVoltage: todayQuery.data?.voltage || null,
  };
}