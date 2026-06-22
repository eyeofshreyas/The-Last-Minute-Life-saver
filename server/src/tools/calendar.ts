// VERIFY: requires googleapis with Calendar scope — real OAuth wired in Task 8

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: string;  // ISO 8601
  end: string;    // ISO 8601
  htmlLink?: string;
}

/** Stub — returns placeholder data until Task 8 wires up real OAuth tokens */
export async function getCalendarEvents(
  _userId: string,
  _params: {
    maxResults?: number;
    timeMin?: string;
    timeMax?: string;
  },
): Promise<CalendarEvent[]> {
  // VERIFY: requires googleapis with Calendar scope — implemented in Task 8
  console.warn('getCalendarEvents: OAuth not yet wired — returning stub data');
  return [
    {
      summary: 'Team standup',
      start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    },
  ];
}

/** Stub — does NOT write to Calendar until Task 8 wires up real OAuth tokens */
export async function createCalendarEvent(
  _userId: string,
  event: CalendarEvent,
): Promise<CalendarEvent> {
  // VERIFY: requires googleapis with Calendar scope — implemented in Task 8
  console.warn('createCalendarEvent: OAuth not yet wired — returning stub');
  return { ...event, id: `stub-${Date.now()}`, htmlLink: 'https://calendar.google.com' };
}
