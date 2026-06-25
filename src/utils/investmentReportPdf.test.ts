import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildInvestmentReportFilename,
  downloadInvestmentReportPdf,
} from './investmentReportPdf';
import type { InvestmentPortfolioResponse } from '../services/investment';

const saveMock = vi.fn();
const setFillColorMock = vi.fn();
const rectMock = vi.fn();
const setFontSizeMock = vi.fn();
const setTextColorMock = vi.fn();
const textMock = vi.fn();
const roundedRectMock = vi.fn();
const circleMock = vi.fn();
const setDrawColorMock = vi.fn();
const setLineWidthMock = vi.fn();
const linesMock = vi.fn();
const lineMock = vi.fn();
const addPageMock = vi.fn();

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    setFillColor: setFillColorMock,
    rect: rectMock,
    setFontSize: setFontSizeMock,
    setTextColor: setTextColorMock,
    text: textMock,
    roundedRect: roundedRectMock,
    circle: circleMock,
    setDrawColor: setDrawColorMock,
    setLineWidth: setLineWidthMock,
    lines: linesMock,
    line: lineMock,
    addPage: addPageMock,
    save: saveMock,
    lastAutoTable: { finalY: 132 },
  })),
}));

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}));

describe('investmentReportPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds a stable filename from the portfolio name and report month', () => {
    expect(buildInvestmentReportFilename('Jennifer Portfolio', 'May 2026')).toBe(
      'jennifer-portfolio-may-2026.pdf'
    );
  });

  it('generates and saves a monthly report pdf', () => {
    downloadInvestmentReportPdf(samplePortfolioResponse);

    expect(saveMock).toHaveBeenCalledWith('jennifer-portfolio-may-2026.pdf');
    expect(textMock).toHaveBeenCalledWith('Monthly Investment Report', 20, 33);
    expect(textMock).toHaveBeenCalledWith('Live Prices', 19, 151);
    expect(
      textMock.mock.calls.some(
        ([text, x, y]) =>
          typeof text === 'string' &&
          text.startsWith('Last updated Jun 20, 2026') &&
          x === 19 &&
          y === 157
      )
    ).toBe(true);
  });
});

const samplePortfolioResponse: InvestmentPortfolioResponse = {
  portfolio: {
    id: 1,
    userId: 7,
    baseCurrency: 'USD',
    displayName: 'Jennifer Portfolio',
    notes: 'Long-term positions',
    createdAt: '2026-06-18T00:00:00.000Z',
    updatedAt: '2026-06-18T00:00:00.000Z',
  },
  summary: {
    totalInvested: 50000,
    portfolioValue: 54320,
    unrealizedPnL: 4320,
    totalReturnPercent: 8.64,
  },
  holdings: [
    {
      assetSymbol: 'BTC',
      assetName: 'Bitcoin',
      quantity: 0.35,
      invested: 23968.08,
      averageCost: 68369.43,
      currentPrice: 63251,
      currentValue: 22208.08,
      unrealizedPnL: -1760,
      allocationPercent: 28.6,
    },
  ],
  transactions: [
    {
      id: 1,
      portfolioId: 1,
      assetSymbol: 'BTC',
      assetName: 'Bitcoin',
      transactionType: 'buy',
      amountInvested: 23968.08,
      purchasePrice: 68369.43,
      purchaseShares: 0.3505672,
      purchaseDate: '2026-05-12',
      notes: 'Core position',
      createdAt: '2026-06-18T00:00:00.000Z',
      updatedAt: '2026-06-18T00:00:00.000Z',
    },
  ],
  livePrices: [
    {
      assetSymbol: 'BTC',
      assetName: 'Bitcoin',
      currentPrice: 63251,
    },
  ],
  pricesLastUpdatedAt: '2026-06-20T08:00:00.000Z',
  monthlyPerformance: [
    { month: '2026-04', label: 'Apr 2026', portfolioValue: 32263.08 },
    { month: '2026-05', label: 'May 2026', portfolioValue: 34855.04 },
  ],
};
