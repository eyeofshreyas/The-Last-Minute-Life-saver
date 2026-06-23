import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { signOutUser } from '../lib/auth';
import type { User } from 'firebase/auth';
import type { Goal, Task, AuditEntry } from '@lmls/shared';
import SnapToPlan from '../components/SnapToPlan';

interface Props { user: User }

/** Returns a Tailwind colour class + label for a risk score 0–100. */
function riskBadge(score: number): { label: string; className: string } {
  if (score >= 80) return { label: `${score}% risk`, className: 'bg-red-900 text-red-300' };
  if (score >= 60) return { label: `${score}% risk`, className: 'bg-orange-900 text-orange-300' };
  if (score >= 30) return { label: `${score}% risk`, className: 'bg-yellow-900 text-yellow-300' };
  return { label: `${score}% risk`, className: 'bg-gray-800 text-gray-400' };
}

export default function Dashboard({ user }: Props) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [confirmations, setConfirmations] = useState<Task[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const [g, t, c, a] = await Promise.all([
      api.goals.list(),
      api.tasks.list(),
      api.confirmations.list(),
      api.audit.list(),
    ]);
    setGoals(g);
    setTasks(t);
    setConfirmations(c);
    setAuditLog(a);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  async function createGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    await api.goals.create({ title: newGoalTitle, source: 'manual' });
    setNewGoalTitle('');
    refresh();
  }

  async function runSweep() {
    await api.sweep.run();
    setTimeout(refresh, 3000); // give executor time to run
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-brand-500">Last-Minute Life Saver</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user.email}</span>
          <button
            onClick={runSweep}
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Run Agent Now
          </button>
          <button onClick={signOutUser} className="text-gray-400 hover:text-white text-sm">
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Goals */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={createGoal} className="flex gap-3">
            <input
              type="text"
              value={newGoalTitle}
              onChange={e => setNewGoalTitle(e.target.value)}
              placeholder="Add a goal (e.g. 'Prepare for Monday interview')"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Add Goal
            </button>
          </form>

          <SnapToPlan onGoalsCreated={refresh} />

          <div className="space-y-4">
            {goals.map(goal => {
              const goalTasks = tasks.filter(t => t.goalId === goal.id);
              const topRiskScore = goalTasks.reduce(
                (max, t) => Math.max(max, t.riskScore ?? 0),
                0,
              );
              const badge = topRiskScore > 0 ? riskBadge(topRiskScore) : null;

              return (
                <div
                  key={goal.id}
                  className={`bg-gray-900 border rounded-xl p-5 ${
                    goal.status === 'at_risk' ? 'border-red-500' : 'border-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white">{goal.title}</h3>
                      {goal.deadline && (
                        <p className="text-gray-400 text-sm mt-1">
                          Due {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {badge && (
                        <span className={`text-xs px-2 py-1 rounded-full ${badge.className}`}>
                          {badge.label}
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          goal.status === 'at_risk'
                            ? 'bg-red-900 text-red-300'
                            : goal.status === 'done'
                            ? 'bg-green-900 text-green-300'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {goal.status}
                      </span>
                    </div>
                  </div>

                  {/* Per-task risk row */}
                  {goalTasks.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {goalTasks.map(t => {
                        const tb = t.riskScore !== undefined ? riskBadge(t.riskScore) : null;
                        return (
                          <div key={t.id} className="flex items-center justify-between text-xs text-gray-400">
                            <span className="truncate mr-2">{t.title}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {tb && (
                                <span className={`px-1.5 py-0.5 rounded ${tb.className}`}>
                                  {tb.label}
                                </span>
                              )}
                              <span className="text-gray-600">{t.status}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            {goals.length === 0 && (
              <div className="text-center py-12 text-gray-600">
                No goals yet. Add your first deadline above.
              </div>
            )}
          </div>
        </div>

        {/* Right column: Confirmations + Audit */}
        <div className="space-y-6">
          {/* Confirmation Gates */}
          {confirmations.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-yellow-400">
                Awaiting Your Review ({confirmations.length})
              </h2>
              {confirmations.map(task => (
                <div
                  key={task.id}
                  className="bg-gray-900 border border-yellow-800 rounded-xl p-4 space-y-3"
                >
                  <p className="text-sm font-medium text-white">{task.title}</p>
                  {task.artifact && (
                    <pre className="text-xs text-gray-400 bg-gray-950 rounded p-3 overflow-auto max-h-32">
                      {JSON.stringify(task.artifact, null, 2)}
                    </pre>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => api.confirmations.approve(task.id).then(refresh)}
                      className="flex-1 bg-green-700 hover:bg-green-600 text-white text-sm py-2 rounded-lg transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => api.confirmations.reject(task.id).then(refresh)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Activity Timeline */}
          <div>
            <h2 className="font-semibold text-gray-300 mb-3">Activity</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {auditLog.map(entry => (
                <div key={entry.id} className="flex gap-3 text-sm">
                  <span className="text-gray-600 whitespace-nowrap text-xs pt-0.5">
                    {new Date(entry.ts).toLocaleTimeString()}
                  </span>
                  <div>
                    <span
                      className={`text-xs font-medium mr-2 ${
                        entry.actor === 'user' ? 'text-blue-400' : 'text-purple-400'
                      }`}
                    >
                      {entry.actor}
                    </span>
                    <span className="text-gray-300">{entry.action}</span>
                  </div>
                </div>
              ))}
              {auditLog.length === 0 && (
                <p className="text-gray-600 text-sm">No activity yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
