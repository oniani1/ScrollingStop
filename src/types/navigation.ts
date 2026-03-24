import type { TradeRecord } from './models';

export type OnboardingStackParamList = {
  Welcome: undefined;
  Permissions: undefined;
  SetLimits: undefined;
  TradingSetup: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Achievements: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  Celebration: { trade: TradeRecord };
  ShareStats: undefined;
  Bypass: undefined;
};
