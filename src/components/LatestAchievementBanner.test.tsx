import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { achievements } from '../data/siteData';
import HomePage from '../pages/HomePage';
import LatestAchievementBanner from './LatestAchievementBanner';

function ChineseLanguageToggle() {
  const { setLang } = useLanguage();

  return (
    <button type="button" onClick={() => setLang('zh')}>
      Switch to Chinese
    </button>
  );
}

describe('LatestAchievementBanner', () => {
  const latestAchievement = achievements.find((achievement) => achievement.latest);

  it('renders the English latest achievement banner with the latest title and distinctions link', () => {
    expect(latestAchievement).toBeDefined();

    render(
      <LanguageProvider>
        <LatestAchievementBanner />
      </LanguageProvider>
    );

    expect(screen.getByText('Latest Achievement')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: latestAchievement?.title,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Achievement' })).toHaveAttribute(
      'href',
      '#distinctions'
    );
    expect(
      screen.getByRole('link', {
        name: /2026 XV Moscow Ballet Competition, Round 2 Contemporary/i,
      })
    ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=_1p3Udn_SZY');
    expect(
      screen.getByRole('link', {
        name: /2026 XV Moscow International Ballet Competition Gala Performance/i,
      })
    ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=ZINiS_mTgd0');
    expect(
      screen.getByRole('link', {
        name: /2026 XV Moscow Ballet Competition, Junior Solo Round 3 - Harlequinade Variation/i,
      })
    ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=JpP-JRj3LMw');
    expect(
      screen.getByRole('link', {
        name: /2026 XV Moscow Ballet Competition, Junior Solo Round 3 - Sugar Plum Fairy Variation/i,
      })
    ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=3i5ap93thF0');
  });

  it('renders the Chinese eyebrow and CTA linked to the achievements section', async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <ChineseLanguageToggle />
        <LatestAchievementBanner />
      </LanguageProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Switch to Chinese' }));

    expect(screen.getByText('最新成就')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '查看成就' })).toHaveAttribute('href', '#distinctions');
  });

  it('uses Moscow reels managed through the public featured-reels feed', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes('/api/featured-reels')) {
        return new Response(
          JSON.stringify({
            reels: [
              {
                id: 901,
                placement: 'supporting',
                youtubeId: 'adminMoscowReel',
                videoSrc: null,
                metaLabel: 'XV Moscow Ballet Competition · July 2026',
                metaLabelZh: '莫斯科國際芭蕾舞大賽 · 2026年7月',
                title: 'Admin managed Moscow reel',
                titleZh: '後台管理的莫斯科影片',
                description: 'A homepage Moscow reel managed in Admin Console.',
                descriptionZh: '由後台管理的首頁莫斯科影片。',
                thumbnail: '/admin-moscow-reel.png',
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(JSON.stringify({ achievements: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    try {
      render(
        <LanguageProvider>
          <LatestAchievementBanner />
        </LanguageProvider>
      );

      expect(
        await screen.findByRole('link', { name: /admin managed Moscow reel/i })
      ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=adminMoscowReel');
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('renders a latest achievement banner section within the homepage with the distinctions CTA', () => {
    expect(latestAchievement).toBeDefined();

    render(
      <LanguageProvider>
        <HomePage />
      </LanguageProvider>
    );

    const bannerHeading = screen.getByRole('heading', {
      name: latestAchievement?.title,
      level: 2,
    });
    const bannerSection = bannerHeading.closest('section');

    expect(bannerSection).not.toBeNull();
    expect(within(bannerSection as HTMLElement).getByText('Latest Achievement')).toBeInTheDocument();

    const cta = within(bannerSection as HTMLElement).getByRole('link', { name: 'View Achievement' });
    expect(cta).toHaveAttribute('href', '#distinctions');
    expect(
      within(bannerSection as HTMLElement).getByRole('link', {
        name: /2026 XV Moscow Ballet Competition, Round 2 Contemporary/i,
      })
    ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=_1p3Udn_SZY');
    expect(
      within(bannerSection as HTMLElement).getByRole('link', {
        name: /2026 XV Moscow Ballet Competition, Junior Solo Round 3 - Harlequinade Variation/i,
      })
    ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=JpP-JRj3LMw');
  });

  it('returns null when no achievement is marked as latest', async () => {
    vi.resetModules();
    vi.doMock('../data/siteData', async () => {
      const actual = await vi.importActual<typeof import('../data/siteData')>('../data/siteData');

      return {
        ...actual,
        achievements: actual.achievements.map((achievement) => ({
          ...achievement,
          latest: undefined,
        })),
      };
    });

    try {
      const { default: MockedLatestAchievementBanner } = await import('./LatestAchievementBanner');
      const { container } = render(
        <LanguageProvider>
          <MockedLatestAchievementBanner />
        </LanguageProvider>
      );

      expect(container).toBeEmptyDOMElement();
    } finally {
      vi.doUnmock('../data/siteData');
      vi.resetModules();
    }
  });
});
