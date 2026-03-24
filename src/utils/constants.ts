import type { BlockedApp } from '../types/models';

export const DEFAULT_BLOCKED_APPS: BlockedApp[] = [
  {
    packageName: 'com.instagram.android',
    displayName: 'Instagram',
    icon: 'camera_enhance',
    enabled: true,
  },
  {
    packageName: 'com.zhiliaoapp.musically',
    displayName: 'TikTok',
    icon: 'music_note',
    enabled: true,
  },
  {
    packageName: 'com.google.android.youtube',
    displayName: 'YouTube',
    icon: 'video_library',
    enabled: true,
  },
  {
    packageName: 'com.twitter.android',
    displayName: 'Twitter/X',
    icon: 'brand_awareness',
    enabled: true,
  },
];

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
    icon: 'rocket',
  },
  {
    id: 'streak_7',
    title: '7-Day Streak',
    subtitle: 'Pure discipline',
    icon: 'local_fire_department',
  },
  {
    id: 'streak_30',
    title: '30-Day Streak',
    subtitle: 'Master of focus',
    icon: 'crown',
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
    icon: 'gem_spark',
    target: 50,
  },
] as const;
