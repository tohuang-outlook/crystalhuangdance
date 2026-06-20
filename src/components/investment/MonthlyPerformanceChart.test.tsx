import { render, screen } from '@testing-library/react';
import MonthlyPerformanceChart from './MonthlyPerformanceChart';

describe('MonthlyPerformanceChart', () => {
  it('renders rounded y-axis currency ticks in $5,000 steps', () => {
    render(
      <MonthlyPerformanceChart
        monthlyPerformance={[
          { month: '2026-01', label: 'Jan 2026', portfolioValue: 45283.78 },
          { month: '2026-02', label: 'Feb 2026', portfolioValue: 36456.4 },
          { month: '2026-03', label: 'Mar 2026', portfolioValue: 31754.3 },
          { month: '2026-04', label: 'Apr 2026', portfolioValue: 32263.08 },
          { month: '2026-05', label: 'May 2026', portfolioValue: 34855.04 },
        ]}
      />
    );

    expect(screen.getByText('$30,000')).toBeInTheDocument();
    expect(screen.getByText('$35,000')).toBeInTheDocument();
    expect(screen.getByText('$40,000')).toBeInTheDocument();
    expect(screen.getByText('$45,000')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
  });
});
