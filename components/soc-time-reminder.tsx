'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBatteryStore } from '@/lib/store';
import { getGuayaquilTime } from '@/lib/timezone-utils';
import { Clock, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

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
      const hour = now.getHours();
      const minutes = now.getMinutes();
      
      // Solo mostrar si no se ha guardado hoy
      if (!todayEntry) {
        // Estamos en el rango de 4-5 PM
        if (hour >= 16 && hour < 18) {
          setShowReminder(true);
          setTimeUntilWindow(null);
        } 
        // Antes de las 4 PM - calcular tiempo restante
        else if (hour < 16) {
          setShowReminder(false);
          const hoursLeft = 15 - hour;
          const minutesLeft = 60 - minutes;
          
          if (hoursLeft === 0) {
            setTimeUntilWindow(`${minutesLeft} minutos`);
          } else if (hoursLeft === 1 && minutesLeft === 60) {
            setTimeUntilWindow('1 hora');
          } else if (hoursLeft === 1) {
            setTimeUntilWindow(`1 hora ${minutesLeft} min`);
          } else {
            setTimeUntilWindow(`${hoursLeft} horas`);
          }
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
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 animate-pulse">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-sm flex items-center justify-between">
          <span className="text-amber-900 dark:text-amber-300 font-medium">
            Es hora de guardar tu SOC diario
          </span>
          <span className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Ventana óptima: 4-5 PM
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  // Mostrar próximo horario recomendado (solo si falta menos de 3 horas)
  if (timeUntilWindow && (timeUntilWindow.includes('minutos') || timeUntilWindow.includes('1 hora') || timeUntilWindow.includes('2 hora'))) {
    return (
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-sm text-blue-900 dark:text-blue-300">
          Próxima ventana recomendada para guardar SOC en <span className="font-medium">{timeUntilWindow}</span> (4-5 PM)
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}