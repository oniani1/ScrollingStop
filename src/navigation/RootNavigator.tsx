import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAppStore } from '../stores/useAppStore';
import OnboardingStack from './OnboardingStack';
import MainTabs from './MainTabs';
import TradeUnlockCelebrationModal from '../screens/modals/TradeUnlockCelebrationModal';
import ShareStatsModal from '../screens/modals/ShareStatsModal';
import BypassModal from '../screens/modals/BypassModal';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const onboardingComplete = useAppStore((state) => state.onboardingComplete);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0A0F' },
      }}
    >
      {!onboardingComplete ? (
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
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
    </Stack.Navigator>
  );
}
