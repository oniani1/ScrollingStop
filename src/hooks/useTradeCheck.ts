import { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { verifyTrades } from '../services/tradeVerifier';
import { appBlocker } from '../services/blockingManager';
import { useTradeStore, useAppStore, useSettingsStore, useStatsStore, useWarModeStore } from '../stores';
import { sendWarEvent } from '../services/warModeService';
import type { RootStackParamList } from '../types/navigation';

export function useTradeCheck() {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const checkTrades = useCallback(async () => {
    setChecking(true);
    setError(null);

    try {
      const tradeState = useTradeStore.getState();
      const settingsState = useSettingsStore.getState();

      const result = await verifyTrades(
        tradeState.binanceConnected ? tradeState.binanceApiKey : undefined,
        tradeState.binanceConnected ? tradeState.binanceApiSecret : undefined,
        tradeState.solanaConnected ? tradeState.solanaWalletAddress : undefined,
        settingsState.profitThreshold
      );

      if (result.qualified && result.trade) {
        // Update stores
        useTradeStore.getState().addTrade(result.trade);
        useTradeStore.getState().setLastTrade(result.trade);
        useAppStore.getState().setUnlockedToday(true);
        useAppStore.getState().addProfit(result.trade.profit);
        useStatsStore.getState().incrementUnlocks();

        // Update native module
        await appBlocker.setUnlockedToday(true);

        // Navigate to celebration
        navigation.navigate('Celebration', { trade: result.trade });

        // Send war event if paired
        const warState = useWarModeStore.getState();
        if (warState.pairId && warState.warriorId) {
          sendWarEvent(warState.pairId, warState.warriorId, 'trade_unlock', {
            pair: result.trade.pair,
            profit: result.trade.profit,
          }).catch(() => {});
        }
      } else {
        setError('No qualifying trades found. Keep trading!');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to check trades');
    } finally {
      setChecking(false);
    }
  }, [navigation]);

  return { checking, error, checkTrades };
}
