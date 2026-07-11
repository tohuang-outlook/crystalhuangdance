const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

export interface ComingUpEvent {
  id: number;
  dateLabel: string;
  title: string;
  location?: string;
  sortOrder: number;
}

interface ComingUpEventsResponse {
  events?: Array<{
    id?: number;
    dateLabel?: string;
    title?: string;
    location?: string | null;
    sortOrder?: number;
  }>;
}

export async function fetchComingUpEvents(): Promise<ComingUpEvent[]> {
  const response = await fetch(`${apiBaseUrl}/api/coming-up-events`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to load coming up events.');
  }

  const data = (await response.json()) as ComingUpEventsResponse;

  if (!Array.isArray(data.events)) {
    return [];
  }

  return data.events.flatMap((event) => {
    if (
      typeof event.id !== 'number' ||
      typeof event.dateLabel !== 'string' ||
      typeof event.title !== 'string' ||
      typeof event.sortOrder !== 'number'
    ) {
      return [];
    }

    return [
      {
        id: event.id,
        dateLabel: event.dateLabel,
        title: event.title,
        location: typeof event.location === 'string' ? event.location : undefined,
        sortOrder: event.sortOrder,
      },
    ];
  });
}
