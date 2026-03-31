import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAppStore } from '../stores/useAppStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import OnboardingStack from './OnboardingStack';
import MainTabs from './MainTabs';
import BlockedScreen from '../screens/main/BlockedScreen';
import TradeUnlockCelebrationModal from '../screens/modals/TradeUnlockCelebrationModal';
import ShareStatsModal from '../screens/modals/ShareStatsModal';
import BypassModal from '../screens/modals/BypassModal';
import ShameReceiptModal from '../screens/modals/ShameReceiptModal';
import GraveyardScreen from '../screens/main/GraveyardScreen';
import WarModeScreen from '../screens/main/WarModeScreen';
import TradingSetupScreen from '../screens/onboarding/TradingSetupScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const todayScreenTime = useAppStore((s) => s.todayScreenTime);
  const isUnlockedToday = useAppStore((s) => s.isUnlockedToday);
  const dailyLimitMinutes = useSettingsStore((s) => s.dailyLimitMinutes);

  const isBlocked =
    onboardingComplete &&
    todayScreenTime >= dailyLimitMinutes &&
    !isUnlockedToday;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0A0F' },
      }}
    >
      {!onboardingComplete ? (
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
      ) : isBlocked ? (
        <Stack.Screen name="Blocked" component={BlockedScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
      <Stack.Screen
        name="Celebration"
        component={TradeUnlockCelebrationModal}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="ShareStats"
        component={ShareStatsModal}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="Bypass"
        component={BypassModal}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="ShameReceipt"
        component={ShameReceiptModal}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="Graveyard"
        component={GraveyardScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="WarMode"
        component={WarModeScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="TradingSetup"
        component={TradingSetupScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}
