import type { Achievement } from '../data/siteData';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

interface AchievementsResponse {
  achievements?: Array<{
    id?: number;
    year?: string;
    title?: string;
    titleZh?: string;
    description?: string;
    descriptionZh?: string;
    highlight?: boolean;
    latest?: boolean;
  }>;
}

export interface ManagedAchievement extends Achievement {
  id: number;
}

export async function fetchAchievements(): Promise<ManagedAchievement[]> {
  const response = await fetch(`${apiBaseUrl}/api/achievements`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to load archive timeline.');
  }

  const data = (await response.json()) as AchievementsResponse;

  if (!Array.isArray(data.achievements)) {
    return [];
  }

  return data.achievements.flatMap((achievement) => {
    if (
      typeof achievement.id !== 'number' ||
      typeof achievement.year !== 'string' ||
      typeof achievement.title !== 'string' ||
      typeof achievement.titleZh !== 'string' ||
      typeof achievement.description !== 'string' ||
      typeof achievement.descriptionZh !== 'string'
    ) {
      return [];
    }

    return [
      {
        id: achievement.id,
        year: achievement.year,
        title: achievement.title,
        titleZh: achievement.titleZh,
        description: achievement.description,
        descriptionZh: achievement.descriptionZh,
        highlight: Boolean(achievement.highlight),
        latest: Boolean(achievement.latest),
      },
    ];
  });
}
