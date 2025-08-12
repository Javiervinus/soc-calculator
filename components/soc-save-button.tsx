'use client';

import { Button } from '@/components/ui/button';
import { useBatteryStore } from '@/lib/store';
import { interpolateSOC } from '@/lib/battery-calculations';
import { Save, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SOCSaveButtonProps {
  compact?: boolean;
}

export function SOCSaveButton({ compact = true }: SOCSaveButtonProps) {
  const { currentVoltage, getCurrentProfile, saveDailySOC, getTodaySOCEntry } = useBatteryStore();
  const profile = getCurrentProfile();
  const [isSaved, setIsSaved] = useState(false);
  const [todaySOC, setTodaySOC] = useState<number | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Verificar si ya se guardó hoy
  useEffect(() => {
    const checkTodayEntry = () => {
      const todayEntry = getTodaySOCEntry();
      if (todayEntry) {
        setIsSaved(true);
        setTodaySOC(todayEntry.soc);
        const time = new Date(todayEntry.timestamp);
        setLastSavedTime(time.toLocaleTimeString('es-EC', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'America/Guayaquil'
        }));
      } else {
        setIsSaved(false);
        setTodaySOC(null);
        setLastSavedTime(null);
      }
    };

    checkTodayEntry();
    
    // Re-verificar cada segundo para detectar cambios externos (como importación)
    const interval = setInterval(checkTodayEntry, 1000);
    
    return () => clearInterval(interval);
  }, [getTodaySOCEntry]);

  const handleSave = () => {
    const socResult = interpolateSOC(currentVoltage, profile.voltageSOCTable);
    const result = saveDailySOC(socResult.soc);
    
    if (result.success) {
      toast.success(result.message, {
        description: `SOC: ${socResult.soc}%`
      });
      setIsSaved(true);
      setTodaySOC(socResult.soc);
      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString('es-EC', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'America/Guayaquil'
      }));
    } else {
      toast.error(result.message);
    }
  };

  // Si ya se guardó hoy, mostrar indicador compacto
  if (isSaved && compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-green-700 dark:text-green-400">Guardado</p>
                <p className="text-xs text-muted-foreground">{todaySOC}% • {lastSavedTime}</p>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">SOC guardado hoy: {todaySOC}%</p>
            <p className="text-xs text-muted-foreground">Hora: {lastSavedTime}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={handleSave}
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-full"
          >
            <Save className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Guardar lectura diaria de SOC</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}