import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, BlockedApp } from '../types/models';
import { DEFAULT_BLOCKED_APPS } from '../utils/constants';

interface SettingsActions {
  setDailyLimit: (mins: number) => void;
  setProfitThreshold: (amount: number) => void;
  setBypassEnabled: (enabled: boolean) => void;
  setBypassPhrase: (phrase: string) => void;
  setHapticHeartbeat: (enabled: boolean) => void;
  toggleApp: (packageName: string) => void;
  addApp: (app: BlockedApp) => void;
  removeApp: (packageName: string) => void;
}

type SettingsStore = AppSettings & SettingsActions;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      dailyLimitMinutes: 60,
      profitThreshold: 50,
      bypassEnabled: true,
      bypassPhrase: 'i am weak and scrolling',
      bypassCooldownMinutes: 5,
      bypassAccessMinutes: 15,
      blockedApps: DEFAULT_BLOCKED_APPS,
      onboardingComplete: false,
      hapticHeartbeatEnabled: true,

      setDailyLimit: (mins) => set({ dailyLimitMinutes: mins }),
      setProfitThreshold: (amount) => set({ profitThreshold: amount }),
      setBypassEnabled: (enabled) => set({ bypassEnabled: enabled }),
      setBypassPhrase: (phrase) => set({ bypassPhrase: phrase }),
      setHapticHeartbeat: (enabled) => set({ hapticHeartbeatEnabled: enabled }),

      toggleApp: (packageName) =>
        set((state) => ({
          blockedApps: state.blockedApps.map((app) =>
            app.packageName === packageName ? { ...app, enabled: !app.enabled } : app,
          ),
        })),

      addApp: (app) =>
        set((state) => ({ blockedApps: [...state.blockedApps, app] })),

      removeApp: (packageName) =>
        set((state) => ({
          blockedApps: state.blockedApps.filter(
            (app) => app.packageName !== packageName,
          ),
        })),
    }),
    {
      name: 'scrollstop-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
