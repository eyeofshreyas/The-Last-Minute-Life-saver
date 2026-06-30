import { useState } from 'react';
import { getIdToken } from '../lib/auth';

interface Props {
  onGoalsCreated: () => void;
}

export default function SnapToPlan({ onGoalsCreated }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setResult(null);
    try {
      const token = await getIdToken();
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/snap', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? `Upload failed (${res.status})`);
      }
      const data = await res.json() as { count: number };
      setResult(`Created ${data.count} goal${data.count !== 1 ? 's' : ''} from image`);
      onGoalsCreated();
    } catch (err) {
      setResult(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
      }}
      className="rounded-xl p-5 text-center transition-all"
      style={{
        background: dragging ? 'rgba(107,95,216,0.08)' : '#12111F',
        border: `1px dashed ${dragging ? '#6B5FD8' : '#2C2949'}`,
      }}
    >
      {uploading ? (
        <div className="flex items-center justify-center gap-2 py-1">
          <div className="w-4 h-4 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
          <span className="text-sm" style={{ color: '#9690F0' }}>
            Extracting deadlines with Gemini Vision…
          </span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#6B5FD8">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            <span className="text-sm font-medium text-brand-300">Snap-to-Plan</span>
          </div>
          <p className="text-muted text-xs mb-3">
            Drop a syllabus, bill, or screenshot — Gemini extracts the deadlines
          </p>
          <label className="cursor-pointer text-xs font-medium transition-colors" style={{ color: '#6B5FD8' }}>
            <span className="hover:text-brand-500">Browse file to upload</span>
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
        </>
      )}
      {result && (
        <p className="mt-3 text-xs font-medium" style={{ color: result.startsWith('Failed') ? '#FFB4AB' : '#6FE0A0' }}>
          {result}
        </p>
      )}
    </div>
  );
}
