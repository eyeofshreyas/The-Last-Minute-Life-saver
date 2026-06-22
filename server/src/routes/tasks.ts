import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getTasks } from '../memory/state';
import { executeTask } from '../agent/executor';

const router = Router();
router.use(requireAuth);

/** GET /api/tasks?goalId=<id> — list tasks for the authenticated user */
router.get('/', async (req, res) => {
  try {
    const { goalId } = req.query as { goalId?: string };
    const tasks = await getTasks(req.uid, goalId);
    res.json(tasks);
  } catch (err) {
    console.error('Failed to fetch tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

/**
 * POST /api/tasks/:id/execute
 * Triggers the Executor agent ReAct loop for the given task.
 * Stages the result as `awaiting_confirm` — never auto-commits.
 */
router.post('/:id/execute', async (req, res) => {
  try {
    await executeTask(req.uid, req.params.id);
    res.json({ status: 'staged' });
  } catch (err) {
    console.error('Execute error:', err);
    res.status(500).json({ error: 'Execution failed' });
  }
});

export default router;
