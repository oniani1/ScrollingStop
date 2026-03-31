import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  onboardingComplete: boolean;
  isUnlockedToday: boolean;
  currentStreak: number;
  totalProfit: number;
  todayScreenTime: number;
  unlockedAchievements: string[];
}

interface AppActions {
  completeOnboarding: () => void;
  setUnlockedToday: (unlocked: boolean) => void;
  setScreenTime: (minutes: number) => void;
  incrementScreenTime: (minutes: number) => void;
  updateStreak: (streak: number) => void;
  addProfit: (amount: number) => void;
  unlockAchievement: (id: string) => void;
  resetDaily: () => void;
}

type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      onboardingComplete: false,
      isUnlockedToday: false,
      currentStreak: 0,
      totalProfit: 0,
      todayScreenTime: 0,
      unlockedAchievements: [],

      completeOnboarding: () => set({ onboardingComplete: true, isUnlockedToday: true }),

      setUnlockedToday: (unlocked) => set({ isUnlockedToday: unlocked }),

      setScreenTime: (minutes) => set({ todayScreenTime: minutes }),

      incrementScreenTime: (minutes) =>
        set((state) => ({ todayScreenTime: state.todayScreenTime + minutes })),

      updateStreak: (streak) => set({ currentStreak: streak }),

      addProfit: (amount) =>
        set((state) => ({ totalProfit: state.totalProfit + amount })),

      unlockAchievement: (id) =>
        set((state) => ({
          unlockedAchievements: state.unlockedAchievements.includes(id)
            ? state.unlockedAchievements
            : [...state.unlockedAchievements, id],
        })),

      resetDaily: () => set({ isUnlockedToday: false, todayScreenTime: 0 }),
    }),
    {
      name: 'scrollstop-app',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
