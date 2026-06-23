import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getTasks, getTask, updateTask, createAuditEntry, getAuditEntries } from '../memory/state';

const router = Router();
router.use(requireAuth);

// Audit log — defined BEFORE /:taskId routes so "audit" is not consumed as a taskId param
router.get('/audit', async (req, res) => {
  try {
    const entries = await getAuditEntries(req.uid, 100);
    res.json(entries);
  } catch {
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

// All tasks awaiting user confirmation
router.get('/', async (req, res) => {
  try {
    const allTasks = await getTasks(req.uid);
    const pending = allTasks.filter(t => t.status === 'awaiting_confirm');
    res.json(pending);
  } catch {
    res.status(500).json({ error: 'Failed to fetch confirmations' });
  }
});

router.post('/:taskId/approve', async (req, res) => {
  try {
    const task = await getTask(req.params.taskId);
    if (!task || task.userId !== req.uid) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    await updateTask(task.id, { status: 'done' });
    await createAuditEntry({
      userId: req.uid,
      actor: 'user',
      action: `Approved task "${task.title}"`,
      goalId: task.goalId,
      taskId: task.id,
      outcome: 'committed',
    });
    res.json({ status: 'approved' });
  } catch {
    res.status(500).json({ error: 'Failed to approve' });
  }
});

router.post('/:taskId/reject', async (req, res) => {
  try {
    const task = await getTask(req.params.taskId);
    if (!task || task.userId !== req.uid) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    await updateTask(task.id, { status: 'pending', artifact: undefined });
    await createAuditEntry({
      userId: req.uid,
      actor: 'user',
      action: `Rejected task "${task.title}" — reset to pending`,
      goalId: task.goalId,
      taskId: task.id,
      outcome: 'rejected',
    });
    res.json({ status: 'rejected' });
  } catch {
    res.status(500).json({ error: 'Failed to reject' });
  }
});

export default router;
