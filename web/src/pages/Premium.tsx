import { api } from '../lib/api';

const freeFeatures = [
  'Up to 3 active goals',
  'Basic activity history log',
  'Manual plan approvals',
];

const premiumFeatures = [
  'Autonomous execution (Tier 3)',
  'Unlimited active goals',
  "Snap to Plan' document ingestion",
  'Daily Voice Standup briefing',
  'Priority AI processing',
];

const logos = ['QuantOS', 'Nebula', 'Vortex'];

export default function Premium() {
  async function handleUpgrade() {
    const data = await api.payments.checkout();
    window.open(data.url, '_blank');
  }

  return (
    <div className="min-h-screen bg-surf-base px-8 py-12 flex flex-col items-center">
      {/* Hero */}
      <div className="text-center mb-12 max-w-xl">
        <h1 className="font-display text-[30px] font-semibold leading-tight mb-3" style={{ color: '#18150F', letterSpacing: '-0.01em' }}>
          Let Lifesaver do more of the work for you.
        </h1>
        <p className="text-[15px] leading-relaxed" style={{ color: '#8C8270' }}>
          Upgrade to an autonomous agent that handles execution, standups, and complex planning without constant supervision.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="flex gap-5 w-full max-w-2xl">
        {/* Free */}
        <div
          className="flex-1 rounded-2xl p-7 flex flex-col"
          style={{ background: '#FFFFFF', border: '1px solid #E0D8C8', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
        >
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: '#8C8270' }}>Free</div>
          <h2 className="font-display text-xl font-semibold mb-6" style={{ color: '#18150F' }}>The Co-Pilot</h2>

          <div className="space-y-3 flex-1">
            {freeFeatures.map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#1E7A50">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                <span className="text-sm" style={{ color: '#3A3628' }}>{f}</span>
              </div>
            ))}
            <div className="flex items-center gap-2.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#CFC6B0">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
              <span className="text-sm" style={{ color: '#CFC6B0' }}>Autonomous execution</span>
            </div>
          </div>

          <button
            className="w-full py-3 rounded-xl text-sm font-medium mt-8"
            style={{ background: '#FAF8F3', color: '#8C8270', border: '1px solid #E0D8C8' }}
            disabled
          >
            Current Plan
          </button>
        </div>

        {/* Premium */}
        <div
          className="flex-1 rounded-2xl p-7 flex flex-col relative"
          style={{ background: '#0D1B3E', border: '1px solid #C8A84B', boxShadow: '0 4px 20px rgba(13,27,62,0.2)' }}
        >
          {/* Recommended chip */}
          <div
            className="absolute top-4 right-4 text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(200,168,75,0.15)', color: '#C8A84B', border: '1px solid rgba(200,168,75,0.3)' }}
          >
            RECOMMENDED
          </div>

          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(245,240,228,0.5)' }}>Premium</div>
          <h2 className="font-display text-xl font-semibold mb-6" style={{ color: '#F5F0E4' }}>The Agent</h2>

          <div className="space-y-3 flex-1">
            {premiumFeatures.map(f => (
              <div key={f} className="flex items-center gap-2.5">
                {f === 'Autonomous execution (Tier 3)' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#C8A84B">
                    <path d="M7 2v11h3v9l7-12h-4l4-8z" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#C8A84B">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
                <span className="text-sm" style={{ color: 'rgba(245,240,228,0.85)' }}>{f}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 mb-5">
            <span className="font-display text-3xl font-semibold" style={{ color: '#F5F0E4' }}>$24</span>
            <span className="text-sm" style={{ color: 'rgba(245,240,228,0.5)' }}> /month</span>
          </div>

          <button
            onClick={handleUpgrade}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
            style={{ background: '#C8A84B', color: '#0D1B3E', border: 'none', boxShadow: '0 2px 12px rgba(200,168,75,0.3)' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#D4B85A')}
            onMouseLeave={e => (e.currentTarget.style.background = '#C8A84B')}
          >
            Upgrade to Premium
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs mt-6 text-center" style={{ color: '#8C8270' }}>
        * Note: System is currently in test mode. No charges will be applied during evaluation.
      </p>

      {/* Logo strip */}
      <div className="mt-16 text-center">
        <p className="text-[10px] uppercase tracking-widest mb-5" style={{ color: '#8C8270' }}>Empowering High-Performance Teams</p>
        <div className="flex items-center justify-center gap-10">
          {logos.map(l => (
            <span key={l} className="text-sm font-semibold opacity-30 tracking-wide" style={{ color: '#18150F' }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
