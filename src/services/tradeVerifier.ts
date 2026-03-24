import { getSpotTrades, getFuturesTrades, calculateSpotPnL, calculateFuturesPnL } from './binanceApi';
import { estimateSwapPnL } from './solanaApi';
import type { TradeRecord } from '../types/models';

interface VerifyResult {
  qualified: boolean;
  trade: TradeRecord | null;
}

export async function verifyTrades(
  binanceApiKey: string | undefined,
  binanceApiSecret: string | undefined,
  solanaWalletAddress: string | undefined,
  profitThreshold: number
): Promise<VerifyResult> {
  const results: { profit: number; pair: string; profitPercent: number; source: 'binance' | 'solana' }[] = [];

  // Check Binance
  if (binanceApiKey && binanceApiSecret) {
    try {
      // Check futures first (has direct realizedPnl)
      const futuresTrades = await getFuturesTrades(binanceApiKey, binanceApiSecret);
      const futuresPnl = calculateFuturesPnL(futuresTrades);
      if (futuresPnl) results.push({ ...futuresPnl, source: 'binance' });

      // Then spot
      const spotTrades = await getSpotTrades(binanceApiKey, binanceApiSecret);
      const spotPnl = calculateSpotPnL(spotTrades);
      if (spotPnl) results.push({ ...spotPnl, source: 'binance' });
    } catch (error) {
      console.warn('Binance trade check failed:', error);
    }
  }

  // Check Solana
  if (solanaWalletAddress) {
    try {
      const solanaPnl = await estimateSwapPnL(solanaWalletAddress);
      if (solanaPnl) results.push({ ...solanaPnl, source: 'solana' });
    } catch (error) {
      console.warn('Solana trade check failed:', error);
    }
  }

  // Find best qualifying trade
  const qualifying = results
    .filter(r => r.profit >= profitThreshold)
    .sort((a, b) => b.profit - a.profit);

  if (qualifying.length > 0) {
    const best = qualifying[0];
    const trade: TradeRecord = {
      id: `${best.source}_${Date.now()}`,
      source: best.source,
      pair: best.pair,
      profit: best.profit,
      profitPercent: best.profitPercent,
      timestamp: Date.now(),
      qualified: true,
    };
    return { qualified: true, trade };
  }

  return { qualified: false, trade: null };
}
