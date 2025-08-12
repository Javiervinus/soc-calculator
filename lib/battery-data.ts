export interface VoltageSOCEntry {
  voltage: number;
  soc: number;
}

export const defaultVoltageSOCTable: VoltageSOCEntry[] = [
  { voltage: 13.80, soc: 100.0 },
  { voltage: 13.79, soc: 99.9 },
  { voltage: 13.78, soc: 99.8 },
  { voltage: 13.77, soc: 99.7 },
  { voltage: 13.76, soc: 99.6 },
  { voltage: 13.75, soc: 99.5 },
  { voltage: 13.74, soc: 99.4 },
  { voltage: 13.73, soc: 99.3 },
  { voltage: 13.72, soc: 99.2 },
  { voltage: 13.71, soc: 99.1 },
  { voltage: 13.70, soc: 99.0 },
  { voltage: 13.69, soc: 98.6 },
  { voltage: 13.68, soc: 98.1 },
  { voltage: 13.67, soc: 97.7 },
  { voltage: 13.66, soc: 97.2 },
  { voltage: 13.65, soc: 96.8 },
  { voltage: 13.64, soc: 96.3 },
  { voltage: 13.63, soc: 95.9 },
  { voltage: 13.62, soc: 95.4 },
  { voltage: 13.61, soc: 95.0 },
  { voltage: 13.60, soc: 94.6 },
  { voltage: 13.59, soc: 94.0 },
  { voltage: 13.58, soc: 93.3 },
  { voltage: 13.57, soc: 92.7 },
  { voltage: 13.56, soc: 92.0 },
  { voltage: 13.55, soc: 91.3 },
  { voltage: 13.54, soc: 90.7 },
  { voltage: 13.53, soc: 90.0 },
  { voltage: 13.52, soc: 89.3 },
  { voltage: 13.51, soc: 88.7 },
  { voltage: 13.50, soc: 88.0 },
  { voltage: 13.49, soc: 87.3 },
  { voltage: 13.48, soc: 86.7 },
  { voltage: 13.47, soc: 86.0 },
  { voltage: 13.46, soc: 85.3 },
  { voltage: 13.45, soc: 84.7 },
  { voltage: 13.44, soc: 84.0 },
  { voltage: 13.43, soc: 83.3 },
  { voltage: 13.42, soc: 82.7 },
  { voltage: 13.41, soc: 82.0 },
  { voltage: 13.40, soc: 81.3 },
  { voltage: 13.39, soc: 80.7 },
  { voltage: 13.38, soc: 80.0 },
  { voltage: 13.37, soc: 79.3 },
  { voltage: 13.36, soc: 78.7 },
  { voltage: 13.35, soc: 78.0 },
  { voltage: 13.34, soc: 77.3 },
  { voltage: 13.33, soc: 76.7 },
  { voltage: 13.32, soc: 76.0 },
  { voltage: 13.31, soc: 75.3 },
  { voltage: 13.30, soc: 74.7 },
  { voltage: 13.29, soc: 74.0 },
  { voltage: 13.28, soc: 73.3 },
  { voltage: 13.27, soc: 72.7 },
  { voltage: 13.26, soc: 72.0 },
  { voltage: 13.25, soc: 71.3 },
  { voltage: 13.24, soc: 70.7 },
  { voltage: 13.23, soc: 70.0 },
  { voltage: 13.22, soc: 70.0 },
  { voltage: 13.21, soc: 67.0 },
  { voltage: 13.20, soc: 64.0 },
  { voltage: 13.19, soc: 61.0 },
  { voltage: 13.18, soc: 58.0 },
  { voltage: 13.17, soc: 55.0 },
  { voltage: 13.16, soc: 52.0 },
  { voltage: 13.15, soc: 49.0 },
  { voltage: 13.14, soc: 46.0 },
  { voltage: 13.13, soc: 43.0 },
  { voltage: 13.12, soc: 40.0 },
  { voltage: 13.11, soc: 39.0 },
  { voltage: 13.10, soc: 38.0 },
  { voltage: 13.09, soc: 37.0 },
  { voltage: 13.08, soc: 36.0 },
  { voltage: 13.07, soc: 35.0 },
  { voltage: 13.06, soc: 34.0 },
  { voltage: 13.05, soc: 33.0 },
  { voltage: 13.04, soc: 32.0 },
  { voltage: 13.03, soc: 31.0 },
  { voltage: 13.02, soc: 30.0 },
  { voltage: 13.01, soc: 29.0 },
  { voltage: 13.00, soc: 28.0 },
  { voltage: 12.99, soc: 27.0 },
  { voltage: 12.98, soc: 26.0 },
  { voltage: 12.97, soc: 25.0 },
  { voltage: 12.96, soc: 24.0 },
  { voltage: 12.95, soc: 23.0 },
  { voltage: 12.94, soc: 22.0 },
  { voltage: 12.93, soc: 21.0 },
  { voltage: 12.92, soc: 20.0 },
  { voltage: 12.91, soc: 19.0 },
  { voltage: 12.90, soc: 18.0 },
  { voltage: 12.89, soc: 17.0 },
  { voltage: 12.88, soc: 16.0 },
  { voltage: 12.87, soc: 15.0 },
  { voltage: 12.86, soc: 14.0 },
  { voltage: 12.85, soc: 13.0 },
  { voltage: 12.84, soc: 12.0 },
  { voltage: 12.83, soc: 11.0 },
  { voltage: 12.82, soc: 10.0 },
  { voltage: 12.81, soc: 10.0 },
  { voltage: 12.80, soc: 10.0 },
];

export interface BatteryConfig {
  // Configuración de la batería
  chemistry: string;
  nominalVoltage: number;
  capacityAh: number;
  capacityWh: number;
  capacityKwh: number;
  batteryConfiguration: string;
  numberOfBatteries: number;
  batteryCapacityEach: number; // Ah
  
  // Configuración solar
  solarPowerTotal: number; // W
  numberOfPanels: number;
  panelPowerEach: number; // W
  panelType: string;
  panelConfiguration: string;
  panelVoltage: number; // V
  panelCurrent: number; // A
  
  // Controlador de carga
  controllerType: 'MPPT' | 'PWM';
  controllerCapacity: number; // A
  
  // Configuración general
  dailyConsumptionAh: number;
  safetyReserve: number;
  timezone: string;
}

export const defaultBatteryConfig: BatteryConfig = {
  // Configuración de la batería
  chemistry: 'LiFePO₄',
  nominalVoltage: 12.8,
  capacityAh: 108,
  capacityWh: 1380,
  capacityKwh: 1.38,
  batteryConfiguration: '6 baterías de 12.8V/18Ah en paralelo',
  numberOfBatteries: 6,
  batteryCapacityEach: 18,
  
  // Configuración solar
  solarPowerTotal: 720,
  numberOfPanels: 12,
  panelPowerEach: 60,
  panelType: 'Monocristalino',
  panelConfiguration: '12 paneles en paralelo',
  panelVoltage: 18,
  panelCurrent: 3.2,
  
  // Controlador de carga
  controllerType: 'MPPT',
  controllerCapacity: 30,
  
  // Configuración general
  dailyConsumptionAh: 45,
  safetyReserve: 0,
  timezone: 'America/Guayaquil',
};

export interface ConsumptionProfile {
  startHour: number;
  endHour: number;
  watts: number;
  label: string;
}

export interface ConsumptionTramo {
  id: string;
  name: string;
  period: string;
  startHour: number;
  endHour: number;
  watts: number;
  hours: number;
  wh: number;
  ah: number;
  color: string;
}

import { getNightConsumptionProfile, NIGHT_CONSUMPTION_TRAMOS } from './consumption-constants';

export const nightConsumptionProfile: ConsumptionProfile[] = getNightConsumptionProfile();

export const defaultConsumptionTramos: ConsumptionTramo[] = NIGHT_CONSUMPTION_TRAMOS;