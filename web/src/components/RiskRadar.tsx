import type { Task } from '@lmls/shared';

interface Props {
  tasks: Task[];
}

const DAY_START = 8;
const DAY_HOURS = 14;

function riskColor(score: number) {
  if (score >= 70) return '#B83232';
  if (score >= 40) return '#C47A18';
  return '#1E7A50';
}

function hoursUntilDue(due: string): number {
  return (new Date(due).getTime() - Date.now()) / 3_600_000;
}

function timePosition(due: string): number {
  const hour = new Date(due).getHours() + new Date(due).getMinutes() / 60;
  return Math.max(0, Math.min(100, ((hour - DAY_START) / DAY_HOURS) * 100));
}

export default function RiskRadar({ tasks }: Props) {
  const today = tasks.filter(t => {
    const d = new Date(t.due);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  });

  const critical = today
    .filter(t => (t.riskScore ?? 0) >= 70)
    .sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0))[0];

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: '#FFFFFF', border: '1px solid #E0D8C8', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
    >
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#0D1B3E">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
          </svg>
          <span className="font-semibold text-sm" style={{ color: '#18150F' }}>Deadline Risk Radar</span>
        </div>
        <span className="text-xs" style={{ color: '#8C8270' }}>Updated just now</span>
      </div>

      {/* Timeline */}
      <div className="relative" style={{ height: 72 }}>
        <div
          className="absolute rounded-full"
          style={{ top: 40, left: 0, right: 0, height: 1, background: '#E0D8C8' }}
        />

        {critical && (
          <div
            className="absolute"
            style={{ left: `${timePosition(critical.due)}%`, transform: 'translateX(-50%)', top: 0 }}
          >
            <div
              className="rounded-lg px-2.5 py-1.5 text-center whitespace-nowrap"
              style={{ background: 'rgba(184,50,50,0.06)', border: '1px solid rgba(184,50,50,0.2)' }}
            >
              <div className="text-[10px] font-semibold tracking-wider" style={{ color: '#B83232' }}>
                CRITICAL RISK
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#3A3628' }}>
                {critical.title.length > 18 ? critical.title.slice(0, 18) + '…' : critical.title}
                {' '}({Math.round(hoursUntilDue(critical.due))}h)
              </div>
            </div>
            <div
              className="mx-auto"
              style={{
                width: 0, height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid rgba(184,50,50,0.2)',
              }}
            />
          </div>
        )}

        {today.map(t => {
          const score = t.riskScore ?? 0;
          const color = riskColor(score);
          const pos = timePosition(t.due);
          const isCritical = t.id === critical?.id;
          return (
            <div
              key={t.id}
              title={`${t.title} — ${score}% risk`}
              className="absolute rounded-full transition-transform hover:scale-110 cursor-default"
              style={{
                left: `${pos}%`,
                top: isCritical ? 33 : 34,
                transform: 'translateX(-50%)',
                width: isCritical ? 16 : 10,
                height: isCritical ? 16 : 10,
                background: color,
                boxShadow: isCritical ? `0 0 10px ${color}60` : undefined,
                zIndex: isCritical ? 2 : 1,
              }}
            />
          );
        })}

        {critical && (
          <div
            className="absolute text-[10px]"
            style={{ left: `${timePosition(critical.due)}%`, top: 56, transform: 'translateX(-50%)', color: '#8C8270' }}
          >
            {new Date(critical.due).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      {today.length === 0 && (
        <p className="text-center text-xs py-2" style={{ color: '#8C8270' }}>No tasks due today.</p>
      )}
    </div>
  );
}
