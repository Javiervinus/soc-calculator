'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { calculateNightProjection, interpolateSOC } from '@/lib/battery-calculations';
import { useBatteryStore } from '@/lib/store';
import { TIME_CONFIG } from '@/lib/time-config';
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
  const isNightTime = currentHour >= TIME_CONFIG.nightCycle.startHour || currentHour < TIME_CONFIG.nightCycle.endHour;

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
      <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-muted/50 to-muted">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">Estado hasta las {TIME_CONFIG.nightCycle.endTime}</span>
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
            <p className="text-xs text-muted-foreground">Disponible</p>
            <p className="text-lg font-semibold">{projection.availableWh} Wh</p>
            <p className="text-xs text-muted-foreground">{(projection.availableWh / 12.8).toFixed(1)} Ah</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Requerido</p>
            <p className="text-lg font-semibold">{projection.requiredWh} Wh</p>
            <p className="text-xs text-muted-foreground">{(projection.requiredWh / 12.8).toFixed(1)} Ah</p>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progressPercentage} className="h-2 mb-3" />

        {/* Margin - Mostrar con y sin reserva */}
        {(() => {
          // Calcular márgenes reales
          const currentSOCDecimal = socResult.soc / 100;
          const totalWh = profile.batteryConfig.capacityWh;
          const realAvailableWh = currentSOCDecimal * totalWh;
          const realMarginWh = Math.round(realAvailableWh - projection.requiredWh);
          const utilMarginWh = Math.round(projection.marginWh); // Este ya tiene la reserva aplicada
          
          // Calcular los SOC finales estimados (estos son los que determinan los colores)
          const realRemainingWh = Math.round(Math.max(0, realAvailableWh - projection.requiredWh));
          const socWithoutReserve = Math.round((realRemainingWh / totalWh) * 100);
          
          const utilRemainingWh = Math.round(Math.max(0, projection.availableWh - projection.requiredWh));
          const socWithReserve = Math.round((utilRemainingWh / totalWh) * 100);
          
          // Función para determinar el color basado en el SOC
          const getSOCColor = (soc: number, willLast: boolean) => {
            if (!willLast) return 'text-red-600';
            if (soc >= 50) return 'text-green-600';
            if (soc >= 30) return 'text-yellow-600';
            return 'text-orange-600';
          };
          
          const hasReserve = profile.batteryConfig.safetyReserve > 0;
          
          // Usar exactamente los mismos colores que los SOC estimados
          const realMarginColor = getSOCColor(socWithoutReserve, projection.willLastUntil8AM);
          const utilMarginColor = getSOCColor(socWithReserve, projection.willLastUntil8AM);
          
          return (
            <div className="space-y-2 hidden">
              <div className="text-xs text-center text-muted-foreground">
                Margen disponible
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* Margen Real (sin reserva) */}
                <div className="bg-muted/30 rounded-lg p-2">
                  <div className="text-[10px] text-muted-foreground text-center mb-1">
                    Real
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-bold ${realMarginColor}`}>
                      {realMarginWh >= 0 ? '+' : ''}{realMarginWh} Wh
                    </div>
                    <div className={`text-[10px] ${realMarginColor}`}>
                      ({(realMarginWh / 12.8).toFixed(1)} Ah)
                    </div>
                  </div>
                </div>
                
                {/* Margen Útil (con reserva) */}
                {hasReserve ? (
                  <div className="bg-muted/30 rounded-lg p-2">
                    <div className="text-[10px] text-muted-foreground text-center mb-1">
                      Útil
                      <span className="text-[9px] ml-1">(-{profile.batteryConfig.safetyReserve}%)</span>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-bold ${utilMarginColor}`}>
                        {utilMarginWh >= 0 ? '+' : ''}{utilMarginWh} Wh
                      </div>
                      <div className={`text-[10px] ${utilMarginColor}`}>
                        ({(utilMarginWh / 12.8).toFixed(1)} Ah)
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/30 rounded-lg p-2 opacity-50">
                    <div className="text-[10px] text-muted-foreground text-center mb-1">
                      Sin Reserva
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-muted-foreground">
                        N/A
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        0% configurado
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* SOC Estimado para las 8:00 AM */}
        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
          <div className="text-xs text-center text-muted-foreground mb-2">
            SOC estimado a las {TIME_CONFIG.nightCycle.endTime}
          </div>
          
          {(() => {
            // La proyección ya tiene la reserva aplicada en availableWh
            // Necesitamos calcular el SOC real sin considerar la reserva
            const totalWh = profile.batteryConfig.capacityWh;
            const hasReserve = profile.batteryConfig.safetyReserve > 0;
            
            // Si hay reserva, projection.availableWh ya la tiene descontada
            // Para obtener el SOC real, necesitamos recalcular desde el SOC actual
            const currentSOCDecimal = socResult.soc / 100;
            const realAvailableWh = Math.round(currentSOCDecimal * totalWh);
            const realRemainingWh = Math.round(Math.max(0, realAvailableWh - projection.requiredWh));
            const socWithoutReserve = Math.round((realRemainingWh / totalWh) * 100);
            
            // El SOC con reserva es lo que ya está calculado en projection
            const utilRemainingWh = Math.round(Math.max(0, projection.availableWh - projection.requiredWh));
            const socWithReserve = hasReserve ? Math.round((utilRemainingWh / totalWh) * 100) : socWithoutReserve;
            
            // Función para determinar el color basado en el SOC
            const getSOCColor = (soc: number, willLast: boolean) => {
              if (!willLast) return 'text-red-600';
              if (soc >= 50) return 'text-green-600';
              if (soc >= 30) return 'text-yellow-600';
              return 'text-orange-600';
            };
            
            return (
              <div className="grid grid-cols-2 gap-3">
                {/* SOC Real (sin reserva) */}
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="text-[10px] text-muted-foreground text-center mb-1">
                    SOC Real
                  </div>
                  <div className="text-center">
                    <span className={`text-lg font-bold ${getSOCColor(socWithoutReserve, projection.willLastUntil8AM)}`}>
                      {socWithoutReserve}%
                    </span>
                    <div className="text-[10px] text-muted-foreground">
                      {(realRemainingWh / 12.8).toFixed(1)} Ah
                    </div>
                  </div>
                </div>
                
                {/* SOC Útil (con reserva) - solo si hay reserva */}
                {hasReserve ? (
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="text-[10px] text-muted-foreground text-center mb-1">
                      SOC Útil
                      <span className="text-[9px] ml-1">(-{profile.batteryConfig.safetyReserve}%)</span>
                    </div>
                    <div className="text-center">
                      <span className={`text-lg font-bold ${getSOCColor(socWithReserve, projection.willLastUntil8AM)}`}>
                        {socWithReserve}%
                      </span>
                      <div className="text-[10px] text-muted-foreground">
                        {(utilRemainingWh / 12.8).toFixed(1)} Ah
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-2 opacity-50">
                    <div className="text-[10px] text-muted-foreground text-center mb-1">
                      Sin Reserva
                    </div>
                    <div className="text-center">
                      <span className="text-lg font-bold text-muted-foreground">
                        N/A
                      </span>
                      <div className="text-[10px] text-muted-foreground">
                        0% configurado
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Alert Messages */}
      {!isNightTime && currentHour < TIME_CONFIG.nightCycle.startHour && (
        <Alert className="mb-3 p-3 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <AlertDescription className="text-xs leading-relaxed dark:text-blue-300">
            Proyección activa desde las {TIME_CONFIG.nightCycle.startTime}. El banco recarga durante el día.
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
          className="w-full flex items-center justify-between text-sm font-medium text-muted-foreground mb-3"
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
                className={`flex items-center justify-between p-3 rounded-lg transition-all text-foreground ${
                  'status' in period && period.status === 'current' 
                    ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' 
                    : 'bg-muted'
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
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-muted-foreground">
                  Total consumo restante:
                </span>
                <span className="text-base font-bold text-foreground">
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