export interface AuthUser {
  id: number;
  email: string;
  role: 'user' | 'admin';
  name?: string | null;
}

interface AuthEnvelope {
  user: AuthUser;
}

interface ApiErrorPayload {
  error?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  inviteCode: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  password: string;
  token: string;
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

export function fetchCurrentUser() {
  return request<AuthEnvelope>('/api/auth/me', { method: 'GET' });
}

export function loginUser(credentials: LoginCredentials) {
  return request<AuthEnvelope>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function registerUser(credentials: RegisterCredentials) {
  return request<AuthEnvelope>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function logoutUser() {
  return request<void>('/api/auth/logout', { method: 'POST' });
}

export function requestPasswordReset(payload: ForgotPasswordRequest) {
  return request<{ message?: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function resetPassword(payload: ResetPasswordRequest) {
  return request<{ message?: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
