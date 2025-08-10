import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  VoltageSOCEntry, 
  BatteryConfig, 
  defaultVoltageSOCTable, 
  defaultBatteryConfig,
  ConsumptionProfile,
  nightConsumptionProfile
} from './battery-data';

export interface Profile {
  id: string;
  name: string;
  voltageSOCTable: VoltageSOCEntry[];
  batteryConfig: BatteryConfig;
  consumptionProfile: ConsumptionProfile[];
  createdAt: Date;
  updatedAt: Date;
}

interface BatteryStore {
  currentVoltage: number;
  currentProfileId: string;
  profiles: Profile[];
  
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
  resetToDefaults: () => void;
}

const defaultProfile: Profile = {
  id: 'default',
  name: 'Perfil Principal',
  voltageSOCTable: defaultVoltageSOCTable,
  batteryConfig: defaultBatteryConfig,
  consumptionProfile: nightConsumptionProfile,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const useBatteryStore = create<BatteryStore>()(
  persist(
    (set, get) => ({
      currentVoltage: 13.2,
      currentProfileId: 'default',
      profiles: [defaultProfile],
      
      setVoltage: (voltage) => set({ currentVoltage: voltage }),
      
      getCurrentProfile: () => {
        const state = get();
        return state.profiles.find(p => p.id === state.currentProfileId) || defaultProfile;
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
      
      resetToDefaults: () => {
        const freshDefaultProfile: Profile = {
          id: 'default',
          name: 'Perfil Principal',
          voltageSOCTable: defaultVoltageSOCTable,
          batteryConfig: defaultBatteryConfig,
          consumptionProfile: nightConsumptionProfile,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set({
          currentVoltage: 13.2,
          currentProfileId: 'default',
          profiles: [freshDefaultProfile],
        });
      },
    }),
    {
      name: 'battery-storage',
    }
  )
);