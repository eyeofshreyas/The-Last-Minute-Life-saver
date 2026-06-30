import { useEffect, useState } from 'react';
import type { AuditEntry } from '@lmls/shared';
import { api } from '../lib/api';

type Filter = 'all' | 'actions' | 'awaiting';
type Outcome = AuditEntry['outcome'];
type Actor = AuditEntry['actor'];

function actorStyle(actor: Actor): { bg: string; text: string; label: string } {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    planner:  { bg: 'rgba(13,27,62,0.08)',   text: '#0D1B3E', label: 'PLANNER' },
    executor: { bg: 'rgba(42,64,128,0.08)',  text: '#2A4080', label: 'EXECUTOR' },
    critic:   { bg: 'rgba(196,122,24,0.08)', text: '#C47A18', label: 'CRITIC' },
    user:     { bg: 'rgba(140,130,112,0.1)', text: '#3A3628', label: 'YOU' },
  };
  return map[actor] ?? map.planner;
}

function outcomeStyle(outcome: Outcome): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    approved:  { bg: 'rgba(30,122,80,0.08)',  text: '#1E7A50' },
    committed: { bg: 'rgba(42,64,128,0.08)',  text: '#2A4080' },
    rejected:  { bg: 'rgba(184,50,50,0.08)',  text: '#B83232' },
    proposed:  { bg: 'rgba(140,130,112,0.1)', text: '#8C8270' },
    error:     { bg: 'rgba(184,50,50,0.08)',  text: '#B83232' },
  };
  return map[outcome] ?? map.proposed;
}

function groupByDate(entries: AuditEntry[]): { label: string; items: AuditEntry[] }[] {
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86_400_000).toDateString();
  const groups: Record<string, AuditEntry[]> = {};

  for (const e of entries) {
    const d = new Date(e.ts).toDateString();
    const label = d === today ? 'Today' : d === yesterday ? 'Yesterday' : new Date(e.ts).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    if (!groups[label]) groups[label] = [];
    groups[label].push(e);
  }

  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

export default function Activity() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.audit.list()
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const filtered = entries.filter(e => {
    if (filter === 'actions') return e.outcome === 'committed' || e.outcome === 'approved';
    if (filter === 'awaiting') return e.outcome === 'proposed';
    return true;
  });

  const groups = groupByDate(filtered);

  return (
    <div className="min-h-screen bg-surf-base px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <h1 className="font-display text-[26px] font-semibold" style={{ color: '#18150F', letterSpacing: '-0.01em' }}>
          Activity &amp; Audit Log
        </h1>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
          style={{ background: '#FFFFFF', border: '1px solid #E0D8C8', minWidth: 180, color: '#8C8270', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#8C8270">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          Search audit trail…
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex justify-between items-center mb-6">
        <div
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: '#FFFFFF', border: '1px solid #E0D8C8', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          {(['all', 'actions', 'awaiting'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize"
              style={{
                background: filter === f ? '#0D1B3E' : 'transparent',
                color: filter === f ? '#F5F0E4' : '#8C8270',
                border: 'none',
              }}
            >
              {f === 'all' ? 'All' : f === 'actions' ? 'Actions taken' : 'Awaiting you'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: '#8C8270' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          Audit history is preserved for 90 days.
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#E0D8C8', borderTopColor: '#0D1B3E' }} />
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: '#FFFFFF', border: '1px dashed #CFC6B0' }}>
          <p className="text-sm" style={{ color: '#8C8270' }}>No activity yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(({ label, items }) => (
            <div key={label}>
              <h2 className="text-sm font-semibold mb-3" style={{ color: '#3A3628' }}>{label}</h2>
              <div className="space-y-2">
                {items.map((entry, i) => {
                  const as = actorStyle(entry.actor);
                  const os = outcomeStyle(entry.outcome);
                  const isExpanded = expanded.has(entry.id);
                  const hasDetail = !!entry.toolCall;

                  return (
                    <div key={entry.id} className="flex gap-4 relative">
                      {i < items.length - 1 && (
                        <div
                          className="absolute left-[15px] top-8 bottom-0 w-px"
                          style={{ background: '#E0D8C8' }}
                        />
                      )}

                      <div className="shrink-0 mt-4">
                        <div
                          className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                          style={{ background: as.bg, borderColor: as.text + '40', color: as.text }}
                        >
                          {as.label[0]}
                        </div>
                      </div>

                      <div
                        className="flex-1 rounded-xl transition-all"
                        style={{ background: '#FFFFFF', border: '1px solid #E0D8C8', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                      >
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs whitespace-nowrap" style={{ color: '#8C8270' }}>
                              {new Date(entry.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span
                              className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full shrink-0"
                              style={{ background: as.bg, color: as.text }}
                            >
                              {as.label}
                            </span>
                            <span className="text-sm truncate" style={{ color: '#3A3628' }}>{entry.action}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <span
                              className="text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded-full uppercase"
                              style={{ background: os.bg, color: os.text }}
                            >
                              {entry.outcome}
                            </span>
                            {hasDetail && (
                              <button
                                onClick={() => toggleExpand(entry.id)}
                                style={{ color: '#8C8270' }}
                                className="hover:opacity-70 transition-opacity"
                              >
                                <svg
                                  width="14" height="14" viewBox="0 0 24 24" fill="currentColor"
                                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                                >
                                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>

                        {isExpanded && hasDetail && (
                          <div className="px-4 pb-3 pt-0" style={{ borderTop: '1px solid #E0D8C8' }}>
                            <pre
                              className="text-xs rounded-lg p-3 mt-2 overflow-auto max-h-40"
                              style={{ background: '#F0EBE0', color: '#8C8270' }}
                            >
                              {JSON.stringify(entry.toolCall, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
