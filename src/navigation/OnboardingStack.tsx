import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../types/navigation';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import PermissionsScreen from '../screens/onboarding/PermissionsScreen';
import SetLimitsScreen from '../screens/onboarding/SetLimitsScreen';
import TradingSetupScreen from '../screens/onboarding/TradingSetupScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#0A0A0F' },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
      <Stack.Screen name="SetLimits" component={SetLimitsScreen} />
      <Stack.Screen name="TradingSetup" component={TradingSetupScreen} />
    </Stack.Navigator>
  );
}
