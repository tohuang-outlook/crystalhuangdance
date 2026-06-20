import { act, render, screen, within } from '@testing-library/react';
import App from './App';
import { siteConfig } from './data/siteData';

const forgotPasswordSuccessMessage =
  'If an account exists for this email, a reset link has been sent.';

describe('App dossier layout', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });
  });

  it('renders the dossier-first sections in English by default', () => {
    render(<App />);
    const masterClassArchive = screen.getByRole('region', {
      name: /Master Class and Choreographer/i,
    });

    expect(
      screen.getByRole('heading', { name: /Crystal Huang/i, level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Artist Profile/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Training Archive/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Artistic Range/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Featured Performance Reels/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Master Class and Choreographer/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Groups Choreography/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Selected Master Class Moments/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/A focused archive of master classes/i)).toBeInTheDocument();
    expect(
      within(masterClassArchive).getByRole('heading', { name: /Archive Timeline/i })
    ).toBeInTheDocument();
    expect(within(masterClassArchive).getAllByText(/ABT School/i).length).toBeGreaterThan(0);
    expect(within(masterClassArchive).getAllByText(/Yearning Heart/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /Professional Inquiries/i })).toBeInTheDocument();
  });

  it('switches to Chinese dossier labels', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({ user: userEvent.setup() }));
    render(<App />);

    await user.click(screen.getByRole('button', { name: /switch language/i }));
    const masterClassArchive = screen.getByRole('region', {
      name: '大師課與編舞指導',
    });

    expect(screen.getByRole('heading', { name: '藝術家簡介' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '訓練檔案' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '藝術範圍' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '精選演出影片' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '大師課與編舞指導' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '群體編舞作品' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '精選大師課片段' })).toBeInTheDocument();
    expect(within(masterClassArchive).getByRole('heading', { name: '完整檔案時間線' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '專業洽詢' })).toBeInTheDocument();
  });

  it('renders archive entry point labels from shared site data', () => {
    render(<App />);

    for (const entryPoint of siteConfig.archiveEntryPoints) {
      expect(screen.getAllByText(entryPoint.title, { exact: true }).length).toBeGreaterThan(0);
    }
  });

  it('renders a formal archive navigation and professional footer copy', () => {
    render(<App />);

    expect(screen.getAllByRole('link', { name: /Profile/i })[0]).toHaveAttribute('href', '#profile');
    expect(screen.getAllByRole('link', { name: /Archive/i })[0]).toHaveAttribute('href', '#archive');
    expect(screen.getByText(/curated artist archive/i)).toBeInTheDocument();
  });

  it('keeps the archive entry points and professional inquiries visible in Chinese', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({ user: userEvent.setup() }));
    render(<App />);

    await user.click(screen.getByRole('button', { name: /switch language/i }));

    expect(screen.getAllByText('舞作範圍', { exact: true }).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: '專業洽詢' })).toBeInTheDocument();
  });

  it('redirects logged-out visitors from protected routes to login', async () => {
    window.history.replaceState({}, '', '/upload');
    render(<App />);

    expect(
      await screen.findByRole('heading', { name: /Sign in to manage uploads and video access/i })
    ).toBeInTheDocument();
  });

  it('redirects non-admin users away from the admin console', async () => {
    window.history.replaceState({}, '', '/admin');
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(
          JSON.stringify({
            user: {
              id: 7,
              email: 'viewer@example.com',
              role: 'user',
              memberType: 'dancer',
            },
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (url.endsWith('/api/videos')) {
        return new Response(JSON.stringify({ videos: [] }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    expect(await screen.findByRole('heading', { name: /^my videos$/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /User and video oversight/i })).not.toBeInTheDocument();
  });

  it('shows direct authenticated navigation links when the user is an admin', async () => {
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(JSON.stringify({ user: { id: 1, email: 'admin@example.com', role: 'admin' } }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    expect(await screen.findByText('admin')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'My Videos' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Upload' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Admin' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('removes the five-minute upload messaging for admins', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({
      user: userEvent.setup(),
    }));
    window.history.replaceState({}, '', '/upload');
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(JSON.stringify({ user: { id: 1, email: 'admin@example.com', role: 'admin' } }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    expect(await screen.findByRole('heading', { name: /Upload a new video/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Upload File/i }));
    expect(screen.queryByText(/^5 minutes$/i)).not.toBeInTheDocument();
    expect(screen.getByText(/No maximum length for admin uploads/i)).toBeInTheDocument();
  });

  it('navigates from login to forgot password', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({
      user: userEvent.setup(),
    }));
    window.history.replaceState({}, '', '/login');
    render(<App />);

    await user.click(screen.getByRole('link', { name: /request a reset link/i }));

    expect(
      await screen.findByRole('heading', {
        name: /Reset your password without contacting support/i,
      })
    ).toBeInTheDocument();
  });

  it('routes investor users to my investment after login', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({
      user: userEvent.setup(),
    }));

    window.history.replaceState({}, '', '/login');
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (url.endsWith('/api/auth/login')) {
        return new Response(
          JSON.stringify({
            user: {
              id: 7,
              email: 'jennifer@example.com',
              role: 'user',
              memberType: 'investor',
            },
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (url.endsWith('/api/investment/me')) {
        return new Response(
          JSON.stringify({
            portfolio: {
              id: 1,
              userId: 7,
              baseCurrency: 'USD',
              displayName: 'Jennifer Portfolio',
              notes: null,
              createdAt: '2026-06-18T00:00:00.000Z',
              updatedAt: '2026-06-18T00:00:00.000Z',
            },
            summary: {
              totalInvested: 5000,
              portfolioValue: 5400,
              unrealizedPnL: 400,
              totalReturnPercent: 8,
            },
            holdings: [
              {
                assetSymbol: 'BTC',
                assetName: 'Bitcoin',
                quantity: 0.1,
                invested: 5000,
                averageCost: 50000,
                currentPrice: 54000,
                currentValue: 5400,
                unrealizedPnL: 400,
                allocationPercent: 100,
              },
            ],
            transactions: [],
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      throw new Error(`Unhandled fetch request in App tests: ${url} (${init?.method ?? 'GET'})`);
    });

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'jennifer@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('heading', { name: /my investment/i })).toBeInTheDocument();
  });

  it('renders investor holdings from the investment api', async () => {
    window.history.replaceState({}, '', '/investment');

    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(
          JSON.stringify({
            user: {
              id: 11,
              email: 'jennifer@example.com',
              role: 'user',
              memberType: 'investor',
            },
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (url.endsWith('/api/investment/me')) {
        return new Response(
          JSON.stringify({
            portfolio: {
              id: 1,
              userId: 11,
              baseCurrency: 'USD',
              displayName: 'Jennifer Portfolio',
              notes: null,
              createdAt: '2026-06-18T00:00:00.000Z',
              updatedAt: '2026-06-18T00:00:00.000Z',
            },
            summary: {
              totalInvested: 5000,
              portfolioValue: 5400,
              unrealizedPnL: 400,
              totalReturnPercent: 8,
            },
            holdings: [
              {
                assetSymbol: 'BTC',
                assetName: 'Bitcoin',
                quantity: 0.1,
                invested: 5000,
                averageCost: 50000,
                currentPrice: 54000,
                currentValue: 5400,
                unrealizedPnL: 400,
                allocationPercent: 100,
              },
            ],
            transactions: [],
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    expect(await screen.findByText('BTC')).toBeInTheDocument();
    expect(screen.getAllByText('$5,400.00').length).toBeGreaterThan(0);
  });

  it('renders live prices and current price data for investor users', async () => {
    window.history.replaceState({}, '', '/investment');

    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(
          JSON.stringify({
            user: {
              id: 7,
              email: 'jennifer@example.com',
              role: 'user',
              memberType: 'investor',
            },
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (url.endsWith('/api/investment/me')) {
        return new Response(
          JSON.stringify({
            portfolio: {
              id: 1,
              userId: 7,
              baseCurrency: 'USD',
              displayName: 'Jennifer Portfolio',
              notes: null,
              createdAt: '2026-06-19T00:00:00.000Z',
              updatedAt: '2026-06-19T00:00:00.000Z',
            },
            summary: {
              totalInvested: 5000,
              portfolioValue: 5400,
              unrealizedPnL: 400,
              totalReturnPercent: 8,
            },
            livePrices: [
              {
                assetSymbol: 'BTC',
                assetName: 'Bitcoin',
                currentPrice: 54000,
              },
            ],
            pricesLastUpdatedAt: '2026-06-19T16:00:00.000Z',
            holdings: [
              {
                assetSymbol: 'BTC',
                assetName: 'Bitcoin',
                quantity: 0.1,
                invested: 5000,
                averageCost: 50000,
                currentPrice: 54000,
                currentValue: 5400,
                unrealizedPnL: 400,
                allocationPercent: 100,
              },
            ],
            transactions: [],
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    await screen.findByRole('heading', { name: /my investment/i });

    expect(screen.getByText('Live Prices')).toBeInTheDocument();
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getAllByText('$54,000.00').length).toBeGreaterThan(0);
    expect(screen.getByRole('columnheader', { name: /Current Price/i })).toBeInTheDocument();
  });

  it('refreshes the investor snapshot every 60 seconds without showing the first-load placeholder again', async () => {
    window.history.replaceState({}, '', '/investment');

    let portfolioFetchCount = 0;
    vi.useFakeTimers({ shouldAdvanceTime: true });

    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(
          JSON.stringify({
            user: {
              id: 7,
              email: 'jennifer@example.com',
              role: 'user',
              memberType: 'investor',
            },
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (url.endsWith('/api/investment/me')) {
        portfolioFetchCount += 1;
        const currentPrice = portfolioFetchCount === 1 ? 54000 : 55000;

        return new Response(
          JSON.stringify({
            portfolio: {
              id: 1,
              userId: 7,
              baseCurrency: 'USD',
              displayName: 'Jennifer Portfolio',
              notes: null,
              createdAt: '2026-06-19T00:00:00.000Z',
              updatedAt: '2026-06-19T00:00:00.000Z',
            },
            summary: {
              totalInvested: 5000,
              portfolioValue: currentPrice * 0.1,
              unrealizedPnL: currentPrice * 0.1 - 5000,
              totalReturnPercent: currentPrice === 54000 ? 8 : 10,
            },
            livePrices: [
              {
                assetSymbol: 'BTC',
                assetName: 'Bitcoin',
                currentPrice,
              },
            ],
            pricesLastUpdatedAt: '2026-06-19T16:00:00.000Z',
            holdings: [
              {
                assetSymbol: 'BTC',
                assetName: 'Bitcoin',
                quantity: 0.1,
                invested: 5000,
                averageCost: 50000,
                currentPrice,
                currentValue: currentPrice * 0.1,
                unrealizedPnL: currentPrice * 0.1 - 5000,
                allocationPercent: 100,
              },
            ],
            transactions: [],
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    try {
      render(<App />);

      expect((await screen.findAllByText('$5,400.00')).length).toBeGreaterThan(0);
      expect(screen.queryByText(/Preparing your investment snapshot/i)).not.toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000);
      });

      expect((await screen.findAllByText('$5,500.00')).length).toBeGreaterThan(0);
      expect(screen.queryByText(/Preparing your investment snapshot/i)).not.toBeInTheDocument();
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it('renders the monthly portfolio value chart between holdings and purchase history', async () => {
    window.history.replaceState({}, '', '/investment');

    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(
          JSON.stringify({
            user: {
              id: 11,
              email: 'investor@example.com',
              role: 'user',
              memberType: 'investor',
            },
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (url.endsWith('/api/investment/me')) {
        return new Response(
          JSON.stringify({
            portfolio: {
              id: 7,
              userId: 11,
              baseCurrency: 'USD',
              displayName: 'Jennifer Portfolio',
              notes: null,
              createdAt: '2026-06-18T00:00:00.000Z',
              updatedAt: '2026-06-18T00:00:00.000Z',
            },
            summary: {
              totalInvested: 50000,
              portfolioValue: 34855.04,
              unrealizedPnL: -15144.96,
              totalReturnPercent: -30.29,
            },
            holdings: [],
            transactions: [
              {
                id: 1,
                portfolioId: 7,
                assetSymbol: 'BTC',
                assetName: 'Bitcoin',
                transactionType: 'buy',
                amountInvested: 5000,
                purchasePrice: 50000,
                purchaseShares: 0.1,
                purchaseDate: '2026-05-12',
                notes: null,
                createdAt: '2026-06-18T00:00:00.000Z',
                updatedAt: '2026-06-18T00:00:00.000Z',
              },
            ],
            livePrices: [],
            pricesLastUpdatedAt: '2026-06-19T16:00:00.000Z',
            monthlyPerformance: [
              { month: '2026-01', label: 'Jan 2026', portfolioValue: 45283.78 },
              { month: '2026-02', label: 'Feb 2026', portfolioValue: 36456.4 },
              { month: '2026-03', label: 'Mar 2026', portfolioValue: 31754.3 },
              { month: '2026-04', label: 'Apr 2026', portfolioValue: 32263.08 },
              { month: '2026-05', label: 'May 2026', portfolioValue: 34855.04 },
            ],
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    expect(
      await screen.findByRole('heading', { name: 'Monthly Portfolio Value' })
    ).toBeInTheDocument();

    const holdingsHeading = screen.getByRole('heading', { name: 'Current Holdings' });
    const chartHeading = screen.getByRole('heading', { name: 'Monthly Portfolio Value' });
    const historyHeading = screen.getByRole('heading', { name: 'Purchase History' });

    expect(holdingsHeading.compareDocumentPosition(chartHeading)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(chartHeading.compareDocumentPosition(historyHeading)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(screen.getAllByText('Jan 2026').length).toBeGreaterThan(0);
    expect(screen.getAllByText('May 2026').length).toBeGreaterThan(0);
  });

  it('routes dancer users to my videos after login', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({
      user: userEvent.setup(),
    }));

    window.history.replaceState({}, '', '/login');
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (url.endsWith('/api/auth/login')) {
        return new Response(
          JSON.stringify({
            user: {
              id: 8,
              email: 'dancer@example.com',
              role: 'user',
              memberType: 'dancer',
            },
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (url.endsWith('/api/videos')) {
        return new Response(JSON.stringify({ videos: [] }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      throw new Error(`Unhandled fetch request in App tests: ${url} (${init?.method ?? 'GET'})`);
    });

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'dancer@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('heading', { name: /^my videos$/i })).toBeInTheDocument();
  });

  it('shows my investment instead of dancer links for investor users', async () => {
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(
          JSON.stringify({
            user: {
              id: 11,
              email: 'jennifer@example.com',
              role: 'user',
              memberType: 'investor',
            },
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (url.endsWith('/api/investment/me')) {
        return new Response(
          JSON.stringify({
            portfolio: {
              id: 1,
              userId: 11,
              baseCurrency: 'USD',
              displayName: 'Jennifer Portfolio',
              notes: null,
              createdAt: '2026-06-18T00:00:00.000Z',
              updatedAt: '2026-06-18T00:00:00.000Z',
            },
            summary: {
              totalInvested: 5000,
              portfolioValue: 5400,
              unrealizedPnL: 400,
              totalReturnPercent: 8,
            },
            holdings: [],
            transactions: [],
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    expect(await screen.findAllByRole('link', { name: 'My Investment' })).not.toHaveLength(0);
    expect(screen.queryByRole('link', { name: 'My Videos' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Upload' })).not.toBeInTheDocument();
  });

  it('shows investor portfolio management controls for admins', async () => {
    window.history.replaceState({}, '', '/admin');

    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(
          JSON.stringify({
            user: {
              id: 1,
              email: 'admin@example.com',
              role: 'admin',
              memberType: 'dancer',
            },
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (url.endsWith('/api/admin/users')) {
        return new Response(
          JSON.stringify({
            users: [
              {
                id: 1,
                email: 'admin@example.com',
                role: 'admin',
                memberType: 'dancer',
                uploadCount: 0,
                createdAt: '2026-06-18T00:00:00.000Z',
                updatedAt: '2026-06-18T00:00:00.000Z',
              },
              {
                id: 11,
                email: 'jennifer@example.com',
                role: 'user',
                memberType: 'investor',
                uploadCount: 0,
                createdAt: '2026-06-18T00:00:00.000Z',
                updatedAt: '2026-06-18T00:00:00.000Z',
              },
            ],
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (url.endsWith('/api/admin/videos')) {
        return new Response(JSON.stringify({ videos: [] }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (url.endsWith('/api/admin/investors/11/portfolio')) {
        return new Response(JSON.stringify({ error: 'Portfolio not found.' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    expect(await screen.findByRole('heading', { name: /Investor Portfolios/i })).toBeInTheDocument();
    expect(screen.getByText('jennifer@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create portfolio/i })).toBeInTheDocument();
  });

  it('keeps the admin page stable when an investor portfolio response is missing snapshot fields', async () => {
    window.history.replaceState({}, '', '/admin');

    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(
          JSON.stringify({
            user: {
              id: 1,
              email: 'admin@example.com',
              role: 'admin',
              memberType: 'dancer',
            },
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (url.endsWith('/api/admin/users')) {
        return new Response(
          JSON.stringify({
            users: [
              {
                id: 1,
                email: 'admin@example.com',
                role: 'admin',
                memberType: 'dancer',
                uploadCount: 0,
                createdAt: '2026-06-18T00:00:00.000Z',
                updatedAt: '2026-06-18T00:00:00.000Z',
              },
              {
                id: 11,
                email: 'jennifer@example.com',
                role: 'user',
                memberType: 'investor',
                uploadCount: 0,
                createdAt: '2026-06-18T00:00:00.000Z',
                updatedAt: '2026-06-18T00:00:00.000Z',
              },
            ],
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (url.endsWith('/api/admin/videos')) {
        return new Response(JSON.stringify({ videos: [] }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (url.endsWith('/api/admin/investors/11/portfolio') && (!init?.method || init.method === 'GET')) {
        return new Response(
          JSON.stringify({
            portfolio: {
              id: 21,
              userId: 11,
              baseCurrency: 'USD',
              displayName: 'Jennifer Portfolio',
              notes: null,
              createdAt: '2026-06-18T00:00:00.000Z',
              updatedAt: '2026-06-18T00:00:00.000Z',
            },
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    expect(await screen.findByRole('heading', { name: /Investor Portfolios/i })).toBeInTheDocument();
    expect(screen.getByText('Jennifer Portfolio')).toBeInTheDocument();
    expect(screen.getAllByText('$0.00').length).toBeGreaterThan(0);
    expect(screen.getByText('No transactions recorded yet.')).toBeInTheDocument();
  });

  it('lets admins create an investor portfolio and add a buy transaction', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({
      user: userEvent.setup(),
    }));

    window.history.replaceState({}, '', '/admin');

    let hasPortfolio = false;
    let hasTransaction = false;

    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(
          JSON.stringify({
            user: {
              id: 1,
              email: 'admin@example.com',
              role: 'admin',
              memberType: 'dancer',
            },
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (url.endsWith('/api/admin/users')) {
        return new Response(
          JSON.stringify({
            users: [
              {
                id: 1,
                email: 'admin@example.com',
                role: 'admin',
                memberType: 'dancer',
                uploadCount: 0,
                createdAt: '2026-06-18T00:00:00.000Z',
                updatedAt: '2026-06-18T00:00:00.000Z',
              },
              {
                id: 11,
                email: 'jennifer@example.com',
                role: 'user',
                memberType: 'investor',
                uploadCount: 0,
                createdAt: '2026-06-18T00:00:00.000Z',
                updatedAt: '2026-06-18T00:00:00.000Z',
              },
            ],
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (url.endsWith('/api/admin/videos')) {
        return new Response(JSON.stringify({ videos: [] }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (url.endsWith('/api/admin/investors/11/portfolio') && init?.method === 'POST') {
        hasPortfolio = true;

        return new Response(
          JSON.stringify({
            portfolio: {
              id: 21,
              userId: 11,
              baseCurrency: 'USD',
              displayName: 'jennifer Portfolio',
              notes: null,
              createdAt: '2026-06-18T00:00:00.000Z',
              updatedAt: '2026-06-18T00:00:00.000Z',
            },
          }),
          {
            status: 201,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (
        url.endsWith('/api/admin/investors/11/portfolio/transactions') &&
        init?.method === 'POST'
      ) {
        const payload = JSON.parse(String(init?.body));

        expect(payload).toMatchObject({
          assetSymbol: 'BTC',
          amountInvested: 5000,
          purchaseDate: '2026-06-01',
        });
        expect(payload.assetName).toBeUndefined();
        expect(payload.purchaseShares).toBeCloseTo(0.1, 6);
        expect(payload.purchasePrice).toBeCloseTo(50000, 6);

        hasTransaction = true;

        return new Response(
          JSON.stringify({
            transaction: {
              id: 90,
              portfolioId: 21,
              assetSymbol: 'BTC',
              assetName: 'Bitcoin',
              transactionType: 'buy',
              amountInvested: 5000,
              purchasePrice: 50000,
              purchaseShares: 0.1,
              purchaseDate: '2026-06-01',
              notes: null,
              createdAt: '2026-06-18T00:00:00.000Z',
              updatedAt: '2026-06-18T00:00:00.000Z',
            },
          }),
          {
            status: 201,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (url.endsWith('/api/admin/investors/11/portfolio')) {
        if (!hasPortfolio) {
          return new Response(JSON.stringify({ error: 'Portfolio not found.' }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }

        return new Response(
          JSON.stringify({
            portfolio: {
              id: 21,
              userId: 11,
              baseCurrency: 'USD',
              displayName: 'jennifer Portfolio',
              notes: null,
              createdAt: '2026-06-18T00:00:00.000Z',
              updatedAt: '2026-06-18T00:00:00.000Z',
            },
            summary: {
              totalInvested: hasTransaction ? 5000 : 0,
              portfolioValue: hasTransaction ? 5400 : 0,
              unrealizedPnL: hasTransaction ? 400 : 0,
              totalReturnPercent: hasTransaction ? 8 : 0,
            },
            holdings: hasTransaction
              ? [
                  {
                    assetSymbol: 'BTC',
                    assetName: 'Bitcoin',
                    quantity: 0.1,
                    invested: 5000,
                    averageCost: 50000,
                    currentPrice: 54000,
                    currentValue: 5400,
                    unrealizedPnL: 400,
                    allocationPercent: 100,
                  },
                ]
              : [],
            transactions: hasTransaction
              ? [
                  {
                    id: 90,
                    portfolioId: 21,
                    assetSymbol: 'BTC',
                    assetName: 'Bitcoin',
                    transactionType: 'buy',
                    amountInvested: 5000,
                    purchasePrice: 50000,
                    purchaseShares: 0.1,
                    purchaseDate: '2026-06-01',
                    notes: null,
                    createdAt: '2026-06-18T00:00:00.000Z',
                    updatedAt: '2026-06-18T00:00:00.000Z',
                  },
                ]
              : [],
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    await user.click(await screen.findByRole('button', { name: /Create portfolio/i }));

    expect(await screen.findByRole('heading', { name: /Record a purchase/i })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/asset symbol/i), 'BTC');
    await user.type(screen.getByPlaceholderText('5000'), '5000');
    await user.type(screen.getByPlaceholderText('0.1'), '0.1');
    await user.type(screen.getByLabelText(/purchase date/i), '2026-06-01');
    await user.click(screen.getByRole('button', { name: /Add transaction/i }));

    expect(await screen.findByText('Bitcoin · 100.0%')).toBeInTheDocument();
    expect(screen.getAllByText('$5,400.00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('0.10000000').length).toBeGreaterThan(0);
  });

  it('lets admins edit and delete investor transactions inline', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({
      user: userEvent.setup(),
    }));

    window.history.replaceState({}, '', '/admin');

    let portfolioState = {
      portfolio: {
        id: 21,
        userId: 11,
        baseCurrency: 'USD',
        displayName: 'jennifer Portfolio',
        notes: null,
        createdAt: '2026-06-18T00:00:00.000Z',
        updatedAt: '2026-06-18T00:00:00.000Z',
      },
      summary: {
        totalInvested: 5000,
        portfolioValue: 5400,
        unrealizedPnL: 400,
        totalReturnPercent: 8,
      },
      holdings: [
        {
          assetSymbol: 'BTC',
          assetName: 'Bitcoin',
          quantity: 0.1,
          invested: 5000,
          averageCost: 50000,
          currentPrice: 54000,
          currentValue: 5400,
          unrealizedPnL: 400,
          allocationPercent: 100,
        },
      ],
      transactions: [
        {
          id: 90,
          portfolioId: 21,
          assetSymbol: 'BTC',
          assetName: 'Bitcoin',
          transactionType: 'buy',
          amountInvested: 5000,
          purchasePrice: 50000,
          purchaseShares: 0.1,
          purchaseDate: '2026-06-01',
          notes: 'Initial BTC position',
          createdAt: '2026-06-18T00:00:00.000Z',
          updatedAt: '2026-06-18T00:00:00.000Z',
        },
      ],
    };

    vi.spyOn(window, 'confirm').mockImplementation(() => true);

    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(
          JSON.stringify({
            user: {
              id: 1,
              email: 'admin@example.com',
              role: 'admin',
              memberType: 'dancer',
            },
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (url.endsWith('/api/admin/users')) {
        return new Response(
          JSON.stringify({
            users: [
              {
                id: 1,
                email: 'admin@example.com',
                role: 'admin',
                memberType: 'dancer',
                uploadCount: 0,
                createdAt: '2026-06-18T00:00:00.000Z',
                updatedAt: '2026-06-18T00:00:00.000Z',
              },
              {
                id: 11,
                email: 'jennifer@example.com',
                role: 'user',
                memberType: 'investor',
                uploadCount: 0,
                createdAt: '2026-06-18T00:00:00.000Z',
                updatedAt: '2026-06-18T00:00:00.000Z',
              },
            ],
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (url.endsWith('/api/admin/videos')) {
        return new Response(JSON.stringify({ videos: [] }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (url.endsWith('/api/admin/investors/11/portfolio') && (!init?.method || init.method === 'GET')) {
        return new Response(JSON.stringify(portfolioState), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (url.endsWith('/api/admin/portfolio-transactions/90') && init?.method === 'PATCH') {
        const payload = JSON.parse(String(init?.body));
        expect(payload.amountInvested).toBe(6000);
        expect(payload.purchasePrice).toBe(60000);
        expect(payload.assetName).toBeUndefined();
        expect(payload.purchaseDate).toBe('2026-06-02');

        portfolioState = {
          ...portfolioState,
          summary: {
            totalInvested: 6000,
            portfolioValue: 5400,
            unrealizedPnL: -600,
            totalReturnPercent: -10,
          },
          holdings: [
            {
              ...portfolioState.holdings[0],
              invested: 6000,
              averageCost: 60000,
              unrealizedPnL: -600,
            },
          ],
          transactions: [
            {
              ...portfolioState.transactions[0],
              amountInvested: 6000,
              purchasePrice: 60000,
              purchaseDate: '2026-06-02',
              notes: 'Updated BTC position',
            },
          ],
        };

        return new Response(
          JSON.stringify({
            transaction: portfolioState.transactions[0],
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (url.endsWith('/api/admin/portfolio-transactions/90') && init?.method === 'DELETE') {
        portfolioState = {
          ...portfolioState,
          summary: {
            totalInvested: 0,
            portfolioValue: 0,
            unrealizedPnL: 0,
            totalReturnPercent: 0,
          },
          holdings: [],
          transactions: [],
        };

        return new Response(JSON.stringify({ deletedTransactionId: 90 }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    expect(await screen.findByText('Initial BTC position')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Edit BTC transaction from Jun/i }));

    const investedInputs = screen.getAllByDisplayValue('5000');
    await user.clear(investedInputs[investedInputs.length - 1]);
    await user.type(investedInputs[investedInputs.length - 1], '6000');

    const shareInputs = screen.getAllByDisplayValue('0.1');
    await user.clear(shareInputs[shareInputs.length - 1]);

    const priceInputs = screen.getAllByDisplayValue('50000');
    await user.clear(priceInputs[priceInputs.length - 1]);
    await user.type(priceInputs[priceInputs.length - 1], '60000');

    const dateInput = screen.getByDisplayValue('2026-06-01');
    await user.clear(dateInput);
    await user.type(dateInput, '2026-06-02');

    const notesInput = screen.getByDisplayValue('Initial BTC position');
    await user.clear(notesInput);
    await user.type(notesInput, 'Updated BTC position');

    await user.click(screen.getByRole('button', { name: /Save changes/i }));

    expect(await screen.findByText('Updated BTC position')).toBeInTheDocument();
    expect(screen.getAllByText('$6,000.00').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: /Delete BTC transaction from Jun/i }));

    expect(await screen.findByText('No transactions recorded yet.')).toBeInTheDocument();
    expect(screen.getAllByText('$0.00').length).toBeGreaterThan(0);
  });

  it('renders an invite code field on the registration page with mobile-friendly numeric hints', async () => {
    window.history.replaceState({}, '', '/register');
    render(<App />);

    const inviteCodeInput = await screen.findByLabelText(/invite code/i);

    expect(inviteCodeInput).toBeInTheDocument();
    expect(inviteCodeInput).toHaveAttribute('inputmode', 'numeric');
    expect(inviteCodeInput).toHaveAttribute('pattern', '[0-9]{6}');
    expect(inviteCodeInput).toHaveAttribute('autocomplete', 'one-time-code');
    expect(inviteCodeInput).toHaveAttribute('maxlength', '6');
  });

  it('submits inviteCode in the register request payload', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({
      user: userEvent.setup(),
    }));
    window.history.replaceState({}, '', '/register');
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (url.endsWith('/api/auth/register')) {
        expect(init?.method).toBe('POST');
        expect(init?.body).toBe(
          JSON.stringify({
            email: 'dancer@example.com',
            password: 'new-password-1',
            inviteCode: '123456',
          })
        );

        return new Response(
          JSON.stringify({ user: { id: 9, email: 'dancer@example.com', role: 'user' } }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (url.endsWith('/api/videos')) {
        return new Response(JSON.stringify({ videos: [] }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'dancer@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'new-password-1');
    await user.type(screen.getByLabelText(/confirm password/i), 'new-password-1');
    await user.type(screen.getByLabelText(/invite code/i), '123456');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('heading', { name: /^my videos$/i })).toBeInTheDocument();
  });

  it('shows the backend invite-code error when registration is rejected', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({
      user: userEvent.setup(),
    }));
    window.history.replaceState({}, '', '/register');
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (url.endsWith('/api/auth/register')) {
        expect(init?.body).toBe(
          JSON.stringify({
            email: 'dancer@example.com',
            password: 'new-password-1',
            inviteCode: '123456',
          })
        );

        return new Response(JSON.stringify({ message: 'Invite code is invalid or expired' }), {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'dancer@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'new-password-1');
    await user.type(screen.getByLabelText(/confirm password/i), 'new-password-1');
    await user.type(screen.getByLabelText(/invite code/i), '123456');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/Invite code is invalid or expired/i)).toBeInTheDocument();
  });

  it('submits forgot password requests with generic success messaging', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({
      user: userEvent.setup(),
    }));
    window.history.replaceState({}, '', '/forgot-password');
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (url.endsWith('/api/auth/forgot-password')) {
        expect(init?.method).toBe('POST');
        expect(init?.body).toBe(JSON.stringify({ email: 'dancer@example.com' }));

        return new Response(JSON.stringify({ message: 'Backend message should stay hidden' }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'dancer@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(await screen.findByText(forgotPasswordSuccessMessage)).toBeInTheDocument();
    expect(screen.queryByText(/Backend message should stay hidden/i)).not.toBeInTheDocument();
  });

  it('validates matching passwords before calling reset password', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({
      user: userEvent.setup(),
    }));
    window.history.replaceState({}, '', '/reset-password?token=token-123');
    render(<App />);

    await user.type(screen.getByLabelText(/^new password$/i), 'new-password-1');
    await user.type(screen.getByLabelText(/^confirm new password$/i), 'new-password-2');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(await screen.findByText(/Passwords must match/i)).toBeInTheDocument();
    expect(
      vi.mocked(fetch).mock.calls.some(([input]) =>
        (typeof input === 'string' ? input : input.toString()).endsWith('/api/auth/reset-password')
      )
    ).toBe(false);
  });

  it('submits a valid reset password token and shows the login handoff', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({
      user: userEvent.setup(),
    }));
    window.history.replaceState({}, '', '/reset-password?token=token-123');
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (url.endsWith('/api/auth/reset-password')) {
        expect(init?.method).toBe('POST');
        expect(init?.body).toBe(JSON.stringify({ password: 'new-password-1', token: 'token-123' }));

        return new Response(JSON.stringify({ message: 'Password updated' }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    await user.type(screen.getByLabelText(/^new password$/i), 'new-password-1');
    await user.type(screen.getByLabelText(/^confirm new password$/i), 'new-password-1');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(
      await screen.findByText(/Your password has been updated. You can now sign in with your new password/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to sign in/i })).toHaveAttribute('href', '/login');
  });

  it('shows a clear recovery path when the reset token is invalid or expired', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({
      user: userEvent.setup(),
    }));
    window.history.replaceState({}, '', '/reset-password?token=expired-token');
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (url.endsWith('/api/auth/reset-password')) {
        return new Response(
          JSON.stringify({ message: 'This reset link is invalid or expired. Request a new password reset link and try again.' }),
          {
            status: 410,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    await user.type(screen.getByLabelText(/^new password$/i), 'new-password-1');
    await user.type(screen.getByLabelText(/^confirm new password$/i), 'new-password-1');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(
      await screen.findByText(/This reset link is invalid or expired. Request a new password reset link and try again/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /request a new link/i })).toHaveAttribute(
      'href',
      '/forgot-password'
    );
  });
});
