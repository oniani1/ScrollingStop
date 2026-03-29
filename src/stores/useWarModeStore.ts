import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WarEvent } from '../types/models';

interface WarModeState {
  isWarrior: boolean;
  warriorId: string | null;
  deviceCode: string | null;
  displayName: string;
  pairId: string | null;
  pairCode: string | null;
  partnerName: string | null;
  partnerId: string | null;
  partnerEvents: WarEvent[];
}

interface WarModeActions {
  setWarrior: (warriorId: string, deviceCode: string, displayName: string) => void;
  setPair: (pairId: string, pairCode: string, partnerId: string | null, partnerName: string | null) => void;
  clearPair: () => void;
  addPartnerEvent: (event: WarEvent) => void;
  setPartnerEvents: (events: WarEvent[]) => void;
  setPartnerInfo: (partnerId: string, partnerName: string) => void;
  reset: () => void;
}

type WarModeStore = WarModeState & WarModeActions;

const initialState: WarModeState = {
  isWarrior: false,
  warriorId: null,
  deviceCode: null,
  displayName: '',
  pairId: null,
  pairCode: null,
  partnerName: null,
  partnerId: null,
  partnerEvents: [],
};

export const useWarModeStore = create<WarModeStore>()(
  persist(
    (set) => ({
      ...initialState,

      setWarrior: (warriorId, deviceCode, displayName) =>
        set({ isWarrior: true, warriorId, deviceCode, displayName }),

      setPair: (pairId, pairCode, partnerId, partnerName) =>
        set({ pairId, pairCode, partnerId, partnerName }),

      clearPair: () =>
        set({ pairId: null, pairCode: null, partnerId: null, partnerName: null, partnerEvents: [] }),

      addPartnerEvent: (event) =>
        set((state) => ({
          partnerEvents: [event, ...state.partnerEvents].slice(0, 50),
        })),

      setPartnerEvents: (events) => set({ partnerEvents: events }),

      setPartnerInfo: (partnerId, partnerName) =>
        set({ partnerId, partnerName }),

      reset: () => set(initialState),
    }),
    {
      name: 'scrollstop-warmode',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isWarrior: state.isWarrior,
        warriorId: state.warriorId,
        deviceCode: state.deviceCode,
        displayName: state.displayName,
        pairId: state.pairId,
        pairCode: state.pairCode,
        partnerId: state.partnerId,
        partnerName: state.partnerName,
      }),
    },
  ),
);
