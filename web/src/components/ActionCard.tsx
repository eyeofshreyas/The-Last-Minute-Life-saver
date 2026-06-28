import type { Task } from '@lmls/shared';

interface Props {
  task: Task;
  onOpenDraft: () => void;
  onDismiss: () => void;
}

function severity(task: Task): 'CRITICAL' | 'AT RISK' | 'SAFE' {
  const score = task.riskScore ?? 0;
  if (score >= 70) return 'CRITICAL';
  if (score >= 40) return 'AT RISK';
  return 'SAFE';
}

function severityStyle(s: 'CRITICAL' | 'AT RISK' | 'SAFE') {
  if (s === 'CRITICAL') return { bg: 'rgba(184,50,50,0.08)', text: '#B83232', border: 'rgba(184,50,50,0.22)' };
  if (s === 'AT RISK')  return { bg: 'rgba(196,122,24,0.08)', text: '#C47A18', border: 'rgba(196,122,24,0.22)' };
  return { bg: 'rgba(30,122,80,0.08)', text: '#1E7A50', border: 'rgba(30,122,80,0.22)' };
}

function contextLine(task: Task): string {
  const hoursLeft = (new Date(task.due).getTime() - Date.now()) / 3_600_000;
  const timeStr =
    hoursLeft < 1
      ? 'Due in < 1 hour'
      : hoursLeft < 24
      ? `Due in ${Math.round(hoursLeft)} hours`
      : hoursLeft < 48
      ? 'Due tomorrow'
      : `Due ${new Date(task.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  const readyStr =
    task.status === 'drafted'
      ? '· Draft Ready'
      : task.status === 'awaiting_confirm'
      ? '· Awaiting approval'
      : '';

  return `${timeStr}${readyStr}`;
}

function primaryLabel(task: Task): string {
  if (task.tool === 'gmail') return 'Open the draft';
  if (task.tool === 'calendar') return 'Reschedule';
  return 'Review & approve';
}

function secondaryLabel(task: Task): string {
  if (task.tool === 'calendar') return 'View Calendar';
  return 'Dismiss';
}

function actionDescription(task: Task): string {
  if (task.artifact) {
    const a = task.artifact as Record<string, string>;
    if (a['body']) return String(a['body']).slice(0, 120);
    if (a['description']) return String(a['description']).slice(0, 120);
  }
  return task.description ?? task.title;
}

export default function ActionCard({ task, onOpenDraft, onDismiss }: Props) {
  const sev = severity(task);
  const style = severityStyle(sev);

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: '#FFFFFF', border: `1px solid ${style.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      {/* Header row */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#8C8270">
            <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
          </svg>
          <span className="text-xs" style={{ color: '#8C8270' }}>{contextLine(task)}</span>
        </div>
        <span
          className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full"
          style={{ background: style.bg, color: style.text }}
        >
          {sev}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed mb-4" style={{ color: '#3A3628' }}>{actionDescription(task)}</p>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenDraft}
          className="text-sm font-semibold px-4 py-2 rounded-xl transition-all active:scale-95"
          style={{ background: '#0D1B3E', color: '#F5F0E4', border: 'none', boxShadow: '0 2px 8px rgba(13,27,62,0.18)' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1A2D5A')}
          onMouseLeave={e => (e.currentTarget.style.background = '#0D1B3E')}
        >
          {primaryLabel(task)}
        </button>
        <button
          onClick={onDismiss}
          className="text-sm font-medium px-4 py-2 rounded-xl transition-all"
          style={{ color: '#8C8270', border: '1px solid #E0D8C8', background: 'transparent' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#FAF8F3')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {secondaryLabel(task)}
        </button>
      </div>
    </div>
  );
}
