'use client';

import { CURRENT_USER_ID } from '@/lib/constants/user-constants';
import { getSupabase } from '@/lib/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Tables } from '@/lib/supabase/database.types';

type UserPreferences = Pick<
  Tables<'user_preferences'>,
  'theme' | 'app_theme' | 'timezone' | 'prediction_efficiency' |
  'prediction_tilt_angle' | 'prediction_azimuth' | 'prediction_temperature_coefficient' |
  'prediction_eta_soil' | 'prediction_eta_ctrl' | 'prediction_eta_aoi' |
  'prediction_svf' | 'prediction_mid_start' | 'prediction_mid_end'
>;

/**
 * Hook para obtener y actualizar las preferencias de usuario (temas, configuración UI)
 * Usa solo React Query sin Zustand, siguiendo el patrón de migración
 */
export function useUserPreferences() {
  const supabase = getSupabase();
  const queryClient = useQueryClient();

  // Query para obtener las preferencias
  const query = useQuery({
    queryKey: ['user-preferences', CURRENT_USER_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('theme, app_theme, timezone, prediction_efficiency, prediction_tilt_angle, prediction_azimuth, prediction_temperature_coefficient, prediction_eta_soil, prediction_eta_ctrl, prediction_eta_aoi, prediction_svf, prediction_mid_start, prediction_mid_end')
        .eq('id', CURRENT_USER_ID)
        .single();

      if (error) {
        console.error('Error obteniendo preferencias:', error);
        throw error;
      }

      return data as UserPreferences;
    },
    // OPTIMIZACIÓN: Las preferencias cambian poco
    staleTime: 1000 * 60 * 60 * 4, // 4 horas
    gcTime: 1000 * 60 * 60 * 24, // 24h en memoria
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  // Mutation para actualizar tema CON ACTUALIZACIÓN OPTIMISTA
  const updateThemeMutation = useMutation({
    mutationFn: async (theme: 'light' | 'dark') => {
      const { data, error } = await supabase
        .from('user_preferences')
        .update({ theme })
        .eq('id', CURRENT_USER_ID)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (theme) => {
      // Cancelar queries en vuelo
      await queryClient.cancelQueries({ queryKey: ['user-preferences', CURRENT_USER_ID] });
      
      // Obtener datos actuales
      const previousData = queryClient.getQueryData<UserPreferences>(['user-preferences', CURRENT_USER_ID]);
      
      // Actualización optimista
      if (previousData) {
        queryClient.setQueryData(['user-preferences', CURRENT_USER_ID], {
          ...previousData,
          theme
        });
      }
      
      return { previousData };
    },
    onError: (err, _theme, context) => {
      // Rollback en caso de error
      if (context?.previousData) {
        queryClient.setQueryData(['user-preferences', CURRENT_USER_ID], context.previousData);
      }
      console.error('Error actualizando tema:', err);
      toast.error('Error al cambiar el tema');
    },
    onSettled: () => {
      // Revalidar después de la mutación
      queryClient.invalidateQueries({ queryKey: ['user-preferences', CURRENT_USER_ID] });
    },
  });

  // Mutation para actualizar tema de la app CON ACTUALIZACIÓN OPTIMISTA
  const updateAppThemeMutation = useMutation({
    mutationFn: async (appTheme: string) => {
      const { data, error } = await supabase
        .from('user_preferences')
        .update({ app_theme: appTheme })
        .eq('id', CURRENT_USER_ID)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (appTheme) => {
      // Cancelar queries en vuelo
      await queryClient.cancelQueries({ queryKey: ['user-preferences', CURRENT_USER_ID] });
      
      // Obtener datos actuales
      const previousData = queryClient.getQueryData<UserPreferences>(['user-preferences', CURRENT_USER_ID]);
      
      // Actualización optimista
      if (previousData) {
        queryClient.setQueryData(['user-preferences', CURRENT_USER_ID], {
          ...previousData,
          app_theme: appTheme
        });
      }
      
      return { previousData };
    },
    onError: (err, _appTheme, context) => {
      // Rollback en caso de error
      if (context?.previousData) {
        queryClient.setQueryData(['user-preferences', CURRENT_USER_ID], context.previousData);
      }
      console.error('Error actualizando tema de app:', err);
      toast.error('Error al cambiar el tema de la aplicación');
    },
    onSettled: () => {
      // Revalidar después de la mutación
      queryClient.invalidateQueries({ queryKey: ['user-preferences', CURRENT_USER_ID] });
    },
  });

  // Mutation para actualizar timezone
  const updateTimezoneMutation = useMutation({
    mutationFn: async (timezone: string) => {
      const { data, error } = await supabase
        .from('user_preferences')
        .update({ timezone })
        .eq('id', CURRENT_USER_ID)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (timezone) => {
      await queryClient.cancelQueries({ queryKey: ['user-preferences', CURRENT_USER_ID] });
      const previousData = queryClient.getQueryData<UserPreferences>(['user-preferences', CURRENT_USER_ID]);
      
      if (previousData) {
        queryClient.setQueryData(['user-preferences', CURRENT_USER_ID], {
          ...previousData,
          timezone
        });
      }
      
      return { previousData };
    },
    onError: (err, _timezone, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['user-preferences', CURRENT_USER_ID], context.previousData);
      }
      console.error('Error actualizando timezone:', err);
      toast.error('Error al cambiar la zona horaria');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences', CURRENT_USER_ID] });
    },
  });

  // Mutation para actualizar parámetros de predicción CON ACTUALIZACIÓN OPTIMISTA
  const updatePredictionParamsMutation = useMutation({
    mutationFn: async (params: {
      prediction_efficiency?: number;
      prediction_tilt_angle?: number;
      prediction_azimuth?: number;
      prediction_temperature_coefficient?: number;
    }) => {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(params)
        .eq('id', CURRENT_USER_ID)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (params) => {
      // Cancelar queries en vuelo
      await queryClient.cancelQueries({ queryKey: ['user-preferences', CURRENT_USER_ID] });
      
      // Obtener datos actuales
      const previousData = queryClient.getQueryData<UserPreferences>(['user-preferences', CURRENT_USER_ID]);
      
      // Actualización optimista
      if (previousData) {
        queryClient.setQueryData(['user-preferences', CURRENT_USER_ID], {
          ...previousData,
          ...params
        });
      }
      
      return { previousData };
    },
    onError: (err, _params, context) => {
      // Rollback en caso de error
      if (context?.previousData) {
        queryClient.setQueryData(['user-preferences', CURRENT_USER_ID], context.previousData);
      }
      console.error('Error actualizando parámetros de predicción:', err);
      toast.error('Error al actualizar los parámetros');
    },
    onSettled: () => {
      // Revalidar después de la mutación
      queryClient.invalidateQueries({ queryKey: ['user-preferences', CURRENT_USER_ID] });
    },
  });

  // Obtener valores actuales
  const preferences = query.data;
  
  return {
    // Datos completos
    preferences,
    theme: preferences?.theme || 'light',
    appTheme: preferences?.app_theme || 'default',
    timezone: preferences?.timezone || 'America/Guayaquil',
    predictionParams: {
      efficiency: preferences?.prediction_efficiency || 0.75,
      tiltAngle: preferences?.prediction_tilt_angle || 10,
      azimuth: preferences?.prediction_azimuth || 0,
      temperatureCoefficient: preferences?.prediction_temperature_coefficient || -0.004
    },
    
    // Estados de carga
    isLoading: query.isLoading,
    error: query.error,
    
    // Funciones de actualización
    updateTheme: updateThemeMutation.mutate,
    updateAppTheme: updateAppThemeMutation.mutate,
    updateTimezone: updateTimezoneMutation.mutate,
    updatePredictionParams: updatePredictionParamsMutation.mutate,
    
    // Estados de mutación
    isUpdatingTheme: updateThemeMutation.isPending,
    isUpdatingAppTheme: updateAppThemeMutation.isPending,
    isUpdatingTimezone: updateTimezoneMutation.isPending,
    isUpdatingPredictionParams: updatePredictionParamsMutation.isPending,
  };
}