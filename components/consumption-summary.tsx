'use client';

import { Badge } from '@/components/ui/badge';
import { TIME_CONFIG } from '@/lib/time-config';
import { Battery, Moon, Loader2 } from 'lucide-react';
import { useConsumptionSegments } from '@/lib/hooks/use-consumption-segments';
import { useBatteryProfile } from '@/lib/hooks/use-battery-profile';

export function ConsumptionSummary() {
  const { segments, isLoading: segmentsLoading } = useConsumptionSegments();
  const { profile, isLoading: profileLoading } = useBatteryProfile();
  
  const isLoading = segmentsLoading || profileLoading;
  
  // Calcular totales dinámicamente
  const totals = segments.length > 0 
    ? segments.reduce((acc, segment) => {
        const wh = segment.watts * segment.hours;
        const ah = wh / 12.8;
        return {
          wh: acc.wh + wh,
          ah: acc.ah + ah
        };
      }, { wh: 0, ah: 0 })
    : { wh: 0, ah: 0 };
  
  const minSOCRequired = totals.wh > 0 && profile ? Number((totals.wh / profile.battery_capacity_wh * 100).toFixed(1)) : 0;
  const minAhRequired = totals.ah;
  
  // Si está cargando, mostrar loader
  if (isLoading) {
    return (
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }
  
  // Si no hay perfil, mostrar mensaje
  if (!profile) {
    return (
      <div className="p-3 sm:p-4">
        <div className="text-center text-sm text-muted-foreground">
          No se pudo cargar el perfil de batería
        </div>
      </div>
    );
  }
  return (
    <div className="p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4 text-indigo-600" />
          <h2 className="text-lg font-semibold text-foreground">Resumen Nocturno</h2>
        </div>
        <Badge variant="outline" className="text-[10px] sm:text-sm px-2">
          {TIME_CONFIG.nightCycle.startTime} → {TIME_CONFIG.nightCycle.endTime}
        </Badge>
      </div>

      {/* Compact Grid View for Mobile */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {segments.length === 0 ? (
          <div className="col-span-2 p-4 text-center text-sm text-muted-foreground">
            No hay tramos de consumo configurados
          </div>
        ) : (
          segments.map((segment) => {
            const wh = segment.watts * segment.hours;
            const periodLabel = segment.period_label || `${String(segment.start_hour).padStart(2, '0')}:00-${String(segment.end_hour).padStart(2, '0')}:00`;
            const color = segment.color || 'bg-gray-500';
            
            return (
              <div key={segment.id} className="p-2 rounded-lg bg-muted border border-border">
                <div className="flex items-center gap-1 mb-1">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-xs font-semibold text-foreground">{segment.name}</span>
                </div>
                <p className="text-[10px] sm:text-sm text-muted-foreground mb-1">{periodLabel}</p>
                <div className="space-y-0.5">
                  <p className="text-[10px] sm:text-sm">
                    <span className="text-muted-foreground">Potencia:</span>
                    <span className="ml-1 font-medium text-foreground">{segment.watts}W</span>
                  </p>
                  <p className="text-[10px] sm:text-sm">
                    <span className="text-muted-foreground">Energía:</span>
                    <span className="ml-1 font-medium text-foreground">{wh} Wh</span>
                  </p>
                  <p className="text-[10px] sm:text-sm">
                    <span className="text-muted-foreground">Duración:</span>
                    <span className="ml-1 font-medium text-foreground">{segment.hours}h</span>
                  </p>
                </div>
              </div>
            );
          }))}
      </div>

      {/* Total Summary */}
      <div className="p-3 rounded-lg alert-summary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Battery className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Total Nocturno</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">
              {totals.wh.toFixed(0)} Wh
            </div>
            <div className="text-[10px] sm:text-sm text-primary">
              {totals.ah.toFixed(1)} Ah @ 12.8V
            </div>
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-accent/30">
          <p className="text-[10px] sm:text-sm text-foreground/80">
            Requiere mínimo <span className="font-semibold">{minSOCRequired}% SOC</span> 
            ({minAhRequired.toFixed(1)} Ah de {profile.battery_capacity_ah} Ah)
          </p>
        </div>
      </div>
    </div>
  );
}