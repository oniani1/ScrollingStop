import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TradeRecord } from '../types/models';

interface TradeState {
  binanceConnected: boolean;
  solanaConnected: boolean;
  binanceApiKey: string;
  binanceApiSecret: string;
  solanaWalletAddress: string;
  lastTrade: TradeRecord | null;
  isChecking: boolean;
  trades: TradeRecord[];
}

interface TradeActions {
  connectBinance: (apiKey: string, apiSecret: string) => void;
  disconnectBinance: () => void;
  connectSolana: (walletAddress: string) => void;
  disconnectSolana: () => void;
  setChecking: (checking: boolean) => void;
  addTrade: (trade: TradeRecord) => void;
  setLastTrade: (trade: TradeRecord | null) => void;
}

type TradeStore = TradeState & TradeActions;

export const useTradeStore = create<TradeStore>()(
  persist(
    (set) => ({
      binanceConnected: false,
      solanaConnected: false,
      binanceApiKey: '',
      binanceApiSecret: '',
      solanaWalletAddress: '',
      lastTrade: null,
      isChecking: false,
      trades: [],

      connectBinance: (apiKey, apiSecret) =>
        set({ binanceConnected: true, binanceApiKey: apiKey, binanceApiSecret: apiSecret }),

      disconnectBinance: () =>
        set({ binanceConnected: false, binanceApiKey: '', binanceApiSecret: '' }),

      connectSolana: (walletAddress) =>
        set({ solanaConnected: true, solanaWalletAddress: walletAddress }),

      disconnectSolana: () =>
        set({ solanaConnected: false, solanaWalletAddress: '' }),

      setChecking: (checking) => set({ isChecking: checking }),

      addTrade: (trade) =>
        set((state) => ({ trades: [...state.trades, trade] })),

      setLastTrade: (trade) => set({ lastTrade: trade }),
    }),
    {
      name: 'scrollstop-trades',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        binanceConnected: state.binanceConnected,
        binanceApiKey: state.binanceApiKey,
        binanceApiSecret: state.binanceApiSecret,
        solanaConnected: state.solanaConnected,
        solanaWalletAddress: state.solanaWalletAddress,
        trades: state.trades,
        lastTrade: state.lastTrade,
      }),
    },
  ),
);
