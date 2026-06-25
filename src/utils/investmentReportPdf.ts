import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  InvestmentHolding,
  InvestmentLivePrice,
  InvestmentMonthlyPerformancePoint,
  InvestmentPortfolioResponse,
  InvestmentTransaction,
} from '../services/investment';

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const PAGE_MARGIN = 14;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const SURFACE_FILL: [number, number, number] = [244, 248, 251];
const SURFACE_BORDER: [number, number, number] = [222, 232, 238];
const TEXT_PRIMARY: [number, number, number] = [28, 42, 54];
const TEXT_MUTED: [number, number, number] = [90, 112, 126];
const BRAND_DARK: [number, number, number] = [35, 74, 101];
const BRAND_SOFT: [number, number, number] = [228, 238, 245];
const POSITIVE: [number, number, number] = [22, 128, 110];
const NEGATIVE: [number, number, number] = [189, 84, 58];

const assetAccentBySymbol: Record<string, [number, number, number]> = {
  BTC: [42, 120, 132],
  ETH: [87, 168, 155],
  SOL: [150, 195, 155],
  XRP: [216, 179, 122],
  ADA: [223, 138, 98],
  DOGE: [166, 115, 120],
};

function formatCurrency(value: number) {
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatRoundedCurrency(value: number) {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

function formatPercent(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${Math.abs(value).toFixed(2)}%`;
}

function formatAllocationPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatShares(value: number) {
  return value.toFixed(8);
}

function formatDate(value: string) {
  const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(normalizedValue));
}

function formatSnapshotTime(value: string | null) {
  if (!value) {
    return 'Unavailable';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Unavailable';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsedDate);
}

function getReportMonthLabel(monthlyPerformance: InvestmentMonthlyPerformancePoint[]) {
  if (monthlyPerformance.length > 0) {
    return monthlyPerformance[monthlyPerformance.length - 1].label;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

function drawPageFrame(doc: jsPDF) {
  doc.setFillColor(238, 246, 255);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
  doc.setDrawColor(230, 238, 243);
  doc.setLineWidth(0.4);
  doc.roundedRect(8, 8, PAGE_WIDTH - 16, PAGE_HEIGHT - 16, 6, 6);
}

function drawPageFooter(doc: jsPDF, pageNumber: number) {
  doc.setDrawColor(...SURFACE_BORDER);
  doc.setLineWidth(0.2);
  doc.line(PAGE_MARGIN, PAGE_HEIGHT - 14, PAGE_WIDTH - PAGE_MARGIN, PAGE_HEIGHT - 14);
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Crystal Huang Investor Report', PAGE_MARGIN, PAGE_HEIGHT - 9);
  doc.text(`Page ${pageNumber}`, PAGE_WIDTH - PAGE_MARGIN, PAGE_HEIGHT - 9, {
    align: 'right',
  });
}

function drawSectionCard(doc: jsPDF, x: number, y: number, width: number, height: number) {
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...SURFACE_BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, width, height, 5, 5, 'FD');
}

function drawSectionTitle(
  doc: jsPDF,
  eyebrow: string,
  title: string,
  subtitle: string | null,
  x: number,
  y: number
) {
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(eyebrow.toUpperCase(), x, y);
  doc.setFontSize(16);
  doc.setTextColor(...TEXT_PRIMARY);
  doc.text(title, x, y + 8);

  if (subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(subtitle, x, y + 14);
  }
}

function addCoverHeader(
  doc: jsPDF,
  portfolio: InvestmentPortfolioResponse['portfolio'],
  summary: InvestmentPortfolioResponse['summary'],
  reportMonthLabel: string
) {
  doc.setFillColor(...BRAND_DARK);
  doc.roundedRect(PAGE_MARGIN, 14, CONTENT_WIDTH, 32, 7, 7, 'F');

  doc.setFontSize(9);
  doc.setTextColor(218, 230, 238);
  doc.text('CRYSTAL HUANG', PAGE_MARGIN + 6, 22);
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('Monthly Investment Report', PAGE_MARGIN + 6, 33);
  doc.setFontSize(10);
  doc.text(reportMonthLabel, PAGE_MARGIN + 6, 40);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(PAGE_MARGIN + CONTENT_WIDTH - 62, 19, 56, 22, 5, 5, 'F');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Report snapshot', PAGE_MARGIN + CONTENT_WIDTH - 56, 27);
  doc.setFontSize(13);
  doc.setTextColor(...TEXT_PRIMARY);
  doc.text(formatCurrency(summary.portfolioValue), PAGE_MARGIN + CONTENT_WIDTH - 56, 35);

  doc.setFontSize(10);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Investor', PAGE_MARGIN, 55);
  doc.text('Base currency', PAGE_MARGIN + 66, 55);
  doc.text('Total return', PAGE_MARGIN + 126, 55);

  doc.setFontSize(12);
  doc.setTextColor(...TEXT_PRIMARY);
  doc.text(portfolio.displayName || 'Investor Portfolio', PAGE_MARGIN, 62);
  doc.text(portfolio.baseCurrency, PAGE_MARGIN + 66, 62);
  doc.text(formatPercent(summary.totalReturnPercent), PAGE_MARGIN + 126, 62);
}

function addSummaryCards(
  doc: jsPDF,
  topY: number,
  portfolio: InvestmentPortfolioResponse['portfolio'],
  summary: InvestmentPortfolioResponse['summary'],
  reportMonthLabel: string
) {
  const cards = [
    {
      label: 'Portfolio Owner',
      value: portfolio.displayName || 'Investor Portfolio',
      accent: BRAND_DARK,
    },
    { label: 'Total Invested', value: formatCurrency(summary.totalInvested), accent: BRAND_DARK },
    { label: 'Portfolio Value', value: formatCurrency(summary.portfolioValue), accent: POSITIVE },
    {
      label: 'Unrealized P&L',
      value: formatCurrency(summary.unrealizedPnL),
      accent: summary.unrealizedPnL >= 0 ? POSITIVE : NEGATIVE,
    },
  ];

  cards.forEach((card, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = PAGE_MARGIN + column * 91;
    const y = topY + row * 28;

    drawSectionCard(doc, x, y, 85, 22);
    doc.setFillColor(...card.accent);
    doc.roundedRect(x, y, 3, 22, 1.5, 1.5, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(card.label, x + 8, y + 8);
    doc.setFontSize(12);
    doc.setTextColor(...TEXT_PRIMARY);
    doc.text(card.value, x + 8, y + 15);
  });

  doc.setFontSize(9);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`Report month: ${reportMonthLabel}`, PAGE_MARGIN, topY + 62);
  if (portfolio.notes) {
    doc.text(`Investor note: ${portfolio.notes}`, PAGE_MARGIN + 70, topY + 62);
  }
}

function addLivePricesSnapshot(
  doc: jsPDF,
  livePrices: InvestmentLivePrice[],
  pricesLastUpdatedAt: string | null,
  startY: number
) {
  drawSectionCard(doc, PAGE_MARGIN, startY, CONTENT_WIDTH, 40);
  drawSectionTitle(doc, 'Market Snapshot', 'Live Prices', null, PAGE_MARGIN + 5, startY + 7);
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`Last updated ${formatSnapshotTime(pricesLastUpdatedAt)}`, PAGE_MARGIN + 5, startY + 21);

  const pricesToShow = livePrices.slice(0, 6);
  pricesToShow.forEach((price, index) => {
    const x = PAGE_MARGIN + 5 + index * 31;
    doc.setFillColor(...(assetAccentBySymbol[price.assetSymbol] ?? BRAND_DARK));
    doc.circle(x + 1.5, startY + 30, 1.5, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(price.assetSymbol, x + 5, startY + 28);
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_PRIMARY);
    doc.text(formatCurrency(price.currentPrice), x + 5, startY + 34);
  });
}

function addHoldingsTable(doc: jsPDF, holdings: InvestmentHolding[], startY: number) {
  const sectionHeight = Math.max(62, 22 + holdings.length * 19);
  drawSectionCard(doc, PAGE_MARGIN, startY, CONTENT_WIDTH, sectionHeight);
  drawSectionTitle(
    doc,
    'Current Positions',
    'Holdings',
    'Asset weight, invested capital, current value, and unrealized performance.',
    PAGE_MARGIN + 5,
    startY + 7
  );

  autoTable(doc, {
    startY: startY + 20,
    head: [['Asset', 'Quantity', 'Invested', 'Value', 'P&L']],
    body: holdings.map((holding) => [
      `${holding.assetSymbol}\n${holding.assetName} - ${formatAllocationPercent(holding.allocationPercent)}`,
      formatShares(holding.quantity),
      formatCurrency(holding.invested),
      formatCurrency(holding.currentValue),
      formatCurrency(holding.unrealizedPnL),
    ]),
    theme: 'plain',
    headStyles: {
      fillColor: SURFACE_FILL,
      textColor: TEXT_PRIMARY,
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: TEXT_PRIMARY,
      cellPadding: 3,
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 251, 253],
    },
    columnStyles: {
      0: { cellWidth: 46 },
      1: { cellWidth: 33 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 28 },
    },
    styles: {
      fontSize: 8.6,
      overflow: 'linebreak',
    },
    pageBreak: 'avoid',
    rowPageBreak: 'avoid',
    margin: { left: PAGE_MARGIN + 4, right: PAGE_MARGIN + 4 },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.column.index === 4) {
        const value = holdings[hookData.row.index]?.unrealizedPnL ?? 0;
        hookData.cell.styles.textColor = value >= 0 ? POSITIVE : NEGATIVE;
      }
    },
  });
}

function addAllocationSection(doc: jsPDF, holdings: InvestmentHolding[], startY: number) {
  drawSectionCard(doc, PAGE_MARGIN, startY, CONTENT_WIDTH, 68);
  drawSectionTitle(
    doc,
    'Portfolio Mix',
    'Allocation',
    'Weighting across active positions based on current market value.',
    PAGE_MARGIN + 5,
    startY + 7
  );

  const centerX = PAGE_MARGIN + 32;
  const centerY = startY + 43;
  const outerRadius = 18;
  const innerRadius = 10;
  let currentAngle = -90;

  holdings.forEach((holding) => {
    const sweepAngle = (holding.allocationPercent / 100) * 360;
    const color = assetAccentBySymbol[holding.assetSymbol] ?? BRAND_DARK;
    drawDonutSegment(doc, centerX, centerY, outerRadius, innerRadius, currentAngle, sweepAngle, color);
    currentAngle += sweepAngle;
  });

  holdings.forEach((holding, index) => {
    const column = index >= 3 ? 1 : 0;
    const row = index % 3;
    const x = PAGE_MARGIN + 64 + column * 63;
    const y = startY + 34 + row * 10;
    const color = assetAccentBySymbol[holding.assetSymbol] ?? BRAND_DARK;
    doc.setFillColor(...color);
    doc.circle(x, y - 1.5, 1.4, 'F');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_PRIMARY);
    doc.text(holding.assetSymbol, x + 4, y);
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(`${holding.assetName} - ${formatAllocationPercent(holding.allocationPercent)}`, x + 18, y);
  });
}

function drawDonutSegment(
  doc: jsPDF,
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  sweepAngle: number,
  color: [number, number, number]
) {
  const points = [];
  const steps = Math.max(6, Math.ceil(Math.abs(sweepAngle) / 12));

  for (let index = 0; index <= steps; index += 1) {
    const angle = startAngle + (sweepAngle * index) / steps;
    const radians = (angle * Math.PI) / 180;
    points.push([
      centerX + outerRadius * Math.cos(radians),
      centerY + outerRadius * Math.sin(radians),
    ]);
  }

  for (let index = steps; index >= 0; index -= 1) {
    const angle = startAngle + (sweepAngle * index) / steps;
    const radians = (angle * Math.PI) / 180;
    points.push([
      centerX + innerRadius * Math.cos(radians),
      centerY + innerRadius * Math.sin(radians),
    ]);
  }

  doc.setFillColor(...color);
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1.2);
  doc.lines(
    points.slice(1).map(([x, y], index) => [x - points[index][0], y - points[index][1]]),
    points[0][0],
    points[0][1],
    [1, 1],
    'FD',
    true
  );
}

function addPerformanceSection(
  doc: jsPDF,
  monthlyPerformance: InvestmentMonthlyPerformancePoint[],
  startY: number
) {
  drawSectionCard(doc, PAGE_MARGIN, startY, CONTENT_WIDTH, 84);
  drawSectionTitle(
    doc,
    'Performance',
    'Monthly Portfolio Value',
    'Month-end portfolio totals seeded from historical records and extended as new months close.',
    PAGE_MARGIN + 5,
    startY + 7
  );

  const chartX = PAGE_MARGIN + 6;
  const chartY = startY + 26;
  const chartWidth = CONTENT_WIDTH - 12;
  const chartHeight = 48;
  doc.setFillColor(...SURFACE_FILL);
  doc.roundedRect(chartX, chartY, chartWidth, chartHeight, 4, 4, 'F');

  if (monthlyPerformance.length > 0) {
    const values = monthlyPerformance.map((point) => point.portfolioValue);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const rawRange = maxValue - minValue || 1;
    const paddedMin = Math.floor((minValue - rawRange * 0.08) / 5000) * 5000;
    const paddedMax = Math.ceil((maxValue + rawRange * 0.08) / 5000) * 5000;
    const chartMin = Math.max(0, paddedMin);
    const chartMax = Math.max(chartMin + 5000, paddedMax);
    const range = chartMax - chartMin;
    const tickCount = 5;
    const plotLeft = chartX + 22;
    const plotRight = chartX + chartWidth - 8;
    const plotTop = chartY + 8;
    const plotBottom = chartY + chartHeight - 10;

    for (let tickIndex = 0; tickIndex <= tickCount; tickIndex += 1) {
      const ratio = tickIndex / tickCount;
      const y = plotBottom - ratio * (plotBottom - plotTop);
      const tickValue = chartMin + ratio * range;

      doc.setDrawColor(210, 224, 236);
      doc.setLineWidth(0.25);
      doc.line(plotLeft, y, plotRight, y);

      doc.setFontSize(8);
      doc.setTextColor(...TEXT_MUTED);
      doc.text(formatRoundedCurrency(tickValue), plotLeft - 8, y + 1, {
        align: 'right',
      });
    }

    const points = monthlyPerformance.map((point, index) => {
      const x =
        monthlyPerformance.length === 1
          ? (plotLeft + plotRight) / 2
          : plotLeft + (index * (plotRight - plotLeft)) / (monthlyPerformance.length - 1);
      const normalized = (point.portfolioValue - chartMin) / range;
      const y = plotBottom - normalized * (plotBottom - plotTop);

      return { x, y, ...point };
    });

    doc.setDrawColor(...BRAND_DARK);
    doc.setLineWidth(1.1);
    for (let index = 1; index < points.length; index += 1) {
      doc.line(points[index - 1].x, points[index - 1].y, points[index].x, points[index].y);
    }

    points.forEach((point) => {
      doc.setFillColor(19, 55, 78);
      doc.circle(point.x, point.y, 1.1, 'F');

      doc.setFontSize(7.5);
      doc.setTextColor(...TEXT_MUTED);
      doc.text(point.label, point.x, plotBottom + 5, {
        align: 'center',
      });
    });
  }

  return startY + 84;
}

function addTransactionsTable(doc: jsPDF, transactions: InvestmentTransaction[], startY: number) {
  drawSectionTitle(
    doc,
    'Transaction Archive',
    'Purchase History',
    'Executed buy transactions recorded in the investor portfolio.',
    PAGE_MARGIN,
    startY
  );

  autoTable(doc, {
    startY: startY + 12,
    head: [['Date', 'Asset', 'Invested', 'Price', 'Shares', 'Notes']],
    body: transactions.map((transaction) => [
      formatDate(transaction.purchaseDate),
      `${transaction.assetSymbol} - ${transaction.assetName}`,
      formatCurrency(transaction.amountInvested),
      formatCurrency(transaction.purchasePrice),
      formatShares(transaction.purchaseShares),
      transaction.notes ?? '',
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: SURFACE_FILL,
      textColor: TEXT_PRIMARY,
      lineColor: SURFACE_BORDER,
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: TEXT_PRIMARY,
      lineColor: [235, 241, 245],
      cellPadding: 3,
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [250, 252, 254],
    },
    styles: {
      fontSize: 8.5,
      overflow: 'linebreak',
    },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 34 },
      2: { cellWidth: 27 },
      3: { cellWidth: 27 },
      4: { cellWidth: 24 },
      5: { cellWidth: 42 },
    },
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
  });

  const finalY =
    (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? startY + 40;

  return finalY;
}

export function buildInvestmentReportFilename(portfolioName: string, reportMonthLabel: string) {
  const slug = (portfolioName || 'investor-portfolio')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const monthSlug = reportMonthLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return `${slug || 'investor-portfolio'}-${monthSlug || 'monthly-report'}.pdf`;
}

export function createInvestmentReportPdfDocument(data: InvestmentPortfolioResponse) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const reportMonthLabel = getReportMonthLabel(data.monthlyPerformance);

  drawPageFrame(doc);
  addCoverHeader(doc, data.portfolio, data.summary, reportMonthLabel);
  addSummaryCards(doc, 68, data.portfolio, data.summary, reportMonthLabel);
  addLivePricesSnapshot(doc, data.livePrices, data.pricesLastUpdatedAt, 136);
  addAllocationSection(doc, data.holdings, 182);

  doc.addPage();
  drawPageFrame(doc);
  const performanceEndY = addPerformanceSection(doc, data.monthlyPerformance, 20);
  addHoldingsTable(doc, data.holdings, performanceEndY + 8);

  const totalPages = doc.getNumberOfPages();
  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    doc.setPage(pageNumber);
    drawPageFooter(doc, pageNumber);
  }

  return {
    doc,
    reportMonthLabel,
  };
}

export function downloadInvestmentReportPdf(data: InvestmentPortfolioResponse) {
  const { doc, reportMonthLabel } = createInvestmentReportPdfDocument(data);
  doc.save(
    buildInvestmentReportFilename(data.portfolio.displayName || 'investor-portfolio', reportMonthLabel)
  );
}
