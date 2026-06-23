import { getCalendarEvents } from '../tools/calendar';
import type { Task } from '@lmls/shared';

/**
 * Score a task's deadline risk on a 0–100 scale.
 *   0   = no risk (task done or deadline far away)
 *   100 = certain miss (deadline already passed)
 *
 * Factors:
 *  - Time remaining until due date
 *  - Calendar busyness in the next 24 h (if Workspace connected)
 *  - Task status (pending = not started → extra penalty)
 */
export async function scoreTask(userId: string, task: Task): Promise<number> {
  const now = Date.now();
  const due = new Date(task.due).getTime();
  const hoursRemaining = (due - now) / (1000 * 60 * 60);

  // Already missed
  if (hoursRemaining <= 0) return 100;

  // Done tasks are zero-risk
  if (task.status === 'done' || task.status === 'skipped') return 0;

  // Base score from time remaining
  //  < 4 h  → 90   (almost certainly missed unless agent acts now)
  //  < 12 h → 70   (high risk)
  //  < 24 h → 50   (medium-high)
  //  < 48 h → 30   (medium)
  //  < 96 h → 15   (low)
  //  else   →  5   (negligible)
  let baseScore: number;
  if (hoursRemaining < 4) baseScore = 90;
  else if (hoursRemaining < 12) baseScore = 70;
  else if (hoursRemaining < 24) baseScore = 50;
  else if (hoursRemaining < 48) baseScore = 30;
  else if (hoursRemaining < 96) baseScore = 15;
  else baseScore = 5;

  // Calendar busyness penalty — look at the next 24 h
  // > 6 busy hours → +15  (very packed day)
  // > 3 busy hours → +8   (busy day)
  let calendarPenalty = 0;
  try {
    const events = await getCalendarEvents(userId, {
      timeMin: new Date().toISOString(),
      timeMax: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
    });
    const busyHours = events.reduce((acc, e) => {
      const start = new Date(e.start).getTime();
      const end = new Date(e.end).getTime();
      return acc + (end - start) / (1000 * 60 * 60);
    }, 0);
    if (busyHours > 6) calendarPenalty = 15;
    else if (busyHours > 3) calendarPenalty = 8;
  } catch {
    // Workspace not connected or calendar unavailable — skip the calendar factor
  }

  // Not-started penalty: if the task is still pending (agent hasn't touched it yet)
  const statusPenalty = task.status === 'pending' ? 10 : 0;

  return Math.min(100, baseScore + calendarPenalty + statusPenalty);
}
