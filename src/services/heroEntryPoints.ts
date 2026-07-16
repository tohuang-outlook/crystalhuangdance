import type { ArchiveEntryPoint } from '../data/siteData';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

export interface HeroEntryPointRecord extends ArchiveEntryPoint {
  id: number;
  isVisible: boolean;
  sortOrder: number;
}

export async function fetchHeroEntryPoints(): Promise<HeroEntryPointRecord[]> {
  const response = await fetch(`${apiBaseUrl}/api/hero-entry-points`);
  if (!response.ok) throw new Error('Unable to load hero entry points.');
  const data = (await response.json()) as { entryPoints?: HeroEntryPointRecord[] };
  return Array.isArray(data.entryPoints) ? data.entryPoints : [];
}

async function adminRequest<T>(path: string, init: RequestInit) {
  const response = await fetch(`${apiBaseUrl}${path}`, { credentials: 'include', ...init, headers: { 'Content-Type': 'application/json' } });
  if (!response.ok) throw new Error(((await response.json().catch(() => ({}))) as { error?: string }).error ?? 'Request failed');
  return (await response.json()) as T;
}

export function fetchAdminHeroEntryPoints() { return adminRequest<{ entryPoints: HeroEntryPointRecord[] }>('/api/admin/hero-entry-points', { method: 'GET' }); }
export function createAdminHeroEntryPoint() { return adminRequest<{ entryPoint: HeroEntryPointRecord }>('/api/admin/hero-entry-points', { method: 'POST', body: JSON.stringify({ title: 'New entry card', titleZh: '新入口卡', description: 'Add a short description.', descriptionZh: '請加入簡短說明。', href: '#home', isVisible: false }) }); }
export function updateAdminHeroEntryPoint(id: number, payload: Omit<HeroEntryPointRecord, 'id' | 'sortOrder'>) { return adminRequest<{ entryPoint: HeroEntryPointRecord }>(`/api/admin/hero-entry-points/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); }
export function deleteAdminHeroEntryPoint(id: number) { return adminRequest<{ deletedEntryPointId: number }>(`/api/admin/hero-entry-points/${id}`, { method: 'DELETE' }); }
export function reorderAdminHeroEntryPoints(orderedIds: number[]) { return adminRequest<{ entryPoints: HeroEntryPointRecord[] }>('/api/admin/hero-entry-points/reorder', { method: 'POST', body: JSON.stringify({ orderedIds }) }); }
