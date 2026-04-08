import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/authStore';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', emoji: '📊' },
  { path: '/today', label: 'Today Workout', emoji: '🏋️' },
  { path: '/progress', label: 'Progress', emoji: '📈' },
  { path: '/profile', label: 'Profile', emoji: '👤' },
  { path: '/chat', label: 'AI Coach', emoji: '🤖' },
];

const FitAiLogo = () => (
  <svg viewBox="0 0 64 64" className="h-9 w-9 flex-shrink-0" aria-hidden="true">
    <defs>
      <linearGradient id="sidebarLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#22d3ee" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#sidebarLogoGrad)" opacity="0.22" />
    <rect x="9" y="9" width="46" height="46" rx="13" fill="#0a0a0a" stroke="url(#sidebarLogoGrad)" strokeWidth="2" />
    <path d="M22 40L31 18H37L46 40H40L38 34H30L28 40H22ZM31.7 29.5H36.3L34 23.1L31.7 29.5Z" fill="url(#sidebarLogoGrad)" />
  </svg>
);

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const isActive = (path) => location.pathname === path;

  const closeMobile = () => setIsMobileOpen(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <Link to="/dashboard" className="flex items-center gap-3" onClick={closeMobile}>
          <FitAiLogo />
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">FitAI</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/70 font-medium">Smart Coach</p>
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-emerald-500/15 to-cyan-500/10 text-white border border-emerald-500/20'
                  : 'text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200 border border-transparent'
              }`}
            >
              <span className="text-lg w-6 text-center">{item.emoji}</span>
              <span>{item.label}</span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 pb-5 pt-2 border-t border-neutral-800/60">
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-200 truncate">{user?.name || 'Athlete'}</p>
            <p className="text-xs text-neutral-500 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-2.5 text-xs font-medium text-neutral-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/20"
        >
          <span>↗</span>
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-r lg:border-neutral-800/60 lg:bg-neutral-950/90 lg:backdrop-blur-xl lg:z-30">
        {sidebarContent}
      </aside>

      {/* Mobile hamburger button */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 h-10 w-10 rounded-xl bg-neutral-900/90 border border-neutral-700/50 backdrop-blur-xl flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
        aria-label="Open navigation"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMobile}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-neutral-950 border-r border-neutral-800/60 animate-slide-in-left shadow-2xl">
            <button
              type="button"
              onClick={closeMobile}
              className="absolute top-5 right-4 h-8 w-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
              aria-label="Close navigation"
            >
              ✕
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
