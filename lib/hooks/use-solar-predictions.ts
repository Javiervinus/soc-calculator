'use client';

import { getSupabase } from '@/lib/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  calculateSolarPrediction, 
  PredictionParams, 
  PredictionResult,
  getNextNDays,
  DEFAULT_PREDICTION_PARAMS,
  SITE_CONFIG
} from '@/lib/solar-predictions';
import { CURRENT_USER_ID } from '@/lib/constants/user-constants';
import { getTodayEcuadorDateString } from '@/lib/timezone-utils';
import { toast } from 'sonner';
import type { Tables } from '@/lib/supabase/database.types';
import { useSolarConfig } from './use-solar-config';
import { useUserPreferences } from './use-user-preferences';

type PredictionCache = Tables<'solar_predictions_cache'>;

interface CacheEntry {
  date: string;
  result: PredictionResult;
  params: PredictionParams;
  expires_at: string;
}

/**
 * Hook para manejar predicciones solares con caché en Supabase
 */
export function useSolarPredictions() {
  const supabase = getSupabase();
  const queryClient = useQueryClient();
  const { solarConfig } = useSolarConfig();
  const { preferences } = useUserPreferences();

  // Obtener parámetros completos (user preferences + solar config)
  const getFullParams = (): PredictionParams => {
    if (!solarConfig || !preferences) {
      // Valores por defecto si no hay datos
      return {
        ...DEFAULT_PREDICTION_PARAMS,
        nPanels: 12,
        pPanelSTC_W: 60
      };
    }

    return {
      // Parámetros de usuario (con valores por defecto)
      etaElec: preferences.prediction_efficiency || DEFAULT_PREDICTION_PARAMS.etaElec,
      etaSoil: DEFAULT_PREDICTION_PARAMS.etaSoil, // No está en user_preferences
      etaCtrl: DEFAULT_PREDICTION_PARAMS.etaCtrl, // No está en user_preferences
      etaAOI: DEFAULT_PREDICTION_PARAMS.etaAOI,   // No está en user_preferences
      svf: DEFAULT_PREDICTION_PARAMS.svf,         // No está en user_preferences
      midStart: DEFAULT_PREDICTION_PARAMS.midStart, // No está en user_preferences
      midEnd: DEFAULT_PREDICTION_PARAMS.midEnd,     // No está en user_preferences
      // Parámetros del sistema solar
      nPanels: solarConfig.number_of_panels || 12,
      pPanelSTC_W: solarConfig.panel_power_each || 60
    };
  };

  // Query para obtener predicción de un día específico
  const useSinglePrediction = (date: string, enabled: boolean = false) => {
    return useQuery({
      queryKey: ['solar-prediction', date],
      queryFn: async () => {
        const params = getFullParams();
        
        // 1. Buscar en caché de Supabase
        const { data: cacheData } = await supabase
          .from('solar_predictions_cache')
          .select('*')
          .eq('prediction_date', date)
          .gte('expires_at', new Date().toISOString())
          .maybeSingle();

        if (cacheData && cacheData.weather_data) {
          // Verificar si los parámetros coinciden
          const cachedParams = {
            efficiency: cacheData.estimated_ah ? 
              (cacheData.estimated_ah / (cacheData.effective_psh || 1) / params.nPanels / params.pPanelSTC_W * 13.6) : 
              params.etaElec
          };

          // Si los parámetros son similares, usar caché
          if (Math.abs(cachedParams.efficiency - params.etaElec) < 0.05) {
            const weatherData = cacheData.weather_data as any;
            return {
              date: cacheData.prediction_date,
              ahEstimated: cacheData.estimated_ah || 0,
              whEstimated: cacheData.estimated_wh || 0,
              pshEffective: cacheData.effective_psh || 0,
              pshDirect: cacheData.total_dni_wh_m2 ? cacheData.total_dni_wh_m2 / 1000 : 0,
              pshDiffuse: cacheData.total_dhi_wh_m2 ? cacheData.total_dhi_wh_m2 / 1000 : 0,
              daylightHours: 12, // Aproximado
              cloudCoverMedian: cacheData.cloud_cover_avg || 0,
              dataQuality: {
                isValid: true,
                validFraction: 1,
                source: 'forecast' as const
              }
            } as PredictionResult;
          }
        }

        // 2. Si no hay caché válido, calcular nueva predicción
        const result = await calculateSolarPrediction(date, params);
        
        // 3. Guardar en caché de Supabase
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 6); // TTL de 6 horas

        // Intentar guardar en caché, pero no fallar si hay error
        try {
          // Primero eliminar cualquier registro existente para esta fecha
          await supabase
            .from('solar_predictions_cache')
            .delete()
            .eq('prediction_date', date);

          // Luego insertar el nuevo registro
          const { error } = await supabase
            .from('solar_predictions_cache')
            .insert({
              prediction_date: date,
              latitude: SITE_CONFIG.coords.lat,
              longitude: SITE_CONFIG.coords.lon,
              estimated_ah: result.ahEstimated,
              estimated_wh: result.whEstimated,
              effective_psh: result.pshEffective,
              total_dni_wh_m2: result.pshDirect * 1000,
              total_dhi_wh_m2: result.pshDiffuse * 1000,
              total_ghi_wh_m2: result.pshEffective * 1000,
              cloud_cover_avg: result.cloudCoverMedian,
              temperature_avg: 25, // Valor aproximado
              weather_data: {
                daylightHours: result.daylightHours,
                dataQuality: result.dataQuality
              },
              expires_at: expiresAt.toISOString()
            });
          
          if (error) {
            console.warn('No se pudo guardar en caché:', error);
          }
        } catch (error) {
          // No fallar si no se puede guardar en caché
          console.warn('Error guardando en caché:', error);
        }

        // Si este día está en la semana actual, actualizar también el caché semanal
        const weekData = queryClient.getQueryData<PredictionResult[]>(['solar-predictions-week']);
        if (weekData) {
          const updatedWeek = weekData.map(day => 
            day.date === date ? result : day
          );
          // Solo actualizar si este día está en la semana
          if (weekData.some(day => day.date === date)) {
            queryClient.setQueryData(['solar-predictions-week'], updatedWeek);
          }
        }

        return result;
      },
      enabled: enabled && !!solarConfig && !!preferences,
      staleTime: 1000 * 60 * 60, // 1 hora
      gcTime: 1000 * 60 * 60 * 6, // 6 horas
      retry: 1
    });
  };

  // Query para obtener predicciones de múltiples días
  const useWeekPredictions = (enabled: boolean = false) => {
    return useQuery({
      queryKey: ['solar-predictions-week'],
      queryFn: async () => {
        const params = getFullParams();
        const dates = getNextNDays(7, false);
        const results: PredictionResult[] = [];

        for (const date of dates) {
          try {
            // Buscar en caché primero
            const { data: cacheData } = await supabase
              .from('solar_predictions_cache')
              .select('*')
              .eq('prediction_date', date)
              .gte('expires_at', new Date().toISOString())
              .maybeSingle();

            if (cacheData && cacheData.weather_data) {
              const weatherData = cacheData.weather_data as any;
              results.push({
                date: cacheData.prediction_date,
                ahEstimated: cacheData.estimated_ah || 0,
                whEstimated: cacheData.estimated_wh || 0,
                pshEffective: cacheData.effective_psh || 0,
                pshDirect: cacheData.total_dni_wh_m2 ? cacheData.total_dni_wh_m2 / 1000 : 0,
                pshDiffuse: cacheData.total_dhi_wh_m2 ? cacheData.total_dhi_wh_m2 / 1000 : 0,
                daylightHours: weatherData.daylightHours || 12,
                cloudCoverMedian: cacheData.cloud_cover_avg || 0,
                dataQuality: weatherData.dataQuality || {
                  isValid: true,
                  validFraction: 1,
                  source: 'forecast'
                }
              });
            } else {
              // Calcular nueva predicción
              const result = await calculateSolarPrediction(date, params);
              results.push(result);

              // Guardar en caché
              const expiresAt = new Date();
              expiresAt.setHours(expiresAt.getHours() + 6);

              try {
                // Primero eliminar cualquier registro existente
                await supabase
                  .from('solar_predictions_cache')
                  .delete()
                  .eq('prediction_date', date);

                // Luego insertar el nuevo
                const { error } = await supabase
                  .from('solar_predictions_cache')
                  .insert({
                    prediction_date: date,
                    latitude: SITE_CONFIG.coords.lat,
                    longitude: SITE_CONFIG.coords.lon,
                    estimated_ah: result.ahEstimated,
                    estimated_wh: result.whEstimated,
                    effective_psh: result.pshEffective,
                    total_dni_wh_m2: result.pshDirect * 1000,
                    total_dhi_wh_m2: result.pshDiffuse * 1000,
                    total_ghi_wh_m2: result.pshEffective * 1000,
                    cloud_cover_avg: result.cloudCoverMedian,
                    temperature_avg: 25,
                    weather_data: {
                      daylightHours: result.daylightHours,
                      dataQuality: result.dataQuality
                    },
                    expires_at: expiresAt.toISOString()
                  });
                
                if (error) {
                  console.warn('No se pudo guardar en caché:', error);
                }
              } catch (cacheError) {
                console.warn('Error guardando en caché:', cacheError);
              }
            }
          } catch (error) {
            console.error(`Error getting prediction for ${date}:`, error);
            // Agregar resultado con error
            results.push({
              date,
              ahEstimated: 0,
              whEstimated: 0,
              pshEffective: 0,
              pshDirect: 0,
              pshDiffuse: 0,
              daylightHours: 0,
              cloudCoverMedian: 0,
              dataQuality: {
                isValid: false,
                validFraction: 0,
                source: 'forecast'
              }
            });
          }
        }

        // Actualizar el caché de React Query para cada día individual
        results.forEach(result => {
          if (result.ahEstimated > 0) {
            queryClient.setQueryData(['solar-prediction', result.date], result);
          }
        });

        return results;
      },
      enabled: enabled && !!solarConfig && !!preferences,
      staleTime: 1000 * 60 * 60, // 1 hora
      gcTime: 1000 * 60 * 60 * 6, // 6 horas
      retry: 1
    });
  };

  // Mutation para actualizar parámetros de predicción
  const updatePredictionParams = useMutation({
    mutationFn: async (updates: Partial<{
      prediction_efficiency: number;
      prediction_tilt_angle: number;
      prediction_azimuth: number;
      prediction_temperature_coefficient: number;
    }>) => {
      const { error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('id', CURRENT_USER_ID);

      if (error) throw error;
      return updates;
    },
    onMutate: async (updates) => {
      // Cancelar queries en vuelo
      await queryClient.cancelQueries({ 
        queryKey: ['user-preferences', CURRENT_USER_ID] 
      });

      // Actualización optimista
      const previousData = queryClient.getQueryData(['user-preferences', CURRENT_USER_ID]);
      
      if (previousData) {
        queryClient.setQueryData(
          ['user-preferences', CURRENT_USER_ID],
          { ...previousData, ...updates }
        );
      }

      return { previousData };
    },
    onError: (error, updates, context) => {
      // Rollback en caso de error
      if (context?.previousData) {
        queryClient.setQueryData(
          ['user-preferences', CURRENT_USER_ID],
          context.previousData
        );
      }
      console.error('Error actualizando parámetros:', error);
      toast.error('Error al actualizar parámetros');
    },
    onSuccess: () => {
      // Invalidar predicciones para recalcular con nuevos parámetros
      queryClient.invalidateQueries({ 
        queryKey: ['solar-prediction'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['solar-predictions-week'] 
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['user-preferences', CURRENT_USER_ID] 
      });
    }
  });

  // Mutation para limpiar caché de predicciones
  const clearPredictionCache = useMutation({
    mutationFn: async (date?: string) => {
      if (date) {
        // Limpiar caché de una fecha específica
        const { error } = await supabase
          .from('solar_predictions_cache')
          .delete()
          .eq('prediction_date', date);

        // No importa si hay error, queremos forzar refetch
        if (error) {
          console.warn('No se pudo limpiar caché en DB:', error);
        }
        
        // Invalidar y remover del caché de React Query
        await queryClient.invalidateQueries({ 
          queryKey: ['solar-prediction', date],
          refetchType: 'all'
        });
        await queryClient.removeQueries({
          queryKey: ['solar-prediction', date]
        });
      } else {
        // Limpiar todo el caché
        const { error } = await supabase
          .from('solar_predictions_cache')
          .delete()
          .gte('prediction_date', getTodayEcuadorDateString());

        // No importa si hay error, queremos forzar refetch
        if (error) {
          console.warn('No se pudo limpiar caché en DB:', error);
        }
        
        // Invalidar y remover todas las queries de predicciones
        await queryClient.invalidateQueries({ 
          queryKey: ['solar-prediction'],
          refetchType: 'all'
        });
        await queryClient.invalidateQueries({ 
          queryKey: ['solar-predictions-week'],
          refetchType: 'all'
        });
        await queryClient.removeQueries({
          queryKey: ['solar-prediction']
        });
        await queryClient.removeQueries({
          queryKey: ['solar-predictions-week']
        });
      }
    },
    onSuccess: (_, date) => {
      console.log('Caché limpiado para:', date || 'todas las fechas');
    },
    onError: (error) => {
      console.error('Error en proceso de limpieza:', error);
    }
  });

  return {
    // Configuración
    fullParams: getFullParams(),
    isConfigLoaded: !!solarConfig && !!preferences,
    
    // Hooks de queries
    useSinglePrediction,
    useWeekPredictions,
    
    // Mutations
    updatePredictionParams: updatePredictionParams.mutate,
    clearCache: clearPredictionCache.mutate,
    
    // Estados de mutations
    isUpdatingParams: updatePredictionParams.isPending,
    isClearingCache: clearPredictionCache.isPending
  };
}