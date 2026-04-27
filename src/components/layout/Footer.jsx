import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40 mt-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <Logo size="lg" />
          <p className="mt-4 text-text-secondary max-w-sm">
            Got pani? We got people. The local services marketplace built for
            India — straight from God's own country.
          </p>
        </div>
        <div>
          <h4 className="font-serif text-base font-bold mb-3">For Clients</h4>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li><Link to="/workers" className="hover:text-primary-dark">Browse workers</Link></li>
            <li><Link to="/post-job" className="hover:text-primary-dark">Drop a job</Link></li>
            <li><Link to="/dashboard" className="hover:text-primary-dark">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-base font-bold mb-3">For Workers</h4>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li><Link to="/become-a-worker" className="hover:text-primary-dark">Become a worker</Link></li>
            <li><Link to="/login" className="hover:text-primary-dark">Log in</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <p className="m-0">© {new Date().getFullYear()} Pani. All work, no fluff.</p>
          <p className="m-0">Made with love in Kerala 🌴</p>
        </div>
      </div>
    </footer>
  );
}
