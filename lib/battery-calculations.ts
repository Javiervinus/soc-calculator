import { VoltageSOCEntry, BatteryConfig, ConsumptionProfile } from './battery-data';

export function interpolateSOC(voltage: number, table: VoltageSOCEntry[]): {
  soc: number;
  isOutOfRange: boolean;
  confidence: 'high' | 'medium' | 'low';
} {
  const sortedTable = [...table].sort((a, b) => b.voltage - a.voltage);
  
  const minVoltage = sortedTable[sortedTable.length - 1].voltage;
  const maxVoltage = sortedTable[0].voltage;
  
  if (voltage >= maxVoltage) {
    return {
      soc: 100,
      isOutOfRange: voltage > maxVoltage,
      confidence: voltage > maxVoltage ? 'low' : 'high',
    };
  }
  
  if (voltage <= minVoltage) {
    return {
      soc: sortedTable[sortedTable.length - 1].soc,
      isOutOfRange: true,
      confidence: 'low',
    };
  }
  
  for (let i = 0; i < sortedTable.length - 1; i++) {
    const upper = sortedTable[i];
    const lower = sortedTable[i + 1];
    
    if (voltage <= upper.voltage && voltage >= lower.voltage) {
      const range = upper.voltage - lower.voltage;
      const position = voltage - lower.voltage;
      const ratio = position / range;
      const socRange = upper.soc - lower.soc;
      const interpolatedSOC = lower.soc + (socRange * ratio);
      
      return {
        soc: Math.round(interpolatedSOC * 10) / 10,
        isOutOfRange: false,
        confidence: 'high',
      };
    }
  }
  
  return {
    soc: 0,
    isOutOfRange: true,
    confidence: 'low',
  };
}

export function calculateAvailableEnergy(soc: number, config: BatteryConfig) {
  const socDecimal = soc / 100;
  const ahAvailable = socDecimal * config.capacityAh;
  const whAvailable = socDecimal * config.capacityWh;
  
  return {
    ahAvailable: Math.round(ahAvailable * 10) / 10,
    whAvailable: Math.round(whAvailable),
  };
}

export function calculateUsableEnergy(soc: number, config: BatteryConfig) {
  const usableSOC = Math.max(soc - config.safetyReserve, 0);
  return calculateAvailableEnergy(usableSOC, config);
}

export function convertWhToAh(wh: number, voltage: number = 12.8): number {
  return Math.round((wh / voltage) * 10) / 10;
}

export function convertAhToWh(ah: number, voltage: number = 12.8): number {
  return Math.round(ah * voltage);
}

export interface NightProjection {
  willLastUntil8AM: boolean;
  estimatedEndTime: Date | null;
  marginWh: number;
  hoursRemaining: number;
  requiredWh: number;
  availableWh: number;
  consumptionByPeriod: {
    period: string;
    watts: number;
    hours: number;
    totalWh: number;
    startTime: string;
    endTime: string;
    status: 'completed' | 'current' | 'pending';
    progress?: number; // Porcentaje de progreso para el tramo actual
    consumedWh?: number; // Wh ya consumidos en el tramo actual
    remainingWh?: number; // Wh restantes en el tramo actual
  }[];
}

export function calculateNightProjection(
  currentSOC: number,
  config: BatteryConfig,
  consumptionProfile: ConsumptionProfile[],
  currentTime: Date = new Date()
): NightProjection {
  const energy = config.safetyReserve > 0 
    ? calculateUsableEnergy(currentSOC, config)
    : calculateAvailableEnergy(currentSOC, config);
    
  const availableWh = energy.whAvailable;
  
  let requiredWh = 0;
  const consumptionByPeriod: NightProjection['consumptionByPeriod'] = [];
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-EC', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Guayaquil'
    });
  };

  // Determinar el inicio del ciclo nocturno actual
  const getNightCycleStart = (baseTime: Date): Date => {
    const cycleStart = new Date(baseTime);
    const hour = baseTime.getHours();
    
    if (hour >= 17) {
      // Estamos después de las 17:00, el ciclo comenzó hoy
      cycleStart.setHours(17, 0, 0, 0);
    } else if (hour < 8) {
      // Estamos en la madrugada, el ciclo comenzó ayer
      cycleStart.setDate(cycleStart.getDate() - 1);
      cycleStart.setHours(17, 0, 0, 0);
    } else {
      // Estamos durante el día, el próximo ciclo comienza hoy
      cycleStart.setHours(17, 0, 0, 0);
    }
    
    return cycleStart;
  };

  // Calcular las fechas absolutas de un período basándose en el inicio del ciclo
  const getPeriodBounds = (profile: ConsumptionProfile, cycleStart: Date): { start: Date; end: Date } => {
    const start = new Date(cycleStart);
    const end = new Date(cycleStart);
    
    // Ajustar el día según la hora del período
    if (profile.startHour < 17) {
      // Períodos de madrugada (0-8) son del día siguiente
      start.setDate(start.getDate() + 1);
      end.setDate(end.getDate() + 1);
    }
    
    // Establecer las horas
    start.setHours(profile.startHour, 0, 0, 0);
    
    if (profile.endHour === 24 || profile.endHour === 0) {
      end.setHours(23, 59, 59, 999);
    } else {
      end.setHours(profile.endHour, 0, 0, 0);
      if (profile.endHour < profile.startHour) {
        // Si el período cruza la medianoche
        end.setDate(end.getDate() + 1);
      }
    }
    
    return { start, end };
  };

  // Calcular el estado y métricas de un período
  const calculatePeriodMetrics = (
    profile: ConsumptionProfile,
    periodStart: Date,
    periodEnd: Date,
    currentTime: Date
  ) => {
    // Calcular las horas totales del período correctamente
    let totalHours: number;
    if (profile.endHour === 24 || profile.endHour === 0) {
      // Si termina a medianoche
      totalHours = 24 - profile.startHour;
    } else if (profile.endHour > profile.startHour) {
      // Período normal sin cruzar medianoche
      totalHours = profile.endHour - profile.startHour;
    } else {
      // Período que cruza medianoche
      totalHours = (24 - profile.startHour) + profile.endHour;
    }
    
    const totalWh = profile.watts * totalHours;
    
    // Determinar el estado del período
    if (currentTime < periodStart) {
      return {
        status: 'pending' as const,
        hours: totalHours,
        totalWh,
        progress: 0,
        consumedWh: 0,
        remainingWh: totalWh,
      };
    }
    
    if (currentTime >= periodEnd) {
      return {
        status: 'completed' as const,
        hours: 0,
        totalWh: 0,
        progress: 100,
        consumedWh: totalWh,
        remainingWh: 0,
      };
    }
    
    // Período actual - calcular progreso
    const elapsedMs = currentTime.getTime() - periodStart.getTime();
    const elapsedHours = Math.min(elapsedMs / (1000 * 60 * 60), totalHours);
    const remainingHours = Math.max(0, totalHours - elapsedHours);
    
    return {
      status: 'current' as const,
      hours: remainingHours,
      totalWh: Math.round(profile.watts * remainingHours),
      progress: (elapsedHours / totalHours) * 100,
      consumedWh: Math.round(profile.watts * elapsedHours),
      remainingWh: Math.round(profile.watts * remainingHours),
    };
  };

  // Procesar cada período del perfil de consumo
  const cycleStart = getNightCycleStart(currentTime);
  
  for (const profile of consumptionProfile) {
    const { start, end } = getPeriodBounds(profile, cycleStart);
    const metrics = calculatePeriodMetrics(profile, start, end, currentTime);
    
    // Agregar al consumo total requerido si hay horas restantes
    if (metrics.hours > 0) {
      requiredWh += metrics.totalWh;
    }
    
    // Agregar a la lista para mostrar en UI
    consumptionByPeriod.push({
      period: profile.label,
      watts: profile.watts,
      hours: Math.round(metrics.hours * 10) / 10,
      totalWh: metrics.totalWh,
      startTime: formatTime(start),
      endTime: formatTime(end),
      status: metrics.status,
      progress: Math.round(metrics.progress * 10) / 10,
      consumedWh: metrics.consumedWh,
      remainingWh: metrics.remainingWh,
    });
  }
  
  // Calcular márgenes y estimaciones
  const marginWh = availableWh - requiredWh;
  const willLastUntil8AM = marginWh >= 0;
  
  // Estimar hora de agotamiento si no alcanza
  let estimatedEndTime: Date | null = null;
  let hoursRemaining = 0;
  
  if (!willLastUntil8AM && availableWh > 0) {
    let accumulatedWh = 0;
    
    for (const consumption of consumptionByPeriod) {
      if (consumption.status === 'completed') continue;
      
      if (accumulatedWh + consumption.totalWh <= availableWh) {
        accumulatedWh += consumption.totalWh;
        hoursRemaining += consumption.hours;
      } else {
        // Período donde se agotará la batería
        const remainingWh = availableWh - accumulatedWh;
        const partialHours = remainingWh / consumption.watts;
        hoursRemaining += partialHours;
        
        estimatedEndTime = new Date(currentTime);
        estimatedEndTime.setTime(estimatedEndTime.getTime() + hoursRemaining * 60 * 60 * 1000);
        break;
      }
    }
  } else if (willLastUntil8AM) {
    // Calcular horas hasta las 08:00
    const cycleEnd = new Date(cycleStart);
    cycleEnd.setDate(cycleEnd.getDate() + 1);
    cycleEnd.setHours(8, 0, 0, 0);
    
    hoursRemaining = (cycleEnd.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
  }
  
  return {
    willLastUntil8AM,
    estimatedEndTime,
    marginWh: Math.round(marginWh),
    hoursRemaining: Math.round(hoursRemaining * 10) / 10,
    requiredWh: Math.round(requiredWh),
    availableWh: Math.round(availableWh),
    consumptionByPeriod,
  };
}