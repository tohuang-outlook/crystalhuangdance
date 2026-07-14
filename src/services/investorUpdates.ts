const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

export type InvestorUpdateCategory =
  | 'investment-page'
  | 'monthly-reports'
  | 'real-time-quote';

export interface InvestorUpdate {
  id: number;
  category: InvestorUpdateCategory;
  title: string;
  summary: string;
  href?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface InvestorUpdatesResponse {
  updates?: Array<{
    id?: number;
    category?: InvestorUpdateCategory;
    title?: string;
    summary?: string;
    href?: string | null;
    sortOrder?: number;
    createdAt?: string;
    updatedAt?: string;
  }>;
}

const validCategories = new Set<InvestorUpdateCategory>([
  'investment-page',
  'monthly-reports',
  'real-time-quote',
]);

export async function fetchInvestorUpdates(): Promise<InvestorUpdate[]> {
  const response = await fetch(`${apiBaseUrl}/api/investor-updates`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to load investor updates.');
  }

  const data = (await response.json()) as InvestorUpdatesResponse;

  if (!Array.isArray(data.updates)) {
    return [];
  }

  return data.updates.flatMap((update) => {
    if (
      typeof update.id !== 'number' ||
      typeof update.category !== 'string' ||
      !validCategories.has(update.category) ||
      typeof update.title !== 'string' ||
      typeof update.summary !== 'string' ||
      typeof update.sortOrder !== 'number' ||
      typeof update.createdAt !== 'string' ||
      typeof update.updatedAt !== 'string'
    ) {
      return [];
    }

    return [
      {
        id: update.id,
        category: update.category,
        title: update.title,
        summary: update.summary,
        href: typeof update.href === 'string' ? update.href : undefined,
        sortOrder: update.sortOrder,
        createdAt: update.createdAt,
        updatedAt: update.updatedAt,
      },
    ];
  });
}
