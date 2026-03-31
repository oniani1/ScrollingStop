import axios from 'axios';

const RPC_URL = 'https://api.mainnet-beta.solana.com';
const JUPITER_PRICE_API = 'https://price.jup.ag/v6/price';

// Known DEX program IDs
const DEX_PROGRAMS = [
  'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', // Jupiter v6
  'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB', // Jupiter v4
  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', // Raydium AMM
  'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc', // Orca Whirlpool
];

interface SolanaSignature {
  signature: string;
  blockTime: number;
  slot: number;
  memo: string | null;
}

async function rpcCall(method: string, params: any[]) {
  try {
    const { data } = await axios.post(RPC_URL, {
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }, { timeout: 10000 });
    if (data.error) throw new Error(data.error.message);
    return data.result;
  } catch (error: any) {
    if (error.response) {
      throw new Error(`Solana RPC: ${error.response.data?.error?.message || error.message}`);
    }
    throw new Error(`Solana RPC: ${error.message}`);
  }
}

export async function testSolanaConnection(walletAddress: string): Promise<void> {
  const result = await rpcCall('getBalance', [walletAddress]);
  if (result?.value === undefined) throw new Error('Invalid wallet address');
}

export async function getRecentSignatures(walletAddress: string, limit: number = 20): Promise<SolanaSignature[]> {
  return rpcCall('getSignaturesForAddress', [
    walletAddress,
    { limit },
  ]);
}

export async function getTransaction(signature: string) {
  return rpcCall('getTransaction', [
    signature,
    { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 },
  ]);
}

export async function getTokenPrice(mint: string): Promise<number> {
  try {
    const { data } = await axios.get(`${JUPITER_PRICE_API}?ids=${mint}`);
    return data.data?.[mint]?.price || 0;
  } catch {
    return 0;
  }
}

// Analyze a transaction for swap activity
export function isSwapTransaction(tx: any): boolean {
  if (!tx?.transaction?.message?.accountKeys) return false;
  const accounts = tx.transaction.message.accountKeys.map((a: any) =>
    typeof a === 'string' ? a : a.pubkey
  );
  return accounts.some((acc: string) => DEX_PROGRAMS.includes(acc));
}

// Estimate P&L from swap transactions (simplified)
export async function estimateSwapPnL(
  walletAddress: string
): Promise<{ profit: number; pair: string; profitPercent: number } | null> {
  try {
    const sigs = await getRecentSignatures(walletAddress, 10);

    for (const sig of sigs) {
      const tx = await getTransaction(sig.signature);
      if (!tx || !isSwapTransaction(tx)) continue;

      // Parse pre/post token balances for P&L estimation
      const preBalances = tx.meta?.preTokenBalances || [];
      const postBalances = tx.meta?.postTokenBalances || [];

      // Find SOL balance change (simplified)
      const preSol = (tx.meta?.preBalances?.[0] || 0) / 1e9;
      const postSol = (tx.meta?.postBalances?.[0] || 0) / 1e9;
      const solChange = postSol - preSol;

      // Get SOL price
      const solPrice = await getTokenPrice('So11111111111111111111111111111111111111112');
      const profitUsd = solChange * solPrice;

      if (Math.abs(profitUsd) > 1) {
        return {
          profit: profitUsd,
          pair: 'SOL/USDC',
          profitPercent: preSol > 0 ? (solChange / preSol) * 100 : 0,
        };
      }
    }

    return null;
  } catch (error) {
    console.warn('Solana P&L estimation failed:', error);
    return null;
  }
}
