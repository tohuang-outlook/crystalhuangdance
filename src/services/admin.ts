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

interface AdminUsersEnvelope {
  users: AdminUserRecord[];
}

interface AdminVideosEnvelope {
  videos: AdminVideoRecord[];
}

interface ApiErrorPayload {
  error?: string;
  message?: string;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
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
