import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getAuthUrl,
  createOAuthClient,
  storeTokens,
  getTokens,
} from '../integrations/googleOAuth';
import { upsertUserProfile, getUserProfile } from '../memory/state';
import { config } from '../config';

const router = Router();

/**
 * GET /api/workspace/auth
 * Redirects the authenticated user to Google's OAuth consent screen.
 * The user's Firebase UID is passed as the OAuth `state` parameter so the
 * callback knows which Firestore document to write.
 */
router.get('/auth', requireAuth, (req, res) => {
  const url = getAuthUrl(req.uid);
  res.json({ url });
});

/**
 * GET /api/workspace/callback
 * Google redirects here after the user grants (or denies) consent.
 * Exchanges the auth code for tokens, encrypts them, and stores in Firestore.
 * Updates the user's profile to mark workspaceConnected = true.
 */
router.get('/callback', async (req, res) => {
  const { code, state: uid, error } = req.query as {
    code?: string;
    state?: string;
    error?: string;
  };

  if (error) {
    console.error('OAuth consent denied:', error);
    res.redirect(`${config.frontendUrl}/settings?workspace=denied`);
    return;
  }

  if (!code || !uid) {
    res.status(400).send('Missing code or state parameter');
    return;
  }

  try {
    const oauth2 = createOAuthClient();
    const { tokens } = await oauth2.getToken(code);
    await storeTokens(uid, tokens as Record<string, unknown>);

    // Mark workspace as connected on the user profile
    const profile = await getUserProfile(uid);
    if (profile) {
      await upsertUserProfile({ ...profile, workspaceConnected: true });
    }

    res.redirect(`${config.frontendUrl}/settings?workspace=connected`);
  } catch (err) {
    console.error('OAuth callback error', err);
    res.status(500).send('OAuth token exchange failed');
  }
});

/**
 * GET /api/workspace/status
 * Returns whether the current user has connected their Google Workspace account.
 */
router.get('/status', requireAuth, async (req, res) => {
  try {
    const tokens = await getTokens(req.uid);
    res.json({ connected: !!tokens });
  } catch (err) {
    console.error('Workspace status error', err);
    res.status(500).json({ error: 'Failed to check workspace status' });
  }
});

export default router;
