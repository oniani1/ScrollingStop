export interface AppBlockerModule {
  isAccessibilityServiceEnabled(): Promise<boolean>;
  openAccessibilitySettings(): Promise<void>;
  updateBlockedApps(packages: string[]): Promise<void>;
  setUnlockedToday(unlocked: boolean): Promise<void>;
}

export interface UsageStatsModule {
  isUsageAccessGranted(): Promise<boolean>;
  openUsageAccessSettings(): Promise<void>;
  getUsageToday(): Promise<number>;
}

export interface OverlayModule {
  isOverlayPermissionGranted(): Promise<boolean>;
  requestOverlayPermission(): Promise<void>;
}

export interface BatteryOptModule {
  isBatteryOptExcluded(): Promise<boolean>;
  requestBatteryOptimizationExclusion(): Promise<void>;
}
