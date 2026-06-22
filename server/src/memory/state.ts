import { getFirestore } from '../integrations/firestore';
import type { Goal, Task, AuditEntry, UserProfile } from '@lmls/shared';

function uid(): string {
  return crypto.randomUUID();
}

// ── Goals ──────────────────────────────────────────────────────────────────

export async function createGoal(
  userId: string,
  data: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
): Promise<Goal> {
  const db = getFirestore();
  const id = uid();
  const now = new Date().toISOString();
  const goal: Goal = { id, userId, createdAt: now, updatedAt: now, ...data };
  await db.collection('goals').doc(id).set(goal);
  return goal;
}

export async function getGoals(userId: string): Promise<Goal[]> {
  const db = getFirestore();
  const snap = await db
    .collection('goals')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map(d => d.data() as Goal);
}

export async function getGoal(goalId: string): Promise<Goal | null> {
  const db = getFirestore();
  const doc = await db.collection('goals').doc(goalId).get();
  return doc.exists ? (doc.data() as Goal) : null;
}

export async function updateGoal(goalId: string, patch: Partial<Goal>): Promise<void> {
  const db = getFirestore();
  await db
    .collection('goals')
    .doc(goalId)
    .update({ ...patch, updatedAt: new Date().toISOString() });
}

// ── Tasks ──────────────────────────────────────────────────────────────────

export async function createTask(
  userId: string,
  data: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
): Promise<Task> {
  const db = getFirestore();
  const id = uid();
  const now = new Date().toISOString();
  const task: Task = { id, userId, createdAt: now, updatedAt: now, ...data };
  await db.collection('tasks').doc(id).set(task);
  return task;
}

export async function getTasks(userId: string, goalId?: string): Promise<Task[]> {
  const db = getFirestore();
  let q = db.collection('tasks').where('userId', '==', userId);
  if (goalId) {
    q = q.where('goalId', '==', goalId) as typeof q;
  }
  const snap = await q.orderBy('due', 'asc').get();
  return snap.docs.map(d => d.data() as Task);
}

export async function getTask(taskId: string): Promise<Task | null> {
  const db = getFirestore();
  const doc = await db.collection('tasks').doc(taskId).get();
  return doc.exists ? (doc.data() as Task) : null;
}

export async function updateTask(taskId: string, patch: Partial<Task>): Promise<void> {
  const db = getFirestore();
  await db
    .collection('tasks')
    .doc(taskId)
    .update({ ...patch, updatedAt: new Date().toISOString() });
}

// ── Audit Log ──────────────────────────────────────────────────────────────

export async function createAuditEntry(
  entry: Omit<AuditEntry, 'id' | 'ts'>,
): Promise<AuditEntry> {
  const db = getFirestore();
  const id = uid();
  const ts = new Date().toISOString();
  const full: AuditEntry = { id, ts, ...entry };
  await db.collection('audit').doc(id).set(full);
  return full;
}

export async function getAuditEntries(userId: string, limit = 50): Promise<AuditEntry[]> {
  const db = getFirestore();
  const snap = await db
    .collection('audit')
    .where('userId', '==', userId)
    .orderBy('ts', 'desc')
    .limit(limit)
    .get();
  return snap.docs.map(d => d.data() as AuditEntry);
}

// ── User Profile ───────────────────────────────────────────────────────────

export async function upsertUserProfile(profile: UserProfile): Promise<void> {
  const db = getFirestore();
  await db.collection('users').doc(profile.uid).set(profile, { merge: true });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getFirestore();
  const doc = await db.collection('users').doc(uid).get();
  return doc.exists ? (doc.data() as UserProfile) : null;
}
