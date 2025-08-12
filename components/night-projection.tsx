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
  const [showDetails, setShowDetails] = useState(true);

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
    <div className="p-4 lg:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base lg:text-lg font-semibold">Proyección Nocturna</h2>
        </div>
        <Badge variant="outline" className="h-6 text-xs px-2 flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {formatGuayaquilTime(currentTime)}
        </Badge>
      </div>

      {/* Main Status Card */}
      <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-zinc-800 dark:to-zinc-900">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-600 dark:text-gray-400">Estado hasta las 08:00</span>
          {projection.willLastUntil8AM ? (
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold text-green-600">Alcanza</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-semibold text-red-600">No alcanza</span>
            </div>
          )}
        </div>

        {/* Energy Summary */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-muted-foreground dark:text-gray-500">Disponible</p>
            <p className="text-lg font-semibold">{projection.availableWh} Wh</p>
            <p className="text-xs text-muted-foreground dark:text-gray-500">{(projection.availableWh / 12.8).toFixed(1)} Ah</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground dark:text-gray-500">Requerido</p>
            <p className="text-lg font-semibold">{projection.requiredWh} Wh</p>
            <p className="text-xs text-muted-foreground dark:text-gray-500">{(projection.requiredWh / 12.8).toFixed(1)} Ah</p>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progressPercentage} className="h-2 mb-3" />

        {/* Margin */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-gray-400">Margen</span>
          <div className="text-right">
            <span className={`text-base font-bold ${projection.marginWh >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {projection.marginWh >= 0 ? '+' : ''}{projection.marginWh} Wh
            </span>
            <span className={`text-xs ml-1 ${projection.marginWh >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ({(projection.marginWh / 12.8).toFixed(1)} Ah)
            </span>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {!isNightTime && currentHour < 17 && (
        <Alert className="mb-3 p-3 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <AlertDescription className="text-xs leading-relaxed dark:text-blue-300">
            Proyección activa desde las 17:00. El banco recarga durante el día.
          </AlertDescription>
        </Alert>
      )}

      {!projection.willLastUntil8AM && projection.estimatedEndTime && (
        <Alert className="mb-3 p-3 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertDescription className="text-xs leading-relaxed dark:text-red-300">
            Agotamiento estimado: {formatGuayaquilTime(projection.estimatedEndTime)}
          </AlertDescription>
        </Alert>
      )}

      {/* Consumption Details */}
      <div className="border-t pt-3">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between text-sm font-medium text-slate-600 dark:text-gray-400 mb-3"
        >
          <span>Detalles por Tramo</span>
          {showDetails ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {showDetails && (
          <div className="space-y-2">
            {projection.consumptionByPeriod.map((period, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-3 rounded-lg transition-all dark:text-white ${
                  'status' in period && period.status === 'current' 
                    ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' 
                    : 'bg-slate-50 dark:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <div className={`w-2 h-2 rounded-full ${
                    'status' in period && period.status === 'completed' ? 'bg-gray-400' :
                    'status' in period && period.status === 'current' ? 'bg-blue-500 animate-pulse' :
                    'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{period.period}</p>
                      {'status' in period && period.status === 'current' && (
                        <Badge variant="secondary" className="h-5 px-2 text-[10px] sm:text-sm">
                          <Activity className="h-3 w-3 mr-1" />
                          En curso
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {period.startTime} - {period.endTime}
                    </p>
                    
                    {/* Progress bar for current period */}
                    {'progress' in period && period.status === 'current' && period.progress !== undefined && (
                      <div className="mt-1">
                        <Progress value={period.progress} className="h-1" />
                        <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5">
                          {period.progress.toFixed(1)}% completado
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right ml-3">
                  {'status' in period && period.status === 'current' ? (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Consumido: {period.consumedWh} Wh
                      </p>
                      <p className="text-sm font-semibold text-blue-600">
                        Restante: {period.remainingWh} Wh
                      </p>
                      <p className="text-[10px] sm:text-sm text-muted-foreground">
                        {period.watts}W × {period.hours.toFixed(1)}h
                      </p>
                    </div>
                  ) : 'status' in period && period.status === 'completed' ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-500">
                          {period.consumedWh} Wh
                        </p>
                        <p className="text-[10px] sm:text-sm text-gray-400">
                          Completado
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold">
                        {period.totalWh} Wh
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {period.watts}W × {period.hours}h
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Total summary */}
            <div className="mt-3 pt-3 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-600">
                  Total consumo restante:
                </span>
                <span className="text-base font-bold text-slate-900">
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