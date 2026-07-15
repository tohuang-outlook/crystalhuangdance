import type { PressHighlightEntry } from '../data/pressHighlights';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

interface PressHighlightsResponse {
  highlights?: Array<{
    id?: number;
    source?: string;
    sourceZh?: string;
    dateLabel?: string;
    dateLabelZh?: string;
    title?: string;
    titleZh?: string;
    description?: string;
    descriptionZh?: string;
    href?: string;
    imageSrc?: string;
    imageAlt?: string;
    imageAltZh?: string;
    imageHref?: string | null;
  }>;
}

export async function fetchPressHighlights(): Promise<PressHighlightEntry[]> {
  const response = await fetch(`${apiBaseUrl}/api/press-highlights`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to load press highlights.');
  }

  const data = (await response.json()) as PressHighlightsResponse;

  if (!Array.isArray(data.highlights)) {
    return [];
  }

  return data.highlights.flatMap((highlight) => {
    if (
      typeof highlight.id !== 'number' ||
      typeof highlight.source !== 'string' ||
      typeof highlight.sourceZh !== 'string' ||
      typeof highlight.dateLabel !== 'string' ||
      typeof highlight.dateLabelZh !== 'string' ||
      typeof highlight.title !== 'string' ||
      typeof highlight.titleZh !== 'string' ||
      typeof highlight.description !== 'string' ||
      typeof highlight.descriptionZh !== 'string' ||
      typeof highlight.href !== 'string' ||
      typeof highlight.imageSrc !== 'string' ||
      typeof highlight.imageAlt !== 'string' ||
      typeof highlight.imageAltZh !== 'string'
    ) {
      return [];
    }

    return [
      {
        id: highlight.id,
        source: highlight.source,
        sourceZh: highlight.sourceZh,
        dateLabel: highlight.dateLabel,
        dateLabelZh: highlight.dateLabelZh,
        title: highlight.title,
        titleZh: highlight.titleZh,
        description: highlight.description,
        descriptionZh: highlight.descriptionZh,
        href: highlight.href,
        imageSrc: highlight.imageSrc,
        imageAlt: highlight.imageAlt,
        imageAltZh: highlight.imageAltZh,
        imageHref: typeof highlight.imageHref === 'string' ? highlight.imageHref : null,
      },
    ];
  });
}
