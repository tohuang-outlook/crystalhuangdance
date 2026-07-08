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
