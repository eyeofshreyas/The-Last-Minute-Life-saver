import { google } from 'googleapis';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { config } from '../config';
import { getFirestore } from './firestore';

// VERIFY: confirm Calendar and Gmail scopes aren't classified as "restricted"
// (would require OAuth verification — use allowlisted test account for hackathon)
// https://developers.google.com/identity/protocols/oauth2/scopes
// gmail.compose is a "restricted" scope; gmail.readonly may also be restricted.
// For the hackathon, keep the OAuth app in Testing mode with the demo account
// on the allowlist to avoid full verification (which takes weeks).
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.readonly',
];

export function createOAuthClient() {
  return new google.auth.OAuth2(
    config.google.oauthClientId,
    config.google.oauthClientSecret,
    config.google.oauthRedirectUri,
  );
}

export function getAuthUrl(state: string): string {
  const oauth2 = createOAuthClient();
  return oauth2.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // force refresh_token every time
    state,
  });
}

// ── AES-256-CBC encryption for token storage ─────────────────────────────────
// TOKEN_ENCRYPTION_KEY must be a 32-byte (64 hex character) random string in .env

function encrypt(text: string): string {
  const key = Buffer.from(config.google.tokenEncryptionKey, 'hex');
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const [ivHex, encHex] = text.split(':');
  const key = Buffer.from(config.google.tokenEncryptionKey, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

// ── Firestore token persistence ───────────────────────────────────────────────

export async function storeTokens(
  userId: string,
  tokens: Record<string, unknown>,
): Promise<void> {
  const db = getFirestore();
  await db.collection('workspace_tokens').doc(userId).set({
    encrypted: encrypt(JSON.stringify(tokens)),
    updatedAt: new Date().toISOString(),
  });
}

export async function getTokens(
  userId: string,
): Promise<Record<string, unknown> | null> {
  const db = getFirestore();
  const doc = await db.collection('workspace_tokens').doc(userId).get();
  if (!doc.exists) return null;
  const { encrypted } = doc.data() as { encrypted: string };
  return JSON.parse(decrypt(encrypted)) as Record<string, unknown>;
}

// ── Authenticated API clients ─────────────────────────────────────────────────

export async function getCalendarClient(userId: string) {
  const tokens = await getTokens(userId);
  if (!tokens) throw new Error('Google Workspace not connected. Visit /api/workspace/auth');
  const oauth2 = createOAuthClient();
  oauth2.setCredentials(tokens);
  return google.calendar({ version: 'v3', auth: oauth2 });
}

export async function getGmailClient(userId: string) {
  const tokens = await getTokens(userId);
  if (!tokens) throw new Error('Google Workspace not connected. Visit /api/workspace/auth');
  const oauth2 = createOAuthClient();
  oauth2.setCredentials(tokens);
  return google.gmail({ version: 'v1', auth: oauth2 });
}
