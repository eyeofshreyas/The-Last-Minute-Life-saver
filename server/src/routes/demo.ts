import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createGoal, createTask, createAuditEntry } from '../memory/state';
import { config } from '../config';

const router = Router();
router.use(requireAuth);

router.post('/seed', async (req, res) => {
  if (!config.demoMode) {
    res.status(403).json({ error: 'Demo mode not enabled' });
    return;
  }
  try {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const in5Days = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

    // Goal 1: PM interview prep
    const goal1 = await createGoal(req.uid, {
      title: 'Prepare for Product Manager interview at TechCorp',
      deadline: in3Days,
      source: 'manual',
      status: 'at_risk',
    });

    await createTask(req.uid, {
      goalId: goal1.id,
      title: 'Research TechCorp recent product launches',
      due: tomorrow,
      tool: 'research',
      autonomyTier: 1,
      dependsOn: [],
      status: 'awaiting_confirm',
      riskScore: 78,
      artifact: {
        type: 'research_summary',
        summary:
          'TechCorp recently launched their AI-powered analytics dashboard in Q1 2026. Key focus areas: enterprise data visualization, real-time collaboration. Recent press: $50M Series C. CEO previously from Salesforce.',
      },
    });

    await createTask(req.uid, {
      goalId: goal1.id,
      title: 'Draft thank-you email for post-interview',
      due: in3Days,
      tool: 'gmail',
      autonomyTier: 2,
      dependsOn: [],
      status: 'pending',
      riskScore: 45,
    });

    // Goal 2: electricity bill payment
    const goal2 = await createGoal(req.uid, {
      title: 'Pay electricity bill — final notice',
      deadline: tomorrow,
      source: 'snap',
      status: 'at_risk',
    });

    await createTask(req.uid, {
      goalId: goal2.id,
      title: 'Draft reminder to check bill payment',
      due: tomorrow,
      tool: 'gmail',
      autonomyTier: 2,
      dependsOn: [],
      status: 'awaiting_confirm',
      riskScore: 92,
      artifact: {
        type: 'email_draft',
        draftId: 'demo-draft-1',
        to: 'myself@email.com',
        subject: 'ACTION NEEDED: Electricity bill due tomorrow',
        body: 'Hi,\n\nYour electricity bill of $127.50 is due tomorrow. Please log in to pay at https://utility.com/pay\n\nThis draft was created by your AI agent.',
      },
    });

    // Audit entries
    await createAuditEntry({
      userId: req.uid,
      actor: 'planner',
      action: 'Decomposed "Prepare for PM interview at TechCorp" into 2 tasks',
      goalId: goal1.id,
      outcome: 'proposed',
    });

    await createAuditEntry({
      userId: req.uid,
      actor: 'executor',
      action: 'Researched TechCorp via web search — summary staged for review',
      goalId: goal1.id,
      outcome: 'proposed',
    });

    await createAuditEntry({
      userId: req.uid,
      actor: 'executor',
      action: 'Drafted electricity bill reminder email — awaiting approval',
      goalId: goal2.id,
      outcome: 'proposed',
    });

    // Suppress unused variable warning for in5Days (kept for potential future tasks)
    void in5Days;

    res.json({ seeded: 2 });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: 'Seed failed' });
  }
});

export default router;
