import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Home, Users, PlusCircle, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../../lib/auth';

const items = [
  { to: '/', label: 'Home', icon: Home, exact: true },
  { to: '/workers', label: 'Browse', icon: Users },
  { to: '/post-job', label: 'Post', icon: PlusCircle, primary: true },
  { to: '/dashboard', label: 'Hub', icon: LayoutDashboard },
];

export function MobileBottomNav() {
  const { isAuthenticated } = useAuth();
  const links = [...items, isAuthenticated
    ? { to: '/settings', label: 'You', icon: User }
    : { to: '/login', label: 'Log in', icon: User }];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg/95 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {links.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to + item.label}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                [
                  'relative flex flex-col items-center gap-1 py-3 text-[11px] font-medium select-none',
                  isActive ? 'text-primary' : 'text-text-muted',
                  item.primary ? 'text-primary' : '',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <motion.span
                    animate={{ scale: isActive ? 1.12 : 1 }}
                    whileTap={{ scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                    className={[
                      'flex items-center justify-center',
                      item.primary
                        ? 'w-11 h-11 -mt-1 rounded-2xl bg-primary text-white shadow-glow'
                        : '',
                    ].join(' ')}
                  >
                    <Icon size={item.primary ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
                  </motion.span>
                  {!item.primary && <span>{item.label}</span>}
                  {isActive && !item.primary && (
                    <motion.span
                      layoutId="bottomNavDot"
                      className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary"
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
