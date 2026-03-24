import { create } from 'zustand';

interface OnboardingState {
  currentStep: number;
  usageAccessGranted: boolean;
  overlayPermissionGranted: boolean;
  batteryOptExcluded: boolean;
  accessibilityEnabled: boolean;
}

type PermissionKey =
  | 'usageAccessGranted'
  | 'overlayPermissionGranted'
  | 'batteryOptExcluded'
  | 'accessibilityEnabled';

interface OnboardingActions {
  nextStep: () => void;
  prevStep: () => void;
  setPermission: (key: PermissionKey, granted: boolean) => void;
}

type OnboardingStore = OnboardingState & OnboardingActions;

export const useOnboardingStore = create<OnboardingStore>()((set) => ({
  currentStep: 0,
  usageAccessGranted: false,
  overlayPermissionGranted: false,
  batteryOptExcluded: false,
  accessibilityEnabled: false,

  nextStep: () =>
    set((state) => ({ currentStep: Math.min(state.currentStep + 1, 3) })),

  prevStep: () =>
    set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),

  setPermission: (key, granted) => set({ [key]: granted }),
}));
