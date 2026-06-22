// VERIFY: requires googleapis with Gmail scope — real OAuth wired in Task 8

export interface EmailMessage {
  id?: string;
  from?: string;
  to?: string;
  subject?: string;
  body?: string;
  date?: string;
}

export interface DraftResult {
  draftId: string;
  to: string;
  subject: string;
  body: string;
}

/** Stub — returns placeholder data until Task 8 wires up real OAuth tokens */
export async function searchEmail(
  _userId: string,
  query: string,
  _maxResults = 5,
): Promise<EmailMessage[]> {
  // VERIFY: requires googleapis with Gmail readonly scope — implemented in Task 8
  console.warn('searchEmail: OAuth not yet wired — returning stub');
  return [
    {
      id: 'stub-1',
      from: 'hr@company.com',
      subject: 'Interview Confirmation',
      body: `Stub result for query: ${query}`,
    },
  ];
}

/** Stub — does NOT create a real Gmail draft until Task 8 wires up real OAuth tokens */
export async function draftEmail(
  _userId: string,
  params: { to: string; subject: string; body: string },
): Promise<DraftResult> {
  // VERIFY: requires googleapis with Gmail compose scope — implemented in Task 8
  console.warn('draftEmail: OAuth not yet wired — returning stub draft');
  return { draftId: `draft-stub-${Date.now()}`, ...params };
}
