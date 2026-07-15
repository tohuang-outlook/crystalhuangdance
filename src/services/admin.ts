export interface AdminUserRecord {
  id: number;
  email: string;
  role: 'user' | 'admin';
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

export interface ComingUpEventRecord {
  id: number;
  dateLabel: string;
  title: string;
  location: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type InvestorUpdateCategory =
  | 'investment-page'
  | 'monthly-reports'
  | 'real-time-quote';

export interface InvestorUpdateRecord {
  id: number;
  category: InvestorUpdateCategory;
  title: string;
  summary: string;
  href: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type FeaturedReelPlacement = 'featured' | 'supporting';

export interface FeaturedReelRecord {
  id: number;
  placement: FeaturedReelPlacement;
  youtubeId: string | null;
  videoSrc: string | null;
  metaLabel: string;
  metaLabelZh: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  thumbnail: string;
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

interface AdminInvestorUpdatesEnvelope {
  updates: InvestorUpdateRecord[];
}

interface AdminFeaturedReelsEnvelope {
  reels: FeaturedReelRecord[];
}

interface AdminVideosEnvelope {
  videos: AdminVideoRecord[];
}

interface AdminVideoEnvelope {
  video: AdminVideoRecord;
}

interface AdminComingUpEventEnvelope {
  event: ComingUpEventRecord;
}

interface AdminInvestorUpdateEnvelope {
  update: InvestorUpdateRecord;
}

interface AdminFeaturedReelEnvelope {
  reel: FeaturedReelRecord;
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

export function fetchAdminUsers() {
  return request<AdminUsersEnvelope>('/api/admin/users', { method: 'GET' });
}

export function fetchAdminVideos() {
  return request<AdminVideosEnvelope>('/api/admin/videos', { method: 'GET' });
}

export function fetchAdminComingUpEvents() {
  return request<AdminComingUpEventsEnvelope>('/api/admin/coming-up-events', { method: 'GET' });
}

export function fetchAdminInvestorUpdates() {
  return request<AdminInvestorUpdatesEnvelope>('/api/admin/investor-updates', { method: 'GET' });
}

export function fetchAdminFeaturedReels() {
  return request<AdminFeaturedReelsEnvelope>('/api/admin/featured-reels', { method: 'GET' });
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

export function deleteAdminInvestorUpdate(updateId: number) {
  return request<{ deletedUpdateId: number }>(`/api/admin/investor-updates/${updateId}`, {
    method: 'DELETE',
  });
}

export function deleteAdminFeaturedReel(reelId: number) {
  return request<{ deletedReelId: number }>(`/api/admin/featured-reels/${reelId}`, {
    method: 'DELETE',
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

export interface AdminInvestorUpdatePayload {
  category: InvestorUpdateCategory;
  title: string;
  summary: string;
  href: string;
}

export interface AdminFeaturedReelPayload {
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

export function createAdminInvestorUpdate(payload: AdminInvestorUpdatePayload) {
  return request<AdminInvestorUpdateEnvelope>('/api/admin/investor-updates', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminInvestorUpdate(
  updateId: number,
  payload: AdminInvestorUpdatePayload
) {
  return request<AdminInvestorUpdateEnvelope>(`/api/admin/investor-updates/${updateId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function createAdminFeaturedReel(payload: AdminFeaturedReelPayload) {
  return request<AdminFeaturedReelEnvelope>('/api/admin/featured-reels', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminFeaturedReel(
  reelId: number,
  payload: AdminFeaturedReelPayload
) {
  return request<AdminFeaturedReelEnvelope>(`/api/admin/featured-reels/${reelId}`, {
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

export function reorderAdminInvestorUpdates(
  category: InvestorUpdateCategory,
  orderedIds: number[]
) {
  return request<AdminInvestorUpdatesEnvelope>('/api/admin/investor-updates/reorder', {
    method: 'POST',
    body: JSON.stringify({ category, orderedIds }),
  });
}

export function reorderAdminFeaturedReels(
  placement: FeaturedReelPlacement,
  orderedIds: number[]
) {
  return request<AdminFeaturedReelsEnvelope>('/api/admin/featured-reels/reorder', {
    method: 'POST',
    body: JSON.stringify({ placement, orderedIds }),
  });
}
