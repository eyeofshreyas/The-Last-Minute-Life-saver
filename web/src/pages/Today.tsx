import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import type { Goal, Task, AuditEntry } from '@lmls/shared';
import { api } from '../lib/api';
import RiskRadar from '../components/RiskRadar';
import ActionCard from '../components/ActionCard';
import TodayPlan from '../components/TodayPlan';
import ConfirmationGateModal from '../components/ConfirmationGateModal';

interface Props { user: User }

function greeting(name: string | null): string {
  const h = new Date().getHours();
  if (h < 12) return `Good morning, ${name ?? 'there'}`;
  if (h < 17) return `Good afternoon, ${name ?? 'there'}`;
  return `Good evening, ${name ?? 'there'}`;
}

export default function Today({ user }: Props) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [confirmations, setConfirmations] = useState<Task[]>([]);
  const [_auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [sweeping, setSweeping] = useState(false);

  const displayName = user.displayName?.split(' ')[0] ?? user.email?.split('@')[0] ?? null;

  async function refresh() {
    setFetchError(null);
    const [g, t, c, a] = await Promise.all([
      api.goals.list().catch(() => [] as Goal[]),
      api.tasks.list().catch((e: Error) => { setFetchError(e.message); return [] as Task[]; }),
      api.confirmations.list().catch(() => [] as Task[]),
      api.audit.list().catch(() => [] as AuditEntry[]),
    ]);
    setGoals(g);
    setTasks(t);
    setConfirmations(c);
    setAuditLog(a);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  async function runSweep() {
    setSweeping(true);
    await api.sweep.run().catch(() => {});
    setTimeout(() => { refresh(); setSweeping(false); }, 3000);
  }

  async function loadDemo() {
    await api.demo.seed();
    refresh();
  }

  async function handleApprove() {
    if (!activeTask) return;
    await api.confirmations.approve(activeTask.id);
    setActiveTask(null);
    refresh();
  }

  async function handleReject() {
    if (!activeTask) return;
    await api.confirmations.reject(activeTask.id);
    setActiveTask(null);
    refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surf-base">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#E0D8C8', borderTopColor: '#0D1B3E' }} />
      </div>
    );
  }

  const atRiskCount = goals.filter(g => g.status === 'at_risk' || g.status === 'recovery').length;

  return (
    <div className="min-h-screen bg-surf-base">
      {activeTask && (
        <ConfirmationGateModal
          task={activeTask}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setActiveTask(null)}
        />
      )}

      {/* Error banner */}
      {fetchError && (
        <div
          className="px-6 py-3 text-sm text-center"
          style={{ background: 'rgba(184,50,50,0.06)', borderBottom: '1px solid rgba(184,50,50,0.15)', color: '#B83232' }}
        >
          Database setup needed — create the Firestore composite index.{' '}
          <a
            href="https://console.firebase.google.com/project/the-last-minute-saver/firestore/indexes"
            target="_blank"
            rel="noreferrer"
            className="underline hover:opacity-80"
          >
            Open Firestore Indexes →
          </a>
        </div>
      )}

      {/* Header */}
      <div
        className="px-8 pt-8 pb-6 flex justify-between items-start"
        style={{ borderBottom: '1px solid #E0D8C8' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-widest" style={{ color: '#8C8270' }}>Dashboard</span>
            <span style={{ color: '#E0D8C8' }}>·</span>
            <span className="text-[10px] uppercase tracking-widest" style={{ color: '#8C8270' }}>Updates</span>
          </div>
          <h1 className="font-display text-[28px] font-semibold leading-tight" style={{ color: '#18150F', letterSpacing: '-0.01em' }}>
            {greeting(displayName)} —<br />here&apos;s your day
          </h1>
          <p className="text-sm mt-1.5" style={{ color: '#8C8270' }}>
            {atRiskCount > 0
              ? `${atRiskCount} thing${atRiskCount > 1 ? 's' : ''} at risk. I've already drafted what you need.`
              : 'Everything looks on track. Run the agent to check for new deadlines.'}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-1">
          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
            style={{ background: '#FFFFFF', border: '1px solid #E0D8C8', minWidth: 170, color: '#8C8270', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#8C8270">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            Search insights…
          </div>

          {/* Notifications */}
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-all"
            style={{ background: '#FFFFFF', border: '1px solid #E0D8C8', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#8C8270">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
            {confirmations.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#B83232' }} />
            )}
          </button>

          {/* Run Agent */}
          <button
            onClick={runSweep}
            disabled={sweeping}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-60"
            style={{ background: '#0D1B3E', color: '#F5F0E4', border: 'none', boxShadow: '0 2px 8px rgba(13,27,62,0.18)' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1A2D5A')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0D1B3E')}
          >
            {sweeping ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'rgba(245,240,228,0.4)', borderTopColor: '#F5F0E4' }} />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.48 13.03A4 4 0 0121 16v3h1v2H2v-2h1v-3a4 4 0 011.52-2.97L7 11.42V8.5a.5.5 0 01.5-.5h9a.5.5 0 01.5.5v2.92l2.48 1.61z" />
              </svg>
            )}
            {sweeping ? 'Running…' : 'Run Agent'}
          </button>

          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-semibold text-sm shrink-0"
            style={{ background: '#0D1B3E', color: '#C8A84B' }}
          >
            {(displayName ?? user.email ?? 'U')[0].toUpperCase()}
          </div>
        </div>
      </div>

      {/* Demo banner */}
      {goals.length === 0 && (
        <div
          className="px-8 py-3 text-sm flex items-center justify-center gap-3"
          style={{ background: 'rgba(13,27,62,0.05)', borderBottom: '1px solid #E0D8C8', color: '#0D1B3E' }}
        >
          No goals yet — load demo data to see the agent in action
          <button onClick={loadDemo} className="underline hover:opacity-70 transition-opacity font-medium">
            Load demo
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="px-8 py-6 flex gap-6">
        <div className="flex-1 min-w-0 space-y-4">
          <RiskRadar tasks={tasks} />

          {confirmations.length > 0 ? (
            <div className="space-y-3">
              {confirmations.map(task => (
                <ActionCard
                  key={task.id}
                  task={task}
                  onOpenDraft={() => setActiveTask(task)}
                  onDismiss={() => api.confirmations.reject(task.id).then(refresh)}
                />
              ))}
            </div>
          ) : (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: '#FFFFFF', border: '1px dashed #CFC6B0' }}
            >
              <p className="text-sm" style={{ color: '#8C8270' }}>No actions pending. Run the agent to check for new tasks.</p>
            </div>
          )}
        </div>

        <div className="w-72 shrink-0">
          <TodayPlan tasks={tasks} />
        </div>
      </div>
    </div>
  );
}
