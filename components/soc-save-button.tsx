'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useVoltage } from '@/lib/hooks/use-voltage';
import { useBatteryProfile } from '@/lib/hooks/use-battery-profile';
import { useDailySOC } from '@/lib/hooks/use-daily-soc';
import { interpolateSOC } from '@/lib/supabase-store/calculations';
import { Check, Save, Loader2 } from 'lucide-react';

interface SOCSaveButtonProps {
  compact?: boolean;
}

export function SOCSaveButton({ compact = true }: SOCSaveButtonProps) {
  const { voltage } = useVoltage();
  const { voltageSOCPoints, isLoading: profileLoading } = useBatteryProfile();
  const { 
    todayEntry, 
    saveDailySOC, 
    isSaving,
    isSavedToday,
    todaySOC,
    isLoadingToday 
  } = useDailySOC();
  
  const lastSavedTime = todayEntry ? new Date(todayEntry.created_at || '').toLocaleTimeString('es-EC', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'America/Guayaquil'
  }) : null;
  
  const isLoading = profileLoading || isLoadingToday;

  const handleSave = () => {
    if (!voltageSOCPoints || voltageSOCPoints.length === 0) {
      return;
    }
    
    const socResult = interpolateSOC(voltage, voltageSOCPoints);
    saveDailySOC({ 
      soc: socResult.soc, 
      voltage: voltage 
    });
  };
  
  // Si está cargando, mostrar loader
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-8 h-8">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Si ya se guardó hoy, mostrar indicador compacto
  if (isSavedToday && compact) {
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
            disabled={isSaving || !voltageSOCPoints}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Guardar lectura diaria de SOC</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}