'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/lib/supabase/client';
import { useVoltageStore } from '@/lib/supabase-store/voltage-store';
import { CURRENT_USER_ID, CURRENT_BATTERY_PROFILE_ID } from '@/lib/constants/user-constants';
import { interpolateSOC } from '@/lib/supabase-store/calculations';
import type { VoltageSOCPoint } from '@/lib/supabase-store/battery-profile-store';

/**
 * Mutation mejorada que también calcula el SOC para el registro
 */
export function useUpdateVoltageWithSOC() {
  const queryClient = useQueryClient();
  const supabase = getSupabase();
  const voltageStore = useVoltageStore();

  return useMutation({
    mutationFn: async ({ voltage, voltageSOCPoints }: { 
      voltage: number; 
      voltageSOCPoints?: VoltageSOCPoint[] 
    }) => {
      // 1. Actualizar el voltaje actual en user_preferences
      const { data, error } = await supabase
        .from('user_preferences')
        .update({ current_voltage: voltage })
        .eq('id', CURRENT_USER_ID)
        .select('current_voltage')
        .single();

      if (error) throw error;

      // 2. Calcular el SOC si tenemos los puntos de la tabla
      let calculatedSOC = null;
      if (voltageSOCPoints && voltageSOCPoints.length > 0) {
        const socResult = interpolateSOC(voltage, voltageSOCPoints);
        calculatedSOC = socResult.soc;
      }

      // 3. Insertar el registro en voltage_readings con el SOC calculado
      const { error: readingError } = await supabase
        .from('voltage_readings')
        .insert({
          profile_id: CURRENT_BATTERY_PROFILE_ID,
          voltage: voltage,
          calculated_soc: calculatedSOC,
          is_manual_entry: true,
          notes: null
        });

      if (readingError) {
        console.error('Error insertando voltage reading:', readingError);
      }

      return data.current_voltage;
    },
    onMutate: async ({ voltage }) => {
      // Actualización optimista inmediata
      voltageStore.setVoltage(voltage);
      
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: ['voltage'] });
      
      return { previousVoltage: voltageStore.currentVoltage };
    },
    onError: (err, { voltage }, context) => {
      // Revertir en caso de error
      if (context?.previousVoltage) {
        voltageStore.setVoltage(context.previousVoltage);
      }
      console.error('Error actualizando voltaje:', err);
    },
    onSettled: () => {
      // Revalidar después de la mutación
      queryClient.invalidateQueries({ queryKey: ['voltage'] });
    },
  });
}