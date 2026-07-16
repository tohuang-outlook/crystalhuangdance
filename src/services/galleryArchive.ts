const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

export interface PublicMasterClassTimelineEntry {
  id: number;
  dateLabel: string;
  dateLabelZh: string;
  title: string;
  titleZh: string;
  location: string;
  locationZh: string;
}

export interface PublicArchiveMediaItem {
  id: number;
  title: string;
  titleZh: string;
  subtitle: string;
  subtitleZh: string;
  imageSrc: string;
  imageAlt: string;
  imageAltZh: string;
  videoSrc?: string;
}

export interface PublicGroupChoreographyEntry {
  id: number;
  seasonLabel: string;
  seasonLabelZh: string;
  organization: string;
  organizationZh: string;
  workTitle: string;
  workTitleZh: string;
}

interface GalleryArchiveResponse {
  timelineEntries?: Array<{
    id?: number;
    dateLabel?: string;
    dateLabelZh?: string;
    title?: string;
    titleZh?: string;
    location?: string;
    locationZh?: string;
  }>;
  masterClassMoments?: Array<{
    id?: number;
    title?: string;
    titleZh?: string;
    subtitle?: string;
    subtitleZh?: string;
    imageSrc?: string;
    imageAlt?: string;
    imageAltZh?: string;
    videoSrc?: string | null;
  }>;
  groupEntries?: Array<{
    id?: number;
    seasonLabel?: string;
    seasonLabelZh?: string;
    organization?: string;
    organizationZh?: string;
    workTitle?: string;
    workTitleZh?: string;
  }>;
  groupMoments?: Array<{
    id?: number;
    title?: string;
    titleZh?: string;
    subtitle?: string;
    subtitleZh?: string;
    imageSrc?: string;
    imageAlt?: string;
    imageAltZh?: string;
    videoSrc?: string | null;
  }>;
}

export async function fetchGalleryArchive() {
  const response = await fetch(`${apiBaseUrl}/api/gallery-archive`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to load gallery archive.');
  }

  const data = (await response.json()) as GalleryArchiveResponse;

  const timelineEntries = Array.isArray(data.timelineEntries)
    ? data.timelineEntries.flatMap((entry) => {
        if (
          typeof entry.id !== 'number' ||
          typeof entry.dateLabel !== 'string' ||
          typeof entry.dateLabelZh !== 'string' ||
          typeof entry.title !== 'string' ||
          typeof entry.titleZh !== 'string' ||
          typeof entry.location !== 'string' ||
          typeof entry.locationZh !== 'string'
        ) {
          return [];
        }

        return [entry as PublicMasterClassTimelineEntry];
      })
    : [];

  const normalizeMediaItems = (
    items: GalleryArchiveResponse['masterClassMoments']
  ): PublicArchiveMediaItem[] =>
    Array.isArray(items)
      ? items.flatMap((item) => {
          if (
            typeof item.id !== 'number' ||
            typeof item.title !== 'string' ||
            typeof item.titleZh !== 'string' ||
            typeof item.subtitle !== 'string' ||
            typeof item.subtitleZh !== 'string' ||
            typeof item.imageSrc !== 'string' ||
            typeof item.imageAlt !== 'string' ||
            typeof item.imageAltZh !== 'string'
          ) {
            return [];
          }

          return [
            {
              id: item.id,
              title: item.title,
              titleZh: item.titleZh,
              subtitle: item.subtitle,
              subtitleZh: item.subtitleZh,
              imageSrc: item.imageSrc,
              imageAlt: item.imageAlt,
              imageAltZh: item.imageAltZh,
              videoSrc: typeof item.videoSrc === 'string' ? item.videoSrc : undefined,
            },
          ];
        })
      : [];

  const groupEntries = Array.isArray(data.groupEntries)
    ? data.groupEntries.flatMap((entry) => {
        if (
          typeof entry.id !== 'number' ||
          typeof entry.seasonLabel !== 'string' ||
          typeof entry.seasonLabelZh !== 'string' ||
          typeof entry.organization !== 'string' ||
          typeof entry.organizationZh !== 'string' ||
          typeof entry.workTitle !== 'string' ||
          typeof entry.workTitleZh !== 'string'
        ) {
          return [];
        }

        return [entry as PublicGroupChoreographyEntry];
      })
    : [];

  return {
    timelineEntries,
    masterClassMoments: normalizeMediaItems(data.masterClassMoments),
    groupEntries,
    groupMoments: normalizeMediaItems(data.groupMoments),
  };
}
