import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Goal, Task } from '@lmls/shared';
import { api } from '../lib/api';
import ConfirmationGateModal from '../components/ConfirmationGateModal';

function timeLeft(deadline?: string): string {
  if (!deadline) return '';
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms < 0) return 'Overdue';
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  return days > 0 ? `${days}d ${hours}h remaining` : `${hours}h remaining`;
}

function taskStatusStyle(status: Task['status']) {
  if (status === 'done') return { color: '#1E7A50', bg: 'rgba(30,122,80,0.08)' };
  if (status === 'awaiting_confirm') return { color: '#C47A18', bg: 'rgba(196,122,24,0.08)' };
  if (status === 'drafted') return { color: '#2A4080', bg: 'rgba(42,64,128,0.08)' };
  return { color: '#8C8270', bg: 'transparent' };
}

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  async function refresh() {
    if (!id) return;
    const data = await api.goals.get(id);
    setGoal(data.goal);
    setTasks(data.tasks);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [id]);

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

  if (!goal) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surf-base text-sm" style={{ color: '#8C8270' }}>
        Goal not found.
      </div>
    );
  }

  const isOverloaded = goal.status === 'at_risk' || goal.status === 'recovery';
  const tl = timeLeft(goal.deadline);

  return (
    <div className="min-h-screen bg-surf-base px-8 py-8">
      {activeTask && (
        <ConfirmationGateModal
          task={activeTask}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setActiveTask(null)}
        />
      )}

      {/* Breadcrumb + CTA */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/goals')}
          className="text-xs uppercase tracking-widest flex items-center gap-1 transition-opacity hover:opacity-70"
          style={{ color: '#8C8270' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
          </svg>
          My Goals
        </button>
        <button
          onClick={() => api.sweep.run().then(refresh)}
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

      {/* Goal header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold mb-3 leading-tight" style={{ color: '#18150F', letterSpacing: '-0.01em' }}>{goal.title}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {tl && (
            <span
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
              style={{ background: '#FAF8F3', border: '1px solid #E0D8C8', color: '#8C8270' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
              </svg>
              {tl}
            </span>
          )}
          {isOverloaded ? (
            <span
              className="text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded-full uppercase"
              style={{ background: 'rgba(184,50,50,0.08)', color: '#B83232' }}
            >
              Recovery Mode
            </span>
          ) : (
            <span
              className="text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded-full uppercase"
              style={{ background: 'rgba(13,27,62,0.08)', color: '#0D1B3E' }}
            >
              {goal.status}
            </span>
          )}
        </div>
      </div>

      {/* Overload alert */}
      {isOverloaded && (
        <div
          className="rounded-2xl p-4 mb-6 flex items-start gap-3"
          style={{ background: 'rgba(184,50,50,0.04)', border: '1px solid rgba(184,50,50,0.18)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#B83232" className="shrink-0 mt-0.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold mb-0.5" style={{ color: '#18150F' }}>High Overload Detected</p>
            <p className="text-xs" style={{ color: '#8C8270' }}>
              The current timeline is at risk. Select a triage option to rebalance your workload.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {['Drop', 'Delegate to agent', 'Request extension'].map(label => (
              <button
                key={label}
                onClick={() => label === 'Delegate to agent' && api.sweep.run().then(refresh)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                style={{ background: '#FAF8F3', color: '#3A3628', border: '1px solid #E0D8C8' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F0EBE0')}
                onMouseLeave={e => (e.currentTarget.style.background = '#FAF8F3')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Task timeline */}
      <div className="space-y-0">
        {tasks
          .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
          .map((task, i) => {
            const isDone = task.status === 'done';
            const isActive = task.status === 'awaiting_confirm' || task.status === 'drafted';
            const ss = taskStatusStyle(task.status);

            return (
              <div key={task.id} className="flex gap-4 relative">
                {i < tasks.length - 1 && (
                  <div className="absolute left-[15px] top-8 bottom-0 w-px" style={{ background: '#E0D8C8' }} />
                )}

                <div className="shrink-0 mt-5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                    style={{
                      background: isDone ? 'rgba(30,122,80,0.08)' : isActive ? '#FAF8F3' : '#F6F2EA',
                      borderColor: isDone ? '#1E7A50' : isActive ? '#0D1B3E' : '#E0D8C8',
                    }}
                  >
                    {isDone ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#1E7A50">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    ) : (
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: isActive ? '#0D1B3E' : '#E0D8C8' }}
                      />
                    )}
                  </div>
                </div>

                <div className="flex-1 pb-5 pt-4">
                  {isDone ? (
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm line-through" style={{ color: '#8C8270' }}>{task.title}</span>
                        <span className="text-xs ml-2 uppercase tracking-wider" style={{ color: '#8C8270' }}>
                          Completed
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: '#8C8270' }}>Done</span>
                    </div>
                  ) : (
                    <div
                      className="rounded-2xl p-4"
                      style={{
                        background: isActive ? '#FFFFFF' : '#FAF8F3',
                        border: `1px solid ${isActive ? '#E0D8C8' : '#E0D8C8'}`,
                        boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.05)' : 'none',
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {task.tool === 'gmail' && (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="#8C8270">
                              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                            </svg>
                          )}
                          <span className="text-sm font-medium" style={{ color: '#18150F' }}>{task.title}</span>
                        </div>
                      </div>

                      {isActive && (
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full uppercase"
                            style={{ background: ss.bg, color: ss.color }}
                          >
                            {task.status === 'awaiting_confirm' ? 'Awaiting your approval' : 'Draft ready'}
                          </span>
                          {task.riskScore !== undefined && task.riskScore > 0 && (
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(196,122,24,0.08)', color: '#C47A18' }}
                            >
                              {task.riskScore}% risk
                            </span>
                          )}
                        </div>
                      )}

                      {task.status === 'awaiting_confirm' && task.artifact && (
                        <div
                          className="rounded-xl p-3 mt-3 mb-3"
                          style={{ background: '#F0EBE0', border: '1px solid #E0D8C8' }}
                        >
                          {(() => {
                            const a = task.artifact as Record<string, string>;
                            return (
                              <>
                                {a['subject'] && (
                                  <div className="text-xs font-medium mb-1" style={{ color: '#3A3628' }}>
                                    {a['subject']}
                                  </div>
                                )}
                                <p className="text-xs leading-relaxed" style={{ color: '#8C8270' }}>
                                  {(a['body'] ?? a['content'] ?? '').slice(0, 150)}
                                  {(a['body'] ?? a['content'] ?? '').length > 150 ? '…' : ''}
                                </p>
                                <div className="text-[10px] mt-2 text-right" style={{ color: '#8C8270' }}>
                                  Agent: Lifesaver-Beta
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}

                      {task.status === 'awaiting_confirm' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => setActiveTask(task)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                            style={{ background: '#0D1B3E', color: '#F5F0E4', border: 'none', boxShadow: '0 2px 8px rgba(13,27,62,0.18)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#1A2D5A')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#0D1B3E')}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                            Approve
                          </button>
                          <button
                            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                            style={{ background: '#FAF8F3', color: '#3A3628', border: '1px solid #E0D8C8' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#F0EBE0')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#FAF8F3')}
                            onClick={() => { if (task.artifact) setActiveTask(task); }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => api.confirmations.reject(task.id).then(refresh)}
                            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                            style={{ background: '#FAF8F3', color: '#3A3628', border: '1px solid #E0D8C8' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#F0EBE0')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#FAF8F3')}
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {task.status === 'drafted' && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(42,64,128,0.08)', color: '#2A4080' }}
                          >
                            DRAFTED
                          </span>
                          {task.tool && task.tool !== 'none' && (
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
                              style={{ background: '#FAF8F3', color: '#8C8270', border: '1px solid #E0D8C8' }}
                            >
                              📎 {task.tool === 'gmail' ? 'Study sheet ready' : `${task.tool} ready`}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        {tasks.length === 0 && (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: '#FFFFFF', border: '1px dashed #CFC6B0' }}
          >
            <p className="text-sm" style={{ color: '#8C8270' }}>Agent is planning tasks for this goal…</p>
          </div>
        )}
      </div>
    </div>
  );
}
