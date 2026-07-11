import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../context/LanguageContext';
import Hero from './Hero';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  mockFetch.mockReset();
  vi.unstubAllGlobals();
});

describe('Hero cover frame', () => {
  it('renders API coming-up events when the request succeeds', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        events: [
          {
            id: 101,
            dateLabel: 'September 2026',
            title: 'Tokyo International Gala',
            location: 'Tokyo',
            sortOrder: 0,
          },
          {
            id: 102,
            dateLabel: 'October 2026',
            title: 'Autumn Residency Showcase',
            location: 'Osaka',
            sortOrder: 1,
          },
        ],
      }),
    });

    render(
      <LanguageProvider>
        <Hero />
      </LanguageProvider>
    );

    expect(screen.getByText(/Curated Dossier/i)).toBeInTheDocument();
    expect(screen.getAllByText(/San Francisco Ballet School Trainee/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Crystal Huang/i)).toBeInTheDocument();
    expect(screen.getByText(/^Press Highlight$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Archive Timeline$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Artist Profile$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Artistic Range$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Media$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Master Class and Choreographer$/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Archive Timeline/i })).toHaveAttribute(
      'href',
      '#archive-timeline'
    );
    expect(screen.getByText(/Coming Up Events/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText(/September 2026 — Tokyo/i)).toBeInTheDocument();
    expect(screen.getByText(/^Tokyo International Gala$/i)).toBeInTheDocument();
    expect(screen.getByText(/October 2026 — Osaka/i)).toBeInTheDocument();
    expect(screen.getByText(/^Autumn Residency Showcase$/i)).toBeInTheDocument();
  });

  it('falls back to static coming-up events when the API returns no events', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ events: [] }),
    });

    render(
      <LanguageProvider>
        <Hero />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText(/July 2026 — Las Vegas/i)).toBeInTheDocument();
    expect(screen.getByText(/^Press Play Pro Assistant$/i)).toBeInTheDocument();
    expect(screen.getByText(/July 2026 — Beijing/i)).toBeInTheDocument();
    expect(screen.getByText(/^YAGP Gala$/i)).toBeInTheDocument();
    expect(screen.getByText(/July-August 2026 — Shanghai \/ Taipei \/ Hong Kong/i)).toBeInTheDocument();
    expect(screen.getByText(/^AEDC Performance and Master Class$/i)).toBeInTheDocument();
  });

  it('falls back to static coming-up events when the API request fails', async () => {
    mockFetch.mockRejectedValue(new Error('network failed'));

    render(
      <LanguageProvider>
        <Hero />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText(/July 2026 — Las Vegas/i)).toBeInTheDocument();
    expect(screen.getByText(/^Press Play Pro Assistant$/i)).toBeInTheDocument();
  });
});
