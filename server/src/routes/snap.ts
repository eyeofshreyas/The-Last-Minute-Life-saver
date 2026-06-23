import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth';
import { callGemini } from '../integrations/gemini';
import { config } from '../config';
import { createGoal } from '../memory/state';
import { planGoal } from '../agent/planner';
import type { Goal } from '@lmls/shared';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();
router.use(requireAuth);

const SNAP_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Goal title describing the deliverable' },
      deadline: { type: 'string', description: 'ISO 8601 date, or null if not found' },
      description: { type: 'string' },
    },
    required: ['title'],
  },
};

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }

  const mimeType = req.file.mimetype;
  const base64 = req.file.buffer.toString('base64');

  try {
    const response = await callGemini({
      model: config.gemini.modelVision,
      systemInstruction: 'Extract all deadlines, assignments, bills, or important events from this image. Return a JSON array of goals with titles and ISO deadlines. If no deadline is visible, omit the deadline field.',
      messages: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: base64 } },
          { text: `Today's date: ${new Date().toISOString()}. Extract all deadlines/tasks from this image.` },
        ],
      }],
      responseSchema: SNAP_SCHEMA,
      temperature: 0.1,
    });

    if (!response.text) { res.status(500).json({ error: 'Vision model returned no results' }); return; }

    const extracted: Array<{ title: string; deadline?: string; description?: string }> = JSON.parse(response.text);
    const goals: Goal[] = [];

    for (const item of extracted) {
      const goal = await createGoal(req.uid, {
        title: item.title,
        description: item.description,
        deadline: item.deadline,
        source: 'snap',
        status: 'active',
      });
      goals.push(goal);
      planGoal(req.uid, goal).catch(err => console.error('Planner error after snap:', err));
    }

    res.json({ goals, count: goals.length });
  } catch (err) {
    console.error('Snap error:', err);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

export default router;
