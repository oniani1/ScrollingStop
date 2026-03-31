import axios from 'axios';
import CryptoJS from 'crypto-js';

const SPOT_BASE = 'https://api.binance.com';
const FUTURES_BASE = 'https://fapi.binance.com';

interface BinanceTrade {
  symbol: string;
  id: number;
  price: string;
  qty: string;
  commission: string;
  commissionAsset: string;
  time: number;
  isBuyer: boolean;
  realizedPnl?: string; // futures only
}

function createSignedParams(apiKey: string, apiSecret: string, params: Record<string, string> = {}) {
  const timestamp = Date.now().toString();
  const queryParams = { ...params, timestamp };
  const queryString = Object.entries(queryParams)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  const signature = CryptoJS.HmacSHA256(queryString, apiSecret).toString();
  return { queryString: `${queryString}&signature=${signature}`, headers: { 'X-MBX-APIKEY': apiKey } };
}

export async function getSpotTrades(apiKey: string, apiSecret: string, symbol: string = 'BTCUSDT'): Promise<BinanceTrade[]> {
  try {
    const { queryString, headers } = createSignedParams(apiKey, apiSecret, {
      symbol,
      limit: '50',
    });
    const { data } = await axios.get(`${SPOT_BASE}/api/v3/myTrades?${queryString}`, { headers, timeout: 10000 });
    return data;
  } catch (error: any) {
    const msg = error.response?.data?.msg || error.message || 'Binance spot API request failed';
    throw new Error(`Binance Spot: ${msg}`);
  }
}

export async function getFuturesTrades(apiKey: string, apiSecret: string, symbol: string = 'BTCUSDT'): Promise<BinanceTrade[]> {
  try {
    const { queryString, headers } = createSignedParams(apiKey, apiSecret, {
      symbol,
      limit: '50',
    });
    const { data } = await axios.get(`${FUTURES_BASE}/fapi/v1/userTrades?${queryString}`, { headers, timeout: 10000 });
    return data;
  } catch (error: any) {
    const msg = error.response?.data?.msg || error.message || 'Binance futures API request failed';
    throw new Error(`Binance Futures: ${msg}`);
  }
}

export async function testBinanceConnection(apiKey: string, apiSecret: string): Promise<void> {
  try {
    const { queryString, headers } = createSignedParams(apiKey, apiSecret, {});
    await axios.get(`${SPOT_BASE}/api/v3/account?${queryString}`, { headers, timeout: 10000 });
  } catch (error: any) {
    const msg = error.response?.data?.msg || error.message || 'Connection failed';
    throw new Error(msg);
  }
}

// Calculate P&L from spot trades (simplified: looks at buy/sell pairs)
export function calculateSpotPnL(trades: BinanceTrade[]): { profit: number; pair: string; profitPercent: number } | null {
  // Find most recent sell trade and pair with most recent buy
  const sells = trades.filter(t => !t.isBuyer).sort((a, b) => b.time - a.time);
  const buys = trades.filter(t => t.isBuyer).sort((a, b) => b.time - a.time);

  if (sells.length === 0 || buys.length === 0) return null;

  const sell = sells[0];
  const buy = buys[0];

  if (buy.time >= sell.time) return null; // No complete trade

  const buyValue = parseFloat(buy.price) * parseFloat(buy.qty);
  const sellValue = parseFloat(sell.price) * parseFloat(sell.qty);
  const profit = sellValue - buyValue;
  const profitPercent = (profit / buyValue) * 100;

  return { profit, pair: sell.symbol, profitPercent };
}

// Futures P&L is simpler - realizedPnl is provided
export function calculateFuturesPnL(trades: BinanceTrade[]): { profit: number; pair: string; profitPercent: number } | null {
  const withPnl = trades.filter(t => t.realizedPnl && parseFloat(t.realizedPnl!) !== 0);
  if (withPnl.length === 0) return null;

  // Sum recent realized PnL
  const recent = withPnl.sort((a, b) => b.time - a.time).slice(0, 10);
  const totalPnl = recent.reduce((sum, t) => sum + parseFloat(t.realizedPnl!), 0);
  const pair = recent[0].symbol;
  // Estimate percent from first trade
  const firstTradeValue = parseFloat(recent[0].price) * parseFloat(recent[0].qty);
  const profitPercent = firstTradeValue > 0 ? (totalPnl / firstTradeValue) * 100 : 0;

  return { profit: totalPnl, pair, profitPercent };
}
