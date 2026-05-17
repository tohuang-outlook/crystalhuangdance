import { render, screen } from '@testing-library/react';
import App from './App';
import { siteConfig } from './data/siteData';

describe('App dossier layout', () => {
  it('renders the dossier-first sections in English by default', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /Crystal Huang/i, level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Selected Distinctions/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Artist Profile/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Training Archive/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Artistic Range/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Featured Performance Reels/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Curated Stills/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Professional Inquiries/i })).toBeInTheDocument();
  });

  it('switches to Chinese dossier labels', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({ user: userEvent.setup() }));
    render(<App />);

    await user.click(screen.getByRole('button', { name: /toggle language/i }));

    expect(screen.getByRole('heading', { name: '精選榮譽' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '藝術家簡介' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '訓練檔案' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '藝術範圍' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '精選演出影片' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '精選影像' })).toBeInTheDocument();
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

    expect(screen.getAllByRole('link', { name: /Profile/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Archive/i }).length).toBeGreaterThan(0);
    expect(screen.getByText(/curated artist archive/i)).toBeInTheDocument();
  });
});
