import { create } from 'zustand';

interface AppState {
  onboardingComplete: boolean;
  isUnlockedToday: boolean;
  currentStreak: number;
  totalProfit: number;
  todayScreenTime: number;
}

interface AppActions {
  completeOnboarding: () => void;
  setUnlockedToday: (unlocked: boolean) => void;
  incrementScreenTime: (minutes: number) => void;
  updateStreak: (streak: number) => void;
  addProfit: (amount: number) => void;
  resetDaily: () => void;
}

type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>()((set) => ({
  onboardingComplete: false,
  isUnlockedToday: false,
  currentStreak: 0,
  totalProfit: 0,
  todayScreenTime: 0,

  completeOnboarding: () => set({ onboardingComplete: true }),

  setUnlockedToday: (unlocked) => set({ isUnlockedToday: unlocked }),

  incrementScreenTime: (minutes) =>
    set((state) => ({ todayScreenTime: state.todayScreenTime + minutes })),

  updateStreak: (streak) => set({ currentStreak: streak }),

  addProfit: (amount) =>
    set((state) => ({ totalProfit: state.totalProfit + amount })),

  resetDaily: () => set({ isUnlockedToday: false, todayScreenTime: 0 }),
}));
