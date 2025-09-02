"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useBatteryProfile } from "@/lib/hooks/use-battery-profile";
import { useDebouncedMutation } from "@/lib/hooks/use-debounced-mutation";
import { useSolarConfig } from "@/lib/hooks/use-solar-config";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ThemeSelector } from "./theme-selector";

export function BatteryConfigTab() {
  const {
    profile,
    updateBatteryProfile,
    isUpdating: isUpdatingProfile,
  } = useBatteryProfile();
  const { solarConfig } = useSolarConfig(); // Solo visualización por ahora

  // Estados locales para los inputs
  const [capacityAh, setCapacityAh] = useState("");
  const [capacityWh, setCapacityWh] = useState("");
  const [safetyReserve, setSafetyReserve] = useState([20]);
  // Sistema solar - Por ahora solo visualización, no edición
  // const [solarPower, setSolarPower] = useState('');
  // const [panelCount, setPanelCount] = useState('');
  // const [panelPowerEach, setPanelPowerEach] = useState('');
  // const [controllerCapacity, setControllerCapacity] = useState('');

  // Sincronizar con datos de Supabase cuando se cargan
  useEffect(() => {
    if (profile) {
      setCapacityAh(profile.battery_capacity_ah.toString());
      setCapacityWh(profile.battery_capacity_wh.toString());
      setSafetyReserve([profile.safety_reserve_percent || 20]);
    }
  }, [profile]);

  // Crear versión con debounce de la función de actualización
  const debouncedUpdateProfile = useDebouncedMutation(
    (value: number) => {
      updateBatteryProfile(
        { safety_reserve_percent: value },
        { showToast: false }
      );
    },
    800
  );

  // Sistema solar - Por ahora solo visualización
  // useEffect(() => {
  //   if (solarConfig) {
  //     setSolarPower(solarConfig.solar_power_total?.toString() || '');
  //     setPanelCount(solarConfig.number_of_panels?.toString() || '');
  //     setPanelPowerEach(solarConfig.panel_power_each?.toString() || '');
  //     setControllerCapacity(solarConfig.controller_capacity?.toString() || '');
  //   }
  // }, [solarConfig]);

  const handleSaveBatteryConfig = () => {
    const ah = parseFloat(capacityAh);
    const wh = parseFloat(capacityWh);

    if (isNaN(ah) || isNaN(wh)) {
      toast.error("Por favor ingresa valores válidos");
      return;
    }

    updateBatteryProfile(
      {
        battery_capacity_ah: ah,
        battery_capacity_wh: wh,
        battery_capacity_kwh: wh / 1000,
        safety_reserve_percent: safetyReserve[0],
      },
      { showToast: true } // Mostrar toast al guardar manualmente
    );
  };

  // Manejar cambio del slider
  const handleSafetyReserveChange = (value: number[]) => {
    // Actualizar UI inmediatamente
    setSafetyReserve(value);
    
    // Guardar con debounce
    if (profile) {
      debouncedUpdateProfile(value[0]);
    }
  };

  // Sistema solar - Por ahora solo visualización, no edición
  // const handleSaveSolarConfig = () => {
  //   const power = parseFloat(solarPower);
  //   const panels = parseInt(panelCount);
  //   const powerEach = parseFloat(panelPowerEach);
  //   const controller = parseInt(controllerCapacity);

  //   if (isNaN(power) || isNaN(panels) || isNaN(powerEach) || isNaN(controller)) {
  //     toast.error('Por favor ingresa valores válidos');
  //     return;
  //   }

  //   updateSolarConfig({
  //     solar_power_total: power,
  //     number_of_panels: panels,
  //     panel_power_each: powerEach,
  //     controller_capacity: controller,
  //     controller_type: 'MPPT',
  //     panel_type: 'Monocristalino'
  //   });
  // };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuración de Batería */}
      <div className="space-y-4">
        <h3 className="font-semibold">Capacidad de la Batería</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="capacity-ah">Capacidad (Ah)</Label>
            <Input
              id="capacity-ah"
              type="number"
              value={capacityAh}
              onChange={(e) => setCapacityAh(e.target.value)}
              placeholder="108"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity-wh">Capacidad (Wh)</Label>
            <Input
              id="capacity-wh"
              type="number"
              value={capacityWh}
              onChange={(e) => setCapacityWh(e.target.value)}
              placeholder="1380"
            />
          </div>
        </div>

        <Button
          onClick={handleSaveBatteryConfig}
          className="w-full"
          disabled={isUpdatingProfile}
        >
          {isUpdatingProfile ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Guardar Capacidad
        </Button>
      </div>

      {/* Reserva de Seguridad */}
      <div className="space-y-4">
        <h3 className="font-semibold">Reserva de Seguridad</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Reserva actual</span>
            <span className="font-medium">{safetyReserve[0]}%</span>
          </div>
          <Slider
            value={safetyReserve}
            onValueChange={handleSafetyReserveChange}
            min={0}
            max={30}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Energía reservada para proteger la batería • Se guarda
            automáticamente
          </p>
        </div>
      </div>

      {/* Configuración Solar - Por ahora solo visualización */}
      {/* <div className="space-y-4">
        <h3 className="font-semibold">Sistema Solar</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="solar-power">Potencia Total (W)</Label>
            <Input
              id="solar-power"
              type="number"
              value={solarPower}
              onChange={(e) => setSolarPower(e.target.value)}
              placeholder="720"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="panel-count">Número de Paneles</Label>
            <Input
              id="panel-count"
              type="number"
              value={panelCount}
              onChange={(e) => setPanelCount(e.target.value)}
              placeholder="12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="panel-power">Potencia c/u (W)</Label>
            <Input
              id="panel-power"
              type="number"
              value={panelPowerEach}
              onChange={(e) => setPanelPowerEach(e.target.value)}
              placeholder="60"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="controller">Controlador (A)</Label>
            <Input
              id="controller"
              type="number"
              value={controllerCapacity}
              onChange={(e) => setControllerCapacity(e.target.value)}
              placeholder="30"
            />
          </div>
        </div>

        <Button 
          onClick={handleSaveSolarConfig} 
          className="w-full"
          disabled={isUpdatingSolar}
        >
          {isUpdatingSolar ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Guardar Sistema Solar
        </Button>
      </div> */}

      {/* Selector de Temas */}
      <ThemeSelector />

      {/* Información del Sistema de Batería */}
      <div className="space-y-4">
        <h3 className="font-semibold">Información del Sistema de Batería</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Química</span>
            <span className="font-medium">
              {profile.chemistry || "LiFePO₄"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Capacidad Total</span>
            <span className="font-medium">
              {profile.battery_capacity_ah} Ah /{" "}
              {profile.battery_capacity_kwh?.toFixed(2)} kWh
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Voltaje Nominal</span>
            <span className="font-medium">
              {profile.nominal_voltage || 12.8} V
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Configuración</span>
            <span className="font-medium text-right text-xs">
              {profile.battery_configuration || "6 baterías en paralelo"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Baterías</span>
            <span className="font-medium">
              {profile.number_of_batteries || 6} ×{" "}
              {profile.battery_capacity_each || 18} Ah
            </span>
          </div>
        </div>
      </div>

      {/* Sistema Solar Info */}
      {solarConfig && (
        <div className="space-y-4">
          <h3 className="font-semibold">Sistema Solar</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Potencia Total</span>
              <span className="font-medium">
                {solarConfig.solar_power_total || 720} W
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paneles</span>
              <span className="font-medium">
                {solarConfig.number_of_panels || 12} ×{" "}
                {solarConfig.panel_power_each || 60} W
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo de Panel</span>
              <span className="font-medium">
                {solarConfig.panel_type || "Monocristalino"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Configuración</span>
              <span className="font-medium text-right text-xs">
                {solarConfig.panel_configuration || "12 paneles en paralelo"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">V/I por Panel</span>
              <span className="font-medium">
                {solarConfig.panel_voltage || 18} V /{" "}
                {solarConfig.panel_current || 3.2} A
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Controlador de Carga */}
      {solarConfig && (
        <div className="space-y-4">
          <h3 className="font-semibold">Controlador de Carga</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo</span>
              <span className="font-medium">
                {solarConfig.controller_type || "MPPT"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Capacidad</span>
              <span className="font-medium">
                {solarConfig.controller_capacity || 30} A
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
