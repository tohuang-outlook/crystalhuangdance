import { useEffect, useMemo, useState } from 'react';
import {
  createAdminGroupChoreographyEntry,
  createAdminGroupChoreographyMoment,
  createAdminFeaturedReel,
  createAdminAchievement,
  createAdminComingUpEvent,
  createAdminInvestorUpdate,
  createAdminMasterClassMoment,
  createAdminMasterClassTimelineEntry,
  createAdminPressHighlight,
  createAdminYoutubeVideo,
  deleteAdminGroupChoreographyEntry,
  deleteAdminGroupChoreographyMoment,
  deleteAdminFeaturedReel,
  deleteAdminAchievement,
  deleteAdminComingUpEvent,
  deleteAdminInvestorUpdate,
  deleteAdminMasterClassMoment,
  deleteAdminMasterClassTimelineEntry,
  deleteAdminPressHighlight,
  deleteAdminUser,
  deleteAdminVideo,
  fetchAdminGalleryArchive,
  fetchAdminFeaturedReels,
  fetchAdminAchievements,
  fetchAdminArtistProfile,
  fetchAdminComingUpEvents,
  fetchAdminInvestorUpdates,
  fetchAdminPressHighlights,
  fetchAdminUsers,
  fetchAdminVideos,
  reorderAdminFeaturedReels,
  reorderAdminGroupChoreographyEntries,
  reorderAdminGroupChoreographyMoments,
  reorderAdminMasterClassMoments,
  reorderAdminMasterClassTimelineEntries,
  reorderAdminAchievements,
  reorderAdminPressHighlights,
  type AdminArchiveMediaPayload,
  type AchievementRecord,
  type AdminAchievementPayload,
  type AdminGroupChoreographyEntryPayload,
  type AdminArtistProfilePayload,
  type AdminArtistProfileRecord,
  type AdminFeaturedReelPayload,
  type AdminInvestorUpdatePayload,
  type ArchiveMediaRecord,
  type AdminMasterClassTimelineEntryPayload,
  type AdminPressHighlightPayload,
  type AdminUserRecord,
  type AdminVideoRecord,
  type ComingUpEventRecord,
  type FeaturedReelPlacement,
  type FeaturedReelRecord,
  type GroupChoreographyEntryRecord,
  type InvestorUpdateCategory,
  type InvestorUpdateRecord,
  type MasterClassTimelineEntryRecord,
  type PressHighlightRecord,
  reorderAdminComingUpEvents,
  reorderAdminInvestorUpdates,
  updateAdminGroupChoreographyEntry,
  updateAdminGroupChoreographyMoment,
  updateAdminFeaturedReel,
  updateAdminAchievement,
  updateAdminArtistProfile,
  updateAdminComingUpEvent,
  updateAdminInvestorUpdate,
  updateAdminMasterClassMoment,
  updateAdminMasterClassTimelineEntry,
  updateAdminPressHighlight,
  uploadAdminVideoFile,
} from '../services/admin';
import {
  deleteAdminContactInquiry,
  fetchAdminContactInquiries,
  updateAdminContactInquiryStatus,
  type ContactInquiryRecord,
} from '../services/contactInquiries';
import { createAdminHeroEntryPoint, deleteAdminHeroEntryPoint, fetchAdminHeroEntryPoints, reorderAdminHeroEntryPoints, updateAdminHeroEntryPoint, type HeroEntryPointRecord } from '../services/heroEntryPoints';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDuration(seconds: number | null) {
  if (!seconds) {
    return 'n/a';
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function formatBytes(bytes: number | null) {
  if (!bytes) {
    return 'n/a';
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type AdminUploadMode = 'youtube' | 'upload';
type AdminConsoleTab = 'coming-up-events' | 'content' | 'dancer' | 'inquiries' | 'investor';

interface DancerUploadDraft {
  mode: AdminUploadMode;
  title: string;
  youtubeUrl: string;
  file: File | null;
  isSubmitting: boolean;
  error: string | null;
  resetKey: number;
}

function createDefaultDraft(): DancerUploadDraft {
  return {
    mode: 'youtube',
    title: '',
    youtubeUrl: '',
    file: null,
    isSubmitting: false,
    error: null,
    resetKey: 0,
  };
}

interface ComingUpEventDraft {
  dateLabel: string;
  location: string;
  title: string;
  isSubmitting: boolean;
  error: string | null;
}

interface InvestorUpdateDraft {
  category: InvestorUpdateCategory;
  title: string;
  summary: string;
  href: string;
  isSubmitting: boolean;
  error: string | null;
}

interface FeaturedReelDraft {
  placement: FeaturedReelPlacement;
  youtubeId: string;
  videoSrc: string;
  metaLabel: string;
  metaLabelZh: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  thumbnail: string;
  isSubmitting: boolean;
  error: string | null;
}

interface PressHighlightDraft {
  source: string;
  sourceZh: string;
  dateLabel: string;
  dateLabelZh: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  imageAltZh: string;
  imageHref: string;
  isSubmitting: boolean;
  error: string | null;
}

interface AchievementDraft {
  year: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  highlight: boolean;
  latest: boolean;
  isSubmitting: boolean;
  error: string | null;
}

interface ArtistProfileDraft {
  coverIdentity: string;
  coverIdentityZh: string;
  coverStatement: string;
  coverStatementZh: string;
  aboutParagraph1: string;
  aboutParagraph1Zh: string;
  aboutParagraph2: string;
  aboutParagraph2Zh: string;
  aboutParagraph3: string;
  aboutParagraph3Zh: string;
  isSubmitting: boolean;
  error: string | null;
}

interface MasterClassTimelineDraft {
  dateLabel: string;
  dateLabelZh: string;
  title: string;
  titleZh: string;
  location: string;
  locationZh: string;
  isSubmitting: boolean;
  error: string | null;
}

interface ArchiveMediaDraft {
  title: string;
  titleZh: string;
  subtitle: string;
  subtitleZh: string;
  imageSrc: string;
  imageAlt: string;
  imageAltZh: string;
  videoSrc: string;
  isSubmitting: boolean;
  error: string | null;
}

interface GroupChoreographyEntryDraft {
  seasonLabel: string;
  seasonLabelZh: string;
  organization: string;
  organizationZh: string;
  workTitle: string;
  workTitleZh: string;
  isSubmitting: boolean;
  error: string | null;
}

function createEmptyComingUpEventDraft(): ComingUpEventDraft {
  return {
    dateLabel: '',
    location: '',
    title: '',
    isSubmitting: false,
    error: null,
  };
}

function createComingUpEventDraftFromRecord(event: ComingUpEventRecord): ComingUpEventDraft {
  return {
    dateLabel: event.dateLabel,
    location: event.location,
    title: event.title,
    isSubmitting: false,
    error: null,
  };
}

function createEmptyInvestorUpdateDraft(
  category: InvestorUpdateCategory
): InvestorUpdateDraft {
  return {
    category,
    title: '',
    summary: '',
    href: '',
    isSubmitting: false,
    error: null,
  };
}

function createInvestorUpdateDraftFromRecord(
  update: InvestorUpdateRecord
): InvestorUpdateDraft {
  return {
    category: update.category,
    title: update.title,
    summary: update.summary,
    href: update.href ?? '',
    isSubmitting: false,
    error: null,
  };
}

function createEmptyFeaturedReelDraft(
  placement: FeaturedReelPlacement
): FeaturedReelDraft {
  return {
    placement,
    youtubeId: '',
    videoSrc: '',
    metaLabel: '',
    metaLabelZh: '',
    title: '',
    titleZh: '',
    description: '',
    descriptionZh: '',
    thumbnail: '',
    isSubmitting: false,
    error: null,
  };
}

function createEmptyPressHighlightDraft(): PressHighlightDraft {
  return {
    source: '',
    sourceZh: '',
    dateLabel: '',
    dateLabelZh: '',
    title: '',
    titleZh: '',
    description: '',
    descriptionZh: '',
    href: '',
    imageSrc: '',
    imageAlt: '',
    imageAltZh: '',
    imageHref: '',
    isSubmitting: false,
    error: null,
  };
}

function createFeaturedReelDraftFromRecord(
  reel: FeaturedReelRecord
): FeaturedReelDraft {
  return {
    placement: reel.placement,
    youtubeId: reel.youtubeId ?? '',
    videoSrc: reel.videoSrc ?? '',
    metaLabel: reel.metaLabel,
    metaLabelZh: reel.metaLabelZh,
    title: reel.title,
    titleZh: reel.titleZh,
    description: reel.description,
    descriptionZh: reel.descriptionZh,
    thumbnail: reel.thumbnail,
    isSubmitting: false,
    error: null,
  };
}

function createPressHighlightDraftFromRecord(
  highlight: PressHighlightRecord
): PressHighlightDraft {
  return {
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
    imageHref: highlight.imageHref ?? '',
    isSubmitting: false,
    error: null,
  };
}

function createEmptyAchievementDraft(): AchievementDraft {
  return {
    year: '',
    title: '',
    titleZh: '',
    description: '',
    descriptionZh: '',
    highlight: false,
    latest: false,
    isSubmitting: false,
    error: null,
  };
}

function createAchievementDraftFromRecord(
  achievement: AchievementRecord
): AchievementDraft {
  return {
    year: achievement.year,
    title: achievement.title,
    titleZh: achievement.titleZh,
    description: achievement.description,
    descriptionZh: achievement.descriptionZh,
    highlight: achievement.highlight,
    latest: achievement.latest,
    isSubmitting: false,
    error: null,
  };
}

function createEmptyArtistProfileDraft(): ArtistProfileDraft {
  return {
    coverIdentity: '',
    coverIdentityZh: '',
    coverStatement: '',
    coverStatementZh: '',
    aboutParagraph1: '',
    aboutParagraph1Zh: '',
    aboutParagraph2: '',
    aboutParagraph2Zh: '',
    aboutParagraph3: '',
    aboutParagraph3Zh: '',
    isSubmitting: false,
    error: null,
  };
}

function createArtistProfileDraftFromRecord(
  profile: AdminArtistProfileRecord
): ArtistProfileDraft {
  return {
    coverIdentity: profile.coverIdentity,
    coverIdentityZh: profile.coverIdentityZh,
    coverStatement: profile.coverStatement,
    coverStatementZh: profile.coverStatementZh,
    aboutParagraph1: profile.aboutParagraph1,
    aboutParagraph1Zh: profile.aboutParagraph1Zh,
    aboutParagraph2: profile.aboutParagraph2,
    aboutParagraph2Zh: profile.aboutParagraph2Zh,
    aboutParagraph3: profile.aboutParagraph3,
    aboutParagraph3Zh: profile.aboutParagraph3Zh,
    isSubmitting: false,
    error: null,
  };
}

function createEmptyMasterClassTimelineDraft(): MasterClassTimelineDraft {
  return {
    dateLabel: '',
    dateLabelZh: '',
    title: '',
    titleZh: '',
    location: '',
    locationZh: '',
    isSubmitting: false,
    error: null,
  };
}

function createMasterClassTimelineDraftFromRecord(
  entry: MasterClassTimelineEntryRecord
): MasterClassTimelineDraft {
  return {
    dateLabel: entry.dateLabel,
    dateLabelZh: entry.dateLabelZh,
    title: entry.title,
    titleZh: entry.titleZh,
    location: entry.location,
    locationZh: entry.locationZh,
    isSubmitting: false,
    error: null,
  };
}

function createEmptyArchiveMediaDraft(): ArchiveMediaDraft {
  return {
    title: '',
    titleZh: '',
    subtitle: '',
    subtitleZh: '',
    imageSrc: '',
    imageAlt: '',
    imageAltZh: '',
    videoSrc: '',
    isSubmitting: false,
    error: null,
  };
}

function createArchiveMediaDraftFromRecord(item: ArchiveMediaRecord): ArchiveMediaDraft {
  return {
    title: item.title,
    titleZh: item.titleZh,
    subtitle: item.subtitle,
    subtitleZh: item.subtitleZh,
    imageSrc: item.imageSrc,
    imageAlt: item.imageAlt,
    imageAltZh: item.imageAltZh,
    videoSrc: item.videoSrc ?? '',
    isSubmitting: false,
    error: null,
  };
}

function createEmptyGroupChoreographyEntryDraft(): GroupChoreographyEntryDraft {
  return {
    seasonLabel: '',
    seasonLabelZh: '',
    organization: '',
    organizationZh: '',
    workTitle: '',
    workTitleZh: '',
    isSubmitting: false,
    error: null,
  };
}

function createGroupChoreographyEntryDraftFromRecord(
  entry: GroupChoreographyEntryRecord
): GroupChoreographyEntryDraft {
  return {
    seasonLabel: entry.seasonLabel,
    seasonLabelZh: entry.seasonLabelZh,
    organization: entry.organization,
    organizationZh: entry.organizationZh,
    workTitle: entry.workTitle,
    workTitleZh: entry.workTitleZh,
    isSubmitting: false,
    error: null,
  };
}

export default function AdminPage() {
  const investorCategories: Array<{
    id: InvestorUpdateCategory;
    label: string;
    description: string;
  }> = [
    {
      id: 'investment-page',
      label: 'Investment page',
      description: 'Homepage-linked investor content and publishing controls.',
    },
    {
      id: 'monthly-reports',
      label: 'Monthly reports',
      description: 'Structured report updates, review notes, and report links.',
    },
    {
      id: 'real-time-quote',
      label: 'Real-time quote',
      description: 'Quote feed status, provider checks, and live-market notes.',
    },
  ];

  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [videos, setVideos] = useState<AdminVideoRecord[]>([]);
  const [comingUpEvents, setComingUpEvents] = useState<ComingUpEventRecord[]>([]);
  const [featuredReels, setFeaturedReels] = useState<FeaturedReelRecord[]>([]);
  const [investorUpdates, setInvestorUpdates] = useState<InvestorUpdateRecord[]>([]);
  const [pressHighlights, setPressHighlights] = useState<PressHighlightRecord[]>([]);
  const [achievements, setAchievements] = useState<AchievementRecord[]>([]);
  const [artistProfile, setArtistProfile] = useState<AdminArtistProfileRecord | null>(null);
  const [masterClassTimelineEntries, setMasterClassTimelineEntries] = useState<
    MasterClassTimelineEntryRecord[]
  >([]);
  const [masterClassArchiveMoments, setMasterClassArchiveMoments] = useState<ArchiveMediaRecord[]>(
    []
  );
  const [groupArchiveEntries, setGroupArchiveEntries] = useState<GroupChoreographyEntryRecord[]>([]);
  const [groupArchiveMoments, setGroupArchiveMoments] = useState<ArchiveMediaRecord[]>([]);
  const [contactInquiries, setContactInquiries] = useState<ContactInquiryRecord[]>([]);
  const [heroEntryPoints, setHeroEntryPoints] = useState<HeroEntryPointRecord[]>([]);
  const [activeTab, setActiveTab] = useState<AdminConsoleTab>('coming-up-events');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDeleteKey, setActiveDeleteKey] = useState<string | null>(null);
  const [activeEventActionKey, setActiveEventActionKey] = useState<string | null>(null);
  const [uploadDrafts, setUploadDrafts] = useState<Record<number, DancerUploadDraft>>({});
  const [comingUpEventDrafts, setComingUpEventDrafts] = useState<Record<number, ComingUpEventDraft>>({});
  const [featuredReelDrafts, setFeaturedReelDrafts] = useState<Record<number, FeaturedReelDraft>>({});
  const [investorUpdateDrafts, setInvestorUpdateDrafts] = useState<Record<number, InvestorUpdateDraft>>({});
  const [pressHighlightDrafts, setPressHighlightDrafts] = useState<Record<number, PressHighlightDraft>>({});
  const [achievementDrafts, setAchievementDrafts] = useState<Record<number, AchievementDraft>>({});
  const [masterClassTimelineDrafts, setMasterClassTimelineDrafts] = useState<Record<number, MasterClassTimelineDraft>>({});
  const [masterClassMomentDrafts, setMasterClassMomentDrafts] = useState<Record<number, ArchiveMediaDraft>>({});
  const [groupChoreographyEntryDrafts, setGroupChoreographyEntryDrafts] = useState<Record<number, GroupChoreographyEntryDraft>>({});
  const [groupChoreographyMomentDrafts, setGroupChoreographyMomentDrafts] = useState<Record<number, ArchiveMediaDraft>>({});
  const [newComingUpEventDraft, setNewComingUpEventDraft] = useState<ComingUpEventDraft>(
    createEmptyComingUpEventDraft()
  );
  const [newPressHighlightDraft, setNewPressHighlightDraft] = useState<PressHighlightDraft>(
    createEmptyPressHighlightDraft()
  );
  const [newAchievementDraft, setNewAchievementDraft] = useState<AchievementDraft>(
    createEmptyAchievementDraft()
  );
  const [artistProfileDraft, setArtistProfileDraft] = useState<ArtistProfileDraft>(
    createEmptyArtistProfileDraft()
  );
  const [newMasterClassTimelineDraft, setNewMasterClassTimelineDraft] =
    useState<MasterClassTimelineDraft>(createEmptyMasterClassTimelineDraft());
  const [newMasterClassMomentDraft, setNewMasterClassMomentDraft] =
    useState<ArchiveMediaDraft>(createEmptyArchiveMediaDraft());
  const [newGroupChoreographyEntryDraft, setNewGroupChoreographyEntryDraft] =
    useState<GroupChoreographyEntryDraft>(createEmptyGroupChoreographyEntryDraft());
  const [newGroupChoreographyMomentDraft, setNewGroupChoreographyMomentDraft] =
    useState<ArchiveMediaDraft>(createEmptyArchiveMediaDraft());
  const [newInvestorUpdateDrafts, setNewInvestorUpdateDrafts] = useState<
    Record<InvestorUpdateCategory, InvestorUpdateDraft>
  >({
    'investment-page': createEmptyInvestorUpdateDraft('investment-page'),
    'monthly-reports': createEmptyInvestorUpdateDraft('monthly-reports'),
    'real-time-quote': createEmptyInvestorUpdateDraft('real-time-quote'),
  });
  const [newFeaturedReelDrafts, setNewFeaturedReelDrafts] = useState<
    Record<FeaturedReelPlacement, FeaturedReelDraft>
  >({
    featured: createEmptyFeaturedReelDraft('featured'),
    supporting: createEmptyFeaturedReelDraft('supporting'),
  });

  const stats = useMemo(
    () => ({
      userCount: users.length,
      videoCount: videos.length,
      adminCount: users.filter((user) => user.role === 'admin').length,
    }),
    [users, videos]
  );

  const adminUsers = useMemo(
    () => users.filter((user) => user.role === 'admin'),
    [users]
  );

  const dancerUsers = useMemo(
    () => users.filter((user) => user.role !== 'admin'),
    [users]
  );

  const adminTabs = [
    {
      id: 'coming-up-events' as const,
      label: 'Coming Up Events',
      description: 'Homepage event list and ordering',
    },
    {
      id: 'content' as const,
      label: 'Content',
      description: 'Homepage reels and featured media modules',
    },
    {
      id: 'dancer' as const,
      label: 'Dancer',
      description: 'Admin accounts and private video management',
    },
    {
      id: 'inquiries' as const,
      label: 'Inquiries',
      description: 'Website contact messages and follow-up status',
    },
    {
      id: 'investor' as const,
      label: 'Investor',
      description: 'Reserved for investor tools and reporting',
    },
  ];

  const investorUpdatesByCategory = useMemo(
    () =>
      investorCategories.reduce<Record<InvestorUpdateCategory, InvestorUpdateRecord[]>>(
        (grouped, category) => {
          grouped[category.id] = investorUpdates.filter((entry) => entry.category === category.id);
          return grouped;
        },
        {
          'investment-page': [],
          'monthly-reports': [],
          'real-time-quote': [],
        }
      ),
    [investorCategories, investorUpdates]
  );

  const featuredReelsByPlacement = useMemo(
    () =>
      (['featured', 'supporting'] as const).reduce<Record<FeaturedReelPlacement, FeaturedReelRecord[]>>(
        (grouped, placement) => {
          grouped[placement] = featuredReels.filter((reel) => reel.placement === placement);
          return grouped;
        },
        {
          featured: [],
          supporting: [],
        }
      ),
    [featuredReels]
  );

  const recentPressHighlights = useMemo(
    () => pressHighlights.slice(0, 3),
    [pressHighlights]
  );

  const archivePressHighlights = useMemo(
    () => pressHighlights.slice(3),
    [pressHighlights]
  );

  const latestAchievementEntry = useMemo(
    () => achievements.find((achievement) => achievement.latest) ?? null,
    [achievements]
  );

  const videosByUser = useMemo(() => {
    const grouped = new Map<number, AdminVideoRecord[]>();

    videos.forEach((video) => {
      const current = grouped.get(video.uploader.id) ?? [];
      current.push(video);
      grouped.set(video.uploader.id, current);
    });

    grouped.forEach((entries) => {
      entries.sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      );
    });

    return grouped;
  }, [videos]);

  const loadDashboard = async ({ keepLoadingState = false }: { keepLoadingState?: boolean } = {}) => {
    if (keepLoadingState) {
      setIsLoading(true);
    }

    setError(null);

    try {
      const [
        usersResponse,
        videosResponse,
        comingUpEventsResponse,
        featuredReelsResponse,
        investorUpdatesResponse,
        pressHighlightsResponse,
        achievementsResponse,
        artistProfileResponse,
        galleryArchiveResponse,
        contactInquiriesResponse,
        heroEntryPointsResponse,
      ] = await Promise.all([
        fetchAdminUsers(),
        fetchAdminVideos(),
        fetchAdminComingUpEvents(),
        fetchAdminFeaturedReels(),
        fetchAdminInvestorUpdates(),
        fetchAdminPressHighlights(),
        fetchAdminAchievements(),
        fetchAdminArtistProfile(),
        fetchAdminGalleryArchive(),
        fetchAdminContactInquiries(),
        fetchAdminHeroEntryPoints(),
      ]);

      setUsers(usersResponse.users);
      setVideos(videosResponse.videos);
      setComingUpEvents(comingUpEventsResponse.events);
      setFeaturedReels(featuredReelsResponse.reels);
      setInvestorUpdates(investorUpdatesResponse.updates);
      setPressHighlights(pressHighlightsResponse.highlights);
      setAchievements(achievementsResponse.achievements);
      setArtistProfile(artistProfileResponse.profile);
      setMasterClassTimelineEntries(galleryArchiveResponse.timelineEntries);
      setMasterClassArchiveMoments(galleryArchiveResponse.masterClassMoments);
      setGroupArchiveEntries(galleryArchiveResponse.groupEntries);
      setGroupArchiveMoments(galleryArchiveResponse.groupMoments);
      setContactInquiries(contactInquiriesResponse.inquiries);
      setHeroEntryPoints(heroEntryPointsResponse.entryPoints);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load admin dashboard.');
    } finally {
      if (keepLoadingState) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadDashboard({ keepLoadingState: true });
  }, []);

  useEffect(() => {
    setComingUpEventDrafts((current) => {
      const nextDrafts: Record<number, ComingUpEventDraft> = {};

      comingUpEvents.forEach((event) => {
        nextDrafts[event.id] = current[event.id] ?? createComingUpEventDraftFromRecord(event);
      });

      return nextDrafts;
    });
  }, [comingUpEvents]);

  useEffect(() => {
    setFeaturedReelDrafts((current) => {
      const nextDrafts: Record<number, FeaturedReelDraft> = {};

      featuredReels.forEach((reel) => {
        nextDrafts[reel.id] = current[reel.id] ?? createFeaturedReelDraftFromRecord(reel);
      });

      return nextDrafts;
    });
  }, [featuredReels]);

  useEffect(() => {
    setInvestorUpdateDrafts((current) => {
      const nextDrafts: Record<number, InvestorUpdateDraft> = {};

      investorUpdates.forEach((update) => {
        nextDrafts[update.id] = current[update.id] ?? createInvestorUpdateDraftFromRecord(update);
      });

      return nextDrafts;
    });
  }, [investorUpdates]);

  useEffect(() => {
    setPressHighlightDrafts((current) => {
      const nextDrafts: Record<number, PressHighlightDraft> = {};

      pressHighlights.forEach((highlight) => {
        nextDrafts[highlight.id] =
          current[highlight.id] ?? createPressHighlightDraftFromRecord(highlight);
      });

      return nextDrafts;
    });
  }, [pressHighlights]);

  useEffect(() => {
    setAchievementDrafts((current) => {
      const nextDrafts: Record<number, AchievementDraft> = {};

      achievements.forEach((achievement) => {
        nextDrafts[achievement.id] =
          current[achievement.id] ?? createAchievementDraftFromRecord(achievement);
      });

      return nextDrafts;
    });
  }, [achievements]);

  useEffect(() => {
    if (!artistProfile) {
      return;
    }

    setArtistProfileDraft((current) => {
      if (
        current.coverIdentity ||
        current.coverIdentityZh ||
        current.coverStatement ||
        current.coverStatementZh ||
        current.aboutParagraph1 ||
        current.aboutParagraph1Zh ||
        current.aboutParagraph2 ||
        current.aboutParagraph2Zh ||
        current.aboutParagraph3 ||
        current.aboutParagraph3Zh
      ) {
        return current;
      }

      return createArtistProfileDraftFromRecord(artistProfile);
    });
  }, [artistProfile]);

  useEffect(() => {
    setMasterClassTimelineDrafts((current) => {
      const nextDrafts: Record<number, MasterClassTimelineDraft> = {};

      masterClassTimelineEntries.forEach((entry) => {
        nextDrafts[entry.id] = current[entry.id] ?? createMasterClassTimelineDraftFromRecord(entry);
      });

      return nextDrafts;
    });
  }, [masterClassTimelineEntries]);

  useEffect(() => {
    setMasterClassMomentDrafts((current) => {
      const nextDrafts: Record<number, ArchiveMediaDraft> = {};

      masterClassArchiveMoments.forEach((moment) => {
        nextDrafts[moment.id] = current[moment.id] ?? createArchiveMediaDraftFromRecord(moment);
      });

      return nextDrafts;
    });
  }, [masterClassArchiveMoments]);

  useEffect(() => {
    setGroupChoreographyEntryDrafts((current) => {
      const nextDrafts: Record<number, GroupChoreographyEntryDraft> = {};

      groupArchiveEntries.forEach((entry) => {
        nextDrafts[entry.id] = current[entry.id] ?? createGroupChoreographyEntryDraftFromRecord(entry);
      });

      return nextDrafts;
    });
  }, [groupArchiveEntries]);

  useEffect(() => {
    setGroupChoreographyMomentDrafts((current) => {
      const nextDrafts: Record<number, ArchiveMediaDraft> = {};

      groupArchiveMoments.forEach((moment) => {
        nextDrafts[moment.id] = current[moment.id] ?? createArchiveMediaDraftFromRecord(moment);
      });

      return nextDrafts;
    });
  }, [groupArchiveMoments]);

  const getDraft = (userId: number) => uploadDrafts[userId] ?? createDefaultDraft();

  const getComingUpEventDraft = (event: ComingUpEventRecord) =>
    comingUpEventDrafts[event.id] ?? createComingUpEventDraftFromRecord(event);

  const getFeaturedReelDraft = (reel: FeaturedReelRecord) =>
    featuredReelDrafts[reel.id] ?? createFeaturedReelDraftFromRecord(reel);

  const getInvestorUpdateDraft = (update: InvestorUpdateRecord) =>
    investorUpdateDrafts[update.id] ?? createInvestorUpdateDraftFromRecord(update);

  const getPressHighlightDraft = (highlight: PressHighlightRecord) =>
    pressHighlightDrafts[highlight.id] ?? createPressHighlightDraftFromRecord(highlight);

  const getAchievementDraft = (achievement: AchievementRecord) =>
    achievementDrafts[achievement.id] ?? createAchievementDraftFromRecord(achievement);
  const getMasterClassTimelineDraft = (entry: MasterClassTimelineEntryRecord) =>
    masterClassTimelineDrafts[entry.id] ?? createMasterClassTimelineDraftFromRecord(entry);
  const getMasterClassMomentDraft = (moment: ArchiveMediaRecord) =>
    masterClassMomentDrafts[moment.id] ?? createArchiveMediaDraftFromRecord(moment);
  const getGroupChoreographyEntryDraft = (entry: GroupChoreographyEntryRecord) =>
    groupChoreographyEntryDrafts[entry.id] ?? createGroupChoreographyEntryDraftFromRecord(entry);
  const getGroupChoreographyMomentDraft = (moment: ArchiveMediaRecord) =>
    groupChoreographyMomentDrafts[moment.id] ?? createArchiveMediaDraftFromRecord(moment);

  const updateDraft = (userId: number, patch: Partial<DancerUploadDraft>) => {
    setUploadDrafts((current) => ({
      ...current,
      [userId]: {
        ...(current[userId] ?? createDefaultDraft()),
        ...patch,
      },
    }));
  };

  const resetDraft = (userId: number, mode?: AdminUploadMode) => {
    const nextDraft = createDefaultDraft();
    if (mode) {
      nextDraft.mode = mode;
    }
    setUploadDrafts((current) => ({
      ...current,
      [userId]: nextDraft,
    }));
  };

  const updateComingUpEventDraft = (eventId: number, patch: Partial<ComingUpEventDraft>) => {
    setComingUpEventDrafts((current) => ({
      ...current,
      [eventId]: {
        ...(current[eventId] ?? createEmptyComingUpEventDraft()),
        ...patch,
      },
    }));
  };

  const updateNewComingUpEventDraft = (patch: Partial<ComingUpEventDraft>) => {
    setNewComingUpEventDraft((current) => ({
      ...current,
      ...patch,
    }));
  };

  const updateFeaturedReelDraft = (reelId: number, patch: Partial<FeaturedReelDraft>) => {
    setFeaturedReelDrafts((current) => ({
      ...current,
      [reelId]: {
        ...(current[reelId] ?? createEmptyFeaturedReelDraft('featured')),
        ...patch,
      },
    }));
  };

  const updateNewFeaturedReelDraft = (
    placement: FeaturedReelPlacement,
    patch: Partial<FeaturedReelDraft>
  ) => {
    setNewFeaturedReelDrafts((current) => ({
      ...current,
      [placement]: {
        ...current[placement],
        ...patch,
      },
    }));
  };

  const updateMasterClassTimelineDraft = (
    entryId: number,
    patch: Partial<MasterClassTimelineDraft>
  ) => {
    setMasterClassTimelineDrafts((current) => ({
      ...current,
      [entryId]: {
        ...(current[entryId] ?? createEmptyMasterClassTimelineDraft()),
        ...patch,
      },
    }));
  };

  const updateMasterClassMomentDraft = (
    momentId: number,
    patch: Partial<ArchiveMediaDraft>
  ) => {
    setMasterClassMomentDrafts((current) => ({
      ...current,
      [momentId]: {
        ...(current[momentId] ?? createEmptyArchiveMediaDraft()),
        ...patch,
      },
    }));
  };

  const updateGroupChoreographyEntryDraft = (
    entryId: number,
    patch: Partial<GroupChoreographyEntryDraft>
  ) => {
    setGroupChoreographyEntryDrafts((current) => ({
      ...current,
      [entryId]: {
        ...(current[entryId] ?? createEmptyGroupChoreographyEntryDraft()),
        ...patch,
      },
    }));
  };

  const updateGroupChoreographyMomentDraft = (
    momentId: number,
    patch: Partial<ArchiveMediaDraft>
  ) => {
    setGroupChoreographyMomentDrafts((current) => ({
      ...current,
      [momentId]: {
        ...(current[momentId] ?? createEmptyArchiveMediaDraft()),
        ...patch,
      },
    }));
  };

  const updateNewMasterClassTimelineDraft = (patch: Partial<MasterClassTimelineDraft>) => {
    setNewMasterClassTimelineDraft((current) => ({ ...current, ...patch }));
  };

  const updateNewMasterClassMomentDraft = (patch: Partial<ArchiveMediaDraft>) => {
    setNewMasterClassMomentDraft((current) => ({ ...current, ...patch }));
  };

  const updateNewGroupChoreographyEntryDraft = (
    patch: Partial<GroupChoreographyEntryDraft>
  ) => {
    setNewGroupChoreographyEntryDraft((current) => ({ ...current, ...patch }));
  };

  const updateNewGroupChoreographyMomentDraft = (patch: Partial<ArchiveMediaDraft>) => {
    setNewGroupChoreographyMomentDraft((current) => ({ ...current, ...patch }));
  };

  const updatePressHighlightDraft = (highlightId: number, patch: Partial<PressHighlightDraft>) => {
    setPressHighlightDrafts((current) => ({
      ...current,
      [highlightId]: {
        ...(current[highlightId] ?? createEmptyPressHighlightDraft()),
        ...patch,
      },
    }));
  };

  const updateNewPressHighlightDraft = (patch: Partial<PressHighlightDraft>) => {
    setNewPressHighlightDraft((current) => ({
      ...current,
      ...patch,
    }));
  };

  const updateAchievementDraft = (achievementId: number, patch: Partial<AchievementDraft>) => {
    setAchievementDrafts((current) => ({
      ...current,
      [achievementId]: {
        ...(current[achievementId] ?? createEmptyAchievementDraft()),
        ...patch,
      },
    }));
  };

  const updateNewAchievementDraft = (patch: Partial<AchievementDraft>) => {
    setNewAchievementDraft((current) => ({
      ...current,
      ...patch,
    }));
  };

  const updateArtistProfileDraft = (patch: Partial<ArtistProfileDraft>) => {
    setArtistProfileDraft((current) => ({
      ...current,
      ...patch,
    }));
  };

  const updateInvestorUpdateDraft = (updateId: number, patch: Partial<InvestorUpdateDraft>) => {
    setInvestorUpdateDrafts((current) => ({
      ...current,
      [updateId]: {
        ...(current[updateId] ?? createEmptyInvestorUpdateDraft('investment-page')),
        ...patch,
      },
    }));
  };

  const updateNewInvestorUpdateDraft = (
    category: InvestorUpdateCategory,
    patch: Partial<InvestorUpdateDraft>
  ) => {
    setNewInvestorUpdateDrafts((current) => ({
      ...current,
      [category]: {
        ...current[category],
        ...patch,
      },
    }));
  };

  const handleDeleteVideo = async (video: AdminVideoRecord) => {
    if (
      !window.confirm(
        `Delete "${video.title}" from ${video.uploader.email}? This removes the saved record and uploaded file.`
      )
    ) {
      return;
    }

    setActiveDeleteKey(`video-${video.id}`);
    setError(null);

    try {
      await deleteAdminVideo(video.id);
      setVideos((current) => current.filter((entry) => entry.id !== video.id));
      setUsers((current) =>
        current.map((user) =>
          user.id === video.uploader.id
            ? { ...user, uploadCount: Math.max(0, user.uploadCount - 1) }
            : user
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete video.');
    } finally {
      setActiveDeleteKey(null);
    }
  };

  const handleDeleteUser = async (user: AdminUserRecord) => {
    if (
      !window.confirm(
        `Delete ${user.email}? This will also delete ${user.uploadCount} uploaded video${user.uploadCount === 1 ? '' : 's'}.`
      )
    ) {
      return;
    }

    setActiveDeleteKey(`user-${user.id}`);
    setError(null);

    try {
      await deleteAdminUser(user.id);
      setUsers((current) => current.filter((entry) => entry.id !== user.id));
      setVideos((current) => current.filter((entry) => entry.uploader.id !== user.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete user.');
    } finally {
      setActiveDeleteKey(null);
    }
  };

  const handleSubmitAssignedYoutube = async (user: AdminUserRecord) => {
    const draft = getDraft(user.id);
    updateDraft(user.id, { isSubmitting: true, error: null });
    setError(null);

    try {
      await createAdminYoutubeVideo(user.id, {
        title: draft.title.trim(),
        youtubeUrl: draft.youtubeUrl.trim(),
      });

      await loadDashboard();
      resetDraft(user.id, 'youtube');
    } catch (err) {
      updateDraft(user.id, {
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to save this YouTube link.',
      });
      return;
    }

    updateDraft(user.id, { isSubmitting: false });
  };

  const handleSubmitAssignedUpload = async (user: AdminUserRecord) => {
    const draft = getDraft(user.id);
    updateDraft(user.id, { isSubmitting: true, error: null });
    setError(null);

    try {
      if (!draft.file) {
        throw new Error('Please choose a video file to upload.');
      }

      await uploadAdminVideoFile(user.id, {
        title: draft.title.trim(),
        file: draft.file,
      });

      await loadDashboard();
      setUploadDrafts((current) => ({
        ...current,
        [user.id]: {
          ...createDefaultDraft(),
          mode: 'upload',
          resetKey: (current[user.id]?.resetKey ?? 0) + 1,
        },
      }));
    } catch (err) {
      updateDraft(user.id, {
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to upload this video.',
      });
      return;
    }

    updateDraft(user.id, { isSubmitting: false });
  };

  const handleCreateComingUpEvent = async () => {
    updateNewComingUpEventDraft({ isSubmitting: true, error: null });
    setError(null);

    try {
      const response = await createAdminComingUpEvent({
        dateLabel: newComingUpEventDraft.dateLabel.trim(),
        location: newComingUpEventDraft.location.trim(),
        title: newComingUpEventDraft.title.trim(),
      });

      setComingUpEvents((current) => [...current, response.event]);
      setNewComingUpEventDraft(createEmptyComingUpEventDraft());
    } catch (err) {
      updateNewComingUpEventDraft({
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to create this event.',
      });
      return;
    }

    updateNewComingUpEventDraft({ isSubmitting: false });
  };

  const handleSaveComingUpEvent = async (event: ComingUpEventRecord) => {
    const draft = getComingUpEventDraft(event);
    updateComingUpEventDraft(event.id, { isSubmitting: true, error: null });
    setError(null);

    try {
      const response = await updateAdminComingUpEvent(event.id, {
        dateLabel: draft.dateLabel.trim(),
        location: draft.location.trim(),
        title: draft.title.trim(),
      });

      setComingUpEvents((current) =>
        current.map((entry) => (entry.id === event.id ? response.event : entry))
      );
      setComingUpEventDrafts((current) => ({
        ...current,
        [event.id]: createComingUpEventDraftFromRecord(response.event),
      }));
    } catch (err) {
      updateComingUpEventDraft(event.id, {
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to save this event.',
      });
      return;
    }

    updateComingUpEventDraft(event.id, { isSubmitting: false });
  };

  const handleDeleteComingUpEvent = async (event: ComingUpEventRecord) => {
    if (
      !window.confirm(
        `Delete "${event.title}" in ${event.location}? This will remove it from the Coming Up Events list.`
      )
    ) {
      return;
    }

    setActiveEventActionKey(`delete-${event.id}`);
    setError(null);

    try {
      await deleteAdminComingUpEvent(event.id);
      setComingUpEvents((current) => current.filter((entry) => entry.id !== event.id));
      setComingUpEventDrafts((current) => {
        const nextDrafts = { ...current };
        delete nextDrafts[event.id];
        return nextDrafts;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete this event.');
    } finally {
      setActiveEventActionKey(null);
    }
  };

  const handleMoveComingUpEvent = async (eventId: number, direction: -1 | 1) => {
    const currentIndex = comingUpEvents.findIndex((event) => event.id === eventId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= comingUpEvents.length) {
      return;
    }

    const reorderedIds = [...comingUpEvents.map((event) => event.id)];
    [reorderedIds[currentIndex], reorderedIds[nextIndex]] = [
      reorderedIds[nextIndex],
      reorderedIds[currentIndex],
    ];

    setActiveEventActionKey(`move-${eventId}`);
    setError(null);

    try {
      const response = await reorderAdminComingUpEvents(reorderedIds);
      setComingUpEvents(response.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reorder coming up events.');
    } finally {
      setActiveEventActionKey(null);
    }
  };

  const toFeaturedReelPayload = (draft: FeaturedReelDraft): AdminFeaturedReelPayload => ({
    placement: draft.placement,
    youtubeId: draft.youtubeId.trim(),
    videoSrc: draft.videoSrc.trim(),
    metaLabel: draft.metaLabel.trim(),
    metaLabelZh: draft.metaLabelZh.trim(),
    title: draft.title.trim(),
    titleZh: draft.titleZh.trim(),
    description: draft.description.trim(),
    descriptionZh: draft.descriptionZh.trim(),
    thumbnail: draft.thumbnail.trim(),
  });

  const toPressHighlightPayload = (draft: PressHighlightDraft): AdminPressHighlightPayload => ({
    source: draft.source.trim(),
    sourceZh: draft.sourceZh.trim(),
    dateLabel: draft.dateLabel.trim(),
    dateLabelZh: draft.dateLabelZh.trim(),
    title: draft.title.trim(),
    titleZh: draft.titleZh.trim(),
    description: draft.description.trim(),
    descriptionZh: draft.descriptionZh.trim(),
    href: draft.href.trim(),
    imageSrc: draft.imageSrc.trim(),
    imageAlt: draft.imageAlt.trim(),
    imageAltZh: draft.imageAltZh.trim(),
    imageHref: draft.imageHref.trim(),
  });

  const toAchievementPayload = (draft: AchievementDraft): AdminAchievementPayload => ({
    year: draft.year.trim(),
    title: draft.title.trim(),
    titleZh: draft.titleZh.trim(),
    description: draft.description.trim(),
    descriptionZh: draft.descriptionZh.trim(),
    highlight: draft.highlight,
    latest: draft.latest,
  });

  const toArtistProfilePayload = (draft: ArtistProfileDraft): AdminArtistProfilePayload => ({
    coverIdentity: draft.coverIdentity.trim(),
    coverIdentityZh: draft.coverIdentityZh.trim(),
    coverStatement: draft.coverStatement.trim(),
    coverStatementZh: draft.coverStatementZh.trim(),
    aboutParagraph1: draft.aboutParagraph1.trim(),
    aboutParagraph1Zh: draft.aboutParagraph1Zh.trim(),
    aboutParagraph2: draft.aboutParagraph2.trim(),
    aboutParagraph2Zh: draft.aboutParagraph2Zh.trim(),
    aboutParagraph3: draft.aboutParagraph3.trim(),
    aboutParagraph3Zh: draft.aboutParagraph3Zh.trim(),
  });

  const toMasterClassTimelinePayload = (
    draft: MasterClassTimelineDraft
  ): AdminMasterClassTimelineEntryPayload => ({
    dateLabel: draft.dateLabel.trim(),
    dateLabelZh: draft.dateLabelZh.trim(),
    title: draft.title.trim(),
    titleZh: draft.titleZh.trim(),
    location: draft.location.trim(),
    locationZh: draft.locationZh.trim(),
  });

  const toArchiveMediaPayload = (draft: ArchiveMediaDraft): AdminArchiveMediaPayload => ({
    title: draft.title.trim(),
    titleZh: draft.titleZh.trim(),
    subtitle: draft.subtitle.trim(),
    subtitleZh: draft.subtitleZh.trim(),
    imageSrc: draft.imageSrc.trim(),
    imageAlt: draft.imageAlt.trim(),
    imageAltZh: draft.imageAltZh.trim(),
    videoSrc: draft.videoSrc.trim(),
  });

  const toGroupChoreographyEntryPayload = (
    draft: GroupChoreographyEntryDraft
  ): AdminGroupChoreographyEntryPayload => ({
    seasonLabel: draft.seasonLabel.trim(),
    seasonLabelZh: draft.seasonLabelZh.trim(),
    organization: draft.organization.trim(),
    organizationZh: draft.organizationZh.trim(),
    workTitle: draft.workTitle.trim(),
    workTitleZh: draft.workTitleZh.trim(),
  });

  const handleCreateFeaturedReel = async (placement: FeaturedReelPlacement) => {
    const draft = newFeaturedReelDrafts[placement];
    updateNewFeaturedReelDraft(placement, { isSubmitting: true, error: null });
    setError(null);

    try {
      const response = await createAdminFeaturedReel(toFeaturedReelPayload(draft));
      setFeaturedReels((current) => [...current, response.reel]);
      updateNewFeaturedReelDraft(placement, createEmptyFeaturedReelDraft(placement));
      await loadDashboard();
    } catch (err) {
      updateNewFeaturedReelDraft(placement, {
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to create this reel.',
      });
      return;
    }

    updateNewFeaturedReelDraft(placement, { isSubmitting: false });
  };

  const handleSaveFeaturedReel = async (reel: FeaturedReelRecord) => {
    const draft = getFeaturedReelDraft(reel);
    updateFeaturedReelDraft(reel.id, { isSubmitting: true, error: null });
    setError(null);

    try {
      const response = await updateAdminFeaturedReel(reel.id, toFeaturedReelPayload(draft));
      setFeaturedReels((current) =>
        current.map((entry) => (entry.id === reel.id ? response.reel : entry))
      );
      setFeaturedReelDrafts((current) => ({
        ...current,
        [reel.id]: createFeaturedReelDraftFromRecord(response.reel),
      }));
      await loadDashboard();
    } catch (err) {
      updateFeaturedReelDraft(reel.id, {
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to save this reel.',
      });
      return;
    }

    updateFeaturedReelDraft(reel.id, { isSubmitting: false });
  };

  const handleDeleteFeaturedReel = async (reel: FeaturedReelRecord) => {
    if (!window.confirm(`Delete "${reel.title}" from ${reel.placement} reels?`)) {
      return;
    }

    setActiveEventActionKey(`featured-reel-delete-${reel.id}`);
    setError(null);

    try {
      await deleteAdminFeaturedReel(reel.id);
      setFeaturedReels((current) => current.filter((entry) => entry.id !== reel.id));
      setFeaturedReelDrafts((current) => {
        const nextDrafts = { ...current };
        delete nextDrafts[reel.id];
        return nextDrafts;
      });
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete this reel.');
    } finally {
      setActiveEventActionKey(null);
    }
  };

  const handleMoveFeaturedReel = async (
    placement: FeaturedReelPlacement,
    reelId: number,
    direction: -1 | 1
  ) => {
    const placementReels = featuredReelsByPlacement[placement];
    const currentIndex = placementReels.findIndex((entry) => entry.id === reelId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= placementReels.length) {
      return;
    }

    const reorderedIds = [...placementReels.map((entry) => entry.id)];
    [reorderedIds[currentIndex], reorderedIds[nextIndex]] = [
      reorderedIds[nextIndex],
      reorderedIds[currentIndex],
    ];

    setActiveEventActionKey(`featured-reel-move-${reelId}`);
    setError(null);

    try {
      await reorderAdminFeaturedReels(placement, reorderedIds);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reorder featured reels.');
    } finally {
      setActiveEventActionKey(null);
    }
  };

  const handleCreatePressHighlight = async () => {
    updateNewPressHighlightDraft({ isSubmitting: true, error: null });
    setError(null);

    try {
      const response = await createAdminPressHighlight(toPressHighlightPayload(newPressHighlightDraft));
      setPressHighlights((current) => [...current, response.highlight]);
      setNewPressHighlightDraft(createEmptyPressHighlightDraft());
      await loadDashboard();
    } catch (err) {
      updateNewPressHighlightDraft({
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to create this press highlight.',
      });
      return;
    }

    updateNewPressHighlightDraft({ isSubmitting: false });
  };

  const handleSavePressHighlight = async (highlight: PressHighlightRecord) => {
    const draft = getPressHighlightDraft(highlight);
    updatePressHighlightDraft(highlight.id, { isSubmitting: true, error: null });
    setError(null);

    try {
      const response = await updateAdminPressHighlight(
        highlight.id,
        toPressHighlightPayload(draft)
      );
      setPressHighlights((current) =>
        current.map((entry) => (entry.id === highlight.id ? response.highlight : entry))
      );
      setPressHighlightDrafts((current) => ({
        ...current,
        [highlight.id]: createPressHighlightDraftFromRecord(response.highlight),
      }));
    } catch (err) {
      updatePressHighlightDraft(highlight.id, {
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to save this press highlight.',
      });
      return;
    }

    updatePressHighlightDraft(highlight.id, { isSubmitting: false });
  };

  const handleDeletePressHighlight = async (highlight: PressHighlightRecord) => {
    if (!window.confirm(`Delete "${highlight.title}" from Press Highlight?`)) {
      return;
    }

    setActiveEventActionKey(`press-highlight-delete-${highlight.id}`);
    setError(null);

    try {
      await deleteAdminPressHighlight(highlight.id);
      setPressHighlights((current) => current.filter((entry) => entry.id !== highlight.id));
      setPressHighlightDrafts((current) => {
        const nextDrafts = { ...current };
        delete nextDrafts[highlight.id];
        return nextDrafts;
      });
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete this press highlight.');
    } finally {
      setActiveEventActionKey(null);
    }
  };

  const handleMovePressHighlight = async (highlightId: number, direction: -1 | 1) => {
    const currentIndex = pressHighlights.findIndex((entry) => entry.id === highlightId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= pressHighlights.length) {
      return;
    }

    const reorderedIds = [...pressHighlights.map((entry) => entry.id)];
    [reorderedIds[currentIndex], reorderedIds[nextIndex]] = [
      reorderedIds[nextIndex],
      reorderedIds[currentIndex],
    ];

    setActiveEventActionKey(`press-highlight-move-${highlightId}`);
    setError(null);

    try {
      const response = await reorderAdminPressHighlights(reorderedIds);
      setPressHighlights(response.highlights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reorder press highlights.');
    } finally {
      setActiveEventActionKey(null);
    }
  };

  const handleCreateAchievement = async () => {
    updateNewAchievementDraft({ isSubmitting: true, error: null });
    setError(null);

    try {
      const response = await createAdminAchievement(toAchievementPayload(newAchievementDraft));
      setAchievements((current) => [...current, response.achievement]);
      setNewAchievementDraft(createEmptyAchievementDraft());
      await loadDashboard();
    } catch (err) {
      updateNewAchievementDraft({
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to create this achievement entry.',
      });
      return;
    }

    updateNewAchievementDraft({ isSubmitting: false });
  };

  const handleSaveAchievement = async (achievement: AchievementRecord) => {
    const draft = getAchievementDraft(achievement);
    updateAchievementDraft(achievement.id, { isSubmitting: true, error: null });
    setError(null);

    try {
      const response = await updateAdminAchievement(
        achievement.id,
        toAchievementPayload(draft)
      );
      setAchievements((current) =>
        current.map((entry) => (entry.id === achievement.id ? response.achievement : entry))
      );
      setAchievementDrafts((current) => ({
        ...current,
        [achievement.id]: createAchievementDraftFromRecord(response.achievement),
      }));
      await loadDashboard();
    } catch (err) {
      updateAchievementDraft(achievement.id, {
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to save this achievement entry.',
      });
      return;
    }

    updateAchievementDraft(achievement.id, { isSubmitting: false });
  };

  const handleDeleteAchievement = async (achievement: AchievementRecord) => {
    if (!window.confirm(`Delete "${achievement.title}" from Archive Timeline?`)) {
      return;
    }

    setActiveEventActionKey(`achievement-delete-${achievement.id}`);
    setError(null);

    try {
      await deleteAdminAchievement(achievement.id);
      setAchievements((current) => current.filter((entry) => entry.id !== achievement.id));
      setAchievementDrafts((current) => {
        const nextDrafts = { ...current };
        delete nextDrafts[achievement.id];
        return nextDrafts;
      });
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete this achievement entry.');
    } finally {
      setActiveEventActionKey(null);
    }
  };

  const handleMoveAchievement = async (achievementId: number, direction: -1 | 1) => {
    const currentIndex = achievements.findIndex((entry) => entry.id === achievementId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= achievements.length) {
      return;
    }

    const reorderedIds = [...achievements.map((entry) => entry.id)];
    [reorderedIds[currentIndex], reorderedIds[nextIndex]] = [
      reorderedIds[nextIndex],
      reorderedIds[currentIndex],
    ];

    setActiveEventActionKey(`achievement-move-${achievementId}`);
    setError(null);

    try {
      const response = await reorderAdminAchievements(reorderedIds);
      setAchievements(response.achievements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reorder archive timeline entries.');
    } finally {
      setActiveEventActionKey(null);
    }
  };

  const handleSaveArtistProfile = async () => {
    updateArtistProfileDraft({ isSubmitting: true, error: null });
    setError(null);

    try {
      const response = await updateAdminArtistProfile(toArtistProfilePayload(artistProfileDraft));
      setArtistProfile(response.profile);
      setArtistProfileDraft(createArtistProfileDraftFromRecord(response.profile));
    } catch (err) {
      updateArtistProfileDraft({
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to save the artist profile.',
      });
      return;
    }

    updateArtistProfileDraft({ isSubmitting: false });
  };

  const handleCreateMasterClassTimelineEntry = async () => {
    updateNewMasterClassTimelineDraft({ isSubmitting: true, error: null });
    setError(null);

    try {
      const response = await createAdminMasterClassTimelineEntry(
        toMasterClassTimelinePayload(newMasterClassTimelineDraft)
      );
      setMasterClassTimelineEntries((current) => [...current, response.entry]);
      setNewMasterClassTimelineDraft(createEmptyMasterClassTimelineDraft());
      await loadDashboard();
    } catch (err) {
      updateNewMasterClassTimelineDraft({
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to create this timeline entry.',
      });
      return;
    }

    updateNewMasterClassTimelineDraft({ isSubmitting: false });
  };

  const handleSaveMasterClassTimelineEntry = async (entry: MasterClassTimelineEntryRecord) => {
    const draft = getMasterClassTimelineDraft(entry);
    updateMasterClassTimelineDraft(entry.id, { isSubmitting: true, error: null });
    setError(null);

    try {
      const response = await updateAdminMasterClassTimelineEntry(
        entry.id,
        toMasterClassTimelinePayload(draft)
      );
      setMasterClassTimelineEntries((current) =>
        current.map((item) => (item.id === entry.id ? response.entry : item))
      );
      setMasterClassTimelineDrafts((current) => ({
        ...current,
        [entry.id]: createMasterClassTimelineDraftFromRecord(response.entry),
      }));
    } catch (err) {
      updateMasterClassTimelineDraft(entry.id, {
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to save this timeline entry.',
      });
      return;
    }

    updateMasterClassTimelineDraft(entry.id, { isSubmitting: false });
  };

  const handleDeleteMasterClassTimelineEntry = async (entry: MasterClassTimelineEntryRecord) => {
    if (!window.confirm(`Delete "${entry.title}" from Archive Timeline?`)) {
      return;
    }

    setActiveEventActionKey(`master-class-timeline-delete-${entry.id}`);
    setError(null);

    try {
      await deleteAdminMasterClassTimelineEntry(entry.id);
      setMasterClassTimelineEntries((current) => current.filter((item) => item.id !== entry.id));
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete this timeline entry.');
    } finally {
      setActiveEventActionKey(null);
    }
  };

  const handleMoveMasterClassTimelineEntry = async (entryId: number, direction: -1 | 1) => {
    const currentIndex = masterClassTimelineEntries.findIndex((entry) => entry.id === entryId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= masterClassTimelineEntries.length) {
      return;
    }

    const reorderedIds = [...masterClassTimelineEntries.map((entry) => entry.id)];
    [reorderedIds[currentIndex], reorderedIds[nextIndex]] = [
      reorderedIds[nextIndex],
      reorderedIds[currentIndex],
    ];

    setActiveEventActionKey(`master-class-timeline-move-${entryId}`);
    setError(null);

    try {
      const response = await reorderAdminMasterClassTimelineEntries(reorderedIds);
      setMasterClassTimelineEntries(response.timelineEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reorder timeline entries.');
    } finally {
      setActiveEventActionKey(null);
    }
  };

  const createMediaHandlers = (
    kind: 'master-class' | 'group',
    moment: ArchiveMediaRecord
  ) => ({
    save: async (draft: ArchiveMediaDraft) => {
      const response =
        kind === 'master-class'
          ? await updateAdminMasterClassMoment(moment.id, toArchiveMediaPayload(draft))
          : await updateAdminGroupChoreographyMoment(moment.id, toArchiveMediaPayload(draft));
      return response.moment;
    },
    deleteAction:
      kind === 'master-class' ? deleteAdminMasterClassMoment : deleteAdminGroupChoreographyMoment,
  });

  const handleSaveMasterClassMoment = async (moment: ArchiveMediaRecord) => {
    const draft = getMasterClassMomentDraft(moment);
    updateMasterClassMomentDraft(moment.id, { isSubmitting: true, error: null });
    setError(null);

    try {
      const saved = await createMediaHandlers('master-class', moment).save(draft);
      setMasterClassArchiveMoments((current) =>
        current.map((item) => (item.id === moment.id ? saved : item))
      );
      setMasterClassMomentDrafts((current) => ({
        ...current,
        [moment.id]: createArchiveMediaDraftFromRecord(saved),
      }));
    } catch (err) {
      updateMasterClassMomentDraft(moment.id, {
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to save this master class moment.',
      });
      return;
    }

    updateMasterClassMomentDraft(moment.id, { isSubmitting: false });
  };

  const handleCreateMasterClassMoment = async () => {
    updateNewMasterClassMomentDraft({ isSubmitting: true, error: null });
    setError(null);

    try {
      const response = await createAdminMasterClassMoment(
        toArchiveMediaPayload(newMasterClassMomentDraft)
      );
      setMasterClassArchiveMoments((current) => [...current, response.moment]);
      setNewMasterClassMomentDraft(createEmptyArchiveMediaDraft());
      await loadDashboard();
    } catch (err) {
      updateNewMasterClassMomentDraft({
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to create this master class moment.',
      });
      return;
    }

    updateNewMasterClassMomentDraft({ isSubmitting: false });
  };

  const handleDeleteMasterClassMoment = async (moment: ArchiveMediaRecord) => {
    if (!window.confirm(`Delete "${moment.title}" from Selected Master Class Moments?`)) {
      return;
    }

    setActiveEventActionKey(`master-class-moment-delete-${moment.id}`);
    setError(null);

    try {
      await deleteAdminMasterClassMoment(moment.id);
      setMasterClassArchiveMoments((current) => current.filter((item) => item.id !== moment.id));
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete this master class moment.');
    } finally {
      setActiveEventActionKey(null);
    }
  };

  const handleMoveMasterClassMoment = async (momentId: number, direction: -1 | 1) => {
    const currentIndex = masterClassArchiveMoments.findIndex((entry) => entry.id === momentId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= masterClassArchiveMoments.length) {
      return;
    }

    const reorderedIds = [...masterClassArchiveMoments.map((entry) => entry.id)];
    [reorderedIds[currentIndex], reorderedIds[nextIndex]] = [
      reorderedIds[nextIndex],
      reorderedIds[currentIndex],
    ];

    setActiveEventActionKey(`master-class-moment-move-${momentId}`);
    setError(null);

    try {
      const response = await reorderAdminMasterClassMoments(reorderedIds);
      setMasterClassArchiveMoments(response.masterClassMoments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reorder master class moments.');
    } finally {
      setActiveEventActionKey(null);
    }
  };

  const handleCreateGroupChoreographyEntry = async () => {
    updateNewGroupChoreographyEntryDraft({ isSubmitting: true, error: null });
    setError(null);

    try {
      const response = await createAdminGroupChoreographyEntry(
        toGroupChoreographyEntryPayload(newGroupChoreographyEntryDraft)
      );
      setGroupArchiveEntries((current) => [...current, response.entry]);
      setNewGroupChoreographyEntryDraft(createEmptyGroupChoreographyEntryDraft());
      await loadDashboard();
    } catch (err) {
      updateNewGroupChoreographyEntryDraft({
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to create this group entry.',
      });
      return;
    }

    updateNewGroupChoreographyEntryDraft({ isSubmitting: false });
  };

  const handleSaveGroupChoreographyEntry = async (entry: GroupChoreographyEntryRecord) => {
    const draft = getGroupChoreographyEntryDraft(entry);
    updateGroupChoreographyEntryDraft(entry.id, { isSubmitting: true, error: null });
    setError(null);

    try {
      const response = await updateAdminGroupChoreographyEntry(
        entry.id,
        toGroupChoreographyEntryPayload(draft)
      );
      setGroupArchiveEntries((current) =>
        current.map((item) => (item.id === entry.id ? response.entry : item))
      );
      setGroupChoreographyEntryDrafts((current) => ({
        ...current,
        [entry.id]: createGroupChoreographyEntryDraftFromRecord(response.entry),
      }));
    } catch (err) {
      updateGroupChoreographyEntryDraft(entry.id, {
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to save this group entry.',
      });
      return;
    }

    updateGroupChoreographyEntryDraft(entry.id, { isSubmitting: false });
  };

  const handleDeleteGroupChoreographyEntry = async (entry: GroupChoreographyEntryRecord) => {
    if (!window.confirm(`Delete "${entry.organization} — ${entry.workTitle}" from Groups Choreography?`)) {
      return;
    }

    setActiveEventActionKey(`group-entry-delete-${entry.id}`);
    setError(null);

    try {
      await deleteAdminGroupChoreographyEntry(entry.id);
      setGroupArchiveEntries((current) => current.filter((item) => item.id !== entry.id));
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete this group entry.');
    } finally {
      setActiveEventActionKey(null);
    }
  };

  const handleMoveGroupChoreographyEntry = async (entryId: number, direction: -1 | 1) => {
    const currentIndex = groupArchiveEntries.findIndex((entry) => entry.id === entryId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= groupArchiveEntries.length) {
      return;
    }

    const reorderedIds = [...groupArchiveEntries.map((entry) => entry.id)];
    [reorderedIds[currentIndex], reorderedIds[nextIndex]] = [
      reorderedIds[nextIndex],
      reorderedIds[currentIndex],
    ];

    setActiveEventActionKey(`group-entry-move-${entryId}`);
    setError(null);

    try {
      const response = await reorderAdminGroupChoreographyEntries(reorderedIds);
      setGroupArchiveEntries(response.groupEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reorder group choreography entries.');
    } finally {
      setActiveEventActionKey(null);
    }
  };

  const handleCreateGroupChoreographyMoment = async () => {
    updateNewGroupChoreographyMomentDraft({ isSubmitting: true, error: null });
    setError(null);

    try {
      const response = await createAdminGroupChoreographyMoment(
        toArchiveMediaPayload(newGroupChoreographyMomentDraft)
      );
      setGroupArchiveMoments((current) => [...current, response.moment]);
      setNewGroupChoreographyMomentDraft(createEmptyArchiveMediaDraft());
      await loadDashboard();
    } catch (err) {
      updateNewGroupChoreographyMomentDraft({
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to create this group moment.',
      });
      return;
    }

    updateNewGroupChoreographyMomentDraft({ isSubmitting: false });
  };

  const handleSaveGroupChoreographyMoment = async (moment: ArchiveMediaRecord) => {
    const draft = getGroupChoreographyMomentDraft(moment);
    updateGroupChoreographyMomentDraft(moment.id, { isSubmitting: true, error: null });
    setError(null);

    try {
      const saved = await updateAdminGroupChoreographyMoment(
        moment.id,
        toArchiveMediaPayload(draft)
      );
      setGroupArchiveMoments((current) =>
        current.map((item) => (item.id === moment.id ? saved.moment : item))
      );
      setGroupChoreographyMomentDrafts((current) => ({
        ...current,
        [moment.id]: createArchiveMediaDraftFromRecord(saved.moment),
      }));
    } catch (err) {
      updateGroupChoreographyMomentDraft(moment.id, {
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to save this group moment.',
      });
      return;
    }

    updateGroupChoreographyMomentDraft(moment.id, { isSubmitting: false });
  };

  const handleDeleteGroupChoreographyMoment = async (moment: ArchiveMediaRecord) => {
    if (!window.confirm(`Delete "${moment.title}" from Featured Group Works?`)) {
      return;
    }

    setActiveEventActionKey(`group-moment-delete-${moment.id}`);
    setError(null);

    try {
      await deleteAdminGroupChoreographyMoment(moment.id);
      setGroupArchiveMoments((current) => current.filter((item) => item.id !== moment.id));
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete this group moment.');
    } finally {
      setActiveEventActionKey(null);
    }
  };

  const handleMoveGroupChoreographyMoment = async (momentId: number, direction: -1 | 1) => {
    const currentIndex = groupArchiveMoments.findIndex((entry) => entry.id === momentId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= groupArchiveMoments.length) {
      return;
    }

    const reorderedIds = [...groupArchiveMoments.map((entry) => entry.id)];
    [reorderedIds[currentIndex], reorderedIds[nextIndex]] = [
      reorderedIds[nextIndex],
      reorderedIds[currentIndex],
    ];

    setActiveEventActionKey(`group-moment-move-${momentId}`);
    setError(null);

    try {
      const response = await reorderAdminGroupChoreographyMoments(reorderedIds);
      setGroupArchiveMoments(response.groupMoments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reorder group moments.');
    } finally {
      setActiveEventActionKey(null);
    }
  };

  const toInvestorUpdatePayload = (draft: InvestorUpdateDraft): AdminInvestorUpdatePayload => ({
    category: draft.category,
    title: draft.title.trim(),
    summary: draft.summary.trim(),
    href: draft.href.trim(),
  });

  const handleCreateInvestorUpdate = async (category: InvestorUpdateCategory) => {
    const draft = newInvestorUpdateDrafts[category];
    updateNewInvestorUpdateDraft(category, { isSubmitting: true, error: null });
    setError(null);

    try {
      const response = await createAdminInvestorUpdate(toInvestorUpdatePayload(draft));
      setInvestorUpdates((current) => [...current, response.update]);
      updateNewInvestorUpdateDraft(category, createEmptyInvestorUpdateDraft(category));
    } catch (err) {
      updateNewInvestorUpdateDraft(category, {
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to create this investor update.',
      });
      return;
    }

    updateNewInvestorUpdateDraft(category, { isSubmitting: false });
  };

  const handleSaveInvestorUpdate = async (update: InvestorUpdateRecord) => {
    const draft = getInvestorUpdateDraft(update);
    updateInvestorUpdateDraft(update.id, { isSubmitting: true, error: null });
    setError(null);

    try {
      const response = await updateAdminInvestorUpdate(update.id, toInvestorUpdatePayload(draft));
      setInvestorUpdates((current) =>
        current.map((entry) => (entry.id === update.id ? response.update : entry))
      );
      setInvestorUpdateDrafts((current) => ({
        ...current,
        [update.id]: createInvestorUpdateDraftFromRecord(response.update),
      }));
      await loadDashboard();
    } catch (err) {
      updateInvestorUpdateDraft(update.id, {
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Unable to save this investor update.',
      });
      return;
    }

    updateInvestorUpdateDraft(update.id, { isSubmitting: false });
  };

  const handleDeleteInvestorUpdate = async (update: InvestorUpdateRecord) => {
    if (
      !window.confirm(
        `Delete "${update.title}" from ${update.category.replaceAll('-', ' ')}?`
      )
    ) {
      return;
    }

    setActiveEventActionKey(`investor-delete-${update.id}`);
    setError(null);

    try {
      await deleteAdminInvestorUpdate(update.id);
      setInvestorUpdates((current) => current.filter((entry) => entry.id !== update.id));
      setInvestorUpdateDrafts((current) => {
        const nextDrafts = { ...current };
        delete nextDrafts[update.id];
        return nextDrafts;
      });
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete this investor update.');
    } finally {
      setActiveEventActionKey(null);
    }
  };

  const handleMoveInvestorUpdate = async (
    category: InvestorUpdateCategory,
    updateId: number,
    direction: -1 | 1
  ) => {
    const categoryUpdates = investorUpdatesByCategory[category];
    const currentIndex = categoryUpdates.findIndex((entry) => entry.id === updateId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= categoryUpdates.length) {
      return;
    }

    const reorderedIds = [...categoryUpdates.map((entry) => entry.id)];
    [reorderedIds[currentIndex], reorderedIds[nextIndex]] = [
      reorderedIds[nextIndex],
      reorderedIds[currentIndex],
    ];

    setActiveEventActionKey(`investor-move-${updateId}`);
    setError(null);

    try {
      await reorderAdminInvestorUpdates(category, reorderedIds);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reorder investor updates.');
    } finally {
      setActiveEventActionKey(null);
    }
  };

  const renderVideoCard = (video: AdminVideoRecord, compact = false) => {
    const isDeleting = activeDeleteKey === `video-${video.id}`;

    return (
      <article
        key={video.id}
        className="rounded-[1.35rem] border border-[var(--line)] bg-[rgba(255,255,255,0.78)] p-5 shadow-[0_16px_40px_rgba(68,102,136,0.08)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-[10px]">
              {video.sourceType === 'youtube' ? 'YouTube Link' : 'Uploaded File'} ·{' '}
              {formatDate(video.createdAt)}
            </p>
            <h3 className="mt-3 text-3xl text-[var(--text)]">{video.title}</h3>
            {!compact ? (
              <p className="mt-3 text-sm text-[var(--text-muted)]">
                Uploaded by{' '}
                <span className="font-medium text-[var(--text)]">{video.uploader.email}</span>
              </p>
            ) : null}
          </div>
          <button
            className="rounded-full border border-[rgba(255,107,107,0.24)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[rgba(255,107,107,0.48)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isDeleting}
            onClick={() => void handleDeleteVideo(video)}
            type="button"
          >
            {isDeleting ? 'Deleting...' : 'Delete video'}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
          <span>Status: {video.status}</span>
          <span>Duration: {formatDuration(video.durationSeconds)}</span>
          <span>Size: {formatBytes(video.fileSizeBytes)}</span>
        </div>

        <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-[var(--line)] bg-black/5">
          {video.sourceType === 'youtube' && video.sourceUrl ? (
            <div className="p-5">
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                External reel link saved to the private archive.
              </p>
              <a
                className="mt-4 inline-flex rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--text)]"
                href={video.sourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open YouTube
              </a>
            </div>
          ) : video.filePath ? (
            <video
              className="block aspect-video w-full bg-black object-contain"
              controls
              preload="metadata"
              src={video.filePath}
            />
          ) : (
            <div className="p-5 text-sm text-[var(--text-muted)]">Processing asset...</div>
          )}
        </div>

        {video.originalFilename ? (
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Original file: {video.originalFilename}
          </p>
        ) : null}
      </article>
    );
  };

  return (
    <section className="section-padding pt-32 sm:pt-36">
      <div className="container-max max-w-7xl">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-8 shadow-[0_28px_80px_rgba(68,102,136,0.15)] backdrop-blur-sm sm:p-10">
          <p className="eyebrow">Admin Console</p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-5xl leading-none text-[var(--text)] sm:text-6xl">
                User and video oversight
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-muted)]">
                Review every registered creator, track their uploads, and remove accounts or videos when needed. Deleting a user cascades through every saved clip they uploaded.
              </p>
            </div>
            <div className="grid min-w-[16rem] gap-3 sm:grid-cols-3 lg:min-w-[25rem]">
              {[
                { label: 'Users', value: stats.userCount },
                { label: 'Videos', value: stats.videoCount },
                { label: 'Admins', value: stats.adminCount },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-4 text-center shadow-[0_18px_40px_rgba(68,102,136,0.08)]"
                >
                  <p className="eyebrow text-[10px]">{stat.label}</p>
                  <p className="mt-3 text-3xl text-[var(--text)]">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,255,255,0.5)] p-3 shadow-[0_14px_36px_rgba(68,102,136,0.08)]">
            <div className="grid gap-3 md:grid-cols-5">
              {adminTabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-[1.2rem] border px-4 py-4 text-left transition ${
                      isActive
                        ? 'border-[var(--text)] bg-[var(--surface)] shadow-[0_12px_28px_rgba(68,102,136,0.08)]'
                        : 'border-transparent bg-transparent hover:border-[var(--line)] hover:bg-[rgba(255,255,255,0.42)]'
                    }`}
                  >
                    <p className="eyebrow text-[10px]">Admin Section</p>
                    <h2 className="mt-3 text-2xl text-[var(--text)]">{tab.label}</h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                      {tab.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="mt-8 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
              {error}
            </p>
          )}

          {isLoading ? (
            <div className="mt-10 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-6 py-14 text-center">
              <p className="eyebrow">Loading admin data</p>
              <h2 className="mt-4 text-3xl text-[var(--text)]">Preparing admin dashboard</h2>
            </div>
          ) : (
            <div className="mt-10 space-y-10">
              {activeTab === 'coming-up-events' ? (
              <section aria-labelledby="coming-up-events-heading">
                <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_20px_55px_rgba(68,102,136,0.09)] sm:p-6">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="eyebrow">Homepage</p>
                      <h2
                        id="coming-up-events-heading"
                        className="mt-3 text-4xl text-[var(--text)]"
                      >
                        Coming Up Events
                      </h2>
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
                        Update the homepage event list with structured date, location, and title fields. Use the arrows to manually set the display order.
                      </p>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">
                      {comingUpEvents.length} event{comingUpEvents.length === 1 ? '' : 's'}
                    </p>
                  </div>

                  <div className="mt-6 rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-5 shadow-[0_12px_28px_rgba(68,102,136,0.06)]">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <p className="eyebrow text-[10px]">Create event</p>
                        <h3 className="mt-3 text-2xl text-[var(--text)]">Add a new stop</h3>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_auto]">
                      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                        <span className="eyebrow text-[10px]">Date label</span>
                        <input
                          className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
                          onChange={(event) =>
                            updateNewComingUpEventDraft({ dateLabel: event.target.value })
                          }
                          placeholder="July-August 2026"
                          type="text"
                          value={newComingUpEventDraft.dateLabel}
                        />
                      </label>

                      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                        <span className="eyebrow text-[10px]">Location</span>
                        <input
                          className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
                          onChange={(event) =>
                            updateNewComingUpEventDraft({ location: event.target.value })
                          }
                          placeholder="Shanghai / Taipei / Hong Kong"
                          type="text"
                          value={newComingUpEventDraft.location}
                        />
                      </label>

                      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                        <span className="eyebrow text-[10px]">Event title</span>
                        <input
                          className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
                          onChange={(event) =>
                            updateNewComingUpEventDraft({ title: event.target.value })
                          }
                          placeholder="AEDC Performance and Master Class"
                          type="text"
                          value={newComingUpEventDraft.title}
                        />
                      </label>

                      <div className="flex items-end">
                        <button
                          className="rounded-full bg-[var(--text)] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[var(--text-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={newComingUpEventDraft.isSubmitting}
                          onClick={() => void handleCreateComingUpEvent()}
                          type="button"
                        >
                          {newComingUpEventDraft.isSubmitting ? 'Adding...' : 'Add event'}
                        </button>
                      </div>
                    </div>

                    {newComingUpEventDraft.error ? (
                      <p className="mt-4 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
                        {newComingUpEventDraft.error}
                      </p>
                    ) : null}
                  </div>

                  {comingUpEvents.length === 0 ? (
                    <div className="mt-6 rounded-[1.25rem] border border-dashed border-[var(--line)] px-5 py-6 text-sm text-[var(--text-muted)]">
                      No coming up events have been added yet.
                    </div>
                  ) : (
                    <div className="mt-6 space-y-4">
                      {comingUpEvents.map((event, index) => {
                        const draft = getComingUpEventDraft(event);
                        const isDeleting = activeEventActionKey === `delete-${event.id}`;
                        const isMoving = activeEventActionKey === `move-${event.id}`;

                        return (
                          <article
                            key={event.id}
                            className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.78)] p-5 shadow-[0_16px_40px_rgba(68,102,136,0.08)]"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <p className="eyebrow text-[10px]">Display order #{index + 1}</p>
                                <h3 className="mt-3 text-2xl text-[var(--text)]">{draft.title || 'Untitled event'}</h3>
                                <p className="mt-3 text-sm text-[var(--text-muted)]">
                                  {draft.dateLabel || 'Date label'} · {draft.location || 'Location'}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-60"
                                  disabled={index === 0 || isMoving}
                                  onClick={() => void handleMoveComingUpEvent(event.id, -1)}
                                  type="button"
                                >
                                  {isMoving ? 'Moving...' : 'Move up'}
                                </button>
                                <button
                                  className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-60"
                                  disabled={index === comingUpEvents.length - 1 || isMoving}
                                  onClick={() => void handleMoveComingUpEvent(event.id, 1)}
                                  type="button"
                                >
                                  {isMoving ? 'Moving...' : 'Move down'}
                                </button>
                                <button
                                  className="rounded-full bg-[var(--text)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[var(--text-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                                  disabled={draft.isSubmitting}
                                  onClick={() => void handleSaveComingUpEvent(event)}
                                  type="button"
                                >
                                  {draft.isSubmitting ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  className="rounded-full border border-[rgba(255,107,107,0.24)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[rgba(255,107,107,0.48)] disabled:cursor-not-allowed disabled:opacity-60"
                                  disabled={isDeleting}
                                  onClick={() => void handleDeleteComingUpEvent(event)}
                                  type="button"
                                >
                                  {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                            </div>

                            <div className="mt-5 grid gap-4 xl:grid-cols-3">
                              <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                                <span className="eyebrow text-[10px]">Date label</span>
                                <input
                                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
                                  onChange={(inputEvent) =>
                                    updateComingUpEventDraft(event.id, {
                                      dateLabel: inputEvent.target.value,
                                    })
                                  }
                                  type="text"
                                  value={draft.dateLabel}
                                />
                              </label>

                              <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                                <span className="eyebrow text-[10px]">Location</span>
                                <input
                                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
                                  onChange={(inputEvent) =>
                                    updateComingUpEventDraft(event.id, {
                                      location: inputEvent.target.value,
                                    })
                                  }
                                  type="text"
                                  value={draft.location}
                                />
                              </label>

                              <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                                <span className="eyebrow text-[10px]">Event title</span>
                                <input
                                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
                                  onChange={(inputEvent) =>
                                    updateComingUpEventDraft(event.id, {
                                      title: inputEvent.target.value,
                                    })
                                  }
                                  type="text"
                                  value={draft.title}
                                />
                              </label>
                            </div>

                            {draft.error ? (
                              <p className="mt-4 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
                                {draft.error}
                              </p>
                            ) : null}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
              ) : null}

              {activeTab === 'content' ? (
              <section aria-labelledby="admin-content-heading">
                <div className="space-y-6">
                  <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_20px_55px_rgba(68,102,136,0.09)] sm:p-8">
                    <p className="eyebrow">Homepage Content</p>
                    <h2 id="admin-content-heading" className="mt-3 text-4xl text-[var(--text)]">
                      Homepage Content Modules
                    </h2>
                    <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-muted)]">
                      Manage the homepage modules that visitors see first. Press Highlight controls the editorial cards in the press section, and Featured Performance Reels controls the media section.
                    </p>
                  </div>

                  <article className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_20px_55px_rgba(68,102,136,0.09)] sm:p-6">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <p className="eyebrow">Artist Profile</p>
                        <h3 className="mt-3 text-3xl text-[var(--text)]">Hero identity and profile narrative</h3>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
                          Manage the Hero identity line, Hero statement, and the three profile paragraphs shown in the Artist Profile section.
                        </p>
                      </div>
                      <div className="text-sm text-[var(--text-muted)]">
                        {artistProfile ? `Updated ${formatDate(artistProfile.updatedAt)}` : 'Loading profile'}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 xl:grid-cols-2">
                      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                        <span className="eyebrow text-[10px]">Cover identity (EN)</span>
                        <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={artistProfileDraft.coverIdentity} onChange={(event) => updateArtistProfileDraft({ coverIdentity: event.target.value })} />
                      </label>
                      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                        <span className="eyebrow text-[10px]">Cover identity (ZH)</span>
                        <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={artistProfileDraft.coverIdentityZh} onChange={(event) => updateArtistProfileDraft({ coverIdentityZh: event.target.value })} />
                      </label>
                      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2">
                        <span className="eyebrow text-[10px]">Hero statement (EN)</span>
                        <textarea className="min-h-24 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" value={artistProfileDraft.coverStatement} onChange={(event) => updateArtistProfileDraft({ coverStatement: event.target.value })} />
                      </label>
                      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2">
                        <span className="eyebrow text-[10px]">Hero statement (ZH)</span>
                        <textarea className="min-h-24 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" value={artistProfileDraft.coverStatementZh} onChange={(event) => updateArtistProfileDraft({ coverStatementZh: event.target.value })} />
                      </label>
                      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2">
                        <span className="eyebrow text-[10px]">Artist Profile paragraph 1 (EN)</span>
                        <textarea className="min-h-28 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" value={artistProfileDraft.aboutParagraph1} onChange={(event) => updateArtistProfileDraft({ aboutParagraph1: event.target.value })} />
                      </label>
                      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2">
                        <span className="eyebrow text-[10px]">Artist Profile paragraph 1 (ZH)</span>
                        <textarea className="min-h-28 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" value={artistProfileDraft.aboutParagraph1Zh} onChange={(event) => updateArtistProfileDraft({ aboutParagraph1Zh: event.target.value })} />
                      </label>
                      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2">
                        <span className="eyebrow text-[10px]">Artist Profile paragraph 2 (EN)</span>
                        <textarea className="min-h-28 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" value={artistProfileDraft.aboutParagraph2} onChange={(event) => updateArtistProfileDraft({ aboutParagraph2: event.target.value })} />
                      </label>
                      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2">
                        <span className="eyebrow text-[10px]">Artist Profile paragraph 2 (ZH)</span>
                        <textarea className="min-h-28 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" value={artistProfileDraft.aboutParagraph2Zh} onChange={(event) => updateArtistProfileDraft({ aboutParagraph2Zh: event.target.value })} />
                      </label>
                      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2">
                        <span className="eyebrow text-[10px]">Artist Profile paragraph 3 (EN)</span>
                        <textarea className="min-h-28 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" value={artistProfileDraft.aboutParagraph3} onChange={(event) => updateArtistProfileDraft({ aboutParagraph3: event.target.value })} />
                      </label>
                      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2">
                        <span className="eyebrow text-[10px]">Artist Profile paragraph 3 (ZH)</span>
                        <textarea className="min-h-28 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" value={artistProfileDraft.aboutParagraph3Zh} onChange={(event) => updateArtistProfileDraft({ aboutParagraph3Zh: event.target.value })} />
                      </label>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-[var(--text-muted)]">
                        Saving here updates both the Hero intro and the Artist Profile section on the public homepage.
                      </p>
                      <button className="rounded-full bg-[var(--text)] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[var(--text-soft)] disabled:cursor-not-allowed disabled:opacity-60" disabled={artistProfileDraft.isSubmitting} onClick={() => void handleSaveArtistProfile()} type="button">
                        {artistProfileDraft.isSubmitting ? 'Saving...' : 'Save artist profile'}
                      </button>
                    </div>

                    {artistProfileDraft.error ? (
                      <p className="mt-4 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
                        {artistProfileDraft.error}
                      </p>
                    ) : null}
                  </article>

                  <article className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_20px_55px_rgba(68,102,136,0.09)] sm:p-6">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <p className="eyebrow">Press Highlight</p>
                        <h3 className="mt-3 text-3xl text-[var(--text)]">Homepage editorial cards</h3>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
                          The first 3 entries become the large left-side cards in Press Highlight. Everything after that becomes the smaller archive cards on the right.
                        </p>
                      </div>
                      <div className="text-sm text-[var(--text-muted)]">
                        {pressHighlights.length} item{pressHighlights.length === 1 ? '' : 's'} total
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.42)] p-4 sm:grid-cols-3">
                      {[
                        { label: 'Featured left cards', value: recentPressHighlights.length },
                        { label: 'Right archive cards', value: archivePressHighlights.length },
                        { label: 'Display rule', value: 'Top 3 featured' },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-4"
                        >
                          <p className="eyebrow text-[10px]">{stat.label}</p>
                          <p className="mt-3 text-xl text-[var(--text)]">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-5 shadow-[0_12px_28px_rgba(68,102,136,0.06)]">
                      <p className="eyebrow text-[10px]">New press highlight</p>
                      <h4 className="mt-3 text-2xl text-[var(--text)]">Add homepage press entry</h4>

                      <div className="mt-5 grid gap-4 xl:grid-cols-2">
                        <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                          <span className="eyebrow text-[10px]">Publication (EN)</span>
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={newPressHighlightDraft.source} onChange={(event) => updateNewPressHighlightDraft({ source: event.target.value })} />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                          <span className="eyebrow text-[10px]">Publication (ZH)</span>
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={newPressHighlightDraft.sourceZh} onChange={(event) => updateNewPressHighlightDraft({ sourceZh: event.target.value })} />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                          <span className="eyebrow text-[10px]">Date label (EN)</span>
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={newPressHighlightDraft.dateLabel} onChange={(event) => updateNewPressHighlightDraft({ dateLabel: event.target.value })} />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                          <span className="eyebrow text-[10px]">Date label (ZH)</span>
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={newPressHighlightDraft.dateLabelZh} onChange={(event) => updateNewPressHighlightDraft({ dateLabelZh: event.target.value })} />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                          <span className="eyebrow text-[10px]">Title (EN)</span>
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={newPressHighlightDraft.title} onChange={(event) => updateNewPressHighlightDraft({ title: event.target.value })} />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                          <span className="eyebrow text-[10px]">Title (ZH)</span>
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={newPressHighlightDraft.titleZh} onChange={(event) => updateNewPressHighlightDraft({ titleZh: event.target.value })} />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2">
                          <span className="eyebrow text-[10px]">Feature link</span>
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" placeholder="https://..." type="text" value={newPressHighlightDraft.href} onChange={(event) => updateNewPressHighlightDraft({ href: event.target.value })} />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2">
                          <span className="eyebrow text-[10px]">Image path</span>
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" placeholder="/crystal-press-example.png" type="text" value={newPressHighlightDraft.imageSrc} onChange={(event) => updateNewPressHighlightDraft({ imageSrc: event.target.value })} />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2">
                          <span className="eyebrow text-[10px]">Image click link (optional)</span>
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" placeholder="https://..." type="text" value={newPressHighlightDraft.imageHref} onChange={(event) => updateNewPressHighlightDraft({ imageHref: event.target.value })} />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                          <span className="eyebrow text-[10px]">Image alt (EN)</span>
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={newPressHighlightDraft.imageAlt} onChange={(event) => updateNewPressHighlightDraft({ imageAlt: event.target.value })} />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                          <span className="eyebrow text-[10px]">Image alt (ZH)</span>
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={newPressHighlightDraft.imageAltZh} onChange={(event) => updateNewPressHighlightDraft({ imageAltZh: event.target.value })} />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2">
                          <span className="eyebrow text-[10px]">Summary (EN)</span>
                          <textarea className="min-h-24 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" value={newPressHighlightDraft.description} onChange={(event) => updateNewPressHighlightDraft({ description: event.target.value })} />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2">
                          <span className="eyebrow text-[10px]">Summary (ZH)</span>
                          <textarea className="min-h-24 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" value={newPressHighlightDraft.descriptionZh} onChange={(event) => updateNewPressHighlightDraft({ descriptionZh: event.target.value })} />
                        </label>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-[var(--text-muted)]">
                          New entries are appended to the end. Use the move buttons below to reposition them.
                        </p>
                        <button className="rounded-full bg-[var(--text)] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[var(--text-soft)] disabled:cursor-not-allowed disabled:opacity-60" disabled={newPressHighlightDraft.isSubmitting} onClick={() => void handleCreatePressHighlight()} type="button">
                          {newPressHighlightDraft.isSubmitting ? 'Adding...' : 'Add press highlight'}
                        </button>
                      </div>

                      {newPressHighlightDraft.error ? (
                        <p className="mt-4 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
                          {newPressHighlightDraft.error}
                        </p>
                      ) : null}
                    </div>

                    {pressHighlights.length === 0 ? (
                      <div className="mt-6 rounded-[1.25rem] border border-dashed border-[var(--line)] px-5 py-6 text-sm text-[var(--text-muted)]">
                        No press highlights yet.
                      </div>
                    ) : (
                      <div className="mt-6 space-y-4">
                        {pressHighlights.map((highlight, index) => {
                          const draft = getPressHighlightDraft(highlight);
                          const isDeleting = activeEventActionKey === `press-highlight-delete-${highlight.id}`;
                          const isMoving = activeEventActionKey === `press-highlight-move-${highlight.id}`;
                          const zoneLabel =
                            index < 3
                              ? `Featured left card ${index + 1}`
                              : `Right archive card ${index - 2}`;

                          return (
                            <article key={highlight.id} className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-5 shadow-[0_12px_28px_rgba(68,102,136,0.06)]">
                              <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                  <p className="eyebrow text-[10px]">
                                    Position {index + 1} · {zoneLabel} · {formatDate(highlight.updatedAt)}
                                  </p>
                                  <h4 className="mt-3 text-2xl text-[var(--text)]">
                                    {draft.title || 'Untitled press highlight'}
                                  </h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <button className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-60" disabled={index === 0 || isMoving} onClick={() => void handleMovePressHighlight(highlight.id, -1)} type="button">{isMoving ? 'Moving...' : 'Up'}</button>
                                  <button className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-60" disabled={index === pressHighlights.length - 1 || isMoving} onClick={() => void handleMovePressHighlight(highlight.id, 1)} type="button">{isMoving ? 'Moving...' : 'Down'}</button>
                                  <button className="rounded-full bg-[var(--text)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[var(--text-soft)] disabled:cursor-not-allowed disabled:opacity-60" disabled={draft.isSubmitting} onClick={() => void handleSavePressHighlight(highlight)} type="button">{draft.isSubmitting ? 'Saving...' : 'Save'}</button>
                                  <button className="rounded-full border border-[rgba(255,107,107,0.24)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[rgba(255,107,107,0.48)] disabled:cursor-not-allowed disabled:opacity-60" disabled={isDeleting} onClick={() => void handleDeletePressHighlight(highlight)} type="button">{isDeleting ? 'Deleting...' : 'Delete'}</button>
                                </div>
                              </div>

                              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]"><span className="eyebrow text-[10px]">Publication (EN)</span><input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={draft.source} onChange={(event) => updatePressHighlightDraft(highlight.id, { source: event.target.value })} /></label>
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]"><span className="eyebrow text-[10px]">Publication (ZH)</span><input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={draft.sourceZh} onChange={(event) => updatePressHighlightDraft(highlight.id, { sourceZh: event.target.value })} /></label>
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]"><span className="eyebrow text-[10px]">Date label (EN)</span><input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={draft.dateLabel} onChange={(event) => updatePressHighlightDraft(highlight.id, { dateLabel: event.target.value })} /></label>
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]"><span className="eyebrow text-[10px]">Date label (ZH)</span><input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={draft.dateLabelZh} onChange={(event) => updatePressHighlightDraft(highlight.id, { dateLabelZh: event.target.value })} /></label>
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]"><span className="eyebrow text-[10px]">Title (EN)</span><input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={draft.title} onChange={(event) => updatePressHighlightDraft(highlight.id, { title: event.target.value })} /></label>
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]"><span className="eyebrow text-[10px]">Title (ZH)</span><input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={draft.titleZh} onChange={(event) => updatePressHighlightDraft(highlight.id, { titleZh: event.target.value })} /></label>
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2"><span className="eyebrow text-[10px]">Feature link</span><input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={draft.href} onChange={(event) => updatePressHighlightDraft(highlight.id, { href: event.target.value })} /></label>
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2"><span className="eyebrow text-[10px]">Image path</span><input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={draft.imageSrc} onChange={(event) => updatePressHighlightDraft(highlight.id, { imageSrc: event.target.value })} /></label>
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2"><span className="eyebrow text-[10px]">Image click link (optional)</span><input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={draft.imageHref} onChange={(event) => updatePressHighlightDraft(highlight.id, { imageHref: event.target.value })} /></label>
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]"><span className="eyebrow text-[10px]">Image alt (EN)</span><input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={draft.imageAlt} onChange={(event) => updatePressHighlightDraft(highlight.id, { imageAlt: event.target.value })} /></label>
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]"><span className="eyebrow text-[10px]">Image alt (ZH)</span><input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={draft.imageAltZh} onChange={(event) => updatePressHighlightDraft(highlight.id, { imageAltZh: event.target.value })} /></label>
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2"><span className="eyebrow text-[10px]">Summary (EN)</span><textarea className="min-h-24 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" value={draft.description} onChange={(event) => updatePressHighlightDraft(highlight.id, { description: event.target.value })} /></label>
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2"><span className="eyebrow text-[10px]">Summary (ZH)</span><textarea className="min-h-24 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" value={draft.descriptionZh} onChange={(event) => updatePressHighlightDraft(highlight.id, { descriptionZh: event.target.value })} /></label>
                              </div>

                              {draft.error ? (
                                <p className="mt-4 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
                                  {draft.error}
                                </p>
                              ) : null}
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </article>

                  <article className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_20px_55px_rgba(68,102,136,0.09)] sm:p-6">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <p className="eyebrow">Archive Timeline</p>
                        <h3 className="mt-3 text-3xl text-[var(--text)]">Timeline and latest achievement</h3>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
                          Manage the chronological archive entries shown in the distinctions section. You can also choose which entry powers the Latest Achievement banner.
                        </p>
                      </div>
                      <div className="text-sm text-[var(--text-muted)]">
                        {achievements.length} item{achievements.length === 1 ? '' : 's'}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.42)] p-4 sm:grid-cols-3">
                      {[
                        { label: 'Latest Achievement', value: latestAchievementEntry?.year ?? 'Not set' },
                        { label: 'Highlighted entries', value: achievements.filter((entry) => entry.highlight).length },
                        { label: 'Timeline order', value: 'Manual' },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-4"
                        >
                          <p className="eyebrow text-[10px]">{stat.label}</p>
                          <p className="mt-3 text-xl text-[var(--text)]">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-5 shadow-[0_12px_28px_rgba(68,102,136,0.06)]">
                      <p className="eyebrow text-[10px]">New archive entry</p>
                      <h4 className="mt-3 text-2xl text-[var(--text)]">Add timeline milestone</h4>

                      <div className="mt-5 grid gap-4 xl:grid-cols-2">
                        <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                          <span className="eyebrow text-[10px]">Year</span>
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={newAchievementDraft.year} onChange={(event) => updateNewAchievementDraft({ year: event.target.value })} />
                        </label>
                        <div className="flex items-end gap-6 rounded-[1.1rem] border border-[var(--line)] bg-white px-4 py-4">
                          <label className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                            <input checked={newAchievementDraft.highlight} onChange={(event) => updateNewAchievementDraft({ highlight: event.target.checked })} type="checkbox" />
                            <span>Highlight</span>
                          </label>
                          <label className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                            <input checked={newAchievementDraft.latest} onChange={(event) => updateNewAchievementDraft({ latest: event.target.checked })} type="checkbox" />
                            <span>Latest achievement</span>
                          </label>
                        </div>
                        <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                          <span className="eyebrow text-[10px]">Title (EN)</span>
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={newAchievementDraft.title} onChange={(event) => updateNewAchievementDraft({ title: event.target.value })} />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                          <span className="eyebrow text-[10px]">Title (ZH)</span>
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={newAchievementDraft.titleZh} onChange={(event) => updateNewAchievementDraft({ titleZh: event.target.value })} />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2">
                          <span className="eyebrow text-[10px]">Description (EN)</span>
                          <textarea className="min-h-24 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" value={newAchievementDraft.description} onChange={(event) => updateNewAchievementDraft({ description: event.target.value })} />
                        </label>
                        <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2">
                          <span className="eyebrow text-[10px]">Description (ZH)</span>
                          <textarea className="min-h-24 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" value={newAchievementDraft.descriptionZh} onChange={(event) => updateNewAchievementDraft({ descriptionZh: event.target.value })} />
                        </label>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-[var(--text-muted)]">
                          New entries are added to the bottom of the timeline. Move them afterward if needed.
                        </p>
                        <button className="rounded-full bg-[var(--text)] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[var(--text-soft)] disabled:cursor-not-allowed disabled:opacity-60" disabled={newAchievementDraft.isSubmitting} onClick={() => void handleCreateAchievement()} type="button">
                          {newAchievementDraft.isSubmitting ? 'Adding...' : 'Add timeline entry'}
                        </button>
                      </div>

                      {newAchievementDraft.error ? (
                        <p className="mt-4 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
                          {newAchievementDraft.error}
                        </p>
                      ) : null}
                    </div>

                    {achievements.length === 0 ? (
                      <div className="mt-6 rounded-[1.25rem] border border-dashed border-[var(--line)] px-5 py-6 text-sm text-[var(--text-muted)]">
                        No archive timeline entries yet.
                      </div>
                    ) : (
                      <div className="mt-6 space-y-4">
                        {achievements.map((achievement, index) => {
                          const draft = getAchievementDraft(achievement);
                          const isDeleting = activeEventActionKey === `achievement-delete-${achievement.id}`;
                          const isMoving = activeEventActionKey === `achievement-move-${achievement.id}`;

                          return (
                            <article key={achievement.id} className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-5 shadow-[0_12px_28px_rgba(68,102,136,0.06)]">
                              <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                  <p className="eyebrow text-[10px]">
                                    Position {index + 1} · {draft.latest ? 'Latest achievement' : draft.highlight ? 'Highlighted entry' : 'Timeline entry'} · {formatDate(achievement.updatedAt)}
                                  </p>
                                  <h4 className="mt-3 text-2xl text-[var(--text)]">
                                    {draft.title || 'Untitled achievement'}
                                  </h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <button className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-60" disabled={index === 0 || isMoving} onClick={() => void handleMoveAchievement(achievement.id, -1)} type="button">{isMoving ? 'Moving...' : 'Up'}</button>
                                  <button className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-60" disabled={index === achievements.length - 1 || isMoving} onClick={() => void handleMoveAchievement(achievement.id, 1)} type="button">{isMoving ? 'Moving...' : 'Down'}</button>
                                  <button className="rounded-full bg-[var(--text)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[var(--text-soft)] disabled:cursor-not-allowed disabled:opacity-60" disabled={draft.isSubmitting} onClick={() => void handleSaveAchievement(achievement)} type="button">{draft.isSubmitting ? 'Saving...' : 'Save'}</button>
                                  <button className="rounded-full border border-[rgba(255,107,107,0.24)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[rgba(255,107,107,0.48)] disabled:cursor-not-allowed disabled:opacity-60" disabled={isDeleting} onClick={() => void handleDeleteAchievement(achievement)} type="button">{isDeleting ? 'Deleting...' : 'Delete'}</button>
                                </div>
                              </div>

                              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]"><span className="eyebrow text-[10px]">Year</span><input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={draft.year} onChange={(event) => updateAchievementDraft(achievement.id, { year: event.target.value })} /></label>
                                <div className="flex items-end gap-6 rounded-[1.1rem] border border-[var(--line)] bg-white px-4 py-4">
                                  <label className="flex items-center gap-3 text-sm text-[var(--text-muted)]"><input checked={draft.highlight} onChange={(event) => updateAchievementDraft(achievement.id, { highlight: event.target.checked })} type="checkbox" /><span>Highlight</span></label>
                                  <label className="flex items-center gap-3 text-sm text-[var(--text-muted)]"><input checked={draft.latest} onChange={(event) => updateAchievementDraft(achievement.id, { latest: event.target.checked })} type="checkbox" /><span>Latest achievement</span></label>
                                </div>
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]"><span className="eyebrow text-[10px]">Title (EN)</span><input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={draft.title} onChange={(event) => updateAchievementDraft(achievement.id, { title: event.target.value })} /></label>
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]"><span className="eyebrow text-[10px]">Title (ZH)</span><input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={draft.titleZh} onChange={(event) => updateAchievementDraft(achievement.id, { titleZh: event.target.value })} /></label>
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2"><span className="eyebrow text-[10px]">Description (EN)</span><textarea className="min-h-24 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" value={draft.description} onChange={(event) => updateAchievementDraft(achievement.id, { description: event.target.value })} /></label>
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2"><span className="eyebrow text-[10px]">Description (ZH)</span><textarea className="min-h-24 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" value={draft.descriptionZh} onChange={(event) => updateAchievementDraft(achievement.id, { descriptionZh: event.target.value })} /></label>
                              </div>

                              {draft.error ? (
                                <p className="mt-4 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
                                  {draft.error}
                                </p>
                              ) : null}
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </article>

                  {(['featured', 'supporting'] as const).map((placement) => {
                    const placementReels = featuredReelsByPlacement[placement];
                    const newDraft = newFeaturedReelDrafts[placement];

                    return (
                      <article
                        key={placement}
                        className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_20px_55px_rgba(68,102,136,0.09)] sm:p-6"
                      >
                        <div className="flex flex-wrap items-end justify-between gap-4">
                          <div>
                            <p className="eyebrow">{placement === 'featured' ? 'Featured column' : 'Supporting column'}</p>
                            <h3 className="mt-3 text-3xl text-[var(--text)]">
                              {placement === 'featured' ? 'Large reel cards' : 'Small reel cards'}
                            </h3>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
                              {placement === 'featured'
                                ? 'These entries appear as the large primary reels on the left side of the media section.'
                                : 'These entries appear as the stacked supporting reels on the right side of the media section.'}
                            </p>
                          </div>
                          <p className="text-sm text-[var(--text-muted)]">
                            {placementReels.length} item{placementReels.length === 1 ? '' : 's'}
                          </p>
                        </div>

                        <div className="mt-6 rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-5 shadow-[0_12px_28px_rgba(68,102,136,0.06)]">
                          <p className="eyebrow text-[10px]">New reel</p>
                          <h4 className="mt-3 text-2xl text-[var(--text)]">Add homepage reel</h4>

                          <div className="mt-5 grid gap-4 xl:grid-cols-2">
                            <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                              <span className="eyebrow text-[10px]">Meta label (EN)</span>
                              <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={newDraft.metaLabel} onChange={(event) => updateNewFeaturedReelDraft(placement, { metaLabel: event.target.value })} />
                            </label>
                            <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                              <span className="eyebrow text-[10px]">Meta label (ZH)</span>
                              <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={newDraft.metaLabelZh} onChange={(event) => updateNewFeaturedReelDraft(placement, { metaLabelZh: event.target.value })} />
                            </label>
                            <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                              <span className="eyebrow text-[10px]">Title (EN)</span>
                              <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={newDraft.title} onChange={(event) => updateNewFeaturedReelDraft(placement, { title: event.target.value })} />
                            </label>
                            <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                              <span className="eyebrow text-[10px]">Title (ZH)</span>
                              <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={newDraft.titleZh} onChange={(event) => updateNewFeaturedReelDraft(placement, { titleZh: event.target.value })} />
                            </label>
                            <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                              <span className="eyebrow text-[10px]">YouTube id</span>
                              <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" placeholder="ZINiS_mTgd0" type="text" value={newDraft.youtubeId} onChange={(event) => updateNewFeaturedReelDraft(placement, { youtubeId: event.target.value })} />
                            </label>
                            <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                              <span className="eyebrow text-[10px]">Local video path (optional)</span>
                              <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" placeholder="/crystal-prix-de-lausanne.mp4" type="text" value={newDraft.videoSrc} onChange={(event) => updateNewFeaturedReelDraft(placement, { videoSrc: event.target.value })} />
                            </label>
                            <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2">
                              <span className="eyebrow text-[10px]">Thumbnail path</span>
                              <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" placeholder="/crystal-press-moscow-gala-2.png" type="text" value={newDraft.thumbnail} onChange={(event) => updateNewFeaturedReelDraft(placement, { thumbnail: event.target.value })} />
                            </label>
                            <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2">
                              <span className="eyebrow text-[10px]">Description (EN)</span>
                              <textarea className="min-h-24 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" value={newDraft.description} onChange={(event) => updateNewFeaturedReelDraft(placement, { description: event.target.value })} />
                            </label>
                            <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2">
                              <span className="eyebrow text-[10px]">Description (ZH)</span>
                              <textarea className="min-h-24 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" value={newDraft.descriptionZh} onChange={(event) => updateNewFeaturedReelDraft(placement, { descriptionZh: event.target.value })} />
                            </label>
                          </div>

                          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-[var(--text-muted)]">
                              New reels are appended to the end of this column.
                            </p>
                            <button className="rounded-full bg-[var(--text)] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[var(--text-soft)] disabled:cursor-not-allowed disabled:opacity-60" disabled={newDraft.isSubmitting} onClick={() => void handleCreateFeaturedReel(placement)} type="button">
                              {newDraft.isSubmitting ? 'Adding...' : 'Add reel'}
                            </button>
                          </div>

                          {newDraft.error ? (
                            <p className="mt-4 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
                              {newDraft.error}
                            </p>
                          ) : null}
                        </div>

                        {placementReels.length === 0 ? (
                          <div className="mt-6 rounded-[1.25rem] border border-dashed border-[var(--line)] px-5 py-6 text-sm text-[var(--text-muted)]">
                            No reels in this column yet.
                          </div>
                        ) : (
                          <div className="mt-6 space-y-4">
                            {placementReels.map((reel, index) => {
                              const draft = getFeaturedReelDraft(reel);
                              const isDeleting = activeEventActionKey === `featured-reel-delete-${reel.id}`;
                              const isMoving = activeEventActionKey === `featured-reel-move-${reel.id}`;

                              return (
                                <article key={reel.id} className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-5 shadow-[0_12px_28px_rgba(68,102,136,0.06)]">
                                  <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                      <p className="eyebrow text-[10px]">Position {index + 1} · {formatDate(reel.updatedAt)}</p>
                                      <h4 className="mt-3 text-2xl text-[var(--text)]">{draft.title || 'Untitled reel'}</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      <button className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-60" disabled={index === 0 || isMoving} onClick={() => void handleMoveFeaturedReel(placement, reel.id, -1)} type="button">{isMoving ? 'Moving...' : 'Up'}</button>
                                      <button className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-60" disabled={index === placementReels.length - 1 || isMoving} onClick={() => void handleMoveFeaturedReel(placement, reel.id, 1)} type="button">{isMoving ? 'Moving...' : 'Down'}</button>
                                      <button className="rounded-full bg-[var(--text)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[var(--text-soft)] disabled:cursor-not-allowed disabled:opacity-60" disabled={draft.isSubmitting} onClick={() => void handleSaveFeaturedReel(reel)} type="button">{draft.isSubmitting ? 'Saving...' : 'Save'}</button>
                                      <button className="rounded-full border border-[rgba(255,107,107,0.24)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[rgba(255,107,107,0.48)] disabled:cursor-not-allowed disabled:opacity-60" disabled={isDeleting} onClick={() => void handleDeleteFeaturedReel(reel)} type="button">{isDeleting ? 'Deleting...' : 'Delete'}</button>
                                    </div>
                                  </div>

                                  <div className="mt-5 grid gap-4 xl:grid-cols-2">
                                    <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]"><span className="eyebrow text-[10px]">Meta label (EN)</span><input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={draft.metaLabel} onChange={(event) => updateFeaturedReelDraft(reel.id, { metaLabel: event.target.value })} /></label>
                                    <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]"><span className="eyebrow text-[10px]">Meta label (ZH)</span><input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={draft.metaLabelZh} onChange={(event) => updateFeaturedReelDraft(reel.id, { metaLabelZh: event.target.value })} /></label>
                                    <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]"><span className="eyebrow text-[10px]">Title (EN)</span><input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={draft.title} onChange={(event) => updateFeaturedReelDraft(reel.id, { title: event.target.value })} /></label>
                                    <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]"><span className="eyebrow text-[10px]">Title (ZH)</span><input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={draft.titleZh} onChange={(event) => updateFeaturedReelDraft(reel.id, { titleZh: event.target.value })} /></label>
                                    <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]"><span className="eyebrow text-[10px]">YouTube id</span><input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={draft.youtubeId} onChange={(event) => updateFeaturedReelDraft(reel.id, { youtubeId: event.target.value })} /></label>
                                    <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]"><span className="eyebrow text-[10px]">Local video path</span><input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={draft.videoSrc} onChange={(event) => updateFeaturedReelDraft(reel.id, { videoSrc: event.target.value })} /></label>
                                    <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2"><span className="eyebrow text-[10px]">Thumbnail path</span><input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" type="text" value={draft.thumbnail} onChange={(event) => updateFeaturedReelDraft(reel.id, { thumbnail: event.target.value })} /></label>
                                    <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2"><span className="eyebrow text-[10px]">Description (EN)</span><textarea className="min-h-24 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" value={draft.description} onChange={(event) => updateFeaturedReelDraft(reel.id, { description: event.target.value })} /></label>
                                    <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2"><span className="eyebrow text-[10px]">Description (ZH)</span><textarea className="min-h-24 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]" value={draft.descriptionZh} onChange={(event) => updateFeaturedReelDraft(reel.id, { descriptionZh: event.target.value })} /></label>
                                  </div>

                                  {draft.error ? (
                                    <p className="mt-4 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
                                      {draft.error}
                                    </p>
                                  ) : null}
                                </article>
                              );
                            })}
                          </div>
                        )}
                      </article>
                    );
                  })}

                  <article className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_20px_55px_rgba(68,102,136,0.09)] sm:p-6">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <p className="eyebrow">Master Class Archive</p>
                        <h3 className="mt-3 text-3xl text-[var(--text)]">Master Class and Choreographer</h3>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
                          Manage the full gallery archive section: timeline, master class cards, group choreography credits, and featured group works.
                        </p>
                      </div>
                      <div className="text-sm text-[var(--text-muted)]">
                        {masterClassTimelineEntries.length} timeline · {masterClassArchiveMoments.length} master cards · {groupArchiveEntries.length} group credits · {groupArchiveMoments.length} group cards
                      </div>
                    </div>

                    <div className="mt-6 space-y-8">
                      <div className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-5">
                        <p className="eyebrow text-[10px]">Archive Timeline</p>
                        <div className="mt-4 grid gap-4 xl:grid-cols-3">
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Date label (EN)" value={newMasterClassTimelineDraft.dateLabel} onChange={(event) => updateNewMasterClassTimelineDraft({ dateLabel: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Date label (ZH)" value={newMasterClassTimelineDraft.dateLabelZh} onChange={(event) => updateNewMasterClassTimelineDraft({ dateLabelZh: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Title (EN)" value={newMasterClassTimelineDraft.title} onChange={(event) => updateNewMasterClassTimelineDraft({ title: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Title (ZH)" value={newMasterClassTimelineDraft.titleZh} onChange={(event) => updateNewMasterClassTimelineDraft({ titleZh: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Location (EN)" value={newMasterClassTimelineDraft.location} onChange={(event) => updateNewMasterClassTimelineDraft({ location: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Location (ZH)" value={newMasterClassTimelineDraft.locationZh} onChange={(event) => updateNewMasterClassTimelineDraft({ locationZh: event.target.value })} />
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="text-sm text-[var(--text-muted)]">Add a new timeline line for the gallery archive.</p>
                          <button className="rounded-full bg-[var(--text)] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white disabled:opacity-60" disabled={newMasterClassTimelineDraft.isSubmitting} onClick={() => void handleCreateMasterClassTimelineEntry()} type="button">{newMasterClassTimelineDraft.isSubmitting ? 'Adding...' : 'Add timeline entry'}</button>
                        </div>
                        {newMasterClassTimelineDraft.error ? <p className="mt-4 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm">{newMasterClassTimelineDraft.error}</p> : null}
                        <div className="mt-6 space-y-4">
                          {masterClassTimelineEntries.map((entry, index) => {
                            const draft = getMasterClassTimelineDraft(entry);
                            const isDeleting = activeEventActionKey === `master-class-timeline-delete-${entry.id}`;
                            const isMoving = activeEventActionKey === `master-class-timeline-move-${entry.id}`;
                            return (
                              <article key={entry.id} className="rounded-[1.1rem] border border-[var(--line)] bg-white p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div><p className="eyebrow text-[10px]">Position {index + 1}</p><h4 className="mt-2 text-xl">{draft.title || 'Untitled timeline entry'}</h4></div>
                                  <div className="flex flex-wrap gap-2">
                                    <button className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em]" disabled={index === 0 || isMoving} onClick={() => void handleMoveMasterClassTimelineEntry(entry.id, -1)} type="button">Up</button>
                                    <button className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em]" disabled={index === masterClassTimelineEntries.length - 1 || isMoving} onClick={() => void handleMoveMasterClassTimelineEntry(entry.id, 1)} type="button">Down</button>
                                    <button className="rounded-full bg-[var(--text)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-white" disabled={draft.isSubmitting} onClick={() => void handleSaveMasterClassTimelineEntry(entry)} type="button">{draft.isSubmitting ? 'Saving...' : 'Save'}</button>
                                    <button className="rounded-full border border-[rgba(255,107,107,0.24)] px-4 py-2 text-xs uppercase tracking-[0.18em]" disabled={isDeleting} onClick={() => void handleDeleteMasterClassTimelineEntry(entry)} type="button">{isDeleting ? 'Deleting...' : 'Delete'}</button>
                                  </div>
                                </div>
                                <div className="mt-4 grid gap-3 xl:grid-cols-3">
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.dateLabel} onChange={(event) => updateMasterClassTimelineDraft(entry.id, { dateLabel: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.dateLabelZh} onChange={(event) => updateMasterClassTimelineDraft(entry.id, { dateLabelZh: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.title} onChange={(event) => updateMasterClassTimelineDraft(entry.id, { title: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.titleZh} onChange={(event) => updateMasterClassTimelineDraft(entry.id, { titleZh: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.location} onChange={(event) => updateMasterClassTimelineDraft(entry.id, { location: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.locationZh} onChange={(event) => updateMasterClassTimelineDraft(entry.id, { locationZh: event.target.value })} />
                                </div>
                                {draft.error ? <p className="mt-3 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm">{draft.error}</p> : null}
                              </article>
                            );
                          })}
                        </div>
                      </div>

                      <div className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-5">
                        <p className="eyebrow text-[10px]">Selected Master Class Moments</p>
                        <div className="mt-4 grid gap-4 xl:grid-cols-2">
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Title (EN)" value={newMasterClassMomentDraft.title} onChange={(event) => updateNewMasterClassMomentDraft({ title: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Title (ZH)" value={newMasterClassMomentDraft.titleZh} onChange={(event) => updateNewMasterClassMomentDraft({ titleZh: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Subtitle (EN)" value={newMasterClassMomentDraft.subtitle} onChange={(event) => updateNewMasterClassMomentDraft({ subtitle: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Subtitle (ZH)" value={newMasterClassMomentDraft.subtitleZh} onChange={(event) => updateNewMasterClassMomentDraft({ subtitleZh: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base xl:col-span-2" placeholder="Image path" value={newMasterClassMomentDraft.imageSrc} onChange={(event) => updateNewMasterClassMomentDraft({ imageSrc: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Image alt (EN)" value={newMasterClassMomentDraft.imageAlt} onChange={(event) => updateNewMasterClassMomentDraft({ imageAlt: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Image alt (ZH)" value={newMasterClassMomentDraft.imageAltZh} onChange={(event) => updateNewMasterClassMomentDraft({ imageAltZh: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base xl:col-span-2" placeholder="Video path (optional)" value={newMasterClassMomentDraft.videoSrc} onChange={(event) => updateNewMasterClassMomentDraft({ videoSrc: event.target.value })} />
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="text-sm text-[var(--text-muted)]">Manage the click-to-open cards in the master class gallery.</p>
                          <button className="rounded-full bg-[var(--text)] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white disabled:opacity-60" disabled={newMasterClassMomentDraft.isSubmitting} onClick={() => void handleCreateMasterClassMoment()} type="button">{newMasterClassMomentDraft.isSubmitting ? 'Adding...' : 'Add master card'}</button>
                        </div>
                        {newMasterClassMomentDraft.error ? <p className="mt-4 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm">{newMasterClassMomentDraft.error}</p> : null}
                        <div className="mt-6 space-y-4">
                          {masterClassArchiveMoments.map((moment, index) => {
                            const draft = getMasterClassMomentDraft(moment);
                            const isDeleting = activeEventActionKey === `master-class-moment-delete-${moment.id}`;
                            const isMoving = activeEventActionKey === `master-class-moment-move-${moment.id}`;
                            return (
                              <article key={moment.id} className="rounded-[1.1rem] border border-[var(--line)] bg-white p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div><p className="eyebrow text-[10px]">Position {index + 1}</p><h4 className="mt-2 text-xl">{draft.title || 'Untitled master card'}</h4></div>
                                  <div className="flex flex-wrap gap-2">
                                    <button className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em]" disabled={index === 0 || isMoving} onClick={() => void handleMoveMasterClassMoment(moment.id, -1)} type="button">Up</button>
                                    <button className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em]" disabled={index === masterClassArchiveMoments.length - 1 || isMoving} onClick={() => void handleMoveMasterClassMoment(moment.id, 1)} type="button">Down</button>
                                    <button className="rounded-full bg-[var(--text)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-white" disabled={draft.isSubmitting} onClick={() => void handleSaveMasterClassMoment(moment)} type="button">{draft.isSubmitting ? 'Saving...' : 'Save'}</button>
                                    <button className="rounded-full border border-[rgba(255,107,107,0.24)] px-4 py-2 text-xs uppercase tracking-[0.18em]" disabled={isDeleting} onClick={() => void handleDeleteMasterClassMoment(moment)} type="button">{isDeleting ? 'Deleting...' : 'Delete'}</button>
                                  </div>
                                </div>
                                <div className="mt-4 grid gap-3 xl:grid-cols-2">
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.title} onChange={(event) => updateMasterClassMomentDraft(moment.id, { title: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.titleZh} onChange={(event) => updateMasterClassMomentDraft(moment.id, { titleZh: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.subtitle} onChange={(event) => updateMasterClassMomentDraft(moment.id, { subtitle: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.subtitleZh} onChange={(event) => updateMasterClassMomentDraft(moment.id, { subtitleZh: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base xl:col-span-2" value={draft.imageSrc} onChange={(event) => updateMasterClassMomentDraft(moment.id, { imageSrc: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.imageAlt} onChange={(event) => updateMasterClassMomentDraft(moment.id, { imageAlt: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.imageAltZh} onChange={(event) => updateMasterClassMomentDraft(moment.id, { imageAltZh: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base xl:col-span-2" value={draft.videoSrc} onChange={(event) => updateMasterClassMomentDraft(moment.id, { videoSrc: event.target.value })} />
                                </div>
                                {draft.error ? <p className="mt-3 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm">{draft.error}</p> : null}
                              </article>
                            );
                          })}
                        </div>
                      </div>

                      <div className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-5">
                        <p className="eyebrow text-[10px]">Groups Choreography</p>
                        <div className="mt-4 grid gap-4 xl:grid-cols-3">
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Season (EN)" value={newGroupChoreographyEntryDraft.seasonLabel} onChange={(event) => updateNewGroupChoreographyEntryDraft({ seasonLabel: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Season (ZH)" value={newGroupChoreographyEntryDraft.seasonLabelZh} onChange={(event) => updateNewGroupChoreographyEntryDraft({ seasonLabelZh: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Organization (EN)" value={newGroupChoreographyEntryDraft.organization} onChange={(event) => updateNewGroupChoreographyEntryDraft({ organization: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Organization (ZH)" value={newGroupChoreographyEntryDraft.organizationZh} onChange={(event) => updateNewGroupChoreographyEntryDraft({ organizationZh: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Work title (EN)" value={newGroupChoreographyEntryDraft.workTitle} onChange={(event) => updateNewGroupChoreographyEntryDraft({ workTitle: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Work title (ZH)" value={newGroupChoreographyEntryDraft.workTitleZh} onChange={(event) => updateNewGroupChoreographyEntryDraft({ workTitleZh: event.target.value })} />
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="text-sm text-[var(--text-muted)]">Manage the text-only group choreography credits list.</p>
                          <button className="rounded-full bg-[var(--text)] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white disabled:opacity-60" disabled={newGroupChoreographyEntryDraft.isSubmitting} onClick={() => void handleCreateGroupChoreographyEntry()} type="button">{newGroupChoreographyEntryDraft.isSubmitting ? 'Adding...' : 'Add group credit'}</button>
                        </div>
                        {newGroupChoreographyEntryDraft.error ? <p className="mt-4 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm">{newGroupChoreographyEntryDraft.error}</p> : null}
                        <div className="mt-6 space-y-4">
                          {groupArchiveEntries.map((entry, index) => {
                            const draft = getGroupChoreographyEntryDraft(entry);
                            const isDeleting = activeEventActionKey === `group-entry-delete-${entry.id}`;
                            const isMoving = activeEventActionKey === `group-entry-move-${entry.id}`;
                            return (
                              <article key={entry.id} className="rounded-[1.1rem] border border-[var(--line)] bg-white p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div><p className="eyebrow text-[10px]">Position {index + 1}</p><h4 className="mt-2 text-xl">{draft.organization || 'Untitled group credit'}</h4></div>
                                  <div className="flex flex-wrap gap-2">
                                    <button className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em]" disabled={index === 0 || isMoving} onClick={() => void handleMoveGroupChoreographyEntry(entry.id, -1)} type="button">Up</button>
                                    <button className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em]" disabled={index === groupArchiveEntries.length - 1 || isMoving} onClick={() => void handleMoveGroupChoreographyEntry(entry.id, 1)} type="button">Down</button>
                                    <button className="rounded-full bg-[var(--text)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-white" disabled={draft.isSubmitting} onClick={() => void handleSaveGroupChoreographyEntry(entry)} type="button">{draft.isSubmitting ? 'Saving...' : 'Save'}</button>
                                    <button className="rounded-full border border-[rgba(255,107,107,0.24)] px-4 py-2 text-xs uppercase tracking-[0.18em]" disabled={isDeleting} onClick={() => void handleDeleteGroupChoreographyEntry(entry)} type="button">{isDeleting ? 'Deleting...' : 'Delete'}</button>
                                  </div>
                                </div>
                                <div className="mt-4 grid gap-3 xl:grid-cols-3">
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.seasonLabel} onChange={(event) => updateGroupChoreographyEntryDraft(entry.id, { seasonLabel: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.seasonLabelZh} onChange={(event) => updateGroupChoreographyEntryDraft(entry.id, { seasonLabelZh: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.organization} onChange={(event) => updateGroupChoreographyEntryDraft(entry.id, { organization: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.organizationZh} onChange={(event) => updateGroupChoreographyEntryDraft(entry.id, { organizationZh: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.workTitle} onChange={(event) => updateGroupChoreographyEntryDraft(entry.id, { workTitle: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.workTitleZh} onChange={(event) => updateGroupChoreographyEntryDraft(entry.id, { workTitleZh: event.target.value })} />
                                </div>
                                {draft.error ? <p className="mt-3 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm">{draft.error}</p> : null}
                              </article>
                            );
                          })}
                        </div>
                      </div>

                      <div className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-5">
                        <p className="eyebrow text-[10px]">Featured Group Works</p>
                        <div className="mt-4 grid gap-4 xl:grid-cols-2">
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Title (EN)" value={newGroupChoreographyMomentDraft.title} onChange={(event) => updateNewGroupChoreographyMomentDraft({ title: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Title (ZH)" value={newGroupChoreographyMomentDraft.titleZh} onChange={(event) => updateNewGroupChoreographyMomentDraft({ titleZh: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Subtitle (EN)" value={newGroupChoreographyMomentDraft.subtitle} onChange={(event) => updateNewGroupChoreographyMomentDraft({ subtitle: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Subtitle (ZH)" value={newGroupChoreographyMomentDraft.subtitleZh} onChange={(event) => updateNewGroupChoreographyMomentDraft({ subtitleZh: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base xl:col-span-2" placeholder="Image path" value={newGroupChoreographyMomentDraft.imageSrc} onChange={(event) => updateNewGroupChoreographyMomentDraft({ imageSrc: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Image alt (EN)" value={newGroupChoreographyMomentDraft.imageAlt} onChange={(event) => updateNewGroupChoreographyMomentDraft({ imageAlt: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" placeholder="Image alt (ZH)" value={newGroupChoreographyMomentDraft.imageAltZh} onChange={(event) => updateNewGroupChoreographyMomentDraft({ imageAltZh: event.target.value })} />
                          <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base xl:col-span-2" placeholder="Video path (optional)" value={newGroupChoreographyMomentDraft.videoSrc} onChange={(event) => updateNewGroupChoreographyMomentDraft({ videoSrc: event.target.value })} />
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="text-sm text-[var(--text-muted)]">Manage the featured group work cards and their click-to-open media.</p>
                          <button className="rounded-full bg-[var(--text)] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white disabled:opacity-60" disabled={newGroupChoreographyMomentDraft.isSubmitting} onClick={() => void handleCreateGroupChoreographyMoment()} type="button">{newGroupChoreographyMomentDraft.isSubmitting ? 'Adding...' : 'Add group card'}</button>
                        </div>
                        {newGroupChoreographyMomentDraft.error ? <p className="mt-4 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm">{newGroupChoreographyMomentDraft.error}</p> : null}
                        <div className="mt-6 space-y-4">
                          {groupArchiveMoments.map((moment, index) => {
                            const draft = getGroupChoreographyMomentDraft(moment);
                            const isDeleting = activeEventActionKey === `group-moment-delete-${moment.id}`;
                            const isMoving = activeEventActionKey === `group-moment-move-${moment.id}`;
                            return (
                              <article key={moment.id} className="rounded-[1.1rem] border border-[var(--line)] bg-white p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div><p className="eyebrow text-[10px]">Position {index + 1}</p><h4 className="mt-2 text-xl">{draft.title || 'Untitled group card'}</h4></div>
                                  <div className="flex flex-wrap gap-2">
                                    <button className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em]" disabled={index === 0 || isMoving} onClick={() => void handleMoveGroupChoreographyMoment(moment.id, -1)} type="button">Up</button>
                                    <button className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em]" disabled={index === groupArchiveMoments.length - 1 || isMoving} onClick={() => void handleMoveGroupChoreographyMoment(moment.id, 1)} type="button">Down</button>
                                    <button className="rounded-full bg-[var(--text)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-white" disabled={draft.isSubmitting} onClick={() => void handleSaveGroupChoreographyMoment(moment)} type="button">{draft.isSubmitting ? 'Saving...' : 'Save'}</button>
                                    <button className="rounded-full border border-[rgba(255,107,107,0.24)] px-4 py-2 text-xs uppercase tracking-[0.18em]" disabled={isDeleting} onClick={() => void handleDeleteGroupChoreographyMoment(moment)} type="button">{isDeleting ? 'Deleting...' : 'Delete'}</button>
                                  </div>
                                </div>
                                <div className="mt-4 grid gap-3 xl:grid-cols-2">
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.title} onChange={(event) => updateGroupChoreographyMomentDraft(moment.id, { title: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.titleZh} onChange={(event) => updateGroupChoreographyMomentDraft(moment.id, { titleZh: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.subtitle} onChange={(event) => updateGroupChoreographyMomentDraft(moment.id, { subtitle: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.subtitleZh} onChange={(event) => updateGroupChoreographyMomentDraft(moment.id, { subtitleZh: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base xl:col-span-2" value={draft.imageSrc} onChange={(event) => updateGroupChoreographyMomentDraft(moment.id, { imageSrc: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.imageAlt} onChange={(event) => updateGroupChoreographyMomentDraft(moment.id, { imageAlt: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base" value={draft.imageAltZh} onChange={(event) => updateGroupChoreographyMomentDraft(moment.id, { imageAltZh: event.target.value })} />
                                  <input className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base xl:col-span-2" value={draft.videoSrc} onChange={(event) => updateGroupChoreographyMomentDraft(moment.id, { videoSrc: event.target.value })} />
                                </div>
                                {draft.error ? <p className="mt-3 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm">{draft.error}</p> : null}
                              </article>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </section>
              ) : null}

              {activeTab === 'content' ? (
                <section aria-labelledby="hero-entry-points-heading">
                  <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_20px_55px_rgba(68,102,136,0.09)]">
                    <p className="eyebrow">Homepage navigation</p>
                    <h2 id="hero-entry-points-heading" className="mt-3 text-4xl text-[var(--text)]">Hero entry cards</h2>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-4"><p className="text-sm leading-6 text-[var(--text-muted)]">Edit the homepage cards, choose whether each one is visible, and use arrows to set the display order.</p><button type="button" className="rounded-full bg-[var(--text)] px-4 py-2 text-xs uppercase tracking-[0.16em] text-white" onClick={() => void createAdminHeroEntryPoint().then((response) => setHeroEntryPoints((current) => [...current, response.entryPoint])).catch((err) => setError(err.message))}>Add card</button></div>
                    <div className="mt-6 space-y-4">
                      {heroEntryPoints.map((entry, index) => (
                        <article key={entry.id} className="rounded-[1.25rem] border border-[var(--line)] bg-white p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3"><p className="eyebrow text-[10px]">Position {index + 1}</p><div className="flex gap-2"><button type="button" disabled={index === 0} className="rounded-full border border-[var(--line)] px-3 py-2 text-xs disabled:opacity-50" onClick={() => void reorderAdminHeroEntryPoints(heroEntryPoints.map((item) => item.id).map((id, position, ids) => position === index ? ids[index - 1] : position === index - 1 ? ids[index] : id)).then((response) => setHeroEntryPoints(response.entryPoints)).catch((err) => setError(err.message))}>Up</button><button type="button" disabled={index === heroEntryPoints.length - 1} className="rounded-full border border-[var(--line)] px-3 py-2 text-xs disabled:opacity-50" onClick={() => void reorderAdminHeroEntryPoints(heroEntryPoints.map((item) => item.id).map((id, position, ids) => position === index ? ids[index + 1] : position === index + 1 ? ids[index] : id)).then((response) => setHeroEntryPoints(response.entryPoints)).catch((err) => setError(err.message))}>Down</button><button type="button" className="rounded-full bg-[var(--text)] px-4 py-2 text-xs uppercase tracking-[0.16em] text-white" onClick={() => void updateAdminHeroEntryPoint(entry.id, { title: entry.title, titleZh: entry.titleZh, description: entry.description, descriptionZh: entry.descriptionZh, href: entry.href, isVisible: entry.isVisible, createdAt: entry.createdAt, updatedAt: entry.updatedAt }).then((response) => setHeroEntryPoints((current) => current.map((item) => item.id === entry.id ? response.entryPoint : item))).catch((err) => setError(err.message))}>Save</button><button type="button" className="rounded-full border border-[rgba(255,107,107,0.24)] px-3 py-2 text-xs" onClick={() => void (window.confirm(`Delete ${entry.title}?`) && deleteAdminHeroEntryPoint(entry.id).then(() => setHeroEntryPoints((current) => current.filter((item) => item.id !== entry.id))).catch((err) => setError(err.message)))}>Delete</button></div></div>
                          <div className="mt-4 grid gap-3 xl:grid-cols-2">
                            {(['title', 'titleZh', 'description', 'descriptionZh', 'href'] as const).map((field) => <input key={field} className="rounded-2xl border border-[var(--line)] px-4 py-3 text-sm" value={entry[field]} onChange={(event) => setHeroEntryPoints((current) => current.map((item) => item.id === entry.id ? { ...item, [field]: event.target.value } : item))} placeholder={field} />)}
                            <label className="flex items-center gap-3 text-sm text-[var(--text-muted)]"><input type="checkbox" checked={entry.isVisible} onChange={(event) => setHeroEntryPoints((current) => current.map((item) => item.id === entry.id ? { ...item, isVisible: event.target.checked } : item))} />Visible on homepage</label>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              ) : null}

              {activeTab === 'dancer' ? (
              <>
              <section aria-labelledby="admin-users-heading">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow">Admin</p>
                    <h2
                      id="admin-users-heading"
                      className="mt-3 text-4xl text-[var(--text)]"
                    >
                      Administrator
                    </h2>
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">
                    {adminUsers.length} account{adminUsers.length === 1 ? '' : 's'}
                  </p>
                </div>

                {adminUsers.length === 0 ? (
                  <div className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-6 py-10 text-center">
                    <p className="text-sm text-[var(--text-muted)]">No administrator accounts yet.</p>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-5 lg:grid-cols-2">
                    {adminUsers.map((user) => {
                      const isDeleting = activeDeleteKey === `user-${user.id}`;
                      return (
                        <article
                          key={user.id}
                          className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_20px_55px_rgba(68,102,136,0.09)]"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <p className="eyebrow text-[10px]">
                                {user.role === 'admin' ? 'Administrator' : 'Registered user'}
                              </p>
                              <h3 className="mt-3 text-3xl text-[var(--text)]">{user.email}</h3>
                            </div>
                            <button
                              className="rounded-full border border-[rgba(255,107,107,0.24)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[rgba(255,107,107,0.48)] disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={isDeleting}
                              onClick={() => void handleDeleteUser(user)}
                              type="button"
                            >
                              {isDeleting ? 'Deleting...' : 'Delete user'}
                            </button>
                          </div>
                          <div className="mt-5 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            <span>Role: {user.role}</span>
                            <span>Uploads: {user.uploadCount}</span>
                            <span>Joined: {formatDate(user.createdAt)}</span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              <section aria-labelledby="admin-dancers-heading">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow">Dancer</p>
                    <h2
                      id="admin-dancers-heading"
                      className="mt-3 text-4xl text-[var(--text)]"
                    >
                      Registered dancers
                    </h2>
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">
                    {dancerUsers.length} account{dancerUsers.length === 1 ? '' : 's'}
                  </p>
                </div>

                {dancerUsers.length === 0 ? (
                  <div className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-6 py-10 text-center">
                    <p className="text-sm text-[var(--text-muted)]">No registered dancers yet.</p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-6">
                    {dancerUsers.map((user) => {
                      const userVideos = videosByUser.get(user.id) ?? [];
                      const isDeleting = activeDeleteKey === `user-${user.id}`;
                      const draft = getDraft(user.id);
                      const isAssigningYoutube = draft.mode === 'youtube';

                      return (
                        <article
                          key={user.id}
                          className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_20px_55px_rgba(68,102,136,0.09)] sm:p-6"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <p className="eyebrow text-[10px]">
                                Registered user
                              </p>
                              <h3 className="mt-3 text-3xl text-[var(--text)]">{user.email}</h3>
                            </div>
                            <button
                              className="rounded-full border border-[rgba(255,107,107,0.24)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[rgba(255,107,107,0.48)] disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={isDeleting}
                              onClick={() => void handleDeleteUser(user)}
                              type="button"
                            >
                              {isDeleting ? 'Deleting...' : 'Delete user'}
                            </button>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            <span>Role: {user.role}</span>
                            <span>Uploads: {user.uploadCount}</span>
                            <span>Joined: {formatDate(user.createdAt)}</span>
                          </div>

                          <div className="mt-6 rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-5 shadow-[0_12px_28px_rgba(68,102,136,0.06)]">
                            <div className="flex flex-wrap items-end justify-between gap-4">
                              <div>
                                <p className="eyebrow text-[10px]">Admin upload</p>
                                <h4 className="mt-3 text-2xl text-[var(--text)]">
                                  Assign private archive media
                                </h4>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                                  Upload a YouTube link or compressed video directly into this dancer&apos;s private archive. The dancer will see it the next time they sign in.
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {(['youtube', 'upload'] as const).map((mode) => {
                                  const isActive = draft.mode === mode;
                                  return (
                                    <button
                                      key={mode}
                                      className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition ${
                                        isActive
                                          ? 'border-[var(--text)] bg-[var(--text)] text-white'
                                          : 'border-[var(--line)] text-[var(--text)] hover:border-[var(--text)]'
                                      }`}
                                      onClick={() =>
                                        updateDraft(user.id, {
                                          mode,
                                          error: null,
                                        })
                                      }
                                      type="button"
                                    >
                                      {mode === 'youtube' ? 'YouTube link' : 'Upload file'}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                              <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                                <span className="eyebrow text-[10px]">Video title</span>
                                <input
                                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
                                  onChange={(event) =>
                                    updateDraft(user.id, {
                                      title: event.target.value,
                                    })
                                  }
                                  placeholder="Enter a private archive title"
                                  type="text"
                                  value={draft.title}
                                />
                              </label>

                              {isAssigningYoutube ? (
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                                  <span className="eyebrow text-[10px]">YouTube URL</span>
                                  <input
                                    className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
                                    onChange={(event) =>
                                      updateDraft(user.id, {
                                        youtubeUrl: event.target.value,
                                      })
                                    }
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    type="url"
                                    value={draft.youtubeUrl}
                                  />
                                </label>
                              ) : (
                                <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                                  <span className="eyebrow text-[10px]">Video file</span>
                                  <input
                                    key={draft.resetKey}
                                    accept=".mp4,.mov,.avi,video/mp4,video/quicktime,video/x-msvideo,video/avi"
                                    className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--text)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--text)] file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.18em] file:text-white"
                                    onChange={(event) =>
                                      updateDraft(user.id, {
                                        file: event.target.files?.[0] ?? null,
                                      })
                                    }
                                    type="file"
                                  />
                                </label>
                              )}

                              <div className="flex items-end">
                                <button
                                  className="rounded-full bg-[var(--text)] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[var(--text-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                                  disabled={draft.isSubmitting}
                                  onClick={() =>
                                    void (
                                      isAssigningYoutube
                                        ? handleSubmitAssignedYoutube(user)
                                        : handleSubmitAssignedUpload(user)
                                    )
                                  }
                                  type="button"
                                >
                                  {draft.isSubmitting
                                    ? isAssigningYoutube
                                      ? 'Saving...'
                                      : 'Uploading...'
                                    : isAssigningYoutube
                                      ? 'Save link'
                                      : 'Upload video'}
                                </button>
                              </div>
                            </div>

                            {draft.error ? (
                              <p className="mt-4 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
                                {draft.error}
                              </p>
                            ) : null}
                          </div>

                          <div className="mt-6 border-t border-[var(--line)] pt-6">
                            <div className="flex items-end justify-between gap-4">
                              <div>
                                <p className="eyebrow text-[10px]">Uploaded videos</p>
                                <h4 className="mt-3 text-2xl text-[var(--text)]">Private archive</h4>
                              </div>
                              <p className="text-sm text-[var(--text-muted)]">
                                {userVideos.length} item{userVideos.length === 1 ? '' : 's'}
                              </p>
                            </div>
                          </div>

                          {userVideos.length === 0 ? (
                            <div className="mt-5 rounded-[1.25rem] border border-dashed border-[var(--line)] px-5 py-6 text-sm text-[var(--text-muted)]">
                              No uploaded videos for this dancer yet.
                            </div>
                          ) : (
                            <div className="mt-5 grid gap-5 xl:grid-cols-2">
                              {userVideos.map((video) => renderVideoCard(video, true))}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
              </>
              ) : null}

              {activeTab === 'inquiries' ? (
                <section aria-labelledby="contact-inquiries-heading">
                  <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_20px_55px_rgba(68,102,136,0.09)] sm:p-8">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <p className="eyebrow">Website Contact</p>
                        <h2 id="contact-inquiries-heading" className="mt-3 text-4xl text-[var(--text)]">
                          Professional inquiries
                        </h2>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
                          Messages submitted through the public contact form. Mark completed conversations as resolved, or delete messages when they are no longer needed.
                        </p>
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">
                        {contactInquiries.filter((inquiry) => inquiry.status === 'new').length} new · {contactInquiries.length} total
                      </p>
                    </div>

                    {contactInquiries.length === 0 ? (
                      <div className="mt-6 rounded-[1.25rem] border border-dashed border-[var(--line)] px-5 py-8 text-center text-sm text-[var(--text-muted)]">
                        No website inquiries yet.
                      </div>
                    ) : (
                      <div className="mt-6 space-y-4">
                        {contactInquiries.map((inquiry) => {
                          const isWorking = activeEventActionKey?.startsWith(`inquiry-${inquiry.id}`);

                          return (
                            <article key={inquiry.id} className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-5 shadow-[0_12px_28px_rgba(68,102,136,0.06)]">
                              <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                  <p className="eyebrow text-[10px]">{inquiry.status === 'new' ? 'New inquiry' : 'Resolved'} · {formatDate(inquiry.createdAt)}</p>
                                  <h3 className="mt-3 text-2xl text-[var(--text)]">{inquiry.name}</h3>
                                  <a className="mt-2 inline-block text-sm text-[var(--text-muted)] underline" href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <button className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] disabled:opacity-60" disabled={isWorking} onClick={() => void (async () => { setActiveEventActionKey(`inquiry-${inquiry.id}-status`); try { const response = await updateAdminContactInquiryStatus(inquiry.id, inquiry.status === 'new' ? 'resolved' : 'new'); setContactInquiries((current) => current.map((entry) => entry.id === inquiry.id ? response.inquiry : entry)); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to update inquiry.'); } finally { setActiveEventActionKey(null); } })()} type="button">{inquiry.status === 'new' ? 'Mark resolved' : 'Reopen'}</button>
                                  <button className="rounded-full border border-[rgba(255,107,107,0.24)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] disabled:opacity-60" disabled={isWorking} onClick={() => void (async () => { if (!window.confirm(`Delete inquiry from ${inquiry.name}?`)) return; setActiveEventActionKey(`inquiry-${inquiry.id}-delete`); try { await deleteAdminContactInquiry(inquiry.id); setContactInquiries((current) => current.filter((entry) => entry.id !== inquiry.id)); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to delete inquiry.'); } finally { setActiveEventActionKey(null); } })()} type="button">Delete</button>
                                </div>
                              </div>
                              {inquiry.interest ? <p className="mt-4 text-sm font-medium text-[var(--text)]">{inquiry.interest}</p> : null}
                              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--text-muted)]">{inquiry.message}</p>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              ) : null}

              {activeTab === 'investor' ? (
              <section aria-labelledby="admin-investor-placeholder-heading">
                <div className="space-y-6">
                  <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_20px_55px_rgba(68,102,136,0.09)] sm:p-8">
                    <p className="eyebrow">Investor</p>
                    <h2
                      id="admin-investor-placeholder-heading"
                      className="mt-3 text-4xl text-[var(--text)]"
                    >
                      Investor tools
                    </h2>
                    <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-muted)]">
                      Manage investor-facing updates in three structured sections. Each module below supports
                      add, edit, delete, and manual sort controls so future investor pages can read from the
                      same source of truth.
                    </p>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-3">
                    {investorCategories.map((category) => (
                      <article
                        key={category.id}
                        className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_16px_40px_rgba(68,102,136,0.08)]"
                      >
                        <p className="eyebrow">Investor Module</p>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <h3 className="text-2xl text-[var(--text)]">{category.label}</h3>
                          <span className="rounded-full border border-[var(--line)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                            {investorUpdatesByCategory[category.id].length} item
                            {investorUpdatesByCategory[category.id].length === 1 ? '' : 's'}
                          </span>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">
                          {category.description}
                        </p>
                      </article>
                    ))}
                  </div>

                  <div className="space-y-6">
                    {investorCategories.map((category) => {
                      const categoryUpdates = investorUpdatesByCategory[category.id];
                      const newDraft = newInvestorUpdateDrafts[category.id];

                      return (
                        <article
                          key={category.id}
                          className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_20px_55px_rgba(68,102,136,0.09)] sm:p-6"
                        >
                          <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                              <p className="eyebrow">{category.label}</p>
                              <h3 className="mt-3 text-3xl text-[var(--text)]">{category.label}</h3>
                              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
                                {category.description}
                              </p>
                            </div>
                            <p className="text-sm text-[var(--text-muted)]">
                              {categoryUpdates.length} item{categoryUpdates.length === 1 ? '' : 's'}
                            </p>
                          </div>

                          <div className="mt-6 rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-5 shadow-[0_12px_28px_rgba(68,102,136,0.06)]">
                            <div className="flex flex-wrap items-end justify-between gap-4">
                              <div>
                                <p className="eyebrow text-[10px]">New entry</p>
                                <h4 className="mt-3 text-2xl text-[var(--text)]">Add investor update</h4>
                              </div>
                            </div>

                            <div className="mt-5 grid gap-4 xl:grid-cols-2">
                              <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                                <span className="eyebrow text-[10px]">Title</span>
                                <input
                                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
                                  onChange={(event) =>
                                    updateNewInvestorUpdateDraft(category.id, { title: event.target.value })
                                  }
                                  placeholder="Enter an investor-facing title"
                                  type="text"
                                  value={newDraft.title}
                                />
                              </label>

                              <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                                <span className="eyebrow text-[10px]">Link (optional)</span>
                                <input
                                  className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
                                  onChange={(event) =>
                                    updateNewInvestorUpdateDraft(category.id, { href: event.target.value })
                                  }
                                  placeholder="https://..."
                                  type="url"
                                  value={newDraft.href}
                                />
                              </label>

                              <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2">
                                <span className="eyebrow text-[10px]">Summary</span>
                                <textarea
                                  className="min-h-28 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
                                  onChange={(event) =>
                                    updateNewInvestorUpdateDraft(category.id, { summary: event.target.value })
                                  }
                                  placeholder="Write the investor update summary"
                                  value={newDraft.summary}
                                />
                              </label>
                            </div>

                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                              <p className="text-sm text-[var(--text-muted)]">
                                New entries are appended to the end of this module.
                              </p>
                              <button
                                className="rounded-full bg-[var(--text)] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[var(--text-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={newDraft.isSubmitting}
                                onClick={() => void handleCreateInvestorUpdate(category.id)}
                                type="button"
                              >
                                {newDraft.isSubmitting ? 'Adding...' : 'Add update'}
                              </button>
                            </div>

                            {newDraft.error ? (
                              <p className="mt-4 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
                                {newDraft.error}
                              </p>
                            ) : null}
                          </div>

                          {categoryUpdates.length === 0 ? (
                            <div className="mt-6 rounded-[1.25rem] border border-dashed border-[var(--line)] px-5 py-6 text-sm text-[var(--text-muted)]">
                              No investor updates in this module yet.
                            </div>
                          ) : (
                            <div className="mt-6 space-y-4">
                              {categoryUpdates.map((update, index) => {
                                const draft = getInvestorUpdateDraft(update);
                                const isSaving = draft.isSubmitting;
                                const isDeleting = activeEventActionKey === `investor-delete-${update.id}`;
                                const isMoving = activeEventActionKey === `investor-move-${update.id}`;

                                return (
                                  <article
                                    key={update.id}
                                    className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-5 shadow-[0_12px_28px_rgba(68,102,136,0.06)]"
                                  >
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                      <div>
                                        <p className="eyebrow text-[10px]">
                                          Position {index + 1} · {formatDate(update.updatedAt)}
                                        </p>
                                        <h4 className="mt-3 text-2xl text-[var(--text)]">{update.title}</h4>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        <button
                                          className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-60"
                                          disabled={index === 0 || isMoving}
                                          onClick={() => void handleMoveInvestorUpdate(category.id, update.id, -1)}
                                          type="button"
                                        >
                                          Up
                                        </button>
                                        <button
                                          className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-60"
                                          disabled={index === categoryUpdates.length - 1 || isMoving}
                                          onClick={() => void handleMoveInvestorUpdate(category.id, update.id, 1)}
                                          type="button"
                                        >
                                          Down
                                        </button>
                                        <button
                                          className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-60"
                                          disabled={isSaving}
                                          onClick={() => void handleSaveInvestorUpdate(update)}
                                          type="button"
                                        >
                                          {isSaving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                          className="rounded-full border border-[rgba(255,107,107,0.24)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[rgba(255,107,107,0.48)] disabled:cursor-not-allowed disabled:opacity-60"
                                          disabled={isDeleting}
                                          onClick={() => void handleDeleteInvestorUpdate(update)}
                                          type="button"
                                        >
                                          {isDeleting ? 'Deleting...' : 'Delete'}
                                        </button>
                                      </div>
                                    </div>

                                    <div className="mt-5 grid gap-4 xl:grid-cols-2">
                                      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                                        <span className="eyebrow text-[10px]">Title</span>
                                        <input
                                          className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
                                          onChange={(event) =>
                                            updateInvestorUpdateDraft(update.id, { title: event.target.value })
                                          }
                                          type="text"
                                          value={draft.title}
                                        />
                                      </label>

                                      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                                        <span className="eyebrow text-[10px]">Link (optional)</span>
                                        <input
                                          className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
                                          onChange={(event) =>
                                            updateInvestorUpdateDraft(update.id, { href: event.target.value })
                                          }
                                          type="url"
                                          value={draft.href}
                                        />
                                      </label>

                                      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)] xl:col-span-2">
                                        <span className="eyebrow text-[10px]">Summary</span>
                                        <textarea
                                          className="min-h-28 rounded-[1.5rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
                                          onChange={(event) =>
                                            updateInvestorUpdateDraft(update.id, { summary: event.target.value })
                                          }
                                          value={draft.summary}
                                        />
                                      </label>
                                    </div>

                                    {draft.error ? (
                                      <p className="mt-4 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
                                        {draft.error}
                                      </p>
                                    ) : null}
                                  </article>
                                );
                              })}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </div>
              </section>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
