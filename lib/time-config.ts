/**
 * Configuración centralizada de horarios para evitar hardcoding
 * Todos los horarios están en formato 24 horas
 */

export const TIME_CONFIG = {
  // Ciclo nocturno principal
  nightCycle: {
    startHour: 17,     // 5:00 PM - Inicio del ciclo nocturno
    endHour: 8,        // 8:00 AM - Fin del ciclo nocturno
    startTime: '17:00',
    endTime: '08:00',
  },
  
  // Configuración de recordatorios SOC
  socReminder: {
    startHour: 16,     // 4:00 PM - Inicio de ventana recomendada
    endHour: 18,       // 6:00 PM - Fin de ventana (exclusivo, hasta 5:59 PM)
    advanceNoticeHours: 1, // Horas de anticipación para mostrar notificación
  },
  
  // Tramos de consumo por defecto (pueden ser sobrescritos por el usuario)
  consumptionPeriods: {
    tramoA: {
      startHour: 17,
      endHour: 19,
      period: '17:00-19:00',
    },
    tramoB: {
      startHour: 19,
      endHour: 0,
      period: '19:00-00:00',
    },
    tramoC: {
      startHour: 0,
      endHour: 6,
      period: '00:00-06:00',
    },
    tramoD: {
      startHour: 6,
      endHour: 8,
      period: '06:00-08:00',
    },
  },
} as const;

/**
 * Formatea una hora en formato 12 horas con AM/PM
 */
export function formatHour12(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${period}`;
}

/**
 * Formatea una hora en formato 24 horas
 */
export function formatHour24(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}