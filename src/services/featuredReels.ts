import type { ReelVideo } from '../data/reels';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

interface FeaturedReelsResponse {
  reels?: Array<{
    id?: number;
    placement?: 'featured' | 'supporting';
    youtubeId?: string | null;
    videoSrc?: string | null;
    metaLabel?: string;
    metaLabelZh?: string;
    title?: string;
    titleZh?: string;
    description?: string;
    descriptionZh?: string;
    thumbnail?: string;
  }>;
}

export async function fetchFeaturedReels(): Promise<ReelVideo[]> {
  const response = await fetch(`${apiBaseUrl}/api/featured-reels`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to load featured reels.');
  }

  const data = (await response.json()) as FeaturedReelsResponse;

  if (!Array.isArray(data.reels)) {
    return [];
  }

  return data.reels.flatMap((reel) => {
    if (
      typeof reel.id !== 'number' ||
      (reel.placement !== 'featured' && reel.placement !== 'supporting') ||
      typeof reel.metaLabel !== 'string' ||
      typeof reel.metaLabelZh !== 'string' ||
      typeof reel.title !== 'string' ||
      typeof reel.titleZh !== 'string' ||
      typeof reel.description !== 'string' ||
      typeof reel.descriptionZh !== 'string' ||
      typeof reel.thumbnail !== 'string'
    ) {
      return [];
    }

    const youtubeId = typeof reel.youtubeId === 'string' ? reel.youtubeId.trim() : '';
    const videoSrc = typeof reel.videoSrc === 'string' ? reel.videoSrc.trim() : '';

    if (!youtubeId && !videoSrc) {
      return [];
    }

    return [
      {
        id: youtubeId || `local-${reel.id}`,
        videoSrc: videoSrc || undefined,
        metaLabel: reel.metaLabel,
        metaLabelZh: reel.metaLabelZh,
        title: reel.title,
        titleZh: reel.titleZh,
        description: reel.description,
        descriptionZh: reel.descriptionZh,
        thumbnail: reel.thumbnail,
        placement: reel.placement,
      },
    ];
  });
}
