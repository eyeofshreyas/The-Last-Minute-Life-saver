export type Tier = 0 | 1 | 2 | 3;

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  source: 'manual' | 'email' | 'snap';
  deadline?: string;       // ISO 8601
  status: 'active' | 'done' | 'at_risk' | 'recovery';
  createdAt: string;       // ISO 8601
  updatedAt: string;
}

export interface Task {
  id: string;
  goalId: string;
  userId: string;
  title: string;
  description?: string;
  due: string;             // ISO 8601
  dependsOn: string[];     // Task ids
  tool?: 'calendar' | 'gmail' | 'research' | 'none';
  autonomyTier: Tier;
  status: 'pending' | 'drafted' | 'awaiting_confirm' | 'done' | 'skipped';
  artifact?: Record<string, unknown>;  // produced draft/plan
  riskScore?: number;      // 0-100 (100 = certain miss)
  createdAt: string;
  updatedAt: string;
}

export interface AuditEntry {
  id: string;
  userId: string;
  ts: string;              // ISO 8601
  actor: 'planner' | 'executor' | 'critic' | 'user';
  action: string;          // human-readable past tense
  goalId?: string;
  taskId?: string;
  toolCall?: {
    name: string;
    input: Record<string, unknown>;
    output: Record<string, unknown>;
  };
  outcome: 'proposed' | 'approved' | 'rejected' | 'committed' | 'error';
}

export interface ConfirmationPayload {
  taskId: string;
  goalId: string;
  actionSummary: string;   // human-readable one-liner
  diff: {
    type: 'email_draft' | 'calendar_event' | 'document' | 'plan';
    before?: Record<string, unknown>;
    after: Record<string, unknown>;
  };
  autonomyTier: Tier;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  workspaceConnected: boolean;
  tier: 'free' | 'pro';   // Lemon Squeezy unlock
  createdAt: string;
}
