'use client';

import { CURRENT_BATTERY_PROFILE_ID } from '@/lib/constants/user-constants';
import { getSupabase } from '@/lib/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Tables } from '@/lib/supabase/database.types';

export type ConsumptionSegment = Tables<'consumption_segments'>;

/**
 * Hook para obtener los segmentos de consumo del perfil actual
 * Ahora usa solo React Query con persistencia nativa
 */
export function useConsumptionSegments() {
  const supabase = getSupabase();

  const query = useQuery({
    queryKey: ['consumption-segments', CURRENT_BATTERY_PROFILE_ID],
    queryFn: async () => {
      console.log('🔄 [CONSUMPTION] Fetching from Supabase (client-side)...');
      const { data: segments, error } = await supabase
        .from('consumption_segments')
        .select('*')
        .eq('profile_id', CURRENT_BATTERY_PROFILE_ID)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ [CONSUMPTION] Error obteniendo segmentos de consumo:', error);
        throw error;
      }

      console.log('✅ [CONSUMPTION] Fetched from Supabase:', segments?.length || 0, 'segments');
      return segments || [];
    },
    // Usar misma configuración que el provider
    staleTime: 0, // Siempre considera datos stale para refetch en background
    gcTime: 1000 * 60 * 60 * 24, // 24h en memoria (igual al provider)
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: 'always',
    retry: 1,
  });

  const queryClient = useQueryClient();

  // Mutation para agregar un segmento con actualización optimista
  const addMutation = useMutation({
    mutationFn: async (segment: Omit<ConsumptionSegment, 'id' | 'created_at' | 'updated_at' | 'profile_id'>) => {
      const { data, error } = await supabase
        .from('consumption_segments')
        .insert({
          ...segment,
          profile_id: CURRENT_BATTERY_PROFILE_ID,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newSegment) => {
      // Cancelar queries en vuelo para evitar sobrescribir el optimistic update
      await queryClient.cancelQueries({ 
        queryKey: ['consumption-segments', CURRENT_BATTERY_PROFILE_ID] 
      });

      // Obtener datos actuales del cache
      const previousSegments = queryClient.getQueryData<ConsumptionSegment[]>(
        ['consumption-segments', CURRENT_BATTERY_PROFILE_ID]
      ) || [];

      // Actualización optimista - crear un segmento temporal
      const optimisticSegment: ConsumptionSegment = {
        ...newSegment,
        id: `temp-${Date.now()}`, // ID temporal
        profile_id: CURRENT_BATTERY_PROFILE_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      } as ConsumptionSegment;

      // ACTUALIZAR EL CACHE DE REACT QUERY DIRECTAMENTE
      queryClient.setQueryData(
        ['consumption-segments', CURRENT_BATTERY_PROFILE_ID],
        [...previousSegments, optimisticSegment]
      );

      // Retornar contexto para rollback si falla
      return { previousSegments, tempId: optimisticSegment.id };
    },
    onError: (error, newSegment, context) => {
      // Rollback usando el cache de React Query
      if (context?.previousSegments) {
        queryClient.setQueryData(
          ['consumption-segments', CURRENT_BATTERY_PROFILE_ID],
          context.previousSegments
        );
      }
      console.error('Error agregando segmento:', error);
      toast.error('Error al agregar el tramo');
    },
    onSuccess: (newSegment, variables, context) => {
      // Reemplazar el segmento temporal con el real de la DB
      const currentSegments = queryClient.getQueryData<ConsumptionSegment[]>(
        ['consumption-segments', CURRENT_BATTERY_PROFILE_ID]
      ) || [];
      
      const filteredSegments = currentSegments.filter(s => s.id !== context?.tempId);
      queryClient.setQueryData(
        ['consumption-segments', CURRENT_BATTERY_PROFILE_ID],
        [...filteredSegments, newSegment]
      );
      
      toast.success('Tramo agregado correctamente');
    },
    onSettled: () => {
      // Siempre invalidar para sincronizar con el servidor
      queryClient.invalidateQueries({ 
        queryKey: ['consumption-segments', CURRENT_BATTERY_PROFILE_ID] 
      });
    }
  });

  // Mutation para actualizar un segmento con actualización optimista
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ConsumptionSegment> & { id: string }) => {
      const { data, error } = await supabase
        .from('consumption_segments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (updatedSegment) => {
      // Cancelar queries en vuelo
      await queryClient.cancelQueries({ 
        queryKey: ['consumption-segments', CURRENT_BATTERY_PROFILE_ID] 
      });

      // Obtener datos actuales del cache
      const previousSegments = queryClient.getQueryData<ConsumptionSegment[]>(
        ['consumption-segments', CURRENT_BATTERY_PROFILE_ID]
      );

      // Actualización optimista EN EL CACHE DE REACT QUERY
      if (previousSegments) {
        const updatedSegments = previousSegments.map(s => 
          s.id === updatedSegment.id 
            ? { ...s, ...updatedSegment, updated_at: new Date().toISOString() }
            : s
        );
        
        // ACTUALIZAR EL CACHE DE REACT QUERY DIRECTAMENTE
        queryClient.setQueryData(
          ['consumption-segments', CURRENT_BATTERY_PROFILE_ID],
          updatedSegments
        );
      }

      return { previousSegments };
    },
    onError: (error, updatedSegment, context) => {
      // Rollback usando el cache de React Query
      if (context?.previousSegments) {
        queryClient.setQueryData(
          ['consumption-segments', CURRENT_BATTERY_PROFILE_ID],
          context.previousSegments
        );
      }
      console.error('Error actualizando segmento:', error);
      toast.error('Error al actualizar el tramo');
    },
    onSuccess: (updatedSegment) => {
      // React Query ya actualizará automáticamente con los datos del servidor
      toast.success('Tramo actualizado');
    },
    onSettled: () => {
      // Siempre invalidar para sincronizar con el servidor
      queryClient.invalidateQueries({ 
        queryKey: ['consumption-segments', CURRENT_BATTERY_PROFILE_ID] 
      });
    }
  });

  // Mutation para eliminar un segmento con actualización optimista
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('consumption_segments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      // Cancelar queries en vuelo
      await queryClient.cancelQueries({ 
        queryKey: ['consumption-segments', CURRENT_BATTERY_PROFILE_ID] 
      });

      // Obtener datos actuales del cache
      const previousSegments = queryClient.getQueryData<ConsumptionSegment[]>(
        ['consumption-segments', CURRENT_BATTERY_PROFILE_ID]
      ) || [];

      // Actualización optimista - eliminar inmediatamente del cache
      const filteredSegments = previousSegments.filter(s => s.id !== id);
      
      // ACTUALIZAR EL CACHE DE REACT QUERY DIRECTAMENTE
      queryClient.setQueryData(
        ['consumption-segments', CURRENT_BATTERY_PROFILE_ID],
        filteredSegments
      );

      return { previousSegments };
    },
    onError: (error, id, context) => {
      // Rollback usando el cache de React Query
      if (context?.previousSegments) {
        queryClient.setQueryData(
          ['consumption-segments', CURRENT_BATTERY_PROFILE_ID],
          context.previousSegments
        );
      }
      console.error('Error eliminando segmento:', error);
      toast.error('Error al eliminar el tramo');
    },
    onSuccess: () => {
      toast.success('Tramo eliminado');
    },
    onSettled: () => {
      // Siempre invalidar para sincronizar
      queryClient.invalidateQueries({ 
        queryKey: ['consumption-segments', CURRENT_BATTERY_PROFILE_ID] 
      });
    }
  });

  // Debug detallado del origen de datos
  const dataSource = query.data !== undefined 
    ? (query.isFetching ? 'CACHED_DATA + BACKGROUND_FETCH' : 'CACHED_DATA')
    : (query.isFetching ? 'FETCHING_FIRST_TIME' : 'NO_DATA');

  console.log(`🎯 [CONSUMPTION] Data Source: ${dataSource}`, {
    segments: query.data?.length || 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    status: query.status,
    fetchStatus: query.fetchStatus,
  });

  return {
    segments: query.data || [],
    // Con SSR + HydrationBoundary, isLoading solo es true en primera carga real
    isLoading: query.isLoading,
    // isFetching es true cuando está fetcheando en background
    isFetching: query.isFetching,
    error: query.error,
    // Funciones CRUD
    addSegment: addMutation.mutate,
    updateSegment: updateMutation.mutate,
    deleteSegment: deleteMutation.mutate,
    // Estados de las mutaciones
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}