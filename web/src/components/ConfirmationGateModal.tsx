import type { Task } from '@lmls/shared';

interface Props {
  task: Task;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}

export default function ConfirmationGateModal({ task, onApprove, onReject, onClose }: Props) {
  const artifact = task.artifact as Record<string, string> | undefined;
  const isEmail = task.tool === 'gmail' || (artifact && ('to' in artifact || 'subject' in artifact));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(18,12,6,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#FFFFFF', border: '1px solid #E0D8C8', boxShadow: '0 8px 40px rgba(13,27,62,0.14)' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #E0D8C8' }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #0D1B3E 0%, #1A2D5A 100%)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-[15px]" style={{ color: '#18150F' }}>I&apos;m about to do this — okay?</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(196,122,24,0.1)', color: '#C47A18' }}
                >
                  TIER {task.autonomyTier} · NEEDS YOUR APPROVAL
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-3">
          {isEmail && artifact ? (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E0D8C8' }}>
              <div className="px-4 py-2" style={{ background: '#F0EBE0', borderBottom: '1px solid #E0D8C8' }}>
                <div className="flex gap-6 text-xs">
                  <span style={{ color: '#8C8270' }}>To:</span>
                  <span style={{ color: '#3A3628' }}>{artifact['to'] ?? '—'}</span>
                </div>
                <div className="flex gap-2 mt-1 text-xs">
                  <span style={{ color: '#8C8270' }}>Subject:</span>
                  <span className="font-medium" style={{ color: '#18150F' }}>{artifact['subject'] ?? '—'}</span>
                </div>
              </div>
              <div className="px-4 py-3" style={{ background: '#F0EBE0' }}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#3A3628' }}>
                  {artifact['body'] ?? artifact['content'] ?? '(no body)'}
                </p>
                {artifact['agentLabel'] && (
                  <p className="text-[10px] mt-3 text-right" style={{ color: '#8C8270' }}>
                    Agent: {artifact['agentLabel']}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <pre
              className="text-xs rounded-xl p-3 overflow-auto max-h-40"
              style={{ background: '#F0EBE0', color: '#8C8270', border: '1px solid #E0D8C8' }}
            >
              {JSON.stringify(artifact ?? { action: task.title }, null, 2)}
            </pre>
          )}

          {task.description && (
            <div
              className="rounded-xl px-3 py-2.5 flex gap-2"
              style={{ background: '#FAF8F3', border: '1px solid #E0D8C8' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#8C8270" className="shrink-0 mt-0.5">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <p className="text-xs leading-relaxed" style={{ color: '#8C8270' }}>
                <span className="font-medium" style={{ color: '#0D1B3E' }}>Why I&apos;m doing this: </span>
                {task.description}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-2">
          <button
            onClick={onApprove}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
            style={{ background: '#0D1B3E', color: '#F5F0E4', border: 'none', boxShadow: '0 2px 10px rgba(13,27,62,0.2)' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1A2D5A')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0D1B3E')}
          >
            Approve &amp; send ✓
          </button>
          <div className="flex gap-2">
            <button
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: '#FAF8F3', color: '#8C8270', border: '1px solid #E0D8C8' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F0EBE0')}
              onMouseLeave={e => (e.currentTarget.style.background = '#FAF8F3')}
              onClick={onClose}
            >
              ✎ Edit first
            </button>
            <button
              onClick={onReject}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: '#FAF8F3', color: '#8C8270', border: '1px solid #E0D8C8' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F0EBE0')}
              onMouseLeave={e => (e.currentTarget.style.background = '#FAF8F3')}
            >
              × Reject
            </button>
          </div>
          <p className="text-center text-[10px] uppercase tracking-widest mt-1" style={{ color: '#8C8270' }}>
            Nothing is sent until you approve.
          </p>
        </div>
      </div>
    </div>
  );
}
