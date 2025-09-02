/**
 * Store para la configuración del sistema solar
 * Persiste en localStorage para funcionamiento offline
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tables } from '@/lib/supabase/database.types';

export type SolarSystemConfig = Tables<'solar_system_config'>;

interface SolarConfigStore {
  solarConfig: SolarSystemConfig | null;
  lastSync: string | null;
  
  setSolarConfig: (config: SolarSystemConfig) => void;
  clear: () => void;
}

export const useSolarConfigStore = create<SolarConfigStore>()(
  persist(
    (set) => ({
      solarConfig: null,
      lastSync: null,
      
      setSolarConfig: (config) => set({ 
        solarConfig: config,
        lastSync: new Date().toISOString()
      }),
      
      clear: () => set({
        solarConfig: null,
        lastSync: null,
      }),
    }),
    {
      name: 'soc-calculator-solar-config', // Store separado para configuración solar
    }
  )
);