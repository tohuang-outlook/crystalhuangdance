interface ApiErrorPayload {
  error?: string;
  message?: string;
}

export interface InvestmentPortfolioRecord {
  id: number;
  userId: number;
  baseCurrency: string;
  displayName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentSummary {
  totalInvested: number;
  portfolioValue: number;
  unrealizedPnL: number;
  totalReturnPercent: number;
}

export interface InvestmentHolding {
  assetSymbol: string;
  assetName: string;
  quantity: number;
  invested: number;
  averageCost: number;
  currentPrice: number;
  currentValue: number;
  unrealizedPnL: number;
  allocationPercent: number;
}

export interface InvestmentTransaction {
  id: number;
  portfolioId: number;
  assetSymbol: string;
  assetName: string;
  transactionType: 'buy';
  amountInvested: number;
  purchasePrice: number;
  purchaseShares: number;
  purchaseDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const INVESTMENT_ASSET_OPTIONS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'ADA', name: 'Cardano' },
  { symbol: 'XRP', name: 'XRP' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'DOGE', name: 'Dogecoin' },
] as const;

export interface InvestmentPortfolioResponse {
  portfolio: InvestmentPortfolioRecord;
  summary: InvestmentSummary;
  holdings: InvestmentHolding[];
  transactions: InvestmentTransaction[];
}

interface InvestmentPortfolioEnvelope {
  portfolio: InvestmentPortfolioRecord;
}

interface AdminInvestmentTransactionEnvelope {
  transaction: InvestmentTransaction;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

function normalizeInvestmentPortfolioResponse(
  payload: Partial<InvestmentPortfolioResponse> & {
    portfolio: InvestmentPortfolioRecord;
  }
): InvestmentPortfolioResponse {
  return {
    portfolio: payload.portfolio,
    summary: payload.summary ?? {
      totalInvested: 0,
      portfolioValue: 0,
      unrealizedPnL: 0,
      totalReturnPercent: 0,
    },
    holdings: Array.isArray(payload.holdings) ? payload.holdings : [],
    transactions: Array.isArray(payload.transactions) ? payload.transactions : [],
  };
}

async function parseError(response: Response) {
  let message = 'Request failed';

  try {
    const payload = (await response.json()) as ApiErrorPayload;
    message = payload.message ?? payload.error ?? message;
  } catch {
    message = response.statusText || message;
  }

  const error = new Error(message) as Error & { status?: number };
  error.status = response.status;
  throw error;
}

export async function fetchMyInvestmentPortfolio() {
  const response = await fetch(`${apiBaseUrl}/api/investment/me`, {
    credentials: 'include',
  });

  if (!response.ok) {
    await parseError(response);
  }

  return normalizeInvestmentPortfolioResponse(
    (await response.json()) as Partial<InvestmentPortfolioResponse> & {
      portfolio: InvestmentPortfolioRecord;
    }
  );
}

async function requestJson<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    await parseError(response);
  }

  return (await response.json()) as T;
}

export function fetchAdminInvestmentPortfolio(userId: number) {
  return requestJson<Partial<InvestmentPortfolioResponse> & { portfolio: InvestmentPortfolioRecord }>(
    `/api/admin/investors/${userId}/portfolio`,
    {
      method: 'GET',
    }
  ).then(normalizeInvestmentPortfolioResponse);
}

export function createAdminInvestmentPortfolio(
  userId: number,
  payload: { displayName: string; notes?: string | null }
) {
  return requestJson<InvestmentPortfolioEnvelope>(`/api/admin/investors/${userId}/portfolio`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createAdminInvestmentTransaction(
  userId: number,
  payload: {
    assetSymbol: string;
    amountInvested: number;
    purchasePrice: number;
    purchaseShares: number;
    purchaseDate: string;
    notes?: string | null;
  }
) {
  return requestJson<AdminInvestmentTransactionEnvelope>(
    `/api/admin/investors/${userId}/portfolio/transactions`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export function updateAdminInvestmentTransaction(
  transactionId: number,
  payload: {
    assetSymbol: string;
    amountInvested: number;
    purchasePrice: number;
    purchaseShares: number;
    purchaseDate: string;
    notes?: string | null;
  }
) {
  return requestJson<AdminInvestmentTransactionEnvelope>(
    `/api/admin/portfolio-transactions/${transactionId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );
}

export function deleteAdminInvestmentTransaction(transactionId: number) {
  return requestJson<{ deletedTransactionId: number }>(
    `/api/admin/portfolio-transactions/${transactionId}`,
    {
      method: 'DELETE',
    }
  );
}
