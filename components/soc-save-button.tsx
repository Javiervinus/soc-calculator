'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { interpolateSOC } from '@/lib/battery-calculations';
import { useBatteryStore } from '@/lib/store';
import { Check, Save } from 'lucide-react';
import { toast } from 'sonner';

interface SOCSaveButtonProps {
  compact?: boolean;
}

export function SOCSaveButton({ compact = true }: SOCSaveButtonProps) {
  const { currentVoltage, getCurrentProfile, saveDailySOC, getTodaySOCEntry, getSOCHistory } = useBatteryStore();
  const profile = getCurrentProfile();
  
  // Obtener directamente del store - esto se actualizará automáticamente
  const todayEntry = getTodaySOCEntry();
  const historyLength = getSOCHistory().length; // Usar como dependencia para forzar re-render
  
  const isSaved = !!todayEntry;
  const todaySOC = todayEntry?.soc || null;
  const lastSavedTime = todayEntry ? new Date(todayEntry.timestamp).toLocaleTimeString('es-EC', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'America/Guayaquil'
  }) : null;

  const handleSave = () => {
    const socResult = interpolateSOC(currentVoltage, profile.voltageSOCTable);
    const result = saveDailySOC(socResult.soc);
    
    if (result.success) {
      toast.success(result.message, {
        description: `SOC: ${socResult.soc}%`
      });
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