export interface AdminUserRecord {
  id: number;
  email: string;
  role: 'user' | 'admin';
  memberType: 'dancer' | 'investor';
  uploadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminVideoRecord {
  id: number;
  userId: number;
  title: string;
  sourceType: 'youtube' | 'upload';
  sourceUrl: string | null;
  filePath: string | null;
  originalFilename: string | null;
  durationSeconds: number | null;
  fileSizeBytes: number | null;
  status: 'processing' | 'ready' | 'failed';
  createdAt: string;
  updatedAt: string;
  uploader: {
    id: number;
    email: string;
    role: 'user' | 'admin';
  };
}

export interface AdminInvestmentReportRecord {
  id: number;
  portfolioId: number;
  monthKey: string;
  label: string;
  snapshotDate: string;
  status: 'ready' | 'failed';
  generatedAt: string;
  fileName: string;
  investorNote: string | null;
  adminNote: string | null;
  investorEmail: string;
  investorUserId: number;
  portfolioDisplayName: string | null;
}

export interface ComingUpEventRecord {
  id: number;
  dateLabel: string;
  title: string;
  location: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminUsersEnvelope {
  users: AdminUserRecord[];
}

interface AdminComingUpEventsEnvelope {
  events: ComingUpEventRecord[];
}

interface AdminVideosEnvelope {
  videos: AdminVideoRecord[];
}

interface AdminVideoEnvelope {
  video: AdminVideoRecord;
}

interface AdminUserEnvelope {
  user: AdminUserRecord;
}

interface AdminInvestmentReportsEnvelope {
  reports: AdminInvestmentReportRecord[];
}

interface AdminInvestmentReportEnvelope {
  report: AdminInvestmentReportRecord;
}

interface AdminComingUpEventEnvelope {
  event: ComingUpEventRecord;
}

interface ApiErrorPayload {
  error?: string;
  message?: string;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormDataBody = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = 'Request failed';

    try {
      const errorPayload = (await response.json()) as ApiErrorPayload;
      message = errorPayload.message ?? errorPayload.error ?? message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function normalizeAdminInvestmentReports(payload: unknown): AdminInvestmentReportRecord[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') {
      return [];
    }

    const id = Number(entry.id);
    const portfolioId = Number(entry.portfolioId);
    const monthKey = typeof entry.monthKey === 'string' ? entry.monthKey.trim() : '';
    const label = typeof entry.label === 'string' ? entry.label.trim() : '';
    const snapshotDate =
      typeof entry.snapshotDate === 'string' ? entry.snapshotDate.trim() : '';
    const status = entry.status === 'failed' ? 'failed' : entry.status === 'ready' ? 'ready' : '';
    const generatedAt =
      typeof entry.generatedAt === 'string' ? entry.generatedAt.trim() : '';
    const fileName = typeof entry.fileName === 'string' ? entry.fileName.trim() : '';
    const investorEmail =
      typeof entry.investorEmail === 'string' ? entry.investorEmail.trim() : '';
    const investorUserId = Number(entry.investorUserId);
    const portfolioDisplayName =
      typeof entry.portfolioDisplayName === 'string' ? entry.portfolioDisplayName : null;
    const investorNote =
      typeof entry.investorNote === 'string' ? entry.investorNote : entry.investorNote === null ? null : null;
    const adminNote =
      typeof entry.adminNote === 'string' ? entry.adminNote : entry.adminNote === null ? null : null;

    if (
      !Number.isInteger(id) ||
      !Number.isInteger(portfolioId) ||
      !monthKey ||
      !label ||
      !snapshotDate ||
      !status ||
      !generatedAt ||
      !fileName ||
      !investorEmail ||
      !Number.isInteger(investorUserId)
    ) {
      return [];
    }

    return [
      {
        id,
        portfolioId,
        monthKey,
        label,
        snapshotDate,
        status,
        generatedAt,
        fileName,
        investorNote,
        adminNote,
        investorEmail,
        investorUserId,
        portfolioDisplayName,
      },
    ];
  });
}

export function fetchAdminUsers() {
  return request<AdminUsersEnvelope>('/api/admin/users', { method: 'GET' });
}

export function fetchAdminVideos() {
  return request<AdminVideosEnvelope>('/api/admin/videos', { method: 'GET' });
}

export function fetchAdminComingUpEvents() {
  return request<AdminComingUpEventsEnvelope>('/api/admin/coming-up-events', { method: 'GET' });
}

export function deleteAdminUser(userId: number) {
  return request<{ deletedUserId: number; deletedVideoCount: number }>(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  });
}

export function deleteAdminVideo(videoId: number) {
  return request<{ deletedVideoId: number }>(`/api/admin/videos/${videoId}`, {
    method: 'DELETE',
  });
}

export function deleteAdminComingUpEvent(eventId: number) {
  return request<{ deletedEventId: number }>(`/api/admin/coming-up-events/${eventId}`, {
    method: 'DELETE',
  });
}

export function updateAdminUserMemberType(
  userId: number,
  payload: { memberType: 'dancer' | 'investor' }
) {
  return request<AdminUserEnvelope>(`/api/admin/users/${userId}/member-type`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function createAdminYoutubeVideo(
  userId: number,
  payload: { title: string; youtubeUrl: string }
) {
  return request<AdminVideoEnvelope>(`/api/admin/users/${userId}/videos/youtube`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function uploadAdminVideoFile(userId: number, payload: { title: string; file: File }) {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('video', payload.file);

  return request<AdminVideoEnvelope>(`/api/admin/users/${userId}/videos/upload`, {
    method: 'POST',
    body: formData,
  });
}

export interface AdminComingUpEventPayload {
  dateLabel: string;
  title: string;
  location: string;
}

export function createAdminComingUpEvent(payload: AdminComingUpEventPayload) {
  return request<AdminComingUpEventEnvelope>('/api/admin/coming-up-events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminComingUpEvent(
  eventId: number,
  payload: AdminComingUpEventPayload
) {
  return request<AdminComingUpEventEnvelope>(`/api/admin/coming-up-events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function reorderAdminComingUpEvents(orderedIds: number[]) {
  return request<AdminComingUpEventsEnvelope>('/api/admin/coming-up-events/reorder', {
    method: 'POST',
    body: JSON.stringify({ orderedIds }),
  });
}

export async function fetchAdminInvestmentReports() {
  const payload = await request<AdminInvestmentReportsEnvelope>('/api/admin/investment/reports', {
    method: 'GET',
  });

  return normalizeAdminInvestmentReports(payload.reports);
}

export async function updateAdminInvestmentReportNotes(
  monthKey: string,
  reportId: number,
  payload: {
    investorNote: string | null;
    adminNote: string | null;
  }
) {
  const response = await request<AdminInvestmentReportEnvelope>(
    `/api/admin/investment/reports/${monthKey}/${reportId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );

  const [report] = normalizeAdminInvestmentReports([response.report]);

  if (!report) {
    throw new Error('Unable to parse saved report response.');
  }

  return report;
}

export async function regenerateAdminInvestmentReport(monthKey: string, reportId: number) {
  const response = await request<AdminInvestmentReportEnvelope>(
    `/api/admin/investment/reports/${monthKey}/${reportId}/regenerate`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    }
  );

  const [report] = normalizeAdminInvestmentReports([response.report]);

  if (!report) {
    throw new Error('Unable to parse regenerated report response.');
  }

  return report;
}

export function getAdminInvestmentReportDownloadUrl(monthKey: string, reportId: number) {
  return `${apiBaseUrl}/api/admin/investment/reports/${monthKey}/${reportId}/download`;
}
