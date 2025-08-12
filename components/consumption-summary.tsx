'use client';

import { Badge } from '@/components/ui/badge';
import { useBatteryStore } from '@/lib/store';
import { Battery, Moon } from 'lucide-react';
import React from 'react';

export function ConsumptionSummary() {
  const { getCurrentProfile } = useBatteryStore();
  const currentProfile = getCurrentProfile();
  
  // Usar tramos del store, con fallback a array vacío
  const tramos = currentProfile.consumptionTramos || [];
  
  // Si no hay tramos, cargarlos
  React.useEffect(() => {
    if (!currentProfile.consumptionTramos || currentProfile.consumptionTramos.length === 0) {
      import('@/lib/battery-data').then(({ defaultConsumptionTramos }) => {
        const { updateConsumptionTramos } = useBatteryStore.getState();
        updateConsumptionTramos(defaultConsumptionTramos);
      });
    }
  }, [currentProfile.consumptionTramos]);
  
  // Calcular totales dinámicamente
  const totals = tramos.length > 0 
    ? tramos.reduce((acc, t) => ({
        wh: acc.wh + t.wh,
        ah: acc.ah + t.ah
      }), { wh: 0, ah: 0 })
    : { wh: 0, ah: 0 };
  
  const minSOCRequired = totals.wh > 0 ? Number((totals.wh / currentProfile.batteryConfig.capacityWh * 100).toFixed(1)) : 0;
  const minAhRequired = totals.ah;
  return (
    <div className="p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-foreground">Resumen Nocturno</h2>
        </div>
        <Badge variant="outline" className="text-[10px] sm:text-sm px-2">
          17:00 → 08:00
        </Badge>
      </div>

      {/* Compact Grid View for Mobile */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {tramos.length === 0 ? (
          <div className="col-span-2 p-4 text-center text-sm text-muted-foreground">
            Cargando tramos de consumo...
          </div>
        ) : (
          tramos.map((tramo) => (
          <div key={tramo.id} className="p-2 rounded-lg bg-muted border border-border">
            <div className="flex items-center gap-1 mb-1">
              <div className={`w-2 h-2 rounded-full ${tramo.color}`} />
              <span className="text-xs font-semibold text-foreground">{tramo.name}</span>
            </div>
            <p className="text-[10px] sm:text-sm text-muted-foreground mb-1">{tramo.period}</p>
            <div className="space-y-0.5">
              <p className="text-[10px] sm:text-sm">
                <span className="text-muted-foreground">Potencia:</span>
                <span className="ml-1 font-medium text-foreground">{tramo.watts}W</span>
              </p>
              <p className="text-[10px] sm:text-sm">
                <span className="text-muted-foreground">Energía:</span>
                <span className="ml-1 font-medium text-foreground">{tramo.wh} Wh</span>
              </p>
              <p className="text-[10px] sm:text-sm">
                <span className="text-muted-foreground">Duración:</span>
                <span className="ml-1 font-medium text-foreground">{tramo.hours}h</span>
              </p>
            </div>
          </div>
        )))}
      </div>

      {/* Total Summary */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Battery className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-foreground">Total Nocturno</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">
              {totals.wh.toFixed(0)} Wh
            </div>
            <div className="text-[10px] sm:text-sm text-blue-600">
              {totals.ah.toFixed(1)} Ah @ 12.8V
            </div>
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
          <p className="text-[10px] sm:text-sm text-blue-900 dark:text-blue-300">
            Requiere mínimo <span className="font-semibold">{minSOCRequired}% SOC</span> 
            ({minAhRequired.toFixed(1)} Ah de {currentProfile.batteryConfig.capacityAh} Ah)
          </p>
        </div>
      </div>
    </div>
  );
}