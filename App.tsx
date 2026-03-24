import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';

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
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
