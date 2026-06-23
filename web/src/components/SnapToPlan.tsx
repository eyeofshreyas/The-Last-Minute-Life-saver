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
      const data = await res.json() as { count: number };
      setResult(`Created ${data.count} goal${data.count !== 1 ? 's' : ''} from image`);
      onGoalsCreated();
    } catch (_err) {
      setResult('Failed to process image');
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
      className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${dragging ? 'border-brand-500 bg-brand-900/20' : 'border-gray-700 hover:border-gray-600'}`}
    >
      {uploading ? (
        <div className="text-brand-400 animate-pulse">Extracting deadlines with Gemini Vision...</div>
      ) : (
        <>
          <div className="text-gray-400 text-sm mb-2">Snap-to-Plan</div>
          <div className="text-gray-600 text-xs mb-3">Drop a syllabus, bill, or screenshot</div>
          <label className="cursor-pointer text-brand-500 hover:text-brand-400 text-sm underline">
            or click to upload
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
      {result && <div className="mt-3 text-sm text-green-400">{result}</div>}
    </div>
  );
}
