import { render, screen, within } from '@testing-library/react';
import App from './App';
import { siteConfig } from './data/siteData';

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

    await user.click(screen.getByRole('button', { name: /toggle language/i }));
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

    await user.click(screen.getByRole('button', { name: /toggle language/i }));

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
        return new Response(JSON.stringify({ user: { id: 7, email: 'viewer@example.com', role: 'user' } }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    expect(
      await screen.findByRole('heading', { name: /Crystal Huang/i, level: 1 })
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /User and video oversight/i })).not.toBeInTheDocument();
  });

  it('shows an admin navigation link when the authenticated user is an admin', async () => {
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

    expect(await screen.findAllByRole('link', { name: 'Admin' })).not.toHaveLength(0);
  });
});
