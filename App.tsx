import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { useDailyReset } from './src/hooks/useDailyReset';
import { checkAchievements } from './src/services/achievementEngine';
import { useAppStore, useStatsStore, useTradeStore } from './src/stores';

function AppInner() {
  useDailyReset();

  // Run achievement checks whenever relevant state changes
  const totalProfit = useAppStore((s) => s.totalProfit);
  const currentStreak = useAppStore((s) => s.currentStreak);
  const todayScreenTime = useAppStore((s) => s.todayScreenTime);
  const unlockedAchievements = useAppStore((s) => s.unlockedAchievements);
  const unlockAchievement = useAppStore((s) => s.unlockAchievement);
  const totalUnlocks = useStatsStore((s) => s.totalUnlocks);
  const totalBypasses = useStatsStore((s) => s.totalBypasses);
  const trades = useTradeStore((s) => s.trades);

  useEffect(() => {
    const hasSolanaTrade = trades.some((t) => t.source === 'solana');
    const results = checkAchievements(
      { totalProfit, currentStreak, totalUnlocks, totalBypasses, weekBypasses: totalBypasses, todayScreenTime, hasSolanaTrade },
      new Set(unlockedAchievements),
    );
    results.forEach((a) => {
      if (a.unlocked && !unlockedAchievements.includes(a.id)) {
        unlockAchievement(a.id);
      }
    });
  }, [totalProfit, currentStreak, todayScreenTime, totalUnlocks, totalBypasses, trades, unlockedAchievements, unlockAchievement]);

  return <RootNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: '#4F8CFF',
            background: '#0A0A0F',
            card: '#131318',
            text: '#e4e1e9',
            border: 'rgba(255,255,255,0.08)',
            notification: '#4F8CFF',
          },
          fonts: {
            regular: { fontFamily: 'Inter', fontWeight: '400' },
            medium: { fontFamily: 'Inter', fontWeight: '500' },
            bold: { fontFamily: 'Inter', fontWeight: '700' },
            heavy: { fontFamily: 'Inter', fontWeight: '800' },
          },
        }}
      >
        <AppInner />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
