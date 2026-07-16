import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../context/LanguageContext';
import Hero from './Hero';

const mockFetch = vi.fn();

function createArtistProfileResponse() {
  return {
    ok: true,
    json: async () => ({
      profile: {
        coverIdentity: 'San Francisco Ballet School Trainee',
        coverIdentityZh: '舊金山芭蕾舞學校學生',
        coverStatement:
          'San Francisco Ballet School trainee with international performance, touring, and competition experience across ballet, contemporary, and commercial work.',
        coverStatementZh:
          '現為舊金山芭蕾舞學校學生，具備國際演出、巡演與比賽經驗，活躍於古典芭蕾、現代及商業舞蹈領域。',
        aboutParagraph1: 'Paragraph one',
        aboutParagraph1Zh: '第一段',
        aboutParagraph2: 'Paragraph two',
        aboutParagraph2Zh: '第二段',
        aboutParagraph3: 'Paragraph three',
        aboutParagraph3Zh: '第三段',
      },
    }),
  };
}

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  mockFetch.mockReset();
  vi.unstubAllGlobals();
});

describe('Hero cover frame', () => {
  it('renders API coming-up events when the request succeeds', async () => {
    mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/coming-up-events')) {
        return {
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
        };
      }

      if (url.endsWith('/api/artist-profile')) {
        return createArtistProfileResponse();
      }

      throw new Error(`Unhandled fetch request in Hero test: ${url}`);
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
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByText(/September 2026 — Tokyo/i)).toBeInTheDocument();
    expect(screen.getByText(/^Tokyo International Gala$/i)).toBeInTheDocument();
    expect(screen.getByText(/October 2026 — Osaka/i)).toBeInTheDocument();
    expect(screen.getByText(/^Autumn Residency Showcase$/i)).toBeInTheDocument();
  });

  it('falls back to static coming-up events when the API returns no events', async () => {
    mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/coming-up-events')) {
        return {
          ok: true,
          json: async () => ({ events: [] }),
        };
      }

      if (url.endsWith('/api/artist-profile')) {
        return createArtistProfileResponse();
      }

      throw new Error(`Unhandled fetch request in Hero test: ${url}`);
    });

    render(
      <LanguageProvider>
        <Hero />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    expect(screen.getByText(/July 2026 — Las Vegas/i)).toBeInTheDocument();
    expect(screen.getByText(/^Press Play Pro Assistant$/i)).toBeInTheDocument();
    expect(screen.getByText(/July 2026 — Beijing/i)).toBeInTheDocument();
    expect(screen.getByText(/^YAGP Gala$/i)).toBeInTheDocument();
    expect(screen.getByText(/July-August 2026 — Shanghai \/ Taipei \/ Hong Kong/i)).toBeInTheDocument();
    expect(screen.getByText(/^AEDC Performance and Master Class$/i)).toBeInTheDocument();
  });

  it('falls back to static coming-up events when the API request fails', async () => {
    mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/coming-up-events')) {
        throw new Error('network failed');
      }

      if (url.endsWith('/api/artist-profile')) {
        return createArtistProfileResponse();
      }

      throw new Error(`Unhandled fetch request in Hero test: ${url}`);
    });

    render(
      <LanguageProvider>
        <Hero />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    expect(screen.getByText(/July 2026 — Las Vegas/i)).toBeInTheDocument();
    expect(screen.getByText(/^Press Play Pro Assistant$/i)).toBeInTheDocument();
  });
});
