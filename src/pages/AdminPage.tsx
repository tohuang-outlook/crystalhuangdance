import { useEffect, useMemo, useState } from 'react';
import AdminReportCenter from '../components/investment/AdminReportCenter';
import HoldingsTable from '../components/investment/HoldingsTable';
import PortfolioSummary from '../components/investment/PortfolioSummary';
import TransactionForm from '../components/investment/TransactionForm';
import TransactionTable from '../components/investment/TransactionTable';
import {
  createAdminInvestmentPortfolio,
  generateAdminInvestmentReports,
  createAdminInvestmentTransaction,
  deleteAdminInvestmentTransaction,
  fetchAdminInvestmentPortfolio,
  type InvestmentTransaction,
  type InvestmentPortfolioResponse,
  updateAdminInvestmentTransaction,
} from '../services/investment';
import {
  createAdminComingUpEvent,
  createAdminInvestorUpdate,
  createAdminYoutubeVideo,
  deleteAdminComingUpEvent,
  deleteAdminInvestorUpdate,
  deleteAdminUser,
  deleteAdminVideo,
  fetchAdminComingUpEvents,
  fetchAdminInvestmentReports,
  fetchAdminInvestorUpdates,
  fetchAdminUsers,
  fetchAdminVideos,
  regenerateAdminInvestmentReport,
  type AdminInvestorUpdatePayload,
  type AdminInvestmentReportRecord,
  type AdminUserRecord,
  type AdminVideoRecord,
  type ComingUpEventRecord,
  type InvestorUpdateCategory,
  type InvestorUpdateRecord,
  reorderAdminComingUpEvents,
  reorderAdminInvestorUpdates,
  updateAdminComingUpEvent,
  updateAdminInvestmentReportNotes,
  updateAdminInvestorUpdate,
  updateAdminUserMemberType,
  uploadAdminVideoFile,
} from '../services/admin';

function formatDate(value: string) {
  const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(normalizedValue));
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
type AdminConsoleTab = 'coming-up-events' | 'dancer' | 'investor';

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
  const [investorUpdates, setInvestorUpdates] = useState<InvestorUpdateRecord[]>([]);
  const [activeTab, setActiveTab] = useState<AdminConsoleTab>('coming-up-events');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDeleteKey, setActiveDeleteKey] = useState<string | null>(null);
  const [activeEventActionKey, setActiveEventActionKey] = useState<string | null>(null);
  const [activeMemberTypeUserId, setActiveMemberTypeUserId] = useState<number | null>(null);
  const [uploadDrafts, setUploadDrafts] = useState<Record<number, DancerUploadDraft>>({});
  const [comingUpEventDrafts, setComingUpEventDrafts] = useState<Record<number, ComingUpEventDraft>>({});
  const [investorUpdateDrafts, setInvestorUpdateDrafts] = useState<Record<number, InvestorUpdateDraft>>({});
  const [newComingUpEventDraft, setNewComingUpEventDraft] = useState<ComingUpEventDraft>(
    createEmptyComingUpEventDraft()
  );
  const [newInvestorUpdateDrafts, setNewInvestorUpdateDrafts] = useState<
    Record<InvestorUpdateCategory, InvestorUpdateDraft>
  >({
    'investment-page': createEmptyInvestorUpdateDraft('investment-page'),
    'monthly-reports': createEmptyInvestorUpdateDraft('monthly-reports'),
    'real-time-quote': createEmptyInvestorUpdateDraft('real-time-quote'),
  });
  const [portfolioByInvestorId, setPortfolioByInvestorId] = useState<
    Record<number, InvestmentPortfolioResponse | null | undefined>
  >({});
  const [activePortfolioAction, setActivePortfolioAction] = useState<string | null>(null);
  const [editingTransactionId, setEditingTransactionId] = useState<number | null>(null);
  const [reportGenerationMessage, setReportGenerationMessage] = useState<string | null>(null);
  const [reportCenterReports, setReportCenterReports] = useState<AdminInvestmentReportRecord[]>([]);
  const [isReportCenterLoading, setIsReportCenterLoading] = useState(true);
  const [activeReportSaveKey, setActiveReportSaveKey] = useState<string | null>(null);
  const [activeReportRegenerateKey, setActiveReportRegenerateKey] = useState<string | null>(null);

  const createReportActionKey = (report: Pick<AdminInvestmentReportRecord, 'id' | 'monthKey'>) =>
    `${report.monthKey}:${report.id}`;

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
    () => users.filter((user) => user.role !== 'admin' && user.memberType !== 'investor'),
    [users]
  );

  const investorUsers = useMemo(
    () => users.filter((user) => user.role !== 'admin' && user.memberType === 'investor'),
    [users]
  );

  const adminTabs = [
    {
      id: 'coming-up-events' as const,
      label: 'Coming Up Events',
      description: 'Homepage event list and ordering',
    },
    {
      id: 'dancer' as const,
      label: 'Dancer',
      description: 'Admin accounts and private video management',
    },
    {
      id: 'investor' as const,
      label: 'Investor',
      description: 'Investor portfolios, reports, and page updates',
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
    [investorUpdates]
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
      const [usersResponse, videosResponse, reportsResponse, comingUpEventsResponse, investorUpdatesResponse] = await Promise.all([
        fetchAdminUsers(),
        fetchAdminVideos(),
        fetchAdminInvestmentReports(),
        fetchAdminComingUpEvents(),
        fetchAdminInvestorUpdates(),
      ]);

      setUsers(usersResponse.users);
      setVideos(videosResponse.videos);
      setReportCenterReports(reportsResponse);
      setComingUpEvents(comingUpEventsResponse.events);
      setInvestorUpdates(investorUpdatesResponse.updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load admin dashboard.');
    } finally {
      setIsReportCenterLoading(false);
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
    setInvestorUpdateDrafts((current) => {
      const nextDrafts: Record<number, InvestorUpdateDraft> = {};

      investorUpdates.forEach((update) => {
        nextDrafts[update.id] = current[update.id] ?? createInvestorUpdateDraftFromRecord(update);
      });

      return nextDrafts;
    });
  }, [investorUpdates]);

  useEffect(() => {
    const loadInvestorPortfolios = async () => {
      if (investorUsers.length === 0) {
        setPortfolioByInvestorId({});
        return;
      }

      const entries = await Promise.all(
        investorUsers.map(async (user) => {
          try {
            const response = await fetchAdminInvestmentPortfolio(user.id);
            return [user.id, response] as const;
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to load portfolio.';
            if (message.toLowerCase().includes('portfolio not found')) {
              return [user.id, null] as const;
            }

            throw err;
          }
        })
      );

      setPortfolioByInvestorId(Object.fromEntries(entries));
    };

    void loadInvestorPortfolios().catch((err) => {
      setError(err instanceof Error ? err.message : 'Unable to load investor portfolios.');
    });
  }, [investorUsers]);

  const getDraft = (userId: number) => uploadDrafts[userId] ?? createDefaultDraft();

  const getComingUpEventDraft = (event: ComingUpEventRecord) =>
    comingUpEventDrafts[event.id] ?? createComingUpEventDraftFromRecord(event);

  const getInvestorUpdateDraft = (update: InvestorUpdateRecord) =>
    investorUpdateDrafts[update.id] ?? createInvestorUpdateDraftFromRecord(update);

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

  const handleGenerateLatestReports = async () => {
    setActivePortfolioAction('generate-reports');
    setError(null);
    setReportGenerationMessage(null);

    try {
      const response = await generateAdminInvestmentReports();
      await loadDashboard();
      setReportGenerationMessage(
        `Saved ${response.summary.generated + response.summary.updated} investor report${
          response.summary.generated + response.summary.updated === 1 ? '' : 's'
        } for ${response.monthKey}. Skipped ${response.summary.skipped}, failed ${response.summary.failed}.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate investor reports.');
    } finally {
      setActivePortfolioAction(null);
    }
  };

  const handleSaveReportNotes = async (
    report: AdminInvestmentReportRecord,
    notes: {
      investorNote: string | null;
      adminNote: string | null;
    }
  ) => {
    const actionKey = createReportActionKey(report);
    setActiveReportSaveKey(actionKey);
    setError(null);
    setReportGenerationMessage(null);

    try {
      const savedReport = await updateAdminInvestmentReportNotes(report.monthKey, report.id, notes);
      setReportCenterReports((current) =>
        current.map((entry) => (entry.id === savedReport.id ? savedReport : entry))
      );
      setReportGenerationMessage(
        `Saved notes for ${savedReport.investorEmail} (${savedReport.label}).`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save report notes.');
      throw err;
    } finally {
      setActiveReportSaveKey(null);
    }
  };

  const handleRegenerateReport = async (report: AdminInvestmentReportRecord) => {
    const actionKey = createReportActionKey(report);
    setActiveReportRegenerateKey(actionKey);
    setError(null);
    setReportGenerationMessage(null);

    try {
      const refreshedReport = await regenerateAdminInvestmentReport(report.monthKey, report.id);
      setReportCenterReports((current) =>
        current.map((entry) => (entry.id === refreshedReport.id ? refreshedReport : entry))
      );
      setReportGenerationMessage(
        `Regenerated ${refreshedReport.label} for ${refreshedReport.investorEmail}.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to regenerate this saved report.');
      throw err;
    } finally {
      setActiveReportRegenerateKey(null);
    }
  };

  const handleMemberTypeChange = async (
    user: AdminUserRecord,
    memberType: 'dancer' | 'investor'
  ) => {
    if (user.memberType === memberType) {
      return;
    }

    setActiveMemberTypeUserId(user.id);
    setError(null);

    try {
      const response = await updateAdminUserMemberType(user.id, { memberType });
      setUsers((current) =>
        current.map((entry) =>
          entry.id === user.id ? { ...entry, memberType: response.user.memberType } : entry
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update member type.');
    } finally {
      setActiveMemberTypeUserId(null);
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

  const loadInvestorPortfolio = async (userId: number) => {
    const response = await fetchAdminInvestmentPortfolio(userId);
    setPortfolioByInvestorId((current) => ({
      ...current,
      [userId]: response,
    }));
  };

  const handleCreateInvestorPortfolio = async (user: AdminUserRecord) => {
    setActivePortfolioAction(`create-${user.id}`);
    setError(null);

    try {
      const response = await createAdminInvestmentPortfolio(user.id, {
        displayName: `${user.email.split('@')[0]} Portfolio`,
      });

      setPortfolioByInvestorId((current) => ({
        ...current,
        [user.id]: {
          portfolio: response.portfolio,
          summary: {
            totalInvested: 0,
            portfolioValue: 0,
            unrealizedPnL: 0,
            totalReturnPercent: 0,
          },
          holdings: [],
          transactions: [],
        },
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create investor portfolio.');
    } finally {
      setActivePortfolioAction(null);
    }
  };

  const handleCreateInvestorTransaction = async (
    user: AdminUserRecord,
    payload: {
      assetSymbol: string;
      amountInvested: number;
      purchasePrice: number;
      purchaseShares: number;
      purchaseDate: string;
      notes: string | null;
    }
  ) => {
    setActivePortfolioAction(`transaction-${user.id}`);
    setError(null);

    try {
      await createAdminInvestmentTransaction(user.id, payload);
      await loadInvestorPortfolio(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create investment transaction.');
      throw err;
    } finally {
      setActivePortfolioAction(null);
    }
  };

  const handleUpdateInvestorTransaction = async (
    user: AdminUserRecord,
    transactionId: number,
    payload: {
      assetSymbol: string;
      amountInvested: number;
      purchasePrice: number;
      purchaseShares: number;
      purchaseDate: string;
      notes: string | null;
    }
  ) => {
    setActivePortfolioAction(`transaction-${transactionId}`);
    setError(null);

    try {
      await updateAdminInvestmentTransaction(transactionId, payload);
      await loadInvestorPortfolio(user.id);
      setEditingTransactionId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update investment transaction.');
      throw err;
    } finally {
      setActivePortfolioAction(null);
    }
  };

  const handleDeleteInvestorTransaction = async (
    user: AdminUserRecord,
    transaction: InvestmentTransaction
  ) => {
    if (
      !window.confirm(
        `Delete the ${transaction.assetSymbol} transaction from ${formatDate(transaction.purchaseDate)}?`
      )
    ) {
      return;
    }

    setActivePortfolioAction(`delete-transaction-${transaction.id}`);
    setError(null);

    try {
      await deleteAdminInvestmentTransaction(transaction.id);
      await loadInvestorPortfolio(user.id);

      if (editingTransactionId === transaction.id) {
        setEditingTransactionId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete investment transaction.');
    } finally {
      setActivePortfolioAction(null);
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
            <div className="grid gap-3 md:grid-cols-3">
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
                      const isUpdatingMemberType = activeMemberTypeUserId === user.id;
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
                            <span>Member type: {user.memberType}</span>
                            <span>Uploads: {user.uploadCount}</span>
                            <span>Joined: {formatDate(user.createdAt)}</span>
                          </div>

                          <label className="mt-5 block">
                            <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                              Member type
                            </span>
                            <select
                              className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white/90 px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={isUpdatingMemberType}
                              onChange={(event) =>
                                void handleMemberTypeChange(
                                  user,
                                  event.target.value as 'dancer' | 'investor'
                                )
                              }
                              value={user.memberType}
                            >
                              <option value="dancer">Dancer</option>
                              <option value="investor">Investor</option>
                            </select>
                          </label>

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

              {activeTab === 'investor' ? (
              <section aria-labelledby="admin-investors-heading">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow">Investor</p>
                    <h2 id="admin-investors-heading" className="mt-3 text-4xl text-[var(--text)]">
                      Investor Portfolios
                    </h2>
                  </div>
                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <button
                      className="rounded-full bg-[var(--text)] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[var(--text-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={investorUsers.length === 0 || activePortfolioAction === 'generate-reports'}
                      onClick={() => void handleGenerateLatestReports()}
                      type="button"
                    >
                      {activePortfolioAction === 'generate-reports'
                        ? 'Generating reports...'
                        : 'Generate latest reports'}
                    </button>
                    <p className="text-sm text-[var(--text-muted)]">
                      {investorUsers.length} account{investorUsers.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-3">
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

                {reportGenerationMessage ? (
                  <p className="mt-4 rounded-2xl border border-[rgba(74,155,127,0.24)] bg-[rgba(74,155,127,0.10)] px-4 py-3 text-sm text-[var(--text)]">
                    {reportGenerationMessage}
                  </p>
                ) : null}

                <div className="mt-6 space-y-6">
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
                          <p className="eyebrow text-[10px]">New entry</p>
                          <h4 className="mt-3 text-2xl text-[var(--text)]">Add investor update</h4>

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

                <AdminReportCenter
                  activeRegenerateKey={activeReportRegenerateKey}
                  activeSaveKey={activeReportSaveKey}
                  isLoading={isReportCenterLoading}
                  onRegenerate={handleRegenerateReport}
                  onSave={handleSaveReportNotes}
                  reports={reportCenterReports}
                />

                {investorUsers.length === 0 ? (
                  <div className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-6 py-10 text-center">
                    <p className="text-sm text-[var(--text-muted)]">No investor accounts yet.</p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-6">
                    {investorUsers.map((user) => {
                      const portfolio = portfolioByInvestorId[user.id];
                      const isCreatingPortfolio = activePortfolioAction === `create-${user.id}`;
                      const isCreatingTransaction = activePortfolioAction === `transaction-${user.id}`;
                      const safeSummary =
                        portfolio && portfolio !== null
                          ? portfolio.summary ?? {
                              totalInvested: 0,
                              portfolioValue: 0,
                              unrealizedPnL: 0,
                              totalReturnPercent: 0,
                            }
                          : null;
                      const safeHoldings =
                        portfolio && portfolio !== null && Array.isArray(portfolio.holdings)
                          ? portfolio.holdings
                          : [];
                      const safeTransactions =
                        portfolio && portfolio !== null && Array.isArray(portfolio.transactions)
                          ? portfolio.transactions
                          : [];
                      const editingTransaction =
                        portfolio && portfolio !== null
                          ? safeTransactions.find(
                              (transaction) => transaction.id === editingTransactionId
                            ) ?? null
                          : null;
                      const isUpdatingTransaction =
                        editingTransactionId != null &&
                        activePortfolioAction === `transaction-${editingTransactionId}`;
                      const activeDeleteTransactionId = activePortfolioAction?.startsWith(
                        'delete-transaction-'
                      )
                        ? Number(activePortfolioAction.replace('delete-transaction-', ''))
                        : null;

                      return (
                        <article
                          key={user.id}
                          className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_20px_55px_rgba(68,102,136,0.09)] sm:p-6"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <p className="eyebrow text-[10px]">Investor account</p>
                              <h3 className="mt-3 text-3xl text-[var(--text)]">{user.email}</h3>
                            </div>
                            {portfolio === null ? (
                              <button
                                className="rounded-full bg-[var(--text)] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[var(--text-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={isCreatingPortfolio}
                                onClick={() => void handleCreateInvestorPortfolio(user)}
                                type="button"
                              >
                                {isCreatingPortfolio ? 'Creating...' : 'Create portfolio'}
                              </button>
                            ) : null}
                          </div>

                          <div className="mt-5 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            <span>Role: {user.role}</span>
                            <span>Member type: {user.memberType}</span>
                            <span>Joined: {formatDate(user.createdAt)}</span>
                          </div>

                          {portfolio === undefined ? (
                            <div className="mt-5 rounded-[1.25rem] border border-dashed border-[var(--line)] px-5 py-6 text-sm text-[var(--text-muted)]">
                              Loading portfolio...
                            </div>
                          ) : portfolio === null ? (
                            <div className="mt-5 rounded-[1.25rem] border border-dashed border-[var(--line)] px-5 py-6 text-sm text-[var(--text-muted)]">
                              No portfolio created yet.
                            </div>
                          ) : (
                            <>
                              <div className="mt-6 rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-5 shadow-[0_12px_28px_rgba(68,102,136,0.06)]">
                                <p className="eyebrow text-[10px]">Portfolio summary</p>
                                <h4 className="mt-3 text-2xl text-[var(--text)]">
                                  {portfolio.portfolio.displayName || 'Investor Portfolio'}
                                </h4>
                                <PortfolioSummary summary={safeSummary ?? {
                                  totalInvested: 0,
                                  portfolioValue: 0,
                                  unrealizedPnL: 0,
                                  totalReturnPercent: 0,
                                }} />
                                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                                  <div>
                                    <p className="text-sm text-[var(--text-muted)]">Holdings</p>
                                    <HoldingsTable holdings={safeHoldings} />
                                  </div>
                                  <div>
                                    <p className="text-sm text-[var(--text-muted)]">Transactions</p>
                                    <TransactionTable
                                      activeDeleteId={activeDeleteTransactionId}
                                      activeEditId={editingTransactionId}
                                      onDelete={(transaction) =>
                                        void handleDeleteInvestorTransaction(user, transaction)
                                      }
                                      onEdit={(transaction) => setEditingTransactionId(transaction.id)}
                                      transactions={safeTransactions}
                                    />
                                    {editingTransaction ? (
                                      <div className="mt-5 rounded-[1.25rem] border border-[var(--line)] bg-white p-5">
                                        <p className="eyebrow text-[10px]">Edit transaction</p>
                                        <h5 className="mt-3 text-xl text-[var(--text)]">
                                          Update {editingTransaction.assetSymbol} purchase
                                        </h5>
                                        <TransactionForm
                                          initialValues={{
                                            assetSymbol: editingTransaction.assetSymbol,
                                            amountInvested: String(editingTransaction.amountInvested),
                                            purchasePrice: String(editingTransaction.purchasePrice),
                                            purchaseShares: String(editingTransaction.purchaseShares),
                                            purchaseDate: editingTransaction.purchaseDate,
                                            notes: editingTransaction.notes ?? '',
                                          }}
                                          isSubmitting={isUpdatingTransaction}
                                          onCancel={() => setEditingTransactionId(null)}
                                          onSubmit={(payload) =>
                                            handleUpdateInvestorTransaction(
                                              user,
                                              editingTransaction.id,
                                              payload
                                            )
                                          }
                                          submitLabel="Save changes"
                                        />
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-6 rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.62)] p-5 shadow-[0_12px_28px_rgba(68,102,136,0.06)]">
                                <p className="eyebrow text-[10px]">Add buy transaction</p>
                                <h4 className="mt-3 text-2xl text-[var(--text)]">Record a purchase</h4>
                                <TransactionForm
                                  isSubmitting={isCreatingTransaction}
                                  onSubmit={(payload) => handleCreateInvestorTransaction(user, payload)}
                                />
                              </div>
                            </>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
