import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  VoltageSOCEntry, 
  BatteryConfig, 
  defaultVoltageSOCTable, 
  defaultBatteryConfig,
  ConsumptionProfile,
  ConsumptionTramo,
  nightConsumptionProfile,
  defaultConsumptionTramos
} from './battery-data';

export interface SOCHistoryEntry {
  date: string; // formato YYYY-MM-DD
  timestamp: Date;
  soc: number;
}

export interface Profile {
  id: string;
  name: string;
  voltageSOCTable: VoltageSOCEntry[];
  batteryConfig: BatteryConfig;
  consumptionProfile: ConsumptionProfile[];
  consumptionTramos: ConsumptionTramo[];
  socHistory: SOCHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

interface BatteryStore {
  currentVoltage: number;
  currentProfileId: string;
  profiles: Profile[];
  theme: 'light' | 'dark';
  
  setVoltage: (voltage: number) => void;
  getCurrentProfile: () => Profile;
  setCurrentProfile: (profileId: string) => void;
  createProfile: (name: string) => void;
  updateProfile: (profileId: string, updates: Partial<Profile>) => void;
  deleteProfile: (profileId: string) => void;
  importProfile: (profileData: Partial<Profile>) => void;
  updateVoltageSOCTable: (table: VoltageSOCEntry[]) => void;
  updateBatteryConfig: (config: Partial<BatteryConfig>) => void;
  updateConsumptionProfile: (profile: ConsumptionProfile[]) => void;
  updateConsumptionTramos: (tramos: ConsumptionTramo[]) => void;
  addConsumptionTramo: (tramo: ConsumptionTramo) => void;
  updateConsumptionTramo: (id: string, updates: Partial<ConsumptionTramo>) => void;
  deleteConsumptionTramo: (id: string) => void;
  saveDailySOC: (soc: number) => { success: boolean; message: string };
  getTodaySOCEntry: () => SOCHistoryEntry | null;
  getSOCHistory: () => SOCHistoryEntry[];
  clearSOCHistory: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  resetToDefaults: () => void;
}

const defaultProfile: Profile = {
  id: 'default',
  name: 'Perfil Principal',
  voltageSOCTable: defaultVoltageSOCTable,
  batteryConfig: defaultBatteryConfig,
  consumptionProfile: nightConsumptionProfile,
  consumptionTramos: defaultConsumptionTramos,
  socHistory: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const useBatteryStore = create<BatteryStore>()(
  persist(
    (set, get) => ({
      currentVoltage: 13.2,
      currentProfileId: 'default',
      profiles: [defaultProfile],
      theme: 'light', // Siempre inicia en modo claro
      
      setVoltage: (voltage) => set({ currentVoltage: voltage }),
      
      setTheme: (theme) => set({ theme }),
      
      getCurrentProfile: () => {
        const state = get();
        const profile = state.profiles.find(p => p.id === state.currentProfileId) || defaultProfile;
        
        // Migración automática: agregar consumptionTramos si no existe
        if (!profile.consumptionTramos) {
          profile.consumptionTramos = defaultConsumptionTramos;
        }
        // Migración automática: agregar socHistory si no existe
        if (!profile.socHistory) {
          profile.socHistory = [];
        }
        
        return profile;
      },
      
      setCurrentProfile: (profileId) => set({ currentProfileId: profileId }),
      
      createProfile: (name) => {
        const newProfile: Profile = {
          ...defaultProfile,
          id: Date.now().toString(),
          name,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          profiles: [...state.profiles, newProfile],
          currentProfileId: newProfile.id,
        }));
      },
      
      updateProfile: (profileId, updates) => {
        set((state) => ({
          profiles: state.profiles.map(p =>
            p.id === profileId
              ? { ...p, ...updates, updatedAt: new Date() }
              : p
          ),
        }));
      },
      
      deleteProfile: (profileId) => {
        set((state) => {
          if (state.profiles.length <= 1) return state;
          const newProfiles = state.profiles.filter(p => p.id !== profileId);
          const newCurrentId = state.currentProfileId === profileId 
            ? newProfiles[0].id 
            : state.currentProfileId;
          return {
            profiles: newProfiles,
            currentProfileId: newCurrentId,
          };
        });
      },
      
      importProfile: (profileData) => {
        const newProfile: Profile = {
          id: Date.now().toString(),
          name: profileData.name || 'Perfil Importado',
          voltageSOCTable: profileData.voltageSOCTable || defaultVoltageSOCTable,
          batteryConfig: profileData.batteryConfig || defaultBatteryConfig,
          consumptionProfile: profileData.consumptionProfile || nightConsumptionProfile,
          consumptionTramos: profileData.consumptionTramos || defaultConsumptionTramos,
          socHistory: profileData.socHistory || [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          profiles: [...state.profiles, newProfile],
          currentProfileId: newProfile.id,
        }));
      },
      
      updateVoltageSOCTable: (table) => {
        const state = get();
        const profileId = state.currentProfileId;
        state.updateProfile(profileId, { voltageSOCTable: table });
      },
      
      updateBatteryConfig: (config) => {
        const state = get();
        const profileId = state.currentProfileId;
        const currentProfile = state.getCurrentProfile();
        state.updateProfile(profileId, {
          batteryConfig: { ...currentProfile.batteryConfig, ...config },
        });
      },
      
      updateConsumptionProfile: (profile) => {
        const state = get();
        const profileId = state.currentProfileId;
        state.updateProfile(profileId, { consumptionProfile: profile });
      },
      
      updateConsumptionTramos: (tramos) => {
        const state = get();
        const profileId = state.currentProfileId;
        // Actualizar también el consumptionProfile cuando se actualicen los tramos
        const newProfile = tramos.map(tramo => ({
          startHour: tramo.startHour,
          endHour: tramo.endHour,
          watts: tramo.watts,
          label: `${tramo.period} (${tramo.name})`
        }));
        state.updateProfile(profileId, { 
          consumptionTramos: tramos,
          consumptionProfile: newProfile
        });
      },
      
      addConsumptionTramo: (tramo) => {
        const state = get();
        const currentProfile = state.getCurrentProfile();
        const newTramos = [...currentProfile.consumptionTramos, tramo];
        state.updateConsumptionTramos(newTramos);
      },
      
      updateConsumptionTramo: (id, updates) => {
        const state = get();
        const currentProfile = state.getCurrentProfile();
        const newTramos = currentProfile.consumptionTramos.map(t => {
          if (t.id === id) {
            const updated = { ...t, ...updates };
            // Recalcular wh y ah si se cambian watts o hours
            if (updates.watts !== undefined || updates.hours !== undefined) {
              const watts = updates.watts !== undefined ? updates.watts : t.watts;
              const hours = updates.hours !== undefined ? updates.hours : t.hours;
              updated.wh = watts * hours;
              updated.ah = Number((updated.wh / 12.8).toFixed(1));
            }
            // Recalcular hours si se cambian las horas
            if (updates.startHour !== undefined || updates.endHour !== undefined) {
              const start = updates.startHour !== undefined ? updates.startHour : t.startHour;
              const end = updates.endHour !== undefined ? updates.endHour : t.endHour;
              updated.hours = end > start ? end - start : (24 - start) + (end === 24 ? 0 : end);
              updated.wh = updated.watts * updated.hours;
              updated.ah = Number((updated.wh / 12.8).toFixed(1));
              // Actualizar el período
              const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;
              updated.period = `${formatHour(start)}-${formatHour(end === 24 ? 0 : end)}`;
            }
            return updated;
          }
          return t;
        });
        state.updateConsumptionTramos(newTramos);
      },
      
      deleteConsumptionTramo: (id) => {
        const state = get();
        const currentProfile = state.getCurrentProfile();
        const newTramos = currentProfile.consumptionTramos.filter(t => t.id !== id);
        state.updateConsumptionTramos(newTramos);
      },
      
      saveDailySOC: (soc) => {
        const state = get();
        const currentProfile = state.getCurrentProfile();
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Verificar si ya hay una entrada para hoy
        const todayEntry = currentProfile.socHistory?.find(entry => entry.date === todayStr);
        
        if (todayEntry) {
          return { 
            success: false, 
            message: 'Ya se guardó el SOC de hoy' 
          };
        }
        
        // Crear nueva entrada
        const newEntry: SOCHistoryEntry = {
          date: todayStr,
          timestamp: today,
          soc
        };
        
        // Actualizar el histórico
        const newHistory = [...(currentProfile.socHistory || []), newEntry]
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        state.updateProfile(state.currentProfileId, { socHistory: newHistory });
        
        return { 
          success: true, 
          message: 'SOC guardado exitosamente' 
        };
      },
      
      getTodaySOCEntry: () => {
        const state = get();
        const currentProfile = state.getCurrentProfile();
        const todayStr = new Date().toISOString().split('T')[0];
        
        return currentProfile.socHistory?.find(entry => entry.date === todayStr) || null;
      },
      
      getSOCHistory: () => {
        const state = get();
        const currentProfile = state.getCurrentProfile();
        return currentProfile.socHistory || [];
      },
      
      clearSOCHistory: () => {
        const state = get();
        state.updateProfile(state.currentProfileId, { socHistory: [] });
      },
      
      resetToDefaults: () => {
        const freshDefaultProfile: Profile = {
          id: 'default',
          name: 'Perfil Principal',
          voltageSOCTable: defaultVoltageSOCTable,
          batteryConfig: defaultBatteryConfig,
          consumptionProfile: nightConsumptionProfile,
          consumptionTramos: defaultConsumptionTramos,
          socHistory: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set({
          currentVoltage: 13.2,
          currentProfileId: 'default',
          profiles: [freshDefaultProfile],
          theme: 'light', // Resetear tema también
        });
      },
    }),
    {
      name: 'battery-storage',
    }
  )
);