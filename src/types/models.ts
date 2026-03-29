export interface BlockedApp {
  packageName: string;
  displayName: string;
  icon: string;
  enabled: boolean;
}

export interface TradeRecord {
  id: string;
  source: 'binance' | 'solana';
  pair: string;
  profit: number;
  profitPercent: number;
  timestamp: number;
  qualified: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  target?: number;
}

export interface DailyStats {
  date: string;
  screenTimeMinutes: number;
  tradeUnlocks: number;
  bypasses: number;
  totalProfit: number;
}

export interface BypassRecord {
  timestamp: number;
  phrase: string;
  durationMinutes: number;
}

export interface TradingConnection {
  type: 'binance' | 'solana';
  connected: boolean;
  apiKey?: string;
  apiSecret?: string;
  walletAddress?: string;
  lastChecked?: number;
}

export interface AppSettings {
  dailyLimitMinutes: number;
  profitThreshold: number;
  bypassEnabled: boolean;
  bypassPhrase: string;
  bypassCooldownMinutes: number;
  bypassAccessMinutes: number;
  blockedApps: BlockedApp[];
  onboardingComplete: boolean;
  hapticHeartbeatEnabled: boolean;
}

export interface TickerPrice {
  symbol: string;
  price: string;
  priceChangePercent: string;
}

export interface Warrior {
  id: string;
  device_code: string;
  display_name: string;
  created_at: string;
}

export interface WarPair {
  id: string;
  warrior_a: string;
  warrior_b: string | null;
  pair_code: string;
  active: boolean;
  created_at: string;
}

export interface WarEvent {
  id: string;
  pair_id: string;
  warrior_id: string;
  event_type: 'bypass_attempt' | 'bypass_complete' | 'trade_unlock' | 'streak_milestone';
  data: Record<string, unknown>;
  created_at: string;
}
