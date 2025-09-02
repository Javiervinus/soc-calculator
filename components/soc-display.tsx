'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Battery, Loader2 } from 'lucide-react';
import { SOCSaveButton } from './soc-save-button';
import { HippieCardWrapper } from './hippie-card-wrapper';
import { HippieProgress } from './hippie-progress';
import { HippieIcon } from './hippie-icon';
import { HippieText } from './hippie-text';
import { HippieCornerFlorals } from './hippie-corner-florals';
import { useVoltage } from '@/lib/hooks/use-voltage';
import { useBatteryProfile } from '@/lib/hooks/use-battery-profile';
import { 
  interpolateSOC, 
  calculateAvailableEnergy, 
  calculateUsableEnergy 
} from '@/lib/supabase-store/calculations';

export function SOCDisplay() {
  const { voltage } = useVoltage();
  const { profile, voltageSOCPoints, isLoading } = useBatteryProfile();
  
  // Calcular SOC basado en los datos actuales
  const socResult = voltageSOCPoints && voltageSOCPoints.length > 0
    ? interpolateSOC(voltage, voltageSOCPoints)
    : { soc: 0, confidence: 'low' as const, isOutOfRange: true };
    
  const availableEnergy = calculateAvailableEnergy(
    socResult.soc, 
    profile || null
  );
  
  const usableEnergy = profile?.safety_reserve_percent && 
                       profile.safety_reserve_percent > 0
    ? calculateUsableEnergy(socResult.soc, profile)
    : availableEnergy;

  const getSOCColor = () => {
    if (socResult.soc >= 80) return 'text-green-600';
    if (socResult.soc >= 50) return 'text-yellow-600';
    if (socResult.soc >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  // Mostrar loading solo si está cargando el perfil
  if (isLoading) {
    return (
      <HippieCardWrapper className="p-3 sm:p-4 lg:p-5">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </HippieCardWrapper>
    );
  }

  // Si no hay datos después de cargar, mostrar mensaje
  if (!profile) {
    return (
      <HippieCardWrapper className="p-3 sm:p-4 lg:p-5">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No se pudo cargar el perfil de batería. Por favor, recarga la página.
          </AlertDescription>
        </Alert>
      </HippieCardWrapper>
    );
  }

  return (
    <HippieCardWrapper className="p-3 sm:p-4 lg:p-5">
      <HippieCornerFlorals position="top-right" />
      <HippieCornerFlorals position="bottom-left" />
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HippieIcon variant="pulse">
            <Battery className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
          </HippieIcon>
          <HippieText variant="rainbow">
            <h2 className="text-lg font-semibold text-foreground">Estado de Carga</h2>
          </HippieText>
        </div>
        <Badge variant={socResult.confidence === 'high' ? 'default' : 'secondary'} className="h-5 text-[10px] sm:text-sm px-2">
          {socResult.confidence === 'high' ? 'Preciso' : 'Estimado'}
        </Badge>
      </div>

      {socResult.isOutOfRange && (
        <Alert className="mb-3 p-2 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <AlertDescription className="text-xs flex items-center gap-1 text-yellow-900 dark:text-yellow-300">
            <AlertTriangle className="h-3 w-3" />
            Voltaje fuera de rango ({voltage.toFixed(2)}V)
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {/* SOC Percentage - Large and Prominent */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <HippieText variant="glow">
                <div className={`text-4xl lg:text-5xl font-bold ${getSOCColor()}`} data-numeric="true">
                  {socResult.soc.toFixed(1)}%
                </div>
              </HippieText>
              <p className="text-xs lg:text-sm text-muted-foreground">SOC Actual</p>
            </div>
            {/* Botón de guardar SOC */}
          </div>
          
          <div className="text-right">
            <div className="text-sm lg:text-base font-semibold text-foreground">{availableEnergy.whAvailable} Wh</div>
            <div className="text-xs lg:text-sm text-muted-foreground">{availableEnergy.ahAvailable} Ah</div>
            {profile.safety_reserve_percent && profile.safety_reserve_percent > 0 && (
              <div className="text-[10px] sm:text-sm text-blue-600 mt-1">
                Útil: {usableEnergy.whAvailable} Wh
              </div>
            )}
          </div>
        </div>
        <SOCSaveButton />

        {/* Progress Bar */}
        <div>
          <HippieProgress 
            value={socResult.soc} 
            className="h-2"
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
            <p className="text-xs lg:text-sm font-semibold text-foreground">{profile.battery_capacity_ah} Ah</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] sm:text-sm text-muted-foreground">Energía</p>
            <p className="text-xs lg:text-sm font-semibold text-foreground">{profile.battery_capacity_wh} Wh</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] sm:text-sm text-muted-foreground">Reserva</p>
            <p className="text-xs lg:text-sm font-semibold text-foreground">{profile.safety_reserve_percent || 0}%</p>
          </div>
        </div>
      </div>
    </HippieCardWrapper>
  );
}