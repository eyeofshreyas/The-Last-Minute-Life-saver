import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createGoal, getGoals, getGoal, getTasks } from '../memory/state';
import { planGoal } from '../agent/planner';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const goals = await getGoals(req.uid);
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, deadline, source } = req.body as {
      title: string;
      description?: string;
      deadline?: string;
      source: 'manual' | 'email' | 'snap';
    };
    const goal = await createGoal(req.uid, {
      title,
      description,
      deadline,
      source,
      status: 'active',
    });
    // Trigger planner async — don't await (respond immediately, planner runs in background)
    planGoal(req.uid, goal).catch(err => console.error('Planner error:', err));
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [goal, tasks] = await Promise.all([
      getGoal(req.params.id),
      getTasks(req.uid, req.params.id),
    ]);
    if (!goal || goal.userId !== req.uid) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ goal, tasks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch goal' });
  }
});

export default router;
