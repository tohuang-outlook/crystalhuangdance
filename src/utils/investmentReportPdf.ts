import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  InvestmentHolding,
  InvestmentMonthlyPerformancePoint,
  InvestmentPortfolioResponse,
  InvestmentTransaction,
} from '../services/investment';

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

function getReportMonthLabel(monthlyPerformance: InvestmentMonthlyPerformancePoint[]) {
  if (monthlyPerformance.length > 0) {
    return monthlyPerformance[monthlyPerformance.length - 1].label;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

function addSummaryCards(
  doc: jsPDF,
  topY: number,
  portfolio: InvestmentPortfolioResponse['portfolio'],
  summary: InvestmentPortfolioResponse['summary'],
  reportMonthLabel: string
) {
  const cardWidth = 42;
  const cardGap = 6;
  const cardHeight = 24;
  const startX = 14;
  const cards = [
    ['Investor', portfolio.displayName || 'Investor Portfolio'],
    ['Total Invested', formatCurrency(summary.totalInvested)],
    ['Portfolio Value', formatCurrency(summary.portfolioValue)],
    ['Unrealized P&L', formatCurrency(summary.unrealizedPnL)],
  ];

  cards.forEach(([label, value], index) => {
    const x = startX + index * (cardWidth + cardGap);
    doc.setFillColor(245, 249, 252);
    doc.roundedRect(x, topY, cardWidth, cardHeight, 4, 4, 'F');
    doc.setFontSize(8);
    doc.setTextColor(90, 112, 126);
    doc.text(label, x + 4, topY + 7);
    doc.setFontSize(label === 'Investor' ? 10 : 11);
    doc.setTextColor(28, 42, 54);
    doc.text(value, x + 4, topY + 15);
  });

  doc.setFontSize(10);
  doc.setTextColor(90, 112, 126);
  doc.text(`Report month: ${reportMonthLabel}`, 14, topY + cardHeight + 8);
  doc.text(`Base currency: ${portfolio.baseCurrency}`, 78, topY + cardHeight + 8);
  doc.text(`Total return: ${formatPercent(summary.totalReturnPercent)}`, 134, topY + cardHeight + 8);
}

function addHoldingsTable(doc: jsPDF, holdings: InvestmentHolding[], startY: number) {
  doc.setFontSize(16);
  doc.setTextColor(28, 42, 54);
  doc.text('Holdings', 14, startY);

  autoTable(doc, {
    startY: startY + 4,
    head: [['Asset', 'Quantity', 'Invested', 'Value', 'P&L']],
    body: holdings.map((holding) => [
      `${holding.assetSymbol}\n${holding.assetName} - ${formatAllocationPercent(holding.allocationPercent)}`,
      formatShares(holding.quantity),
      formatCurrency(holding.invested),
      formatCurrency(holding.currentValue),
      formatCurrency(holding.unrealizedPnL),
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [244, 248, 251],
      textColor: [28, 42, 54],
      lineColor: [220, 230, 237],
    },
    bodyStyles: {
      textColor: [44, 58, 70],
      lineColor: [232, 239, 244],
      cellPadding: 3,
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 44 },
      1: { cellWidth: 34 },
      2: { cellWidth: 34 },
      3: { cellWidth: 34 },
      4: { cellWidth: 28 },
    },
    styles: {
      fontSize: 9,
      overflow: 'linebreak',
    },
    margin: { left: 14, right: 14 },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.column.index === 4) {
        const value = holdings[hookData.row.index]?.unrealizedPnL ?? 0;
        hookData.cell.styles.textColor = value >= 0 ? [22, 128, 110] : [189, 84, 58];
      }
    },
  });
}

function addAllocationSection(doc: jsPDF, holdings: InvestmentHolding[], startY: number) {
  const sectionTop = startY;
  doc.setFontSize(16);
  doc.setTextColor(28, 42, 54);
  doc.text('Allocation', 14, sectionTop);

  const centerX = 42;
  const centerY = sectionTop + 34;
  const outerRadius = 20;
  const innerRadius = 11;
  let currentAngle = -90;

  holdings.forEach((holding) => {
    const sweepAngle = (holding.allocationPercent / 100) * 360;
    const color = assetAccentBySymbol[holding.assetSymbol] ?? [42, 120, 132];
    drawDonutSegment(doc, centerX, centerY, outerRadius, innerRadius, currentAngle, sweepAngle, color);
    currentAngle += sweepAngle;
  });

  holdings.forEach((holding, index) => {
    const y = sectionTop + 12 + index * 10;
    const color = assetAccentBySymbol[holding.assetSymbol] ?? [42, 120, 132];
    doc.setFillColor(...color);
    doc.circle(82, y - 1.5, 1.5, 'F');
    doc.setFontSize(10);
    doc.setTextColor(28, 42, 54);
    doc.text(holding.assetSymbol, 87, y);
    doc.setFontSize(9);
    doc.setTextColor(90, 112, 126);
    doc.text(`${holding.assetName} - ${formatAllocationPercent(holding.allocationPercent)}`, 102, y);
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
  const endAngle = startAngle + sweepAngle;
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
  doc.setFontSize(16);
  doc.setTextColor(28, 42, 54);
  doc.text('Monthly Portfolio Value', 14, startY);

  const chartX = 14;
  const chartY = startY + 8;
  const chartWidth = 182;
  const chartHeight = 46;
  doc.setFillColor(245, 249, 252);
  doc.roundedRect(chartX, chartY, chartWidth, chartHeight, 4, 4, 'F');

  if (monthlyPerformance.length > 0) {
    const values = monthlyPerformance.map((point) => point.portfolioValue);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    const points = monthlyPerformance.map((point, index) => {
      const x =
        monthlyPerformance.length === 1
          ? chartX + chartWidth / 2
          : chartX + 12 + (index * (chartWidth - 24)) / (monthlyPerformance.length - 1);
      const normalized = (point.portfolioValue - minValue) / range;
      const y = chartY + chartHeight - 10 - normalized * (chartHeight - 18);

      return { x, y, ...point };
    });

    doc.setDrawColor(42, 79, 110);
    doc.setLineWidth(1.2);
    for (let index = 1; index < points.length; index += 1) {
      doc.line(points[index - 1].x, points[index - 1].y, points[index].x, points[index].y);
    }

    points.forEach((point) => {
      doc.setFillColor(19, 55, 78);
      doc.circle(point.x, point.y, 1.2, 'F');
    });
  }

  autoTable(doc, {
    startY: chartY + chartHeight + 6,
    head: [['Month', 'Portfolio Value']],
    body: monthlyPerformance.map((point) => [point.label, formatCurrency(point.portfolioValue)]),
    theme: 'grid',
    headStyles: {
      fillColor: [244, 248, 251],
      textColor: [28, 42, 54],
      lineColor: [220, 230, 237],
    },
    bodyStyles: {
      textColor: [44, 58, 70],
      lineColor: [232, 239, 244],
      cellPadding: 3,
    },
    styles: {
      fontSize: 9,
    },
    margin: { left: 14, right: 14 },
  });
}

function addTransactionsSection(doc: jsPDF, transactions: InvestmentTransaction[]) {
  doc.addPage();
  doc.setFontSize(18);
  doc.setTextColor(28, 42, 54);
  doc.text('Purchase History', 14, 18);

  autoTable(doc, {
    startY: 24,
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
      fillColor: [244, 248, 251],
      textColor: [28, 42, 54],
      lineColor: [220, 230, 237],
    },
    bodyStyles: {
      textColor: [44, 58, 70],
      lineColor: [232, 239, 244],
      cellPadding: 3,
      valign: 'middle',
    },
    styles: {
      fontSize: 9,
      overflow: 'linebreak',
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 34 },
      2: { cellWidth: 28 },
      3: { cellWidth: 28 },
      4: { cellWidth: 25 },
      5: { cellWidth: 44 },
    },
    margin: { left: 14, right: 14 },
  });
}

export function buildInvestmentReportFilename(portfolioName: string, reportMonthLabel: string) {
  const slug = (portfolioName || 'investor-portfolio')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const monthSlug = reportMonthLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return `${slug || 'investor-portfolio'}-${monthSlug || 'monthly-report'}.pdf`;
}

export function downloadInvestmentReportPdf(data: InvestmentPortfolioResponse) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const reportMonthLabel = getReportMonthLabel(data.monthlyPerformance);

  doc.setFillColor(238, 246, 255);
  doc.rect(0, 0, 210, 297, 'F');
  doc.setFontSize(10);
  doc.setTextColor(82, 112, 126);
  doc.text('CRYSTAL HUANG', 14, 16);
  doc.setFontSize(24);
  doc.setTextColor(28, 42, 54);
  doc.text('Monthly Investment Report', 14, 27);
  doc.setFontSize(11);
  doc.setTextColor(90, 112, 126);
  doc.text(reportMonthLabel, 14, 34);

  addSummaryCards(doc, 42, data.portfolio, data.summary, reportMonthLabel);
  addHoldingsTable(doc, data.holdings, 78);
  const afterHoldingsY = ((doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 120) + 10;
  addAllocationSection(doc, data.holdings, afterHoldingsY);
  addPerformanceSection(doc, data.monthlyPerformance, afterHoldingsY + 62);
  addTransactionsSection(doc, data.transactions);

  doc.save(buildInvestmentReportFilename(data.portfolio.displayName || 'investor-portfolio', reportMonthLabel));
}
