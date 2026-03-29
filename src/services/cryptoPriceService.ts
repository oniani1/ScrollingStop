import axios from 'axios';

export interface TickerPrice {
  symbol: string;
  price: string;
  priceChangePercent: string;
}

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];

export async function fetchTickerPrices(): Promise<TickerPrice[]> {
  try {
    const { data } = await axios.get<
      Array<{ symbol: string; lastPrice: string; priceChangePercent: string }>
    >('https://api.binance.com/api/v3/ticker/24hr', {
      params: { symbols: JSON.stringify(SYMBOLS) },
      timeout: 8000,
    });

    return data.map((t) => ({
      symbol: t.symbol,
      price: t.lastPrice,
      priceChangePercent: t.priceChangePercent,
    }));
  } catch {
    return [];
  }
}
