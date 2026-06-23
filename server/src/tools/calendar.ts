import { getCalendarClient } from '../integrations/googleOAuth';

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: string; // ISO 8601
  end: string;   // ISO 8601
  htmlLink?: string;
}

export async function getCalendarEvents(
  userId: string,
  params: {
    maxResults?: number;
    timeMin?: string;
    timeMax?: string;
  },
): Promise<CalendarEvent[]> {
  try {
    const cal = await getCalendarClient(userId);
    const res = await cal.events.list({
      calendarId: 'primary',
      maxResults: params.maxResults ?? 10,
      timeMin: params.timeMin ?? new Date().toISOString(),
      timeMax: params.timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return (res.data.items ?? []).map(e => ({
      id: e.id ?? undefined,
      summary: e.summary ?? '(no title)',
      description: e.description ?? undefined,
      start: e.start?.dateTime ?? e.start?.date ?? '',
      end: e.end?.dateTime ?? e.end?.date ?? '',
      htmlLink: e.htmlLink ?? undefined,
    }));
  } catch (err: unknown) {
    // If Workspace isn't connected yet, return empty rather than crashing the agent loop
    if ((err as Error).message?.includes('not connected')) return [];
    throw err;
  }
}

export async function createCalendarEvent(
  userId: string,
  event: CalendarEvent,
): Promise<CalendarEvent> {
  const cal = await getCalendarClient(userId);
  const res = await cal.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.start },
      end: { dateTime: event.end },
    },
  });
  return {
    id: res.data.id ?? undefined,
    summary: res.data.summary ?? event.summary,
    description: res.data.description ?? event.description,
    start: res.data.start?.dateTime ?? event.start,
    end: res.data.end?.dateTime ?? event.end,
    htmlLink: res.data.htmlLink ?? undefined,
  };
}
