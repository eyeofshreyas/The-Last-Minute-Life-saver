import { getGmailClient } from '../integrations/googleOAuth';

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

export async function searchEmail(
  userId: string,
  query: string,
  maxResults = 5,
): Promise<EmailMessage[]> {
  // VERIFY: gmail.readonly scope — classified as "restricted" by Google; keep app in
  // Testing mode with the demo account allowlisted during the hackathon window.
  const gmail = await getGmailClient(userId);
  const listRes = await gmail.users.messages.list({ userId: 'me', q: query, maxResults });
  const messages = listRes.data.messages ?? [];
  const results: EmailMessage[] = [];
  for (const msg of messages.slice(0, 5)) {
    const detail = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id!,
      format: 'metadata',
      metadataHeaders: ['From', 'To', 'Subject', 'Date'],
    });
    const headers = detail.data.payload?.headers ?? [];
    const h = (name: string): string | undefined =>
      headers.find(x => x.name === name)?.value ?? undefined;
    const bodyPart = detail.data.payload?.parts?.find(p => p.mimeType === 'text/plain');
    const bodyData = bodyPart?.body?.data;
    results.push({
      id: msg.id ?? undefined,
      from: h('From'),
      to: h('To'),
      subject: h('Subject'),
      date: h('Date'),
      body: bodyData
        ? Buffer.from(bodyData, 'base64url').toString('utf8').slice(0, 500)
        : undefined,
    });
  }
  return results;
}

export async function draftEmail(
  userId: string,
  params: { to: string; subject: string; body: string },
): Promise<DraftResult> {
  // VERIFY: gmail.compose scope — restricted; keep app in Testing mode for hackathon.
  // This creates a DRAFT only — does NOT send. Tier 2 confirmation required to send.
  const gmail = await getGmailClient(userId);
  const raw = Buffer.from(
    `To: ${params.to}\r\nSubject: ${params.subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${params.body}`,
  ).toString('base64url');
  const draft = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: { message: { raw } },
  });
  return { draftId: draft.data.id!, ...params };
}
