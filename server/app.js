import bcrypt from 'bcryptjs';
import { AsyncLocalStorage } from 'async_hooks';
import { createHash, randomBytes } from 'crypto';
import express from 'express';
import session from 'express-session';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { buildInvestmentReportFilename, createInvestmentReportPdfDocument } from './investment-report-pdf.js';
import { processUploadedVideo } from './video-processing.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minimumPasswordLength = 8;
const forgotPasswordSuccessMessage =
  'If an account exists for that email, a password reset link has been sent.';
const invalidResetPasswordTokenMessage = 'This password reset link is invalid or expired.';
const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{6,}/i;
const allowedExtensions = new Set(['.mp4', '.mov', '.avi']);
const allowedMimeTypes = new Set([
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/avi',
]);
const inviteCodePattern = /^\d{6}$/;
const allowedMemberTypes = new Set(['dancer', 'investor']);
const investmentAssetNamesBySymbol = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  ADA: 'Cardano',
  XRP: 'XRP',
  SOL: 'Solana',
  DOGE: 'Dogecoin',
};
const investmentAssetIdsBySymbol = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  ADA: 'cardano',
  XRP: 'ripple',
  SOL: 'solana',
  DOGE: 'dogecoin',
};
const seededInvestmentMonthlyPerformance = [
  { month: '2025-06', portfolioValue: 50004.88, snapshotDate: '2025-06-30' },
  { month: '2025-07', portfolioValue: 49345.13, snapshotDate: '2025-07-31' },
  { month: '2025-08', portfolioValue: 61851.85, snapshotDate: '2025-08-31' },
  { month: '2025-09', portfolioValue: 68851.62, snapshotDate: '2025-09-30' },
  { month: '2025-10', portfolioValue: 69919.95, snapshotDate: '2025-10-31' },
  { month: '2025-11', portfolioValue: 60918.19, snapshotDate: '2025-11-30' },
  { month: '2025-12', portfolioValue: 44607.51, snapshotDate: '2025-12-31' },
  { month: '2026-01', portfolioValue: 45283.78, snapshotDate: '2026-01-31' },
  { month: '2026-02', portfolioValue: 36456.4, snapshotDate: '2026-02-28' },
  { month: '2026-03', portfolioValue: 31754.3, snapshotDate: '2026-03-31' },
  { month: '2026-04', portfolioValue: 32263.08, snapshotDate: '2026-04-30' },
  { month: '2026-05', portfolioValue: 34855.04, snapshotDate: '2026-05-31' },
];
const investmentPricingFetchTimeoutMs = 5000;

function toSafeUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    memberType: user.memberType,
  };
}

function setSessionUser(req, user) {
  req.session.user = toSafeUser(user);
}

function getSessionPayload(req) {
  return {
    authenticated: Boolean(req.session.user),
    user: req.session.user ?? null,
  };
}

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access is required.' });
  }

  next();
}

function requireInvestor(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.session.user.memberType !== 'investor') {
    return res.status(403).json({ error: 'Investor access is required.' });
  }

  next();
}

function serializeVideo(video) {
  return {
    id: video.id,
    title: video.title,
    sourceType: video.sourceType,
    sourceUrl: video.sourceUrl,
    filePath: video.filePath,
    originalFilename: video.originalFilename,
    durationSeconds: video.durationSeconds,
    fileSizeBytes: video.fileSizeBytes,
    status: video.status,
    createdAt: video.createdAt,
    updatedAt: video.updatedAt,
  };
}

function serializeAdminUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    memberType: user.memberType,
    uploadCount: user.uploadCount,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function serializeAdminVideo(video) {
  return {
    ...serializeVideo(video),
    userId: video.userId,
    uploader: {
      id: video.uploaderId,
      email: video.uploaderEmail,
      role: video.uploaderRole,
    },
  };
}

function serializeComingUpEvent(event) {
  return {
    id: event.id,
    dateLabel: event.dateLabel,
    title: event.title,
    location: event.location,
    sortOrder: event.sortOrder,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

function serializeInvestmentPortfolio(portfolio) {
  return {
    id: portfolio.id,
    userId: portfolio.userId,
    baseCurrency: portfolio.baseCurrency,
    displayName: portfolio.displayName,
    notes: portfolio.notes,
    createdAt: portfolio.createdAt,
    updatedAt: portfolio.updatedAt,
  };
}

function serializeInvestmentTransaction(transaction) {
  return {
    id: transaction.id,
    portfolioId: transaction.portfolioId,
    assetSymbol: transaction.assetSymbol,
    assetName: transaction.assetName,
    transactionType: transaction.transactionType,
    amountInvested: transaction.amountInvested,
    purchasePrice: transaction.purchasePrice,
    purchaseShares: transaction.purchaseShares,
    purchaseDate: transaction.purchaseDate,
    notes: transaction.notes,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  };
}

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundQuantity(value) {
  return Math.round((value + Number.EPSILON) * 100000000) / 100000000;
}

function buildPortfolioSnapshot(transactions, livePricesBySymbol) {
  const holdingsMap = new Map();

  for (const transaction of transactions) {
    const key = transaction.assetSymbol;
    const current = holdingsMap.get(key) ?? {
      assetSymbol: transaction.assetSymbol,
      assetName: transaction.assetName,
      quantity: 0,
      invested: 0,
    };

    current.quantity += Number(transaction.purchaseShares);
    current.invested += Number(transaction.amountInvested);
    holdingsMap.set(key, current);
  }

  const rawHoldings = Array.from(holdingsMap.values()).map((holding) => {
    const averageCost = holding.quantity > 0 ? holding.invested / holding.quantity : 0;
    const livePrice = Number(livePricesBySymbol[holding.assetSymbol]);
    const hasLivePrice = Number.isFinite(livePrice);
    const currentPrice = hasLivePrice ? livePrice : averageCost;
    const currentValue = hasLivePrice ? holding.quantity * livePrice : holding.invested;
    const unrealizedPnL = hasLivePrice ? currentValue - holding.invested : 0;

    return {
      assetSymbol: holding.assetSymbol,
      assetName: holding.assetName,
      quantity: roundQuantity(holding.quantity),
      invested: roundCurrency(holding.invested),
      averageCost: roundCurrency(averageCost),
      currentPrice: roundCurrency(currentPrice),
      currentValue: roundCurrency(currentValue),
      unrealizedPnL: roundCurrency(unrealizedPnL),
    };
  });

  const totalInvested = roundCurrency(
    rawHoldings.reduce((sum, holding) => sum + holding.invested, 0)
  );
  const portfolioValue = roundCurrency(
    rawHoldings.reduce((sum, holding) => sum + holding.currentValue, 0)
  );
  const unrealizedPnL = roundCurrency(portfolioValue - totalInvested);
  const totalReturnPercent =
    totalInvested > 0 ? roundCurrency((unrealizedPnL / totalInvested) * 100) : 0;

  const holdings = rawHoldings.map((holding) => ({
    ...holding,
    allocationPercent:
      portfolioValue > 0 ? roundCurrency((holding.currentValue / portfolioValue) * 100) : 0,
  }));

  return {
    summary: {
      totalInvested,
      portfolioValue,
      unrealizedPnL,
      totalReturnPercent,
    },
    holdings,
  };
}

function normalizeInvestmentSymbols(symbols = Object.keys(investmentAssetIdsBySymbol)) {
  return [...new Set(symbols)].filter((symbol) => investmentAssetIdsBySymbol[symbol]);
}

function buildLivePrices(symbols, livePricesBySymbol) {
  return normalizeInvestmentSymbols(symbols)
    .map((assetSymbol) => {
      const currentPrice = Number(livePricesBySymbol[assetSymbol]);

      if (!Number.isFinite(currentPrice)) {
        return null;
      }

      return {
        assetSymbol,
        assetName: investmentAssetNamesBySymbol[assetSymbol],
        currentPrice: roundCurrency(currentPrice),
      };
    })
    .filter(Boolean);
}

function formatMonthKeyFromDate(value) {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function getLastCompletedMonthKey(now = new Date()) {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  date.setUTCMonth(date.getUTCMonth() - 1);
  return formatMonthKeyFromDate(date);
}

function getMonthEndDate(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month, 0));
  return date.toISOString().slice(0, 10);
}

function ensureSeededInvestmentMonthlyHistory(db, portfolioId) {
  const existing = db.listInvestmentMonthlyHistoryByPortfolioId(portfolioId);
  const existingMonths = new Set(existing.map((entry) => entry.month));

  for (const seed of seededInvestmentMonthlyPerformance) {
    if (existingMonths.has(seed.month)) {
      continue;
    }

    db.upsertInvestmentMonthlyHistory({
      portfolioId,
      month: seed.month,
      portfolioValue: seed.portfolioValue,
      snapshotDate: seed.snapshotDate,
    });
  }

  return db.listInvestmentMonthlyHistoryByPortfolioId(portfolioId);
}

function appendLatestCompletedMonthSnapshot({
  db,
  portfolioId,
  summary,
  now = new Date(),
}) {
  const lastCompletedMonth = getLastCompletedMonthKey(now);
  const existing = db.listInvestmentMonthlyHistoryByPortfolioId(portfolioId);
  const hasLatestCompletedMonth = existing.some((entry) => entry.month === lastCompletedMonth);

  if (!lastCompletedMonth || hasLatestCompletedMonth) {
    return existing;
  }

  db.upsertInvestmentMonthlyHistory({
    portfolioId,
    month: lastCompletedMonth,
    portfolioValue: summary.portfolioValue,
    snapshotDate: getMonthEndDate(lastCompletedMonth),
  });

  return db.listInvestmentMonthlyHistoryByPortfolioId(portfolioId);
}

function serializeInvestmentMonthlyPerformance(history) {
  return history.map((entry) => ({
    month: entry.month,
    label: formatMonthLabel(entry.month),
    portfolioValue: roundCurrency(entry.portfolioValue),
  }));
}

function serializeInvestmentMonthlyReport(report, { includeAdminFields = false } = {}) {
  const serialized = {
    id: report.id,
    monthKey: report.monthKey,
    label: formatMonthLabel(report.monthKey),
    snapshotDate: report.snapshotDate,
    status: report.status,
    generatedAt: report.generatedAt,
    fileName: report.fileName,
    investorNote: report.investorNote ?? null,
  };

  if (includeAdminFields) {
    serialized.adminNote = report.adminNote ?? null;
    serialized.portfolioId = report.portfolioId;
  }

  return serialized;
}

function serializeAdminInvestmentMonthlyReport(report) {
  return {
    ...serializeInvestmentMonthlyReport(report, { includeAdminFields: true }),
    investorEmail: report.investorEmail,
    investorUserId: report.investorUserId,
    portfolioDisplayName: report.portfolioDisplayName,
  };
}

function findAdminInvestmentReportByIdAndMonth(db, reportId, monthKey) {
  return (
    db.raw
      .prepare(
        `SELECT
           reports.id,
           reports.portfolio_id AS portfolioId,
           reports.month_key AS monthKey,
           reports.snapshot_date AS snapshotDate,
           reports.file_name AS fileName,
           reports.file_path AS filePath,
           reports.status,
           reports.generated_at AS generatedAt,
           reports.error_message AS errorMessage,
           reports.investor_note AS investorNote,
           reports.admin_note AS adminNote,
           reports.created_at AS createdAt,
           reports.updated_at AS updatedAt,
           portfolios.user_id AS investorUserId,
           portfolios.display_name AS portfolioDisplayName,
           portfolios.base_currency AS baseCurrency,
           portfolios.notes,
           portfolios.created_at AS portfolioCreatedAt,
           portfolios.updated_at AS portfolioUpdatedAt,
           users.email AS investorEmail
         FROM investment_monthly_reports reports
         INNER JOIN investment_portfolios portfolios ON portfolios.id = reports.portfolio_id
         INNER JOIN users ON users.id = portfolios.user_id
         WHERE reports.id = ? AND reports.month_key = ?`
      )
      .get(reportId, monthKey) ?? null
  );
}

function findInvestmentPortfolioById(db, portfolioId) {
  return (
    db.raw
      .prepare(
        `SELECT
           id,
           user_id AS userId,
           base_currency AS baseCurrency,
           display_name AS displayName,
           notes,
           created_at AS createdAt,
           updated_at AS updatedAt
         FROM investment_portfolios
         WHERE id = ?`
      )
      .get(portfolioId) ?? null
  );
}

async function writeInvestmentMonthlyReportPdf({ outputPath, reportData }) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const { doc } = createInvestmentReportPdfDocument(reportData);
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  await fs.writeFile(outputPath, pdfBuffer);
}

async function generateInvestmentMonthlyReport({
  db,
  portfolio,
  monthKey,
  currentDate,
  reportStorageRoot,
  getInvestmentPrices,
  getInvestmentPricesLastUpdatedAt,
  runWithInvestmentPricingRequestState,
}) {
  const existingReport = db.findInvestmentMonthlyReportByPortfolioIdAndMonth(portfolio.id, monthKey);
  const transactions = db.listInvestmentTransactionsByPortfolioId(portfolio.id);

  if (transactions.length === 0) {
    return { status: 'skipped', reason: 'no-transactions' };
  }

  const priceSymbols = [...new Set(transactions.map((transaction) => transaction.assetSymbol))];
  const { livePricesBySymbol, livePrices, pricesLastUpdatedAt } =
    await runWithInvestmentPricingRequestState(() =>
      loadInvestmentPricing(priceSymbols, getInvestmentPrices, getInvestmentPricesLastUpdatedAt)
    );
  const snapshot = buildPortfolioSnapshot(transactions, livePricesBySymbol);
  ensureSeededInvestmentMonthlyHistory(db, portfolio.id);
  const monthlyHistory = appendLatestCompletedMonthSnapshot({
    db,
    portfolioId: portfolio.id,
    summary: snapshot.summary,
    now: currentDate,
  });
  const filteredHistory = monthlyHistory.filter((entry) => entry.month <= monthKey);
  const reportMonthEntry = filteredHistory.find((entry) => entry.month === monthKey);

  if (!reportMonthEntry) {
    return { status: 'skipped', reason: 'missing-month-history' };
  }

  const reportMonthLabel = formatMonthLabel(monthKey);
  const fileName = buildInvestmentReportFilename(
    portfolio.displayName || 'investor-portfolio',
    reportMonthLabel
  );
  const relativePath = path.join(String(portfolio.id), fileName);
  const outputPath = path.join(reportStorageRoot, relativePath);

  await writeInvestmentMonthlyReportPdf({
    outputPath,
    reportData: {
      portfolio: serializeInvestmentPortfolio(portfolio),
      summary: snapshot.summary,
      holdings: snapshot.holdings,
      transactions: [],
      livePrices,
      pricesLastUpdatedAt,
      monthlyPerformance: serializeInvestmentMonthlyPerformance(filteredHistory),
      investorNote: existingReport?.investorNote ?? null,
    },
  });

  const report = db.upsertInvestmentMonthlyReport({
    portfolioId: portfolio.id,
    monthKey,
    snapshotDate: reportMonthEntry.snapshotDate,
    fileName,
    filePath: relativePath,
    status: 'ready',
    errorMessage: null,
    investorNote: existingReport?.investorNote ?? null,
    adminNote: existingReport?.adminNote ?? null,
  });

  return { status: 'ready', report };
}

async function generateLatestCompletedInvestmentReports({
  db,
  currentDate,
  reportStorageRoot,
  getInvestmentPrices,
  getInvestmentPricesLastUpdatedAt,
  runWithInvestmentPricingRequestState,
}) {
  const monthKey = getLastCompletedMonthKey(currentDate);
  const portfolios = db.listInvestmentPortfoliosForInvestors();
  let generated = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const portfolio of portfolios) {
    const existing = db.findInvestmentMonthlyReportByPortfolioIdAndMonth(portfolio.id, monthKey);

    try {
      const result = await generateInvestmentMonthlyReport({
        db,
        portfolio,
        monthKey,
        currentDate,
        reportStorageRoot,
        getInvestmentPrices,
        getInvestmentPricesLastUpdatedAt,
        runWithInvestmentPricingRequestState,
      });

      if (result.status === 'ready') {
        if (existing) {
          updated += 1;
        } else {
          generated += 1;
        }
      } else {
        skipped += 1;
      }
    } catch (error) {
      failed += 1;
      db.upsertInvestmentMonthlyReport({
        portfolioId: portfolio.id,
        monthKey,
        snapshotDate: getMonthEndDate(monthKey),
        fileName: `${monthKey}-failed.pdf`,
        filePath: path.join(String(portfolio.id), `${monthKey}-failed.pdf`),
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown generation error.',
        investorNote: existing?.investorNote ?? null,
        adminNote: existing?.adminNote ?? null,
      });
    }
  }

  return { monthKey, summary: { generated, updated, skipped, failed } };
}

function isAbortError(error) {
  return error instanceof Error && error.name === 'AbortError';
}

async function defaultCoinGeckoPriceFetcher(
  symbols,
  fetchFn = fetch,
  timeoutMs = investmentPricingFetchTimeoutMs
) {
  const normalizedSymbols = normalizeInvestmentSymbols(symbols);

  if (normalizedSymbols.length === 0) {
    return {
      pricesBySymbol: {},
      pricesLastUpdatedAt: null,
    };
  }

  const coinGeckoIds = normalizedSymbols.map((symbol) => investmentAssetIdsBySymbol[symbol]);
  const url = new URL('https://api.coingecko.com/api/v3/simple/price');
  url.searchParams.set('ids', coinGeckoIds.join(','));
  url.searchParams.set('vs_currencies', 'usd');
  url.searchParams.set('include_last_updated_at', 'true');

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, timeoutMs);
  let response;

  try {
    response = await fetchFn(url, { signal: abortController.signal });
  } catch (error) {
    if (isAbortError(error)) {
      throw new Error(`CoinGecko pricing request timed out after ${timeoutMs}ms`);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`CoinGecko pricing request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const pricesBySymbol = {};
  let latestTimestampSeconds = null;

  for (const symbol of normalizedSymbols) {
    const assetPayload = payload[investmentAssetIdsBySymbol[symbol]];
    const currentPrice = Number(assetPayload?.usd);

    if (Number.isFinite(currentPrice)) {
      pricesBySymbol[symbol] = currentPrice;
    }

    const updatedAt = Number(assetPayload?.last_updated_at);

    if (Number.isFinite(updatedAt)) {
      latestTimestampSeconds =
        latestTimestampSeconds === null ? updatedAt : Math.max(latestTimestampSeconds, updatedAt);
    }
  }

  return {
    pricesBySymbol,
    pricesLastUpdatedAt:
      latestTimestampSeconds === null ? null : new Date(latestTimestampSeconds * 1000).toISOString(),
  };
}

async function loadInvestmentPricing(symbols, getInvestmentPrices, getInvestmentPricesLastUpdatedAt) {
  const normalizedSymbols = normalizeInvestmentSymbols(symbols);

  if (normalizedSymbols.length === 0) {
    return {
      livePricesBySymbol: {},
      livePrices: [],
      pricesLastUpdatedAt: null,
    };
  }

  try {
    const livePricesBySymbol = await getInvestmentPrices(normalizedSymbols);

    return {
      livePricesBySymbol,
      livePrices: buildLivePrices(normalizedSymbols, livePricesBySymbol),
      pricesLastUpdatedAt: getInvestmentPricesLastUpdatedAt() ?? null,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn('Investment pricing unavailable; returning snapshot without live prices.', {
      reason,
    });

    return {
      livePricesBySymbol: {},
      livePrices: [],
      pricesLastUpdatedAt: null,
    };
  }
}

function parseIdParam(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseTransactionPayload(body) {
  const assetSymbol = String(body?.assetSymbol ?? '')
    .trim()
    .toUpperCase();
  const amountInvested = Number(body?.amountInvested);
  const rawPurchasePrice = String(body?.purchasePrice ?? '').trim();
  const rawPurchaseShares = String(body?.purchaseShares ?? '').trim();
  const purchasePrice = rawPurchasePrice ? Number(rawPurchasePrice) : Number.NaN;
  const purchaseShares = rawPurchaseShares ? Number(rawPurchaseShares) : Number.NaN;
  const purchaseDate = String(body?.purchaseDate ?? '').trim();
  const notes = trimOptionalString(body?.notes);
  const assetName = investmentAssetNamesBySymbol[assetSymbol];

  if (!assetName || !purchaseDate) {
    return { error: 'A supported asset symbol and purchase date are required.' };
  }

  if (!Number.isFinite(amountInvested) || amountInvested <= 0) {
    return { error: 'Amount invested must be a positive number.' };
  }

  const hasPurchasePrice = Number.isFinite(purchasePrice) && purchasePrice > 0;
  const hasPurchaseShares = Number.isFinite(purchaseShares) && purchaseShares > 0;

  if (!hasPurchasePrice && !hasPurchaseShares) {
    return { error: 'Enter either purchase price or purchase shares.' };
  }

  const normalizedPurchasePrice = hasPurchasePrice ? purchasePrice : amountInvested / purchaseShares;
  const normalizedPurchaseShares = hasPurchaseShares ? purchaseShares : amountInvested / purchasePrice;

  return {
    assetSymbol,
    assetName,
    amountInvested,
    purchasePrice: normalizedPurchasePrice,
    purchaseShares: normalizedPurchaseShares,
    purchaseDate,
    notes,
  };
}

function findHydratedAdminVideo(db, videoId) {
  return db.listAllVideosWithUploader().find((video) => video.id === videoId) ?? null;
}

function resolveStoredVideoFilePath(filePath, config) {
  if (typeof filePath !== 'string' || !filePath.startsWith(`${config.publicVideosBasePath}/`)) {
    return null;
  }

  const relativePath = filePath.slice(config.publicVideosBasePath.length + 1);
  const rootPath = path.resolve(config.processedVideosDirectory);
  const absolutePath = path.resolve(config.processedVideosDirectory, relativePath);

  if (absolutePath !== rootPath && !absolutePath.startsWith(`${rootPath}${path.sep}`)) {
    return null;
  }

  return absolutePath;
}

async function removeStoredVideoFile(filePath, config) {
  const absolutePath = resolveStoredVideoFilePath(filePath, config);

  if (!absolutePath) {
    return;
  }

  await fs.rm(absolutePath, { force: true });
}

function trimOptionalString(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseRequiredTrimmedString(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseComingUpEventPayload(body) {
  return {
    dateLabel: parseRequiredTrimmedString(body?.dateLabel),
    title: parseRequiredTrimmedString(body?.title),
    location: parseRequiredTrimmedString(body?.location),
  };
}

function hashResetToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function createPasswordResetToken() {
  return randomBytes(32).toString('base64url');
}

function buildResetPasswordUrl(resetPasswordUrlBase, token) {
  const url = new URL(resetPasswordUrlBase);
  url.searchParams.set('token', token);
  return url.toString();
}

function createUploadMiddleware(config) {
  return multer({
    dest: config.uploadTempDirectory,
    limits: {
      fileSize: config.uploadFileSizeLimitBytes,
    },
    fileFilter: (_req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      const mimeAllowed = allowedMimeTypes.has(file.mimetype);
      const extensionAllowed = allowedExtensions.has(extension);

      if (!mimeAllowed && !extensionAllowed) {
        callback(new Error('Only MP4, MOV, and AVI videos are allowed.'));
        return;
      }

      callback(null, true);
    },
  });
}

export function createApp({
  db,
  sessionSecret,
  config,
  now = () => new Date(),
  sendPasswordResetEmail = async () => {},
  processUploadedVideoFn = processUploadedVideo,
  getInvestmentPrices: customGetInvestmentPrices,
  getInvestmentPricesLastUpdatedAt: customGetInvestmentPricesLastUpdatedAt,
  investmentPriceFetchTimeoutMs = investmentPricingFetchTimeoutMs,
}) {
  const investmentPricingRequestState = new AsyncLocalStorage();
  const runWithInvestmentPricingRequestState = (callback) =>
    investmentPricingRequestState.run({ pricesLastUpdatedAt: null }, callback);
  const setInvestmentPricingRequestTimestamp = (pricesLastUpdatedAt) => {
    const store = investmentPricingRequestState.getStore();

    if (store) {
      store.pricesLastUpdatedAt = pricesLastUpdatedAt ?? null;
    }
  };
  const getInvestmentPricingRequestTimestamp = () =>
    investmentPricingRequestState.getStore()?.pricesLastUpdatedAt ?? null;

  let getInvestmentPrices;

  if (customGetInvestmentPrices) {
    getInvestmentPrices = async (symbols) => {
      const pricesBySymbol = await customGetInvestmentPrices(symbols);

      if (!customGetInvestmentPricesLastUpdatedAt) {
        setInvestmentPricingRequestTimestamp(new Date(now()).toISOString());
      }

      return pricesBySymbol;
    };
  } else {
    getInvestmentPrices = async (symbols) => {
      const { pricesBySymbol, pricesLastUpdatedAt } = await defaultCoinGeckoPriceFetcher(
        symbols,
        fetch,
        investmentPriceFetchTimeoutMs
      );
      setInvestmentPricingRequestTimestamp(pricesLastUpdatedAt);
      return pricesBySymbol;
    };
  }

  const getInvestmentPricesLastUpdatedAt =
    customGetInvestmentPricesLastUpdatedAt ?? getInvestmentPricingRequestTimestamp;
  const reportStorageRoot = config.reportStorageDirectory;

  if (config.requireInviteCode && config.inviteCodes.length === 0) {
    throw new Error(
      'Invite code enforcement requires at least one configured six-digit invite code.'
    );
  }

  const app = express();
  const upload = createUploadMiddleware(config);

  if (config.trustProxy) {
    app.set('trust proxy', 1);
  }

  app.use(express.json());
  app.use(
    session({
      name: 'crystal.sid',
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );
  app.use(config.publicVideosBasePath, express.static(config.processedVideosDirectory));

  app.get('/api/auth/me', (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.json({ user: req.session.user });
  });

  app.get('/api/auth/session', (req, res) => {
    res.json(getSessionPayload(req));
  });

  app.post('/api/auth/register', async (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    const inviteCode = String(req.body?.inviteCode ?? '').trim();

    if (!emailPattern.test(email)) {
      return res.status(400).json({ error: 'A valid email is required.' });
    }

    if (password.length < minimumPasswordLength) {
      return res.status(400).json({
        error: `Password must be at least ${minimumPasswordLength} characters.`,
      });
    }

    if (config.requireInviteCode) {
      if (!inviteCodePattern.test(inviteCode)) {
        return res.status(400).json({ error: 'A valid six-digit invite code is required.' });
      }

      if (!config.inviteCodes.includes(inviteCode)) {
        return res.status(403).json({ error: 'Invite code is invalid.' });
      }
    }

    if (db.findUserByEmail(email)) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = db.createUser({ email, passwordHash });

    setSessionUser(req, user);

    return res.status(201).json({ user: toSafeUser(user) });
  });

  app.post('/api/auth/login', async (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    const user = db.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    setSessionUser(req, user);

    return res.json({ user: toSafeUser(user) });
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();

    if (emailPattern.test(email)) {
      const user = db.findUserByEmail(email);

      if (user) {
        const issuedAt = now();
        const expiresAt = new Date(
          issuedAt.getTime() + config.passwordResetTokenTtlMinutes * 60 * 1000
        ).toISOString();
        const token = createPasswordResetToken();

        db.deleteExpiredPasswordResetTokens(issuedAt.toISOString());
        db.createPasswordResetToken({
          userId: user.id,
          tokenHash: hashResetToken(token),
          expiresAt,
        });

        try {
          await sendPasswordResetEmail({
            email: user.email,
            resetUrl: buildResetPasswordUrl(config.resetPasswordUrlBase, token),
            expiresAt,
            expiresInMinutes: config.passwordResetTokenTtlMinutes,
          });
        } catch (error) {
          console.error('Unable to send password reset email.', error);
        }
      }
    }

    return res.json({ message: forgotPasswordSuccessMessage });
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    const token = String(req.body?.token ?? '').trim();
    const password = String(req.body?.password ?? '');

    if (!token) {
      return res.status(400).json({ error: 'A reset token is required.' });
    }

    if (password.length < minimumPasswordLength) {
      return res.status(400).json({
        error: `Password must be at least ${minimumPasswordLength} characters.`,
      });
    }

    const passwordResetToken = db.findPasswordResetTokenByHash(hashResetToken(token));

    if (!passwordResetToken || passwordResetToken.usedAt) {
      return res.status(400).json({ error: invalidResetPasswordTokenMessage });
    }

    if (new Date(passwordResetToken.expiresAt).getTime() <= now().getTime()) {
      db.deletePasswordResetTokenById(passwordResetToken.id);
      return res.status(410).json({ error: 'This password reset link has expired.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const updatedUser = db.resetUserPassword({
      userId: passwordResetToken.userId,
      passwordHash,
    });

    if (!updatedUser) {
      db.deletePasswordResetTokenById(passwordResetToken.id);
      return res.status(400).json({ error: invalidResetPasswordTokenMessage });
    }

    return res.json({ message: 'Your password has been reset successfully.' });
  });

  app.post('/api/auth/logout', (req, res) => {
    if (!req.session) {
      return res.sendStatus(204);
    }

    req.session.destroy((error) => {
      if (error) {
        return res.status(500).json({ error: 'Unable to log out right now.' });
      }

      res.clearCookie('crystal.sid');
      return res.sendStatus(204);
    });
  });

  app.get('/api/videos', requireAuth, (req, res) => {
    const videos = db.listVideosByUser(req.session.user.id).map(serializeVideo);
    res.json({ videos });
  });

  app.get('/api/coming-up-events', (_req, res) => {
    const events = db.listComingUpEvents().map(serializeComingUpEvent);
    res.json({ events });
  });

  app.get('/api/investment/me', requireInvestor, async (req, res) => {
    const portfolio = db.findInvestmentPortfolioByUserId(req.session.user.id);

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found.' });
    }

    const transactions = db.listInvestmentTransactionsByPortfolioId(portfolio.id);
    const priceSymbols = [...new Set(transactions.map((transaction) => transaction.assetSymbol))];
    const { livePricesBySymbol, livePrices, pricesLastUpdatedAt } =
      await runWithInvestmentPricingRequestState(() =>
        loadInvestmentPricing(priceSymbols, getInvestmentPrices, getInvestmentPricesLastUpdatedAt)
      );
    const snapshot = buildPortfolioSnapshot(transactions, livePricesBySymbol);
    ensureSeededInvestmentMonthlyHistory(db, portfolio.id);
    const monthlyHistory = appendLatestCompletedMonthSnapshot({
      db,
      portfolioId: portfolio.id,
      summary: snapshot.summary,
      now: now(),
    });

    return res.json({
      portfolio: serializeInvestmentPortfolio(portfolio),
      summary: snapshot.summary,
      holdings: snapshot.holdings,
      transactions: transactions.map(serializeInvestmentTransaction),
      livePrices,
      pricesLastUpdatedAt,
      monthlyPerformance: serializeInvestmentMonthlyPerformance(monthlyHistory),
    });
  });

  app.get('/api/investment/me/reports', requireInvestor, (req, res) => {
    const portfolio = db.findInvestmentPortfolioByUserId(req.session.user.id);

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found.' });
    }

    return res.json({
      reports: db
        .listInvestmentMonthlyReportsByPortfolioId(portfolio.id)
        .map(serializeInvestmentMonthlyReport),
    });
  });

  app.get('/api/admin/investment/reports', requireAdmin, (_req, res) => {
    const reports = db
      .listInvestmentMonthlyReportsForAdmin()
      .map(serializeAdminInvestmentMonthlyReport);

    return res.json({ reports });
  });

  app.patch('/api/admin/investment/reports/:monthKey/:reportId', requireAdmin, (req, res) => {
    const reportId = parseIdParam(req.params.reportId);
    const monthKey = String(req.params.monthKey ?? '').trim();
    const investorNote = trimOptionalString(req.body?.investorNote);
    const adminNote = trimOptionalString(req.body?.adminNote);

    if (!reportId || !/^\d{4}-\d{2}$/.test(monthKey)) {
      return res.status(400).json({ error: 'A valid report id and month are required.' });
    }

    const report = db.updateInvestmentMonthlyReportNotes(reportId, monthKey, investorNote, adminNote);

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const adminReport = findAdminInvestmentReportByIdAndMonth(db, reportId, monthKey);

    if (!adminReport) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    return res.json({
      report: serializeAdminInvestmentMonthlyReport(adminReport),
    });
  });

  app.get('/api/admin/investment/reports/:monthKey/:reportId/download', requireAdmin, async (req, res) => {
    const reportId = parseIdParam(req.params.reportId);
    const monthKey = String(req.params.monthKey ?? '').trim();

    if (!reportId || !/^\d{4}-\d{2}$/.test(monthKey)) {
      return res.status(400).json({ error: 'A valid report id and month are required.' });
    }

    const report = findAdminInvestmentReportByIdAndMonth(db, reportId, monthKey);

    if (!report || report.status !== 'ready') {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const absolutePath = path.join(reportStorageRoot, report.filePath);

    try {
      await fs.access(absolutePath);
    } catch {
      return res.status(404).json({ error: 'Report file is missing.' });
    }

    return res.download(absolutePath, report.fileName);
  });

  app.get('/api/investment/me/reports/:monthKey/download', requireInvestor, async (req, res) => {
    const portfolio = db.findInvestmentPortfolioByUserId(req.session.user.id);

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found.' });
    }

    const monthKey = String(req.params.monthKey ?? '').trim();
    if (!/^\d{4}-\d{2}$/.test(monthKey)) {
      return res.status(400).json({ error: 'A valid report month is required.' });
    }

    const report = db.findInvestmentMonthlyReportByPortfolioIdAndMonth(portfolio.id, monthKey);
    if (!report || report.status !== 'ready') {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const absolutePath = path.join(reportStorageRoot, report.filePath);

    try {
      await fs.access(absolutePath);
    } catch {
      return res.status(404).json({ error: 'Report file is missing.' });
    }

    return res.download(absolutePath, report.fileName);
  });

  app.get('/api/admin/users', requireAdmin, (_req, res) => {
    const users = db.listUsersWithUploadCounts().map(serializeAdminUser);
    res.json({ users });
  });

  app.get('/api/admin/coming-up-events', requireAdmin, (_req, res) => {
    const events = db.listComingUpEvents().map(serializeComingUpEvent);
    res.json({ events });
  });

  app.post('/api/admin/coming-up-events', requireAdmin, (req, res) => {
    const payload = parseComingUpEventPayload(req.body);

    if (!payload.dateLabel) {
      return res.status(400).json({ error: 'A date label is required.' });
    }

    if (!payload.title) {
      return res.status(400).json({ error: 'A title is required.' });
    }

    if (!payload.location) {
      return res.status(400).json({ error: 'A location is required.' });
    }

    const event = db.createComingUpEvent({
      ...payload,
      sortOrder: db.listComingUpEvents().length,
    });

    return res.status(201).json({ event: serializeComingUpEvent(event) });
  });

  app.put('/api/admin/coming-up-events/:eventId', requireAdmin, (req, res) => {
    const eventId = parseIdParam(req.params.eventId);

    if (!eventId) {
      return res.status(400).json({ error: 'A valid event id is required.' });
    }

    const payload = parseComingUpEventPayload(req.body);

    if (!payload.dateLabel) {
      return res.status(400).json({ error: 'A date label is required.' });
    }

    if (!payload.title) {
      return res.status(400).json({ error: 'A title is required.' });
    }

    if (!payload.location) {
      return res.status(400).json({ error: 'A location is required.' });
    }

    const event = db.updateComingUpEvent({
      id: eventId,
      ...payload,
    });

    if (!event) {
      return res.status(404).json({ error: 'Coming up event not found.' });
    }

    return res.json({ event: serializeComingUpEvent(event) });
  });

  app.delete('/api/admin/coming-up-events/:eventId', requireAdmin, (req, res) => {
    const eventId = parseIdParam(req.params.eventId);

    if (!eventId) {
      return res.status(400).json({ error: 'A valid event id is required.' });
    }

    const deletedEvent = db.deleteComingUpEvent(eventId);

    if (!deletedEvent) {
      return res.status(404).json({ error: 'Coming up event not found.' });
    }

    const remainingIds = db.listComingUpEvents().map((event) => event.id);
    db.reorderComingUpEvents(remainingIds);

    return res.json({ deletedEventId: deletedEvent.id });
  });

  app.post('/api/admin/coming-up-events/reorder', requireAdmin, (req, res) => {
    const orderedIds = Array.isArray(req.body?.orderedIds)
      ? req.body.orderedIds.map((id) => parseIdParam(id))
      : null;

    if (!orderedIds || orderedIds.some((id) => id === null)) {
      return res.status(400).json({ error: 'orderedIds must be an array of valid event ids.' });
    }

    const currentIds = db.listComingUpEvents().map((event) => event.id);

    if (orderedIds.length !== currentIds.length) {
      return res.status(400).json({ error: 'orderedIds must exactly match the current event ids.' });
    }

    const orderedIdSet = new Set(orderedIds);

    if (orderedIdSet.size !== currentIds.length || currentIds.some((id) => !orderedIdSet.has(id))) {
      return res.status(400).json({ error: 'orderedIds must exactly match the current event ids.' });
    }

    const events = db.reorderComingUpEvents(orderedIds).map(serializeComingUpEvent);
    return res.json({ events });
  });

  app.patch('/api/admin/users/:userId/member-type', requireAdmin, (req, res) => {
    const userId = parseIdParam(req.params.userId);
    const memberType = String(req.body?.memberType ?? '')
      .trim()
      .toLowerCase();

    if (!userId) {
      return res.status(400).json({ error: 'A valid user id is required.' });
    }

    if (!allowedMemberTypes.has(memberType)) {
      return res.status(400).json({ error: 'A valid member type is required.' });
    }

    const updatedUser = db.setUserMemberTypeById(userId, memberType);

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ user: toSafeUser(updatedUser) });
  });

  app.post('/api/admin/investors/:userId/portfolio', requireAdmin, (req, res) => {
    const userId = parseIdParam(req.params.userId);
    const displayName = trimOptionalString(req.body?.displayName);
    const notes = trimOptionalString(req.body?.notes);

    if (!userId) {
      return res.status(400).json({ error: 'A valid user id is required.' });
    }

    const targetUser = db.findUserById(userId);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (targetUser.memberType !== 'investor') {
      return res.status(400).json({ error: 'Portfolios can only be created for investor users.' });
    }

    const existingPortfolio = db.findInvestmentPortfolioByUserId(userId);

    if (existingPortfolio) {
      return res.status(409).json({ error: 'This investor already has a portfolio.' });
    }

    const portfolio = db.createInvestmentPortfolio({
      userId,
      displayName,
      notes,
    });

    return res.status(201).json({ portfolio: serializeInvestmentPortfolio(portfolio) });
  });

  app.get('/api/admin/investors/:userId/portfolio', requireAdmin, async (req, res) => {
    const userId = parseIdParam(req.params.userId);

    if (!userId) {
      return res.status(400).json({ error: 'A valid user id is required.' });
    }

    const portfolio = db.findInvestmentPortfolioByUserId(userId);

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found.' });
    }

    const transactions = db.listInvestmentTransactionsByPortfolioId(portfolio.id);
    const priceSymbols = [...new Set(transactions.map((transaction) => transaction.assetSymbol))];
    const { livePricesBySymbol, livePrices, pricesLastUpdatedAt } =
      await runWithInvestmentPricingRequestState(() =>
        loadInvestmentPricing(priceSymbols, getInvestmentPrices, getInvestmentPricesLastUpdatedAt)
      );
    const snapshot = buildPortfolioSnapshot(transactions, livePricesBySymbol);
    ensureSeededInvestmentMonthlyHistory(db, portfolio.id);
    const monthlyHistory = appendLatestCompletedMonthSnapshot({
      db,
      portfolioId: portfolio.id,
      summary: snapshot.summary,
      now: now(),
    });

    return res.json({
      portfolio: serializeInvestmentPortfolio(portfolio),
      summary: snapshot.summary,
      holdings: snapshot.holdings,
      transactions: transactions.map(serializeInvestmentTransaction),
      livePrices,
      pricesLastUpdatedAt,
      monthlyPerformance: serializeInvestmentMonthlyPerformance(monthlyHistory),
    });
  });

  app.post('/api/admin/investment/reports/generate-latest', requireAdmin, async (_req, res) => {
    const result = await generateLatestCompletedInvestmentReports({
      db,
      currentDate: now(),
      reportStorageRoot,
      getInvestmentPrices,
      getInvestmentPricesLastUpdatedAt,
      runWithInvestmentPricingRequestState,
    });

    return res.json(result);
  });

  app.post('/api/admin/investment/reports/:monthKey/:reportId/regenerate', requireAdmin, async (req, res) => {
    const reportId = parseIdParam(req.params.reportId);
    const monthKey = String(req.params.monthKey ?? '').trim();

    if (!reportId || !/^\d{4}-\d{2}$/.test(monthKey)) {
      return res.status(400).json({ error: 'A valid report id and month are required.' });
    }

    const existingReport = findAdminInvestmentReportByIdAndMonth(db, reportId, monthKey);

    if (!existingReport) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const portfolio = findInvestmentPortfolioById(db, existingReport.portfolioId);

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found.' });
    }

    const result = await generateInvestmentMonthlyReport({
      db,
      portfolio,
      monthKey,
      currentDate: now(),
      reportStorageRoot,
      getInvestmentPrices,
      getInvestmentPricesLastUpdatedAt,
      runWithInvestmentPricingRequestState,
    });

    if (result.status !== 'ready') {
      return res.status(409).json({ error: 'Report could not be generated for that month.' });
    }

    const refreshedReport = findAdminInvestmentReportByIdAndMonth(db, reportId, monthKey);

    if (!refreshedReport) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    return res.json({
      report: serializeAdminInvestmentMonthlyReport(refreshedReport),
    });
  });

  app.post('/api/admin/investors/:userId/portfolio/transactions', requireAdmin, (req, res) => {
    const userId = parseIdParam(req.params.userId);

    if (!userId) {
      return res.status(400).json({ error: 'A valid user id is required.' });
    }

    const portfolio = db.findInvestmentPortfolioByUserId(userId);

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found.' });
    }

    const parsedPayload = parseTransactionPayload(req.body);

    if ('error' in parsedPayload) {
      return res.status(400).json({ error: parsedPayload.error });
    }

    const transaction = db.createInvestmentTransaction({
      portfolioId: portfolio.id,
      ...parsedPayload,
    });

    return res.status(201).json({
      transaction: serializeInvestmentTransaction(transaction),
    });
  });

  app.patch('/api/admin/portfolio-transactions/:transactionId', requireAdmin, (req, res) => {
    const transactionId = parseIdParam(req.params.transactionId);

    if (!transactionId) {
      return res.status(400).json({ error: 'A valid transaction id is required.' });
    }

    const existingTransaction = db.findInvestmentTransactionById(transactionId);

    if (!existingTransaction) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    const parsedPayload = parseTransactionPayload(req.body);

    if ('error' in parsedPayload) {
      return res.status(400).json({ error: parsedPayload.error });
    }

    const transaction = db.updateInvestmentTransaction({
      id: transactionId,
      ...parsedPayload,
    });

    return res.json({
      transaction: serializeInvestmentTransaction(transaction),
    });
  });

  app.delete('/api/admin/portfolio-transactions/:transactionId', requireAdmin, (req, res) => {
    const transactionId = parseIdParam(req.params.transactionId);

    if (!transactionId) {
      return res.status(400).json({ error: 'A valid transaction id is required.' });
    }

    const deletedTransaction = db.deleteInvestmentTransactionById(transactionId);

    if (!deletedTransaction) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    return res.json({ deletedTransactionId: deletedTransaction.id });
  });

  app.get('/api/admin/videos', requireAdmin, (_req, res) => {
    const videos = db.listAllVideosWithUploader().map(serializeAdminVideo);
    res.json({ videos });
  });

  app.delete('/api/admin/videos/:videoId', requireAdmin, async (req, res) => {
    const videoId = parseIdParam(req.params.videoId);

    if (!videoId) {
      return res.status(400).json({ error: 'A valid video id is required.' });
    }

    const deletedVideo = db.deleteVideoById(videoId);

    if (!deletedVideo) {
      return res.status(404).json({ error: 'Video not found.' });
    }

    await removeStoredVideoFile(deletedVideo.filePath, config).catch(() => {});

    return res.json({ deletedVideoId: deletedVideo.id });
  });

  app.delete('/api/admin/users/:userId', requireAdmin, async (req, res) => {
    const userId = parseIdParam(req.params.userId);

    if (!userId) {
      return res.status(400).json({ error: 'A valid user id is required.' });
    }

    const deleted = db.deleteUserWithVideos(userId);

    if (!deleted) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await Promise.all(
      deleted.videos.map((video) => removeStoredVideoFile(video.filePath, config).catch(() => {}))
    );

    return res.json({
      deletedUserId: deleted.user.id,
      deletedVideoCount: deleted.videos.length,
    });
  });

  app.post('/api/admin/users/:userId/videos/youtube', requireAdmin, (req, res) => {
    const userId = parseIdParam(req.params.userId);

    if (!userId) {
      return res.status(400).json({ error: 'A valid user id is required.' });
    }

    const targetUser = db.findUserById(userId);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const title = String(req.body?.title ?? '').trim();
    const youtubeUrl = String(req.body?.youtubeUrl ?? '').trim();

    if (!title) {
      return res.status(400).json({ error: 'A title is required.' });
    }

    if (!youtubePattern.test(youtubeUrl)) {
      return res.status(400).json({ error: 'Please enter a valid YouTube link.' });
    }

    const video = db.createVideo({
      userId: targetUser.id,
      title,
      sourceType: 'youtube',
      sourceUrl: youtubeUrl,
      filePath: null,
      originalFilename: null,
      durationSeconds: null,
      fileSizeBytes: null,
      status: 'ready',
    });

    const hydratedVideo = findHydratedAdminVideo(db, video.id);

    return res.status(201).json({
      video: hydratedVideo ? serializeAdminVideo(hydratedVideo) : { ...serializeVideo(video), userId },
    });
  });

  app.post('/api/admin/users/:userId/videos/upload', requireAdmin, (req, res) => {
    upload.single('video')(req, res, async (uploadError) => {
      if (uploadError) {
        const message = uploadError instanceof Error ? uploadError.message : 'Upload failed.';
        return res.status(400).json({ error: message });
      }

      const userId = parseIdParam(req.params.userId);
      const file = req.file;

      if (!userId) {
        if (file?.path) {
          await fs.rm(file.path, { force: true }).catch(() => {});
        }
        return res.status(400).json({ error: 'A valid user id is required.' });
      }

      const targetUser = db.findUserById(userId);

      if (!targetUser) {
        if (file?.path) {
          await fs.rm(file.path, { force: true }).catch(() => {});
        }
        return res.status(404).json({ error: 'User not found.' });
      }

      const title = String(req.body?.title ?? '').trim();

      if (!title) {
        if (file?.path) {
          await fs.rm(file.path, { force: true }).catch(() => {});
        }
        return res.status(400).json({ error: 'A title is required.' });
      }

      if (!file) {
        return res.status(400).json({ error: 'Please choose a video file to upload.' });
      }

      try {
        const processed = await processUploadedVideo({
          inputPath: file.path,
          originalFilename: file.originalname,
          processedVideosDirectory: config.processedVideosDirectory,
          publicVideosBasePath: config.publicVideosBasePath,
          maxVideoDurationSeconds: config.maxVideoDurationSeconds,
          targetVideoSizeBytes: config.targetVideoSizeBytes,
          maxAllowedVideoSizeBytes: config.maxAllowedVideoSizeBytes,
        });

        const video = db.createVideo({
          userId: targetUser.id,
          title,
          sourceType: 'upload',
          sourceUrl: null,
          filePath: processed.filePath,
          originalFilename: file.originalname,
          durationSeconds: processed.durationSeconds,
          fileSizeBytes: processed.fileSizeBytes,
          status: 'ready',
        });

        const hydratedVideo = findHydratedAdminVideo(db, video.id);

        return res.status(201).json({
          video: hydratedVideo ? serializeAdminVideo(hydratedVideo) : { ...serializeVideo(video), userId },
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unable to process the uploaded video.';
        return res.status(400).json({ error: message });
      } finally {
        await fs.rm(file.path, { force: true }).catch(() => {});
      }
    });
  });

  app.post('/api/videos/youtube', requireAuth, (req, res) => {
    const title = String(req.body?.title ?? '').trim();
    const youtubeUrl = String(req.body?.youtubeUrl ?? '').trim();

    if (!title) {
      return res.status(400).json({ error: 'A title is required.' });
    }

    if (!youtubePattern.test(youtubeUrl)) {
      return res.status(400).json({ error: 'Please enter a valid YouTube link.' });
    }

    const video = db.createVideo({
      userId: req.session.user.id,
      title,
      sourceType: 'youtube',
      sourceUrl: youtubeUrl,
      filePath: null,
      originalFilename: null,
      durationSeconds: null,
      fileSizeBytes: null,
      status: 'ready',
    });

    return res.status(201).json({ video: serializeVideo(video) });
  });

  app.post('/api/videos/upload', requireAuth, (req, res) => {
    upload.single('video')(req, res, async (uploadError) => {
      if (uploadError) {
        const message = uploadError instanceof Error ? uploadError.message : 'Upload failed.';
        return res.status(400).json({ error: message });
      }

      const title = String(req.body?.title ?? '').trim();
      const file = req.file;

      if (!title) {
        if (file?.path) {
          await fs.rm(file.path, { force: true });
        }
        return res.status(400).json({ error: 'A title is required.' });
      }

      if (!file) {
        return res.status(400).json({ error: 'Please choose a video file to upload.' });
      }

      try {
        const processed = await processUploadedVideoFn({
          inputPath: file.path,
          originalFilename: file.originalname,
          processedVideosDirectory: config.processedVideosDirectory,
          publicVideosBasePath: config.publicVideosBasePath,
          maxVideoDurationSeconds:
            req.session.user.role === 'admin' ? null : config.maxVideoDurationSeconds,
          targetVideoSizeBytes: config.targetVideoSizeBytes,
          maxAllowedVideoSizeBytes: config.maxAllowedVideoSizeBytes,
        });

        const video = db.createVideo({
          userId: req.session.user.id,
          title,
          sourceType: 'upload',
          sourceUrl: null,
          filePath: processed.filePath,
          originalFilename: file.originalname,
          durationSeconds: processed.durationSeconds,
          fileSizeBytes: processed.fileSizeBytes,
          status: 'ready',
        });

        return res.status(201).json({ video: serializeVideo(video) });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to process the uploaded video.';
        return res.status(400).json({ error: message });
      } finally {
        await fs.rm(file.path, { force: true }).catch(() => {});
      }
    });
  });

  app.post('/internal/jobs/investment-reports/generate-latest', async (req, res) => {
    if (!config.cronSecret || req.get('x-cron-secret') !== config.cronSecret) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await generateLatestCompletedInvestmentReports({
      db,
      currentDate: now(),
      reportStorageRoot,
      getInvestmentPrices,
      getInvestmentPricesLastUpdatedAt,
      runWithInvestmentPricingRequestState,
    });

    return res.json(result);
  });

  app.use(express.static(config.frontendDistDirectory));
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    if (req.path.startsWith('/api/') || req.path === '/api') {
      return next();
    }

    if (req.path.startsWith(config.publicVideosBasePath)) {
      return next();
    }

    res.sendFile('index.html', { root: config.frontendDistDirectory });
  });

  return app;
}
