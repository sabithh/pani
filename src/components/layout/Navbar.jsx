import { AnimatePresence, motion } from 'framer-motion';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { Logo } from './Logo';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { NotificationBell } from './NotificationBell';

const links = [
  { to: '/workers', label: 'Browse Workers' },
  { to: '/jobs', label: 'Browse Jobs' },
  { to: '/post-job', label: 'Drop a Job' },
];

export function Navbar() {
  const scrolled = useScrollPosition(40);
  const { isAuthenticated, profile, signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          backgroundColor: scrolled ? 'rgba(253, 248, 244, 0.92)' : 'rgba(253, 248, 244, 0)',
          borderBottomColor: scrolled ? 'rgba(232, 217, 203, 1)' : 'rgba(232, 217, 203, 0)',
          boxShadow: scrolled ? '0 4px 24px rgba(45, 26, 14, 0.06)' : '0 0 0 rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.25 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
        style={{ borderBottomWidth: 1 }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-surface"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <Logo />
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => {
              const active = location.pathname.startsWith(l.to);
              return (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className="relative px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="navUnderline"
                      className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Link to="/messages" className="p-2 rounded-full hover:bg-surface transition-colors relative" aria-label="Messages">
                <NotificationBell />
              </Link>
            )}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full bg-surface hover:bg-surface-hover transition-colors"
                >
                  <Avatar src={profile?.avatar_url} name={profile?.full_name} size="sm" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {profile?.full_name?.split(' ')[0] ?? 'You'}
                  </span>
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 mt-2 w-56 bg-bg border border-border rounded-2xl shadow-card overflow-hidden z-50"
                      >
                        <Link
                          to="/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-surface text-sm"
                        >
                          <LayoutDashboard size={16} /> Dashboard
                        </Link>
                        <Link
                          to="/become-a-worker"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-surface text-sm"
                        >
                          <span className="text-base">🪄</span> Become a worker
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-surface text-sm"
                        >
                          <Settings size={16} /> Settings
                        </Link>
                        <div className="border-t border-border" />
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface text-sm text-urgent"
                        >
                          <LogOut size={16} /> Sign out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="hidden sm:inline-flex"
                >
                  Log in
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                  Join the crew
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-text-primary/40 backdrop-blur-sm lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 left-0 bottom-0 z-[70] w-72 bg-bg border-r border-border p-6 lg:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <Logo />
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-lg hover:bg-surface"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {links.map((l, i) => (
                  <motion.div
                    key={l.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * i + 0.1 }}
                  >
                    <NavLink
                      to={l.to}
                      onClick={() => setDrawerOpen(false)}
                      className={({ isActive }) =>
                        [
                          'block px-4 py-3 rounded-xl text-base font-medium',
                          isActive
                            ? 'bg-primary-light text-primary-dark'
                            : 'text-text-secondary hover:bg-surface',
                        ].join(' ')
                      }
                    >
                      {l.label}
                    </NavLink>
                  </motion.div>
                ))}
                {isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.22 }}
                  >
                    <NavLink
                      to="/dashboard"
                      onClick={() => setDrawerOpen(false)}
                      className={({ isActive }) =>
                        [
                          'block px-4 py-3 rounded-xl text-base font-medium',
                          isActive
                            ? 'bg-primary-light text-primary-dark'
                            : 'text-text-secondary hover:bg-surface',
                        ].join(' ')
                      }
                    >
                      Dashboard
                    </NavLink>
                  </motion.div>
                )}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
