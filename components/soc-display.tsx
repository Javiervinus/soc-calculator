'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Battery, AlertTriangle } from 'lucide-react';
import { useBatteryStore } from '@/lib/store';
import { interpolateSOC, calculateAvailableEnergy, calculateUsableEnergy } from '@/lib/battery-calculations';

export function SOCDisplay() {
  const { currentVoltage, getCurrentProfile } = useBatteryStore();
  const profile = getCurrentProfile();
  
  const socResult = interpolateSOC(currentVoltage, profile.voltageSOCTable);
  const availableEnergy = calculateAvailableEnergy(socResult.soc, profile.batteryConfig);
  const usableEnergy = profile.batteryConfig.safetyReserve > 0
    ? calculateUsableEnergy(socResult.soc, profile.batteryConfig)
    : availableEnergy;

  const getSOCColor = () => {
    if (socResult.soc >= 80) return 'text-green-600';
    if (socResult.soc >= 50) return 'text-yellow-600';
    if (socResult.soc >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = () => {
    if (socResult.soc >= 80) return 'bg-green-600';
    if (socResult.soc >= 50) return 'bg-yellow-600';
    if (socResult.soc >= 20) return 'bg-orange-600';
    return 'bg-red-600';
  };

  return (
    <div className="p-3 sm:p-4 lg:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Battery className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
          <h2 className="text-sm lg:text-base font-semibold dark:text-white">Estado de Carga</h2>
        </div>
        <Badge variant={socResult.confidence === 'high' ? 'default' : 'secondary'} className="h-5 text-[10px] lg:text-xs px-2">
          {socResult.confidence === 'high' ? 'Preciso' : 'Estimado'}
        </Badge>
      </div>

      {socResult.isOutOfRange && (
        <Alert className="mb-3 p-2 border-yellow-200 bg-yellow-50">
          <AlertDescription className="text-xs flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Voltaje fuera de rango
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {/* SOC Percentage - Large and Prominent */}
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-4xl lg:text-5xl font-bold ${getSOCColor()}`}>
              {socResult.soc.toFixed(1)}%
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground dark:text-gray-500">SOC Actual</p>
          </div>
          
          <div className="text-right">
            <div className="text-sm lg:text-base font-semibold dark:text-white">{availableEnergy.whAvailable} Wh</div>
            <div className="text-xs lg:text-sm text-muted-foreground dark:text-gray-500">{availableEnergy.ahAvailable} Ah</div>
            {profile.batteryConfig.safetyReserve > 0 && (
              <div className="text-[10px] lg:text-xs text-blue-600 mt-1">
                Útil: {usableEnergy.whAvailable} Wh
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <Progress 
            value={socResult.soc} 
            className="h-2"
            style={{
              '--progress-background': getProgressColor(),
            } as React.CSSProperties}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Quick Stats Grid - Compact */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <p className="text-[10px] lg:text-xs text-muted-foreground dark:text-gray-500">Capacidad</p>
            <p className="text-xs lg:text-sm font-semibold dark:text-white">{profile.batteryConfig.capacityAh} Ah</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] lg:text-xs text-muted-foreground dark:text-gray-500">Energía</p>
            <p className="text-xs lg:text-sm font-semibold dark:text-white">{profile.batteryConfig.capacityWh} Wh</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] lg:text-xs text-muted-foreground dark:text-gray-500">Reserva</p>
            <p className="text-xs lg:text-sm font-semibold dark:text-white">{profile.batteryConfig.safetyReserve}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}