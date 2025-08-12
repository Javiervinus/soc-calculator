'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { calculateAvailableEnergy, calculateUsableEnergy, interpolateSOC } from '@/lib/battery-calculations';
import { useBatteryStore } from '@/lib/store';
import { AlertTriangle, Battery } from 'lucide-react';
import { SOCSaveButton } from './soc-save-button';

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
          <h2 className="text-sm lg:text-base font-semibold text-foreground">Estado de Carga</h2>
        </div>
        <Badge variant={socResult.confidence === 'high' ? 'default' : 'secondary'} className="h-5 text-[10px] sm:text-sm px-2">
          {socResult.confidence === 'high' ? 'Preciso' : 'Estimado'}
        </Badge>
      </div>

      {socResult.isOutOfRange && (
        <Alert className="mb-3 p-2 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <AlertDescription className="text-xs flex items-center gap-1 text-yellow-900 dark:text-yellow-300">
            <AlertTriangle className="h-3 w-3" />
            Voltaje fuera de rango
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {/* SOC Percentage - Large and Prominent */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className={`text-4xl lg:text-5xl font-bold ${getSOCColor()}`}>
                {socResult.soc.toFixed(1)}%
              </div>
              <p className="text-xs lg:text-sm text-muted-foreground">SOC Actual</p>
            </div>
            {/* Botón de guardar SOC  prueba*/}
          </div>
          
          <div className="text-right">
            <div className="text-sm lg:text-base font-semibold text-foreground">{availableEnergy.whAvailable} Wh</div>
            <div className="text-xs lg:text-sm text-muted-foreground">{availableEnergy.ahAvailable} Ah</div>
            {profile.batteryConfig.safetyReserve > 0 && (
              <div className="text-[10px] sm:text-sm text-blue-600 mt-1">
                Útil: {usableEnergy.whAvailable} Wh
              </div>
            )}
          </div>
        </div>
            <SOCSaveButton />


        {/* Progress Bar */}
        <div>
          <Progress 
            value={socResult.soc} 
            className="h-2"
            style={{
              '--progress-background': getProgressColor(),
            } as React.CSSProperties}
          />
          <div className="flex justify-between text-[10px] sm:text-sm text-muted-foreground mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Quick Stats Grid - Compact */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <p className="text-[10px] sm:text-sm text-muted-foreground">Capacidad</p>
            <p className="text-xs lg:text-sm font-semibold text-foreground">{profile.batteryConfig.capacityAh} Ah</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] sm:text-sm text-muted-foreground">Energía</p>
            <p className="text-xs lg:text-sm font-semibold text-foreground">{profile.batteryConfig.capacityWh} Wh</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] sm:text-sm text-muted-foreground">Reserva</p>
            <p className="text-xs lg:text-sm font-semibold text-foreground">{profile.batteryConfig.safetyReserve}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}