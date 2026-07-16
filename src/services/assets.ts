const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
export interface AssetRecord { name: string; path: string; size: number; createdAt: string; }
async function request<T>(path: string, init: RequestInit) { const response = await fetch(`${apiBaseUrl}${path}`, { credentials: 'include', ...init }); if (!response.ok) throw new Error('Asset request failed'); return (await response.json()) as T; }
export const fetchAdminAssets = () => request<{ assets: AssetRecord[] }>('/api/admin/assets', { method: 'GET' });
export const uploadAdminAsset = (file: File) => { const body = new FormData(); body.append('asset', file); return request<{ asset: AssetRecord }>('/api/admin/assets', { method: 'POST', body }); };
export const deleteAdminAsset = (name: string) => request<{ deletedAssetName: string }>(`/api/admin/assets/${encodeURIComponent(name)}`, { method: 'DELETE' });
