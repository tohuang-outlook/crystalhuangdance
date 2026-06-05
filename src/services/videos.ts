export interface VideoRecord {
  id: number;
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
}

interface VideosEnvelope {
  videos: VideoRecord[];
}

interface VideoEnvelope {
  video: VideoRecord;
}

interface ApiErrorPayload {
  error?: string;
  message?: string;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

async function parseError(response: Response) {
  let message = 'Request failed';

  try {
    const payload = (await response.json()) as ApiErrorPayload;
    message = payload.message ?? payload.error ?? message;
  } catch {
    message = response.statusText || message;
  }

  throw new Error(message);
}

export async function fetchVideos() {
  const response = await fetch(`${apiBaseUrl}/api/videos`, {
    credentials: 'include',
  });

  if (!response.ok) {
    await parseError(response);
  }

  return (await response.json()) as VideosEnvelope;
}

export async function createYoutubeVideo(payload: { title: string; youtubeUrl: string }) {
  const response = await fetch(`${apiBaseUrl}/api/videos/youtube`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseError(response);
  }

  return (await response.json()) as VideoEnvelope;
}

export async function uploadVideoFile(payload: { title: string; file: File }) {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('video', payload.file);

  const response = await fetch(`${apiBaseUrl}/api/videos/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    await parseError(response);
  }

  return (await response.json()) as VideoEnvelope;
}
