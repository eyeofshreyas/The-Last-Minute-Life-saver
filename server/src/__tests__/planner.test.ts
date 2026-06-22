// server/src/__tests__/planner.test.ts
// This is an integration test — it calls the real Gemini API.
// Run with a real .env file: GEMINI_API_KEY and MODEL_PLANNER set.
// Skip in CI (mark with .skip) until API keys are available.

import { planGoal } from '../agent/planner';
import type { Goal } from '@lmls/shared';

const mockGoal: Goal = {
  id: 'test-goal-1',
  userId: 'test-user-1',
  title: 'Prepare for job interview at Acme Corp on Monday',
  deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  source: 'manual',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Stub createTask and createAuditEntry for unit testing
jest.mock('../memory/state', () => ({
  createTask: jest.fn().mockImplementation((_uid: string, data: Record<string, unknown>) =>
    Promise.resolve({
      id: `task-${Math.random()}`,
      userId: 'test-user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    })
  ),
  createAuditEntry: jest.fn().mockResolvedValue({}),
}));

describe.skip('planGoal (integration — needs GEMINI_API_KEY)', () => {
  it('returns at least 2 tasks with valid fields', async () => {
    const tasks = await planGoal('test-user-1', mockGoal);
    expect(tasks.length).toBeGreaterThanOrEqual(2);
    for (const t of tasks) {
      expect(t.title).toBeTruthy();
      expect(t.due).toMatch(/^\d{4}-\d{2}-\d{2}/);
      expect([0, 1, 2, 3]).toContain(t.autonomyTier);
    }
  });
});
