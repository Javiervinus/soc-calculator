/**
 * Funciones de cálculo adaptadas para trabajar con los tipos de Supabase
 */

import type { Tables } from '@/lib/supabase/database.types';

export type VoltageSOCPoint = Tables<'voltage_soc_points'>;
export type BatteryProfile = Tables<'battery_profiles'>;

export interface SOCResult {
  soc: number;
  confidence: 'high' | 'medium' | 'low';
  isOutOfRange: boolean;
}

export interface EnergyInfo {
  ahAvailable: string;
  whAvailable: string;
  kwhAvailable: string;
  ahTotal: number;
  whTotal: number;
  kwhTotal: number;
}

/**
 * Interpola el SOC basado en el voltaje usando la tabla de puntos
 */
export function interpolateSOC(
  voltage: number,
  points: VoltageSOCPoint[]
): SOCResult {
  if (!points || points.length === 0) {
    return { soc: 0, confidence: 'low', isOutOfRange: true };
  }

  // Ordenar por voltaje descendente (de mayor a menor)
  const sortedPoints = [...points].sort((a, b) => b.voltage - a.voltage);
  
  const minVoltage = sortedPoints[sortedPoints.length - 1].voltage;
  const maxVoltage = sortedPoints[0].voltage;

  // Verificar si está fuera de rango
  if (voltage < minVoltage) {
    return { 
      soc: 0, 
      confidence: 'low', 
      isOutOfRange: true 
    };
  }
  
  if (voltage > maxVoltage) {
    return { 
      soc: 100, 
      confidence: 'low', 
      isOutOfRange: true 
    };
  }

  // Buscar el punto exacto o los dos puntos para interpolar
  for (let i = 0; i < sortedPoints.length - 1; i++) {
    const higher = sortedPoints[i];
    const lower = sortedPoints[i + 1];
    
    if (voltage === higher.voltage) {
      return { 
        soc: higher.soc, 
        confidence: 'high', 
        isOutOfRange: false 
      };
    }
    
    if (voltage > lower.voltage && voltage < higher.voltage) {
      // Interpolación lineal
      const range = higher.voltage - lower.voltage;
      const position = voltage - lower.voltage;
      const socRange = higher.soc - lower.soc;
      const soc = lower.soc + (position / range) * socRange;
      
      // Determinar confianza basada en la distancia entre puntos
      const confidence = range <= 0.05 ? 'high' : range <= 0.1 ? 'medium' : 'low';
      
      return { 
        soc: Math.round(soc * 10) / 10, // Redondear a 1 decimal
        confidence, 
        isOutOfRange: false 
      };
    }
  }

  // Si llegamos aquí, usar el último punto
  const lastPoint = sortedPoints[sortedPoints.length - 1];
  return { 
    soc: lastPoint.soc, 
    confidence: 'low', 
    isOutOfRange: false 
  };
}

/**
 * Calcula la energía disponible basada en el SOC
 */
export function calculateAvailableEnergy(
  soc: number,
  profile: BatteryProfile | null
): EnergyInfo {
  if (!profile) {
    return {
      ahAvailable: '0',
      whAvailable: '0',
      kwhAvailable: '0',
      ahTotal: 0,
      whTotal: 0,
      kwhTotal: 0,
    };
  }

  const ahTotal = profile.battery_capacity_ah;
  const whTotal = profile.battery_capacity_wh;
  const kwhTotal = profile.battery_capacity_kwh || whTotal / 1000;

  const ahAvailable = (ahTotal * soc) / 100;
  const whAvailable = (whTotal * soc) / 100;
  const kwhAvailable = (kwhTotal * soc) / 100;

  return {
    ahAvailable: ahAvailable.toFixed(0),
    whAvailable: whAvailable.toFixed(0),
    kwhAvailable: kwhAvailable.toFixed(2),
    ahTotal,
    whTotal,
    kwhTotal,
  };
}

/**
 * Calcula la energía utilizable considerando la reserva de seguridad
 */
export function calculateUsableEnergy(
  soc: number,
  profile: BatteryProfile | null
): EnergyInfo {
  if (!profile) {
    return calculateAvailableEnergy(soc, profile);
  }

  const safetyReserve = profile.safety_reserve_percent || 0;
  const usableSoc = Math.max(0, soc - safetyReserve);
  
  return calculateAvailableEnergy(usableSoc, profile);
}