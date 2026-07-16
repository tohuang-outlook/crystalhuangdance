const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

export type ContactInquiryStatus = 'new' | 'resolved';

export interface ContactInquiryRecord {
  id: number;
  name: string;
  email: string;
  interest: string;
  message: string;
  status: ContactInquiryStatus;
  createdAt: string;
  updatedAt: string;
}

async function request<T>(path: string, init: RequestInit) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error ?? 'Request failed');
  }

  return (await response.json()) as T;
}

export function fetchAdminContactInquiries() {
  return request<{ inquiries: ContactInquiryRecord[] }>('/api/admin/contact-inquiries', { method: 'GET' });
}

export function updateAdminContactInquiryStatus(id: number, status: ContactInquiryStatus) {
  return request<{ inquiry: ContactInquiryRecord }>(`/api/admin/contact-inquiries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteAdminContactInquiry(id: number) {
  return request<{ deletedInquiryId: number }>(`/api/admin/contact-inquiries/${id}`, {
    method: 'DELETE',
  });
}
