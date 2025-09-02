/**
 * Store para las preferencias de usuario (temas, configuración UI)
 * Separado del voltaje aunque estén en la misma tabla porque:
 * - El voltaje cambia frecuentemente
 * - Las preferencias UI cambian raramente  
 * - Son dominios diferentes
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tables } from '@/lib/supabase/database.types';

export type UserPreferences = Pick<
  Tables<'user_preferences'>, 
  'theme' | 'app_theme' | 'timezone' | 
  'prediction_efficiency' | 'prediction_tilt_angle' | 
  'prediction_azimuth' | 'prediction_temperature_coefficient'
>;

interface UserPreferencesStore {
  // Datos
  preferences: UserPreferences | null;
  lastSync: string | null;
  
  // Acciones
  setPreferences: (preferences: UserPreferences) => void;
  updateTheme: (theme: string) => void;
  updateAppTheme: (appTheme: string) => void;
  updatePredictionParams: (params: Partial<UserPreferences>) => void;
  clear: () => void;
}

// Valores por defecto
const defaultPreferences: UserPreferences = {
  theme: 'light',
  app_theme: 'default',
  timezone: 'America/Guayaquil',
  prediction_efficiency: 0.75,
  prediction_tilt_angle: 10,
  prediction_azimuth: 0,
  prediction_temperature_coefficient: -0.004
};

export const useUserPreferencesStore = create<UserPreferencesStore>()(
  persist(
    (set, get) => ({
      preferences: null,
      lastSync: null,
      
      setPreferences: (preferences) => set({ 
        preferences,
        lastSync: new Date().toISOString()
      }),
      
      updateTheme: (theme) => {
        const current = get().preferences || defaultPreferences;
        set({
          preferences: { ...current, theme },
          lastSync: new Date().toISOString()
        });
      },
      
      updateAppTheme: (appTheme) => {
        const current = get().preferences || defaultPreferences;
        set({
          preferences: { ...current, app_theme: appTheme },
          lastSync: new Date().toISOString()
        });
      },
      
      updatePredictionParams: (params) => {
        const current = get().preferences || defaultPreferences;
        set({
          preferences: { ...current, ...params },
          lastSync: new Date().toISOString()
        });
      },
      
      clear: () => set({
        preferences: null,
        lastSync: null,
      }),
    }),
    {
      name: 'soc-calculator-user-preferences', // Store separado para preferencias UI
    }
  )
);