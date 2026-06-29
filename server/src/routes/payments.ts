import { Router, raw } from 'express';
import { requireAuth } from '../middleware/auth';
import { createCheckoutUrl, verifyWebhookSignature } from '../integrations/lemonSqueezy';
import { getUserProfile, upsertUserProfile } from '../memory/state';

const router = Router();

router.post('/checkout', requireAuth, async (req, res) => {
  try {
    const profile = await getUserProfile(req.uid);
    if (!profile) { res.status(404).json({ error: 'User not found' }); return; }
    if (!profile.email) { res.status(400).json({ error: 'User profile missing email' }); return; }
    const url = await createCheckoutUrl(req.uid, profile.email);
    res.json({ url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout' });
  }
});

// Raw body needed for HMAC verification — must be registered before express.json parses it
router.post('/webhook', raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-signature'] as string | undefined;
  if (!signature || !verifyWebhookSignature(req.body as Buffer, signature)) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }
  try {
    const payload = JSON.parse((req.body as Buffer).toString('utf8')) as {
      meta?: {
        event_name?: string;
        custom_data?: { userId?: string };
      };
    };
    const eventName = payload.meta?.event_name;
    if (eventName === 'order_created' || eventName === 'subscription_created') {
      const userId = payload.meta?.custom_data?.userId;
      if (userId) {
        const profile = await getUserProfile(userId);
        if (profile) await upsertUserProfile({ ...profile, tier: 'pro' });
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ error: 'Webhook failed' });
  }
});

export default router;
