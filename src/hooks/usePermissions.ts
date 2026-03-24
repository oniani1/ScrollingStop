import { useCallback, useEffect, useState } from 'react';
import { appBlocker, usageStats, overlay, battery } from '../services/blockingManager';
import { useOnboardingStore } from '../stores';

export function usePermissions() {
  const { setPermission } = useOnboardingStore();
  const [loading, setLoading] = useState(true);

  const checkAll = useCallback(async () => {
    setLoading(true);
    try {
      const [usageAccess, overlayPerm, batteryOpt, accessibility] = await Promise.all([
        usageStats.isUsageAccessGranted(),
        overlay.isOverlayPermissionGranted(),
        battery.isBatteryOptExcluded(),
        appBlocker.isAccessibilityServiceEnabled(),
      ]);
      setPermission('usageAccessGranted', usageAccess);
      setPermission('overlayPermissionGranted', overlayPerm);
      setPermission('batteryOptExcluded', batteryOpt);
      setPermission('accessibilityEnabled', accessibility);
    } catch (e) {
      console.warn('Permission check failed:', e);
    }
    setLoading(false);
  }, [setPermission]);

  useEffect(() => { checkAll(); }, [checkAll]);

  const requestUsageAccess = useCallback(async () => {
    await usageStats.openUsageAccessSettings();
  }, []);

  const requestOverlay = useCallback(async () => {
    await overlay.requestOverlayPermission();
  }, []);

  const requestBattery = useCallback(async () => {
    await battery.requestBatteryOptimizationExclusion();
  }, []);

  const requestAccessibility = useCallback(async () => {
    await appBlocker.openAccessibilitySettings();
  }, []);

  return { loading, checkAll, requestUsageAccess, requestOverlay, requestBattery, requestAccessibility };
}
