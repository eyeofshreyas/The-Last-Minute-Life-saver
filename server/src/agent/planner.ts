import { callGemini } from '../integrations/gemini';
import { createTask, createAuditEntry } from '../memory/state';
import { config } from '../config';
import type { Goal, Task } from '@lmls/shared';

const PLANNER_SYSTEM = `You are a deadline management planner. Given a goal with a deadline, decompose it into a concrete sequence of tasks with realistic due dates. Each task should use exactly one tool type. Produce a JSON array matching the schema exactly.`;

const TASK_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      due: { type: 'string', description: 'ISO 8601 datetime' },
      tool: { type: 'string', enum: ['calendar', 'gmail', 'research', 'none'] },
      autonomyTier: { type: 'integer', minimum: 0, maximum: 3 },
      dependsOn: { type: 'array', items: { type: 'string' } },
    },
    required: ['title', 'due', 'tool', 'autonomyTier', 'dependsOn'],
  },
};

interface RawTask {
  title: string;
  description?: string;
  due: string;
  tool: 'calendar' | 'gmail' | 'research' | 'none';
  autonomyTier: 0 | 1 | 2 | 3;
  dependsOn: string[];
}

export async function planGoal(userId: string, goal: Goal): Promise<Task[]> {
  const prompt = `Goal: "${goal.title}"
Description: ${goal.description ?? 'none'}
Deadline: ${goal.deadline ?? 'ASAP'}
Today: ${new Date().toISOString()}

Decompose this into 3-7 concrete tasks. Use autonomyTier 1 (suggest) for research/drafting, tier 2 (confirm) for sending email or creating calendar events. Do not use tier 3 unless explicitly reversible.`;

  const response = await callGemini({
    model: config.gemini.modelPlanner,
    systemInstruction: PLANNER_SYSTEM,
    messages: [{ role: 'user', parts: [{ text: prompt }] }],
    responseSchema: TASK_SCHEMA,
    temperature: 0.1,
  });

  if (!response.text) throw new Error('Planner returned empty response');
  const rawTasks: RawTask[] = JSON.parse(response.text);

  const titleToId: Record<string, string> = {};
  const tasks: Task[] = [];

  for (const raw of rawTasks) {
    const task = await createTask(userId, {
      goalId: goal.id,
      title: raw.title,
      description: raw.description,
      due: raw.due,
      tool: raw.tool,
      autonomyTier: raw.autonomyTier,
      dependsOn: raw.dependsOn.map(t => titleToId[t] ?? t),
      status: 'pending',
    });
    titleToId[raw.title] = task.id;
    tasks.push(task);
  }

  await createAuditEntry({
    userId,
    actor: 'planner',
    action: `Decomposed goal "${goal.title}" into ${tasks.length} tasks`,
    goalId: goal.id,
    outcome: 'proposed',
  });

  return tasks;
}
