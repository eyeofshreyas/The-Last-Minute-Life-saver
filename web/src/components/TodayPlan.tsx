import type { Task } from '@lmls/shared';
import { api } from '../lib/api';

interface Props {
  tasks: Task[];
}

function dotColor(task: Task): string {
  if (task.status === 'done') return '#1E7A50';
  if (task.status === 'awaiting_confirm' || (task.riskScore ?? 0) >= 70) return '#B83232';
  if ((task.riskScore ?? 0) >= 40) return '#C47A18';
  return '#0D1B3E';
}

function blockStyle(task: Task): React.CSSProperties {
  if (task.status === 'done') return {};
  if (task.status === 'awaiting_confirm' || (task.riskScore ?? 0) >= 70)
    return { background: 'rgba(184,50,50,0.06)', borderLeft: '3px solid #B83232' };
  if ((task.riskScore ?? 0) >= 40)
    return { background: 'rgba(196,122,24,0.06)', borderLeft: '3px solid #C47A18' };
  return { background: 'rgba(13,27,62,0.05)', borderLeft: '3px solid #0D1B3E' };
}

function blockSubtitle(task: Task): string | null {
  if (task.status === 'awaiting_confirm') return 'Pending your response';
  if (task.status === 'drafted') return 'Draft ready';
  if (task.tool === 'gmail') return 'AI Guided Session';
  return null;
}

export default function TodayPlan({ tasks }: Props) {
  const todayTasks = tasks
    .filter(t => {
      const d = new Date(t.due);
      const now = new Date();
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    })
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());

  return (
    <div
      className="rounded-2xl p-5 h-full"
      style={{ background: '#FFFFFF', border: '1px solid #E0D8C8', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
    >
      <div className="flex justify-between items-center mb-4">
        <span className="font-display font-semibold text-base" style={{ color: '#18150F' }}>Today&apos;s plan</span>
        <button
          onClick={() => api.sweep.run()}
          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
          style={{ background: 'rgba(13,27,62,0.06)', color: '#0D1B3E', border: '1px solid rgba(13,27,62,0.12)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(13,27,62,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(13,27,62,0.06)')}
        >
          Fix my week
        </button>
      </div>

      <div className="space-y-1">
        {todayTasks.map(t => {
          const sub = blockSubtitle(t);
          const dColor = dotColor(t);
          return (
            <div key={t.id} className="flex gap-2.5 items-start">
              <div className="shrink-0 pt-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: t.status === 'done' ? 'transparent' : dColor,
                    border: `2px solid ${dColor}`,
                  }}
                />
              </div>
              <div className="flex-1 rounded-lg px-3 py-2 mb-1" style={blockStyle(t)}>
                <div className="text-[10px] mb-0.5" style={{ color: '#8C8270' }}>
                  {new Date(t.due).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div
                  className="text-xs font-medium"
                  style={{ color: t.status === 'done' ? '#8C8270' : '#18150F' }}
                >
                  {t.title}
                </div>
                {sub && (
                  <div className="text-[10px] mt-0.5" style={{ color: dColor }}>
                    {sub}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {todayTasks.length === 0 && (
          <p className="text-xs py-4 text-center" style={{ color: '#8C8270' }}>
            No tasks scheduled for today.
          </p>
        )}
      </div>

      {todayTasks.length > 0 && (
        <div
          className="mt-4 rounded-xl px-3 py-3 flex gap-2"
          style={{ background: 'rgba(13,27,62,0.05)', border: '1px solid rgba(13,27,62,0.1)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#8C8270" className="shrink-0 mt-0.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1-8h-2V7h2v2z" />
          </svg>
          <p className="text-[10px] leading-relaxed italic" style={{ color: '#8C8270' }}>
            &ldquo;Your peak cognitive window is closing in 4 hours. Prioritize the assignment now to avoid late-night burnout.&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
