/**
 * Store para el perfil de batería activo
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tables } from '@/lib/supabase/database.types';

export type BatteryProfile = Tables<'battery_profiles'>;
export type VoltageSOCPoint = Tables<'voltage_soc_points'>;

interface BatteryProfileStore {
  profile: BatteryProfile | null;
  voltageSOCPoints: VoltageSOCPoint[];
  lastSync: string | null;
  
  setProfile: (profile: BatteryProfile) => void;
  setVoltageSOCPoints: (points: VoltageSOCPoint[]) => void;
  clear: () => void;
}

export const useBatteryProfileStore = create<BatteryProfileStore>()(
  persist(
    (set) => ({
      profile: null,
      voltageSOCPoints: [],
      lastSync: null,
      
      setProfile: (profile) => set({ 
        profile,
        lastSync: new Date().toISOString()
      }),
      
      setVoltageSOCPoints: (points) => set({ 
        voltageSOCPoints: points,
        lastSync: new Date().toISOString()
      }),
      
      clear: () => set({
        profile: null,
        voltageSOCPoints: [],
        lastSync: null,
      }),
    }),
    {
      name: 'soc-calculator-battery-profile', // Store separado para perfil
    }
  )
);