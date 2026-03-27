import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import type { DailyStats, BypassRecord } from '../types/models';

interface StatsState {
  dailyStats: DailyStats[];
  totalUnlocks: number;
  totalBypasses: number;
  bypassRecords: BypassRecord[];
}

interface StatsActions {
  addDailyStats: (stats: DailyStats) => void;
  incrementUnlocks: () => void;
  addBypass: (record: BypassRecord) => void;
  getTodayStats: () => DailyStats | undefined;
}

type StatsStore = StatsState & StatsActions;

export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      dailyStats: [],
      totalUnlocks: 0,
      totalBypasses: 0,
      bypassRecords: [],

      addDailyStats: (stats) =>
        set((state) => ({
          dailyStats: [...state.dailyStats, stats],
        })),

      incrementUnlocks: () =>
        set((state) => ({ totalUnlocks: state.totalUnlocks + 1 })),

      addBypass: (record) =>
        set((state) => ({
          totalBypasses: state.totalBypasses + 1,
          bypassRecords: [...state.bypassRecords, record],
        })),

      getTodayStats: () => {
        const today = dayjs().format('YYYY-MM-DD');
        return get().dailyStats.find((s) => s.date === today);
      },
    }),
    {
      name: 'scrollstop-stats',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
