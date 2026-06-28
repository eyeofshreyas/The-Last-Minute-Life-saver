import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Goal } from '@lmls/shared';
import { api } from '../lib/api';

function statusStyle(status: Goal['status']) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    active:   { bg: 'rgba(13,27,62,0.08)',   text: '#0D1B3E', label: 'Active' },
    at_risk:  { bg: 'rgba(184,50,50,0.08)',  text: '#B83232', label: 'At risk' },
    done:     { bg: 'rgba(30,122,80,0.08)',  text: '#1E7A50', label: 'Done' },
    recovery: { bg: 'rgba(196,122,24,0.08)', text: '#C47A18', label: 'Recovery' },
  };
  return map[status] ?? map.active;
}

function daysLeft(deadline?: string): string | null {
  if (!deadline) return null;
  const diff = (new Date(deadline).getTime() - Date.now()) / 86_400_000;
  if (diff < 0) return 'Overdue';
  if (diff < 1) return `${Math.round(diff * 24)}h left`;
  return `${Math.round(diff)}d left`;
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.goals.list()
      .then(setGoals)
      .finally(() => setLoading(false));
  }, []);

  async function createGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await api.goals.create({ title: newTitle, source: 'manual' });
    setNewTitle('');
    api.goals.list().then(setGoals);
  }

  return (
    <div className="min-h-screen bg-surf-base px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#8C8270' }}>My Goals › Active Journeys</div>
          <h1 className="font-display text-[26px] font-semibold" style={{ color: '#18150F', letterSpacing: '-0.01em' }}>Goals</h1>
        </div>
        <button
          onClick={() => api.sweep.run()}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
          style={{ background: '#0D1B3E', color: '#F5F0E4', border: 'none', boxShadow: '0 2px 8px rgba(13,27,62,0.18)' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1A2D5A')}
          onMouseLeave={e => (e.currentTarget.style.background = '#0D1B3E')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 2v11h3v9l7-12h-4l4-8z" />
          </svg>
          Let the agent run the next step
        </button>
      </div>

      {/* Add goal */}
      <form onSubmit={createGoal} className="flex gap-3 mb-6">
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Add a goal — e.g. 'Prepare for Monday interview'"
          className="flex-1 text-sm px-4 py-3 rounded-xl outline-none transition-all"
          style={{ background: '#FFFFFF', border: '1px solid #E0D8C8', color: '#18150F', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          onFocus={e => (e.currentTarget.style.borderColor = '#0D1B3E')}
          onBlur={e => (e.currentTarget.style.borderColor = '#E0D8C8')}
        />
        <button
          type="submit"
          className="text-sm font-semibold px-5 py-3 rounded-xl transition-all"
          style={{ background: '#0D1B3E', color: '#F5F0E4', boxShadow: '0 2px 8px rgba(13,27,62,0.18)' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1A2D5A')}
          onMouseLeave={e => (e.currentTarget.style.background = '#0D1B3E')}
        >
          Add Goal
        </button>
      </form>

      {/* Goal list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#E0D8C8', borderTopColor: '#0D1B3E' }} />
        </div>
      ) : goals.length === 0 ? (
        <div
          className="rounded-2xl p-16 text-center"
          style={{ background: '#FFFFFF', border: '1px dashed #CFC6B0' }}
        >
          <p className="text-sm" style={{ color: '#8C8270' }}>No goals yet. Add your first deadline above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map(goal => {
            const ss = statusStyle(goal.status);
            const dl = daysLeft(goal.deadline);
            return (
              <button
                key={goal.id}
                onClick={() => navigate(`/goals/${goal.id}`)}
                className="w-full text-left rounded-2xl p-5 transition-all hover:scale-[1.005]"
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${goal.status === 'at_risk' ? 'rgba(184,50,50,0.25)' : '#E0D8C8'}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold leading-snug" style={{ color: '#18150F' }}>{goal.title}</h3>
                    <p className="text-xs mt-1" style={{ color: '#8C8270' }}>
                      {goal.source === 'snap'
                        ? 'Captured via Snap to Plan'
                        : goal.source === 'email'
                        ? 'Detected from email'
                        : 'Manually added'}
                      {goal.deadline && (
                        <> · Due {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {dl && (
                      <span
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(13,27,62,0.07)', color: '#0D1B3E' }}
                      >
                        {dl}
                      </span>
                    )}
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ background: ss.bg, color: ss.text }}
                    >
                      {ss.label}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#CFC6B0">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
