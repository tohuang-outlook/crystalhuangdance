import { render, screen } from '@testing-library/react';
import App from './App';

describe('App dossier layout', () => {
  it('renders the dossier-first sections in English by default', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /Crystal Huang/i, level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Selected Distinctions/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Artist Profile/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Professional Inquiries/i })).toBeInTheDocument();
  });

  it('switches to Chinese dossier labels', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({ user: userEvent.setup() }));
    render(<App />);

    await user.click(screen.getByRole('button', { name: /toggle language/i }));

    expect(screen.getByRole('heading', { name: '精選榮譽' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '藝術家簡介' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '專業洽詢' })).toBeInTheDocument();
  });
});
