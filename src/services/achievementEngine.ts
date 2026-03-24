import type { Achievement } from '../types/models';
import { ACHIEVEMENTS_LIST } from '../utils/constants';

interface AchievementContext {
  totalProfit: number;
  currentStreak: number;
  totalUnlocks: number;
  totalBypasses: number;
  weekBypasses: number;
  todayScreenTime: number;
  hasSolanaTrade: boolean;
}

const RULES: Record<string, (ctx: AchievementContext) => boolean> = {
  first_trade: (ctx) => ctx.totalUnlocks >= 1,
  streak_7: (ctx) => ctx.currentStreak >= 7,
  streak_30: (ctx) => ctx.currentStreak >= 30,
  profit_1000: (ctx) => ctx.totalProfit >= 1000,
  zero_bypass_week: (ctx) => ctx.currentStreak >= 7 && ctx.weekBypasses === 0,
  under_30: (ctx) => ctx.todayScreenTime > 0 && ctx.todayScreenTime < 30,
  solana_degen: (ctx) => ctx.hasSolanaTrade,
  diamond_hands: (ctx) => ctx.totalUnlocks >= 50,
};

export function checkAchievements(
  ctx: AchievementContext,
  existingUnlocked: Set<string>
): Achievement[] {
  return ACHIEVEMENTS_LIST.map(a => {
    const wasUnlocked = existingUnlocked.has(a.id);
    const rule = RULES[a.id];
    const nowUnlocked = wasUnlocked || (rule ? rule(ctx) : false);

    return {
      id: a.id,
      title: a.title,
      subtitle: a.subtitle,
      icon: a.icon,
      unlocked: nowUnlocked,
      unlockedDate: nowUnlocked && !wasUnlocked ? new Date().toISOString() : undefined,
      progress: a.id === 'diamond_hands' ? ctx.totalUnlocks : undefined,
      target: a.id === 'diamond_hands' ? a.target : undefined,
    } as Achievement;
  });
}

export function getNewlyUnlocked(
  ctx: AchievementContext,
  existingUnlocked: Set<string>
): Achievement[] {
  return checkAchievements(ctx, existingUnlocked).filter(
    a => a.unlocked && !existingUnlocked.has(a.id)
  );
}
