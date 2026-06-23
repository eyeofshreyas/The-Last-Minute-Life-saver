import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getTasks, updateTask, updateGoal } from '../memory/state';
import { scoreTask } from '../agent/riskScorer';
import { executeTask } from '../agent/executor';

const router = Router();
router.use(requireAuth);

/**
 * POST /api/sweep
 *
 * Proactive sweep engine — the agent's heartbeat.
 * Triggered by:
 *  - Frontend on-load (Dashboard useEffect)
 *  - "Run Agent Now" button
 *  - External scheduled ping (Cloud Scheduler, if configured)
 *
 * For every pending/drafted task belonging to the authenticated user:
 *  1. Score deadline risk (0–100).
 *  2. Persist the score on the task.
 *  3. If score ≥ 70 → mark the parent goal `at_risk`.
 *  4. If score ≥ 60 and task is still `pending` → auto-execute (fire-and-forget).
 *     The executor stages an artifact for human confirmation (Tier 2 — never auto-commits).
 */
router.post('/', async (req, res) => {
  try {
    const tasks = await getTasks(req.uid);
    const activeTasks = tasks.filter(
      t => t.status === 'pending' || t.status === 'drafted',
    );

    let triggered = 0;

    for (const task of activeTasks) {
      const score = await scoreTask(req.uid, task);
      await updateTask(task.id, { riskScore: score });

      // Escalate parent goal status when risk is high
      if (score >= 70) {
        await updateGoal(task.goalId, { status: 'at_risk' });
      }

      // Auto-execute high-risk tasks that haven't been started yet.
      // Fire-and-forget: executor stages artifact as `awaiting_confirm` — no irreversible
      // action is taken without user approval (Tier 2 per safety model).
      if (score >= 60 && task.status === 'pending') {
        executeTask(req.uid, task.id).catch((err: unknown) =>
          console.error(`[sweep] Auto-exec error for task ${task.id}:`, err),
        );
        triggered++;
      }
    }

    res.json({ triggered, scored: activeTasks.length });
  } catch (err) {
    console.error('[sweep] Sweep failed:', err);
    res.status(500).json({ error: 'Sweep failed' });
  }
});

export default router;
