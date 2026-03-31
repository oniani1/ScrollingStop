import type { BlockedApp } from '../types/models';

export const DEFAULT_BLOCKED_APPS: BlockedApp[] = [];

export const DEFAULT_SETTINGS = {
  dailyLimitMinutes: 60,
  profitThreshold: 50,
  bypassEnabled: true,
  bypassPhrase: 'i am weak and scrolling',
  bypassCooldownMinutes: 5,
  bypassAccessMinutes: 15,
} as const;

export const ACHIEVEMENTS_LIST = [
  {
    id: 'first_trade',
    title: 'First Trade Unlock',
    subtitle: 'Market initialized',
    icon: 'rocket-launch',
  },
  {
    id: 'streak_7',
    title: '7-Day Streak',
    subtitle: 'Pure discipline',
    icon: 'local-fire-department',
  },
  {
    id: 'streak_30',
    title: '30-Day Streak',
    subtitle: 'Master of focus',
    icon: 'military-tech',
  },
  {
    id: 'profit_1000',
    title: '$1,000 Forced Profits',
    subtitle: 'Efficiency gains',
    icon: 'payments',
  },
  {
    id: 'zero_bypass_week',
    title: 'Zero Bypass Week',
    subtitle: 'Iron willpower',
    icon: 'shield',
  },
  {
    id: 'under_30',
    title: 'Under 30 Minutes',
    subtitle: 'Speed racer',
    icon: 'timer',
  },
  {
    id: 'solana_degen',
    title: 'Solana Degen',
    subtitle: 'Ecosystem explorer',
    icon: 'diamond',
  },
  {
    id: 'diamond_hands',
    title: 'Diamond Hands',
    subtitle: 'Long-term vision',
    icon: 'auto-awesome',
    target: 50,
  },
] as const;
