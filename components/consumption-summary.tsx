'use client';

import { Badge } from '@/components/ui/badge';
import { Moon, Battery } from 'lucide-react';
import { NIGHT_CONSUMPTION_TRAMOS, NIGHT_CONSUMPTION_TOTAL } from '@/lib/consumption-constants';

export function ConsumptionSummary() {
  return (
    <div className="p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-semibold dark:text-white">Resumen Nocturno</h2>
        </div>
        <Badge variant="outline" className="text-[10px] px-2">
          17:00 → 08:00
        </Badge>
      </div>

      {/* Compact Grid View for Mobile */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {NIGHT_CONSUMPTION_TRAMOS.map((tramo) => (
          <div key={tramo.id} className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
            <div className="flex items-center gap-1 mb-1">
              <div className={`w-2 h-2 rounded-full ${tramo.color}`} />
              <span className="text-xs font-semibold dark:text-white">{tramo.name}</span>
            </div>
            <p className="text-[10px] text-muted-foreground dark:text-gray-500 mb-1">{tramo.period}</p>
            <div className="space-y-0.5">
              <p className="text-[10px]">
                <span className="text-muted-foreground dark:text-gray-500">Potencia:</span>
                <span className="ml-1 font-medium dark:text-white">{tramo.watts}W</span>
              </p>
              <p className="text-[10px]">
                <span className="text-muted-foreground dark:text-gray-500">Energía:</span>
                <span className="ml-1 font-medium dark:text-white">{tramo.wh} Wh</span>
              </p>
              <p className="text-[10px]">
                <span className="text-muted-foreground dark:text-gray-500">Duración:</span>
                <span className="ml-1 font-medium dark:text-white">{tramo.hours}h</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Total Summary */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Battery className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold dark:text-white">Total Nocturno</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {NIGHT_CONSUMPTION_TOTAL.wh} Wh
            </div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400">
              {NIGHT_CONSUMPTION_TOTAL.ah} Ah @ 12.8V
            </div>
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
          <p className="text-[10px] text-blue-900 dark:text-blue-300">
            Requiere mínimo <span className="font-semibold">{NIGHT_CONSUMPTION_TOTAL.minSOCRequired}% SOC</span> 
            ({NIGHT_CONSUMPTION_TOTAL.minAhRequired} Ah de 108 Ah)
          </p>
        </div>
      </div>
    </div>
  );
}