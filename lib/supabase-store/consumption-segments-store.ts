/**
 * Store para los segmentos de consumo
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tables } from '@/lib/supabase/database.types';

export type ConsumptionSegment = Tables<'consumption_segments'>;

interface ConsumptionSegmentsStore {
  segments: ConsumptionSegment[];
  lastSync: string | null;
  
  setSegments: (segments: ConsumptionSegment[]) => void;
  clear: () => void;
}

export const useConsumptionSegmentsStore = create<ConsumptionSegmentsStore>()(
  persist(
    (set) => ({
      segments: [],
      lastSync: null,
      
      setSegments: (segments) => set({ 
        segments,
        lastSync: new Date().toISOString()
      }),
      
      clear: () => set({
        segments: [],
        lastSync: null,
      }),
    }),
    {
      name: 'soc-calculator-consumption-segments', // Store separado para segmentos
    }
  )
);