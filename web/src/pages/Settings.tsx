import type { User } from 'firebase/auth';
import { signOutUser } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

interface Props { user: User }

export default function Settings({ user }: Props) {
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOutUser();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-surf-base px-8 py-8 max-w-xl">
      <h1 className="font-display text-[26px] font-semibold mb-8" style={{ color: '#18150F', letterSpacing: '-0.01em' }}>Settings</h1>

      {/* Profile card */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: '#FFFFFF', border: '1px solid #E0D8C8', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#8C8270' }}>Account</h2>
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full" style={{ border: '2px solid #E0D8C8' }} />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
              style={{ background: '#0D1B3E', color: '#C8A84B' }}
            >
              {(user.displayName ?? user.email ?? 'U')[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold" style={{ color: '#18150F' }}>{user.displayName ?? '—'}</p>
            <p className="text-sm" style={{ color: '#8C8270' }}>{user.email}</p>
          </div>
        </div>
        <div className="mt-5 pt-4" style={{ borderTop: '1px solid #E0D8C8' }}>
          <button
            onClick={handleSignOut}
            className="text-sm font-medium px-4 py-2 rounded-xl transition-all"
            style={{ background: 'rgba(184,50,50,0.06)', color: '#B83232', border: '1px solid rgba(184,50,50,0.15)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(184,50,50,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(184,50,50,0.06)')}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div className="rounded-2xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E0D8C8', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#8C8270' }}>Google Workspace</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: '#18150F' }}>Gmail &amp; Calendar</p>
            <p className="text-xs mt-0.5" style={{ color: '#8C8270' }}>Connect to enable email drafting and calendar scheduling.</p>
          </div>
          <button
            className="text-sm font-semibold px-4 py-2 rounded-xl transition-all"
            style={{ background: '#0D1B3E', color: '#F5F0E4', border: 'none', boxShadow: '0 2px 8px rgba(13,27,62,0.18)' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1A2D5A')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0D1B3E')}
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}
