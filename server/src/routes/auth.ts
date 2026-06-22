import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { upsertUserProfile } from '../memory/state';

const router = Router();

// Called after Firebase client-side sign-in to sync user to Firestore
router.post('/session', requireAuth, async (req, res) => {
  try {
    const { displayName, email, photoURL } = req.body as {
      displayName?: string;
      email: string;
      photoURL?: string;
    };
    await upsertUserProfile({
      uid: req.uid,
      email,
      displayName,
      photoURL,
      workspaceConnected: false,
      tier: 'free',
      createdAt: new Date().toISOString(),
    });
    res.json({ uid: req.uid });
  } catch (err) {
    console.error('session error', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

export default router;
