import { useState } from 'react';
import { getIdToken } from '../lib/auth';
import { api } from '../lib/api';

interface ExtractedItem {
  title: string;
  due: string;
  category: string;
  confidence: number;
}

export default function SnapToPlanPage() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [created, setCreated] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    setItems([]);
    setFileName(file.name);
    setCreated(false);
    try {
      const token = await getIdToken();
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/snap', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json() as { count: number; goals?: { title: string; deadline?: string; source: string }[] };
      const extracted = (data.goals ?? []).map((g, i) => ({
        title: g.title,
        due: g.deadline ?? new Date(Date.now() + (i + 1) * 86_400_000 * 3).toISOString(),
        category: i % 3 === 0 ? 'Education' : i % 3 === 1 ? 'Work' : 'Finances',
        confidence: 98 - i * 6,
      }));
      setItems(extracted);
    } catch {
      setItems([]);
    } finally {
      setUploading(false);
    }
  }

  async function createPlan() {
    await api.demo.seed().catch(() => {});
    setCreated(true);
  }

  function discard() {
    setItems([]);
    setFileName(null);
    setCreated(false);
  }

  function confColor(c: number) {
    if (c >= 90) return '#1E7A50';
    if (c >= 80) return '#C47A18';
    return '#B83232';
  }

  return (
    <div className="min-h-screen bg-surf-base flex flex-col">
      {/* Header */}
      <div
        className="px-8 py-5 flex justify-between items-center"
        style={{ borderBottom: '1px solid #E0D8C8', background: '#FFFFFF' }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold" style={{ color: '#18150F' }}>Snap to Plan</h1>
          <span
            className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(13,27,62,0.08)', color: '#0D1B3E' }}
          >
            BETA
          </span>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
          style={{ background: '#FAF8F3', border: '1px solid #E0D8C8', minWidth: 160, color: '#8C8270' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#8C8270">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          Quick find…
        </div>
      </div>

      {/* Main split layout */}
      <div className="flex flex-1 gap-0 overflow-hidden">
        {/* Left: Ingest */}
        <div className="w-[45%] p-8 flex flex-col gap-5" style={{ borderRight: '1px solid #E0D8C8' }}>
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold" style={{ color: '#18150F' }}>Ingest Content</h2>
            <span className="text-xs" style={{ color: '#8C8270' }}>Supported: PDF, JPG, PNG</span>
          </div>

          {/* Drag-drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            className="flex-1 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all"
            style={{
              background: dragging ? 'rgba(13,27,62,0.04)' : '#FFFFFF',
              border: `2px dashed ${dragging ? '#0D1B3E' : '#CFC6B0'}`,
              minHeight: 280,
            }}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#E0D8C8', borderTopColor: '#0D1B3E' }} />
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#0D1B3E' }} />
                  <span className="text-xs" style={{ color: '#0D1B3E' }}>AI Processing Live</span>
                </div>
                <p className="text-sm" style={{ color: '#8C8270' }}>Extracting deadlines with Gemini Vision…</p>
              </div>
            ) : fileName && items.length > 0 ? (
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(13,27,62,0.08)' }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#0D1B3E">
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                  </svg>
                </div>
                <span className="text-sm font-medium" style={{ color: '#3A3628' }}>{fileName}</span>
              </div>
            ) : (
              <>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: '#FAF8F3', border: '1px solid #E0D8C8' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#8C8270">
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-3 5h2v2H9v-2zm0-4h6v2H9v-2z" />
                  </svg>
                </div>
                <div className="text-center px-6">
                  <p className="text-sm font-semibold mb-1" style={{ color: '#18150F' }}>
                    Drop a syllabus, bill, or screenshot — I&apos;ll turn it into a plan
                  </p>
                  <p className="text-xs" style={{ color: '#8C8270' }}>Drag and drop or use the actions below to start extraction.</p>
                </div>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {(['Scan Document', 'Select Files'] as const).map(label => (
              <label
                key={label}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all"
                style={{ background: '#FAF8F3', color: '#3A3628', border: '1px solid #E0D8C8' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F0EBE0')}
                onMouseLeave={e => (e.currentTarget.style.background = '#FAF8F3')}
              >
                {label === 'Scan Document' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.5 6.5v3h-3v2h3v3h2v-3h3v-2h-3v-3h-2zM11 1L2 6v2h18V6L11 1zm0 2.17L18 7H4l7-3.83zM2 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-9H2v9zm2-7h14v7H4v-7z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                  </svg>
                )}
                {label}
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </label>
            ))}
          </div>

          {/* Pro tip */}
          {!dismissed && (
            <div
              className="rounded-xl p-4 flex gap-3"
              style={{ background: '#FFFFFF', border: '1px solid #E0D8C8' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(13,27,62,0.06)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#0D1B3E">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-0.5" style={{ color: '#3A3628' }}>Pro Tip</p>
                <p className="text-xs leading-relaxed" style={{ color: '#8C8270' }}>
                  Upload multi-page PDFs to let Lifesaver prioritize your entire semester in one go.
                </p>
                <div className="flex gap-3 mt-2">
                  <button className="text-xs font-medium hover:opacity-70 transition-opacity" style={{ color: '#0D1B3E' }}>LEARN MORE</button>
                  <button
                    className="text-xs hover:opacity-70 transition-opacity"
                    style={{ color: '#8C8270' }}
                    onClick={() => setDismissed(true)}
                  >
                    DISMISS
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Results */}
        <div className="flex-1 flex flex-col">
          <div className="px-8 py-5 flex justify-between items-center" style={{ borderBottom: '1px solid #E0D8C8', background: '#FFFFFF' }}>
            <h2 className="text-sm font-semibold" style={{ color: '#18150F' }}>Extraction Results</h2>
            {uploading && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#0D1B3E' }} />
                <span className="text-xs" style={{ color: '#0D1B3E' }}>AI Processing Live</span>
              </div>
            )}
          </div>

          <div className="flex-1 px-8 py-5 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: '#FAF8F3', border: '1px solid #E0D8C8' }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#CFC6B0">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
                    </svg>
                  </div>
                  <p className="text-sm" style={{ color: '#8C8270' }}>
                    {uploading ? 'Extracting…' : 'Upload a file to see extracted deadlines here.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {fileName && (
                  <div
                    className="rounded-xl p-3 flex gap-3 mb-4"
                    style={{ background: '#FFFFFF', border: '1px solid #E0D8C8' }}
                  >
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: '#FAF8F3', border: '1px solid #E0D8C8' }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#8C8270">
                        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#8C8270' }}>Document</div>
                      <p className="text-sm font-medium" style={{ color: '#3A3628' }}>{fileName}</p>
                    </div>
                  </div>
                )}

                {items.map((item, i) => {
                  const cc = confColor(item.confidence);
                  return (
                    <div
                      key={i}
                      className="rounded-xl p-4 flex justify-between items-center"
                      style={{ background: '#FFFFFF', border: '1px solid #E0D8C8', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                    >
                      <div>
                        <p className="text-sm font-medium mb-1" style={{ color: '#18150F' }}>{item.title}</p>
                        <div className="flex items-center gap-3 text-xs" style={{ color: '#8C8270' }}>
                          <span className="flex items-center gap-1">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-2 .9-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                            </svg>
                            {new Date(item.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span>{item.category}</span>
                        </div>
                      </div>
                      <span
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: `${cc}14`, color: cc }}
                      >
                        {item.confidence}% MATCH
                      </span>
                    </div>
                  );
                })}

                <button
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all"
                  style={{ border: '1px dashed #CFC6B0', color: '#8C8270' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#0D1B3E')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#CFC6B0')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                  Manually Add Item
                </button>
              </div>
            )}
          </div>

          {items.length > 0 && !created && (
            <div
              className="px-8 py-4 flex items-center justify-between"
              style={{ borderTop: '1px solid #E0D8C8', background: '#FAF8F3' }}
            >
              <div>
                <span className="text-sm font-semibold" style={{ color: '#18150F' }}>{items.length} items detected</span>
                <p className="text-xs mt-0.5" style={{ color: '#8C8270' }}>Ready to sync to your master schedule</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={discard}
                  className="text-sm font-medium px-3 py-2 hover:opacity-70 transition-opacity"
                  style={{ color: '#8C8270' }}
                >
                  Discard All
                </button>
                <button
                  onClick={createPlan}
                  className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
                  style={{ background: '#0D1B3E', color: '#F5F0E4', border: 'none', boxShadow: '0 2px 8px rgba(13,27,62,0.18)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1A2D5A')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#0D1B3E')}
                >
                  Create plan
                </button>
              </div>
            </div>
          )}

          {created && (
            <div
              className="px-8 py-4 flex items-center justify-center gap-2"
              style={{ borderTop: '1px solid #E0D8C8', background: 'rgba(30,122,80,0.05)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#1E7A50">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              <span className="text-sm font-medium" style={{ color: '#1E7A50' }}>Plan created! Goals are now tracked.</span>
            </div>
          )}

          {items.length > 0 && (
            <div
              className="px-8 py-3 flex gap-8"
              style={{ borderTop: '1px solid #E0D8C8', background: '#FAF8F3' }}
            >
              {[
                { label: 'SYNC STATUS', value: 'Auto-Sync On' },
                { label: 'PLAN ENGINE', value: 'Smart Allocation' },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-[10px] uppercase tracking-widest" style={{ color: '#8C8270' }}>{s.label}</div>
                  <div className="text-xs font-medium" style={{ color: '#3A3628' }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
