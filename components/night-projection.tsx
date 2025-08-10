'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { calculateNightProjection, interpolateSOC } from '@/lib/battery-calculations';
import { useBatteryStore } from '@/lib/store';
import { formatGuayaquilTime, getGuayaquilTime } from '@/lib/timezone-utils';
import { Activity, CheckCircle, ChevronDown, ChevronUp, Clock, Moon, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NightProjection() {
  const { currentVoltage, getCurrentProfile } = useBatteryStore();
  const profile = getCurrentProfile();
  const [currentTime, setCurrentTime] = useState(getGuayaquilTime());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Actualizar cada minuto para recalcular la ponderación
    const timer = setInterval(() => {
      setCurrentTime(getGuayaquilTime());
    }, 60000); // 60000ms = 1 minuto
    
    return () => clearInterval(timer);
  }, []);

  const socResult = interpolateSOC(currentVoltage, profile.voltageSOCTable);
  const projection = calculateNightProjection(
    socResult.soc,
    profile.batteryConfig,
    profile.consumptionProfile,
    currentTime
  );

  const currentHour = currentTime.getHours();
  const isNightTime = currentHour >= 17 || currentHour < 8;

  const progressPercentage = projection.availableWh > 0 && projection.requiredWh > 0
    ? Math.min((projection.availableWh / projection.requiredWh) * 100, 100)
    : 0;

  return (
    <div className="p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-semibold">Proyección Nocturna</h2>
        </div>
        <Badge variant="outline" className="h-5 text-[10px] px-2 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatGuayaquilTime(currentTime)}
        </Badge>
      </div>

      {/* Main Status - Most Important Info */}
      <div className="mb-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-zinc-800 dark:to-zinc-900">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-600 dark:text-gray-400">Estado hasta las 08:00</span>
          {projection.willLastUntil8AM ? (
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs font-semibold text-green-600">Alcanza</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-xs font-semibold text-red-600">No alcanza</span>
            </div>
          )}
        </div>

        {/* Energy Summary */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div>
            <p className="text-[10px] text-muted-foreground dark:text-gray-500">Disponible</p>
            <p className="text-sm font-semibold">{projection.availableWh} Wh</p>
            <p className="text-[10px] text-muted-foreground dark:text-gray-500">{(projection.availableWh / 12.8).toFixed(1)} Ah</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground dark:text-gray-500">Requerido (restante)</p>
            <p className="text-sm font-semibold">{projection.requiredWh} Wh</p>
            <p className="text-[10px] text-muted-foreground dark:text-gray-500">{(projection.requiredWh / 12.8).toFixed(1)} Ah</p>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progressPercentage} className="h-1.5 mb-2" />

        {/* Margin */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-600 dark:text-gray-400">Margen</span>
          <div className="text-right">
            <span className={`text-sm font-bold ${projection.marginWh >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {projection.marginWh >= 0 ? '+' : ''}{projection.marginWh} Wh
            </span>
            <span className={`text-[10px] ml-1 ${projection.marginWh >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ({(projection.marginWh / 12.8).toFixed(1)} Ah)
            </span>
          </div>
        </div>
      </div>

      {/* Alert Messages - Compact */}
      {!isNightTime && currentHour < 17 && (
        <Alert className="mb-3 p-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <AlertDescription className="text-[10px] leading-relaxed dark:text-blue-300">
            Proyección activa desde las 17:00. El banco recarga durante el día.
          </AlertDescription>
        </Alert>
      )}

      {!projection.willLastUntil8AM && projection.estimatedEndTime && (
        <Alert className="mb-3 p-2 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertDescription className="text-[10px] leading-relaxed dark:text-red-300">
            Agotamiento estimado: {formatGuayaquilTime(projection.estimatedEndTime)}
          </AlertDescription>
        </Alert>
      )}

      {/* Consumption Details - Always visible with current period highlighted */}
      <div className="border-t pt-3">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between text-xs font-medium text-slate-600 dark:text-gray-400 mb-2"
        >
          <span>Detalles por Tramo</span>
          {showDetails ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>

        {showDetails && (
          <div className="space-y-1">
            {projection.consumptionByPeriod.map((period, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-2 rounded transition-all dark:text-white ${
                  'status' in period && period.status === 'current' 
                    ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' 
                    : 'bg-slate-50 dark:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    'status' in period && period.status === 'completed' ? 'bg-gray-400' :
                    'status' in period && period.status === 'current' ? 'bg-blue-500 animate-pulse' :
                    'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-medium">{period.period}</p>
                      {'status' in period && period.status === 'current' && (
                        <Badge variant="secondary" className="h-4 px-1 text-[8px]">
                          <Activity className="h-2 w-2 mr-1" />
                          En curso
                        </Badge>
                      )}
                    </div>
                    <p className="text-[9px] text-muted-foreground">
                      {period.startTime} - {period.endTime}
                    </p>
                    
                    {/* Progress bar for current period */}
                    {'progress' in period && period.status === 'current' && period.progress !== undefined && (
                      <div className="mt-1">
                        <Progress value={period.progress} className="h-1" />
                        <p className="text-[8px] text-muted-foreground mt-0.5">
                          {period.progress.toFixed(1)}% completado
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  {'status' in period && period.status === 'current' ? (
                    <div>
                      <p className="text-[9px] text-muted-foreground">
                        Consumido: {period.consumedWh} Wh
                      </p>
                      <p className="text-[10px] font-semibold text-blue-600">
                        Restante: {period.remainingWh} Wh
                      </p>
                      <p className="text-[8px] text-muted-foreground">
                        {period.watts}W × {period.hours.toFixed(1)}h
                      </p>
                    </div>
                  ) : 'status' in period && period.status === 'completed' ? (
                    <div>
                      <p className="text-[10px] text-gray-500 line-through">
                        {period.consumedWh} Wh
                      </p>
                      <p className="text-[8px] text-gray-400">
                        Completado
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[10px] font-semibold">
                        {period.totalWh} Wh
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        {period.watts}W × {period.hours}h
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Total summary */}
            <div className="mt-2 pt-2 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold text-slate-600">
                  Total consumo restante:
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {projection.requiredWh} Wh ({(projection.requiredWh / 12.8).toFixed(1)} Ah)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}