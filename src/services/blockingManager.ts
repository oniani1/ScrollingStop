import { NativeModules, Platform } from 'react-native';
import type { AppBlockerModule, UsageStatsModule, OverlayModule, BatteryOptModule } from '../types/native';

const { AppBlockerModule: NativeAppBlocker, UsageStatsModule: NativeUsageStats,
        OverlayModule: NativeOverlay, BatteryOptModule: NativeBattery } = NativeModules;

// Wrap with fallback for development/non-Android
function nativeOrMock<T>(module: T | undefined, mockMethods: Record<string, (...args: any[]) => any>): T {
  if (Platform.OS !== 'android' || !module) {
    return mockMethods as unknown as T;
  }
  return module;
}

export const appBlocker = nativeOrMock<AppBlockerModule>(NativeAppBlocker, {
  isAccessibilityServiceEnabled: async () => false,
  openAccessibilitySettings: async () => {},
  updateBlockedApps: async () => {},
  setUnlockedToday: async () => {},
});

export const usageStats = nativeOrMock<UsageStatsModule>(NativeUsageStats, {
  isUsageAccessGranted: async () => false,
  openUsageAccessSettings: async () => {},
  getUsageToday: async () => 0,
});

export const overlay = nativeOrMock<OverlayModule>(NativeOverlay, {
  isOverlayPermissionGranted: async () => false,
  requestOverlayPermission: async () => {},
});

export const battery = nativeOrMock<BatteryOptModule>(NativeBattery, {
  isBatteryOptExcluded: async () => false,
  requestBatteryOptimizationExclusion: async () => {},
});
