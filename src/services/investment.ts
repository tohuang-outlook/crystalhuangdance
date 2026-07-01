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

export interface InvestmentLivePrice {
  assetSymbol: string;
  assetName: string;
  currentPrice: number;
}

export interface InvestmentMonthlyPerformancePoint {
  month: string;
  label: string;
  portfolioValue: number;
}

export interface InvestmentMonthlyReportRecord {
  id: number;
  monthKey: string;
  label: string;
  snapshotDate: string;
  status: 'ready' | 'failed';
  generatedAt: string;
  fileName: string;
  investorNote: string | null;
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
  livePrices: InvestmentLivePrice[];
  pricesLastUpdatedAt: string | null;
  monthlyPerformance: InvestmentMonthlyPerformancePoint[];
}

interface InvestmentPortfolioEnvelope {
  portfolio: InvestmentPortfolioRecord;
}

interface AdminInvestmentTransactionEnvelope {
  transaction: InvestmentTransaction;
}

interface InvestmentReportsEnvelope {
  reports: InvestmentMonthlyReportRecord[];
}

interface AdminInvestmentReportGenerationResponse {
  monthKey: string;
  summary: {
    generated: number;
    updated: number;
    skipped: number;
    failed: number;
  };
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

function normalizeInvestmentLivePrices(payload: unknown): InvestmentLivePrice[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') {
      return [];
    }

    const assetSymbol =
      typeof entry.assetSymbol === 'string' ? entry.assetSymbol.trim() : '';
    const assetName = typeof entry.assetName === 'string' ? entry.assetName.trim() : '';
    const currentPrice = Number(entry.currentPrice);

    if (!assetSymbol || !assetName || !Number.isFinite(currentPrice)) {
      return [];
    }

    return [
      {
        assetSymbol,
        assetName,
        currentPrice,
      },
    ];
  });
}

function normalizeInvestmentMonthlyPerformance(
  payload: unknown
): InvestmentMonthlyPerformancePoint[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') {
      return [];
    }

    const month = typeof entry.month === 'string' ? entry.month.trim() : '';
    const label = typeof entry.label === 'string' ? entry.label.trim() : '';
    const portfolioValue = Number(entry.portfolioValue);

    if (!month || !label || !Number.isFinite(portfolioValue)) {
      return [];
    }

    return [{ month, label, portfolioValue }];
  });
}

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
    livePrices: normalizeInvestmentLivePrices(payload.livePrices),
    pricesLastUpdatedAt:
      typeof payload.pricesLastUpdatedAt === 'string' || payload.pricesLastUpdatedAt === null
        ? payload.pricesLastUpdatedAt
        : null,
    monthlyPerformance: normalizeInvestmentMonthlyPerformance(payload.monthlyPerformance),
  };
}

function normalizeInvestmentMonthlyReports(payload: unknown): InvestmentMonthlyReportRecord[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') {
      return [];
    }

    const monthKey = typeof entry.monthKey === 'string' ? entry.monthKey.trim() : '';
    const id = Number(entry.id);
    const label = typeof entry.label === 'string' ? entry.label.trim() : '';
    const snapshotDate =
      typeof entry.snapshotDate === 'string' ? entry.snapshotDate.trim() : '';
    const status = entry.status === 'failed' ? 'failed' : entry.status === 'ready' ? 'ready' : '';
    const generatedAt =
      typeof entry.generatedAt === 'string' ? entry.generatedAt.trim() : '';
    const fileName = typeof entry.fileName === 'string' ? entry.fileName.trim() : '';
    const investorNote =
      typeof entry.investorNote === 'string' ? entry.investorNote : entry.investorNote === null ? null : null;

    if (
      !Number.isInteger(id) ||
      !monthKey ||
      !label ||
      !snapshotDate ||
      !status ||
      !generatedAt ||
      !fileName
    ) {
      return [];
    }

    return [
      {
        id,
        monthKey,
        label,
        snapshotDate,
        status,
        generatedAt,
        fileName,
        investorNote,
      },
    ];
  });
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

export async function fetchMyInvestmentReports() {
  const response = await fetch(`${apiBaseUrl}/api/investment/me/reports`, {
    credentials: 'include',
  });

  if (!response.ok) {
    await parseError(response);
  }

  const payload = (await response.json()) as InvestmentReportsEnvelope;
  return normalizeInvestmentMonthlyReports(payload.reports);
}

export function getMyInvestmentReportDownloadUrl(monthKey: string) {
  return `${apiBaseUrl}/api/investment/me/reports/${monthKey}/download`;
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

export function generateAdminInvestmentReports() {
  return requestJson<AdminInvestmentReportGenerationResponse>(
    '/api/admin/investment/reports/generate-latest',
    {
      method: 'POST',
      body: JSON.stringify({}),
    }
  );
}
