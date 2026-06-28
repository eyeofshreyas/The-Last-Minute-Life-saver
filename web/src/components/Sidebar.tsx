import { NavLink, useNavigate } from 'react-router-dom';
import type { User } from 'firebase/auth';
import { signOutUser } from '../lib/auth';

interface Props {
  user: User;
}

const nav = [
  {
    to: '/',
    label: 'Today',
    end: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-2 .9-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zM7 12h5v5H7z" />
      </svg>
    ),
  },
  {
    to: '/goals',
    label: 'Goals',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-12.5c-2.49 0-4.5 2.01-4.5 4.5S9.51 16.5 12 16.5s4.5-2.01 4.5-4.5S14.49 7.5 12 7.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5S10.62 9.5 12 9.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    ),
  },
  {
    to: '/activity',
    label: 'Activity',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
      </svg>
    ),
  },
  {
    to: '/snap',
    label: 'Snap to Plan',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.48 13.03A4 4 0 0121 16v3h1v2H2v-2h1v-3a4 4 0 011.52-2.97L7 11.42V8.5a.5.5 0 01.5-.5h9a.5.5 0 01.5.5v2.92l2.48 1.61zM13 6h-2V4h2v2zm-1 14a2 2 0 110-4 2 2 0 010 4z" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.01 7.01 0 00-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 00-.59.22L2.74 8.87a.47.47 0 00.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.47.47 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6a3.6 3.6 0 110-7.2 3.6 3.6 0 010 7.2z" />
      </svg>
    ),
  },
];

export default function Sidebar({ user }: Props) {
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOutUser();
    navigate('/login');
  }

  return (
    <aside
      className="w-[228px] shrink-0 flex flex-col h-screen sticky top-0"
      style={{ background: '#0D1B3E', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Brand */}
      <div className="px-6 pt-7 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="font-display font-semibold text-[20px] tracking-tight" style={{ color: '#F5F0E4' }}>
          Lifesaver
        </div>
        <div className="text-[9px] mt-1 uppercase tracking-[0.2em]" style={{ color: '#C8A84B', opacity: 0.85 }}>
          AI Productivity
        </div>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5 overflow-y-auto">
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all"
            style={({ isActive }) => ({
              background: isActive ? 'rgba(200,168,75,0.12)' : 'transparent',
              color: isActive ? '#F5F0E4' : 'rgba(255,255,255,0.42)',
              border: isActive ? '1px solid rgba(200,168,75,0.22)' : '1px solid transparent',
              fontWeight: isActive ? 500 : 400,
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ opacity: isActive ? 1 : 0.45, color: isActive ? '#C8A84B' : 'currentColor' }}>
                  {item.icon}
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-5 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
        {/* Profile */}
        <NavLink
          to="/settings"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all"
          style={({ isActive }) => ({
            background: isActive ? 'rgba(200,168,75,0.12)' : 'transparent',
            color: isActive ? '#F5F0E4' : 'rgba(255,255,255,0.42)',
            border: isActive ? '1px solid rgba(200,168,75,0.22)' : '1px solid transparent',
          })}
        >
          {() => (
            <>
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-4 h-4 rounded-full" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.42)">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
              Profile
            </>
          )}
        </NavLink>

        {/* Premium */}
        <NavLink
          to="/premium"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ background: 'rgba(200,168,75,0.14)', color: '#C8A84B', border: '1px solid rgba(200,168,75,0.28)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          Premium
        </NavLink>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors mt-2"
          style={{ color: 'rgba(255,255,255,0.3)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
