'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBatteryStore } from '@/lib/store';
import { getGuayaquilTime } from '@/lib/timezone-utils';
import { TIME_CONFIG, formatHour12 } from '@/lib/time-config';
import { Clock, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDistanceToNow, setHours, setMinutes, isWithinInterval, addHours, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

export function SOCTimeReminder() {
  const { getTodaySOCEntry, getSOCHistory } = useBatteryStore();
  const [showReminder, setShowReminder] = useState(false);
  const [timeUntilWindow, setTimeUntilWindow] = useState<string | null>(null);
  
  // Obtener directamente del store
  const todayEntry = getTodaySOCEntry();
  const historyLength = getSOCHistory().length; // Para forzar re-render cuando cambie

  useEffect(() => {
    const checkTimeRange = () => {
      const now = getGuayaquilTime();
      
      // Solo mostrar si no se ha guardado hoy
      if (!todayEntry) {
        // Crear las fechas de inicio y fin del período de recordatorio
        const reminderStart = setMinutes(setHours(now, TIME_CONFIG.socReminder.startHour), 0);
        const reminderEnd = setMinutes(setHours(now, TIME_CONFIG.socReminder.endHour), 0);
        const advanceNoticeTime = addHours(reminderStart, -TIME_CONFIG.socReminder.advanceNoticeHours);
        
        // Verificar si estamos en el rango de recordatorio
        if (isWithinInterval(now, { start: reminderStart, end: reminderEnd })) {
          setShowReminder(true);
          setTimeUntilWindow(null);
        } 
        // Verificar si estamos en el período de notificación anticipada
        else if (isWithinInterval(now, { start: advanceNoticeTime, end: reminderStart })) {
          setShowReminder(false);
          
          // Calcular tiempo restante usando date-fns
          const distance = formatDistanceToNow(reminderStart, { 
            locale: es,
            includeSeconds: false,
            addSuffix: false
          });
          
          setTimeUntilWindow(distance);
        } 
        // Antes del período de notificación anticipada
        else if (isBefore(now, advanceNoticeTime)) {
          setShowReminder(false);
          setTimeUntilWindow(null);
        } else {
          setShowReminder(false);
          setTimeUntilWindow(null);
        }
      } else {
        setShowReminder(false);
        setTimeUntilWindow(null);
      }
    };

    checkTimeRange();
    // Solo verificar cada minuto para actualizar el tiempo restante
    const interval = setInterval(checkTimeRange, 60000); // Verificar cada minuto
    
    return () => clearInterval(interval);
  }, [todayEntry, historyLength]);

  // Si no hay nada que mostrar, no renderizar
  if (!showReminder && !timeUntilWindow) {
    return null;
  }

  // Mostrar recordatorio durante el horario recomendado
  if (showReminder) {
    return (
      <Alert className="alert-warning animate-pulse">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-sm flex items-center justify-between">
          <span className="text-amber-900 dark:text-amber-300 font-medium">
            Es hora de guardar tu SOC diario
          </span>
          <span className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Ventana óptima: {formatHour12(TIME_CONFIG.socReminder.startHour).replace(':00', '')}-{formatHour12(TIME_CONFIG.socReminder.endHour - 1).replace(':00', '')}
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  // Mostrar próximo horario recomendado (cuando está en el período de notificación anticipada)
  if (timeUntilWindow) {
    const startFormatted = formatHour12(TIME_CONFIG.socReminder.startHour).replace(':00', '');
    const endFormatted = formatHour12(TIME_CONFIG.socReminder.endHour - 1).replace(':00', '');
    
    return (
      <Alert className="alert-info">
        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-sm text-blue-900 dark:text-blue-300">
          <span className="inline-block">
            Próxima ventana recomendada para guardar SOC en <span className="font-medium whitespace-nowrap">{timeUntilWindow}</span>
          </span>
          <span className="whitespace-nowrap ml-1">({startFormatted}-{endFormatted})</span>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}