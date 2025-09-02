/**
 * Store específico para el voltaje actual
 * Separado para carga independiente
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VoltageStore {
  currentVoltage: number;
  lastSync: string | null;
  setVoltage: (voltage: number) => void;
  updateFromDB: (voltage: number) => void;
}

export const useVoltageStore = create<VoltageStore>()(
  persist(
    (set) => ({
      currentVoltage: 13.2,
      lastSync: null,
      
      setVoltage: (voltage) => set({ 
        currentVoltage: voltage,
        lastSync: new Date().toISOString()
      }),
      
      updateFromDB: (voltage) => set({ 
        currentVoltage: voltage,
        lastSync: new Date().toISOString()
      }),
    }),
    {
      name: 'soc-calculator-voltage', // Store separado solo para voltaje
    }
  )
);