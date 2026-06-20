import { render, screen } from '@testing-library/react';
import AllocationChart from './AllocationChart';

describe('AllocationChart', () => {
  it('renders a donut chart legend with asset allocations', () => {
    render(
      <AllocationChart
        holdings={[
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
          {
            assetSymbol: 'ETH',
            assetName: 'Ethereum',
            quantity: 17.69,
            invested: 27597.8,
            averageCost: 1559.5,
            currentPrice: 1720,
            currentValue: 30448.62,
            unrealizedPnL: 2850.82,
            allocationPercent: 39.2,
          },
        ]}
      />
    );

    expect(screen.getByLabelText('Portfolio allocation chart')).toBeInTheDocument();
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('Bitcoin · 28.6%')).toBeInTheDocument();
    expect(screen.getByText('ETH')).toBeInTheDocument();
    expect(screen.getByText('Ethereum · 39.2%')).toBeInTheDocument();
  });
});
