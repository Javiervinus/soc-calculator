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
    <div className="p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Battery className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-semibold">Estado de Carga</h2>
        </div>
        <Badge variant={socResult.confidence === 'high' ? 'default' : 'secondary'} className="h-5 text-[10px] px-2">
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
            <div className={`text-4xl font-bold ${getSOCColor()}`}>
              {socResult.soc.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">SOC Actual</p>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-semibold">{availableEnergy.whAvailable} Wh</div>
            <div className="text-xs text-muted-foreground">{availableEnergy.ahAvailable} Ah</div>
            {profile.batteryConfig.safetyReserve > 0 && (
              <div className="text-[10px] text-blue-600 mt-1">
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
            <p className="text-[10px] text-muted-foreground">Capacidad</p>
            <p className="text-xs font-semibold">{profile.batteryConfig.capacityAh} Ah</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">Energía</p>
            <p className="text-xs font-semibold">{profile.batteryConfig.capacityWh} Wh</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground">Reserva</p>
            <p className="text-xs font-semibold">{profile.batteryConfig.safetyReserve}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}