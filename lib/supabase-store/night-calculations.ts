/**
 * Funciones de cálculo para proyección nocturna adaptadas para Supabase
 */

import type { BatteryProfile } from '@/lib/supabase-store/battery-profile-store';
import type { ConsumptionSegment } from '@/lib/supabase-store/consumption-segments-store';
import { TIME_CONFIG } from '@/lib/time-config';

export interface ConsumptionPeriod {
  period: string;
  startTime: string;
  endTime: string;
  watts: number;
  hours: number;
  totalWh: number;
  status?: 'completed' | 'current' | 'pending';
  progress?: number;
  consumedWh?: number;
  remainingWh?: number;
}

export interface NightProjectionResult {
  requiredWh: number;
  availableWh: number;
  marginWh: number;
  willLastUntil8AM: boolean;
  estimatedEndTime: Date | null;
  consumptionByPeriod: ConsumptionPeriod[];
}

/**
 * Calcula la proyección nocturna basada en los segmentos de consumo
 */
export function calculateNightProjection(
  currentSOC: number,
  batteryProfile: BatteryProfile | null,
  consumptionSegments: ConsumptionSegment[],
  currentTime: Date = new Date()
): NightProjectionResult {
  if (!batteryProfile || consumptionSegments.length === 0) {
    return {
      requiredWh: 0,
      availableWh: 0,
      marginWh: 0,
      willLastUntil8AM: true,
      estimatedEndTime: null,
      consumptionByPeriod: [],
    };
  }

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentDecimalHour = currentHour + currentMinute / 60;

  // Calcular energía disponible considerando la reserva
  const totalWh = batteryProfile.battery_capacity_wh;
  const safetyReserve = batteryProfile.safety_reserve_percent || 0;
  const socDecimal = currentSOC / 100;
  
  // Si hay reserva, restar del SOC actual
  const usableSOC = Math.max(0, socDecimal - safetyReserve / 100);
  const availableWh = Math.round(usableSOC * totalWh);

  // Procesar cada segmento
  const consumptionByPeriod: ConsumptionPeriod[] = [];
  let totalRequiredWh = 0;
  let hasReachedCurrent = false;

  for (const segment of consumptionSegments) {
    const segmentStart = segment.start_hour;
    const segmentEnd = segment.end_hour === 24 ? 0 : segment.end_hour;
    
    // Formatear las horas para display
    const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;
    
    const period: ConsumptionPeriod = {
      period: segment.name,
      startTime: formatHour(segmentStart),
      endTime: formatHour(segmentEnd),
      watts: segment.watts,
      hours: segment.hours,
      totalWh: segment.wh,
    };

    // Determinar el estado del segmento basado en la hora actual
    const isNightTime = currentHour >= TIME_CONFIG.nightCycle.startHour || currentHour < TIME_CONFIG.nightCycle.endHour;
    
    if (isNightTime) {
      // Estamos en el ciclo nocturno
      const cycleStartedToday = currentHour >= TIME_CONFIG.nightCycle.startHour;
      
      // Convertir horas del segmento al mismo sistema de referencia
      let adjustedSegmentStart = segmentStart;
      let adjustedSegmentEnd = segmentEnd;
      
      // Si el segmento cruza medianoche
      if (segmentEnd < segmentStart || segmentEnd === 0) {
        if (segmentStart >= TIME_CONFIG.nightCycle.startHour) {
          // Segmento empieza en la tarde (hoy)
          if (!cycleStartedToday && currentHour < TIME_CONFIG.nightCycle.endHour) {
            // Estamos en la madrugada, este segmento fue ayer
            period.status = 'completed';
            period.consumedWh = period.totalWh;
            period.remainingWh = 0;
            period.progress = 100;
          } else if (cycleStartedToday) {
            // Estamos en la tarde/noche
            if (currentDecimalHour >= segmentStart) {
              // Segmento actual o completado
              if (currentHour < 24) {
                // Todavía en el mismo día, segmento en curso
                const hoursElapsed = currentDecimalHour - segmentStart;
                const hoursRemaining = segment.hours - hoursElapsed;
                const progress = Math.min(100, (hoursElapsed / segment.hours) * 100);
                period.status = 'current';
                period.progress = progress;
                period.hours = hoursRemaining; // Actualizar para mostrar horas restantes
                period.consumedWh = Math.round((progress / 100) * period.totalWh);
                period.remainingWh = Math.round(period.totalWh - period.consumedWh);
                totalRequiredWh += period.remainingWh;
                hasReachedCurrent = true;
              }
            } else {
              // Segmento pendiente
              period.status = 'pending';
              totalRequiredWh += period.totalWh;
            }
          }
        } else {
          // Segmento empieza en la madrugada
          if (!cycleStartedToday) {
            // Estamos en la madrugada
            if (currentDecimalHour >= segmentStart && currentDecimalHour < TIME_CONFIG.nightCycle.endHour) {
              // Segmento actual
              const hoursElapsed = currentDecimalHour - segmentStart;
              const hoursRemaining = segment.hours - hoursElapsed;
              const progress = Math.min(100, (hoursElapsed / segment.hours) * 100);
              period.status = 'current';
              period.progress = progress;
              period.hours = hoursRemaining; // Actualizar para mostrar horas restantes
              period.consumedWh = Math.round((progress / 100) * period.totalWh);
              period.remainingWh = Math.round(period.totalWh - period.consumedWh);
              totalRequiredWh += period.remainingWh;
              hasReachedCurrent = true;
            } else if (currentDecimalHour < segmentStart) {
              // Segmento pendiente
              period.status = 'pending';
              totalRequiredWh += period.totalWh;
            } else {
              // Segmento completado
              period.status = 'completed';
              period.consumedWh = period.totalWh;
              period.remainingWh = 0;
              period.progress = 100;
            }
          } else {
            // Estamos en la tarde/noche, este segmento es para mañana
            period.status = 'pending';
            totalRequiredWh += period.totalWh;
          }
        }
      } else {
        // Segmento no cruza medianoche
        if (segmentStart >= TIME_CONFIG.nightCycle.startHour) {
          // Segmento en la tarde/noche
          if (cycleStartedToday && currentDecimalHour >= segmentStart) {
            if (currentDecimalHour < segmentEnd) {
              // Segmento actual
              const hoursElapsed = currentDecimalHour - segmentStart;
              const hoursRemaining = segment.hours - hoursElapsed;
              const progress = Math.min(100, (hoursElapsed / segment.hours) * 100);
              period.status = 'current';
              period.progress = progress;
              period.hours = hoursRemaining; // Actualizar para mostrar horas restantes
              period.consumedWh = Math.round((progress / 100) * period.totalWh);
              period.remainingWh = Math.round(period.totalWh - period.consumedWh);
              totalRequiredWh += period.remainingWh;
              hasReachedCurrent = true;
            } else {
              // Segmento completado
              period.status = 'completed';
              period.consumedWh = period.totalWh;
              period.remainingWh = 0;
              period.progress = 100;
            }
          } else if (cycleStartedToday) {
            // Segmento pendiente
            period.status = 'pending';
            totalRequiredWh += period.totalWh;
          } else {
            // Estamos en la madrugada, este segmento fue ayer
            period.status = 'completed';
            period.consumedWh = period.totalWh;
            period.remainingWh = 0;
            period.progress = 100;
          }
        } else if (segmentEnd <= TIME_CONFIG.nightCycle.endHour) {
          // Segmento en la madrugada
          if (!cycleStartedToday) {
            if (currentDecimalHour >= segmentStart && currentDecimalHour < segmentEnd) {
              // Segmento actual
              const hoursElapsed = currentDecimalHour - segmentStart;
              const hoursRemaining = segment.hours - hoursElapsed;
              const progress = Math.min(100, (hoursElapsed / segment.hours) * 100);
              period.status = 'current';
              period.progress = progress;
              period.hours = hoursRemaining; // Actualizar para mostrar horas restantes
              period.consumedWh = Math.round((progress / 100) * period.totalWh);
              period.remainingWh = Math.round(period.totalWh - period.consumedWh);
              totalRequiredWh += period.remainingWh;
              hasReachedCurrent = true;
            } else if (currentDecimalHour < segmentStart) {
              // Segmento pendiente
              period.status = 'pending';
              totalRequiredWh += period.totalWh;
            } else {
              // Segmento completado
              period.status = 'completed';
              period.consumedWh = period.totalWh;
              period.remainingWh = 0;
              period.progress = 100;
            }
          } else {
            // Estamos en la tarde, este segmento es para mañana
            period.status = 'pending';
            totalRequiredWh += period.totalWh;
          }
        }
      }
    } else {
      // Estamos fuera del ciclo nocturno (día)
      // Todos los segmentos están pendientes para esta noche
      period.status = 'pending';
      totalRequiredWh += period.totalWh;
    }

    consumptionByPeriod.push(period);
  }

  // Calcular margen y si durará hasta las 8 AM
  const marginWh = availableWh - totalRequiredWh;
  const willLastUntil8AM = marginWh >= 0;

  // Estimar hora de agotamiento si no alcanza
  let estimatedEndTime: Date | null = null;
  if (!willLastUntil8AM && totalRequiredWh > 0) {
    const hoursUntilEmpty = (availableWh / (totalRequiredWh / 
      (TIME_CONFIG.nightCycle.endHour + 24 - TIME_CONFIG.nightCycle.startHour - 
       (currentHour >= TIME_CONFIG.nightCycle.startHour ? currentHour - TIME_CONFIG.nightCycle.startHour : 
        24 - TIME_CONFIG.nightCycle.startHour + currentHour))));
    
    estimatedEndTime = new Date(currentTime);
    estimatedEndTime.setHours(estimatedEndTime.getHours() + Math.floor(hoursUntilEmpty));
    estimatedEndTime.setMinutes(estimatedEndTime.getMinutes() + Math.round((hoursUntilEmpty % 1) * 60));
  }

  return {
    requiredWh: Math.round(totalRequiredWh),
    availableWh,
    marginWh: Math.round(marginWh),
    willLastUntil8AM,
    estimatedEndTime,
    consumptionByPeriod,
  };
}