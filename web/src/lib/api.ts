import { getIdToken } from './auth';

const BASE = '/api';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getIdToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  goals: {
    list: () => apiFetch<import('@lmls/shared').Goal[]>('/goals'),
    create: (data: { title: string; description?: string; deadline?: string; source: 'manual' | 'email' | 'snap' }) =>
      apiFetch<import('@lmls/shared').Goal>('/goals', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: string) =>
      apiFetch<{ goal: import('@lmls/shared').Goal; tasks: import('@lmls/shared').Task[] }>(`/goals/${id}`),
  },
  tasks: {
    list: (goalId?: string) =>
      apiFetch<import('@lmls/shared').Task[]>(`/tasks${goalId ? `?goalId=${goalId}` : ''}`),
    execute: (taskId: string) =>
      apiFetch<{ status: string }>(`/tasks/${taskId}/execute`, { method: 'POST' }),
  },
  confirmations: {
    list: () => apiFetch<import('@lmls/shared').Task[]>('/confirmations'),
    approve: (taskId: string) => apiFetch<{ status: string }>(`/confirmations/${taskId}/approve`, { method: 'POST' }),
    reject: (taskId: string) => apiFetch<{ status: string }>(`/confirmations/${taskId}/reject`, { method: 'POST' }),
  },
  audit: {
    list: () => apiFetch<import('@lmls/shared').AuditEntry[]>('/confirmations/audit'),
  },
  sweep: {
    run: () => apiFetch<{ triggered: number }>('/sweep', { method: 'POST' }),
  },
};
