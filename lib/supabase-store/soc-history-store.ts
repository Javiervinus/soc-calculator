'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tables } from '@/lib/supabase/database.types';

export type DailySOCRecord = Tables<'daily_soc_records'>;

interface SOCHistoryState {
  todayEntry: DailySOCRecord | null;
  history: DailySOCRecord[];
  lastSync: number | null;
  
  // Actions
  setTodayEntry: (entry: DailySOCRecord | null) => void;
  setHistory: (history: DailySOCRecord[]) => void;
  updateFromDB: (todayEntry: DailySOCRecord | null, history: DailySOCRecord[]) => void;
  clearStore: () => void;
}

export const useSOCHistoryStore = create<SOCHistoryState>()(
  persist(
    (set) => ({
      todayEntry: null,
      history: [],
      lastSync: null,
      
      setTodayEntry: (entry) => set({ 
        todayEntry: entry,
        lastSync: Date.now() 
      }),
      
      setHistory: (history) => set({ 
        history,
        lastSync: Date.now() 
      }),
      
      updateFromDB: (todayEntry, history) => set({
        todayEntry,
        history,
        lastSync: Date.now()
      }),
      
      clearStore: () => set({
        todayEntry: null,
        history: [],
        lastSync: null
      }),
    }),
    {
      name: 'soc-history-storage',
      version: 1,
    }
  )
);