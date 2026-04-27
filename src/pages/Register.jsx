import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Briefcase, User, UsersRound } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/layout/Logo';
import { AuthSidePanel } from './auth/AuthSidePanel';
import { fadeUp, staggerContainer } from '../lib/motion';

const ROLES = [
  { value: 'client', label: 'Client', helper: 'I need pani done', icon: User },
  { value: 'worker', label: 'Worker', helper: 'I do the pani', icon: Briefcase },
  { value: 'both', label: 'Both', helper: 'Why not both?', icon: UsersRound },
];

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    role: 'client',
  });

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password should be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const data = await signUp(form);
      if (!data.session) {
        // Email confirmation required — user is not yet logged in
        toast.success('Almost there! Check your email to confirm your account.', { duration: 6000 });
        navigate('/login');
      } else {
        toast.success('You\'re in. Welcome to the crew.');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Sign up failed. Try again?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <AuthSidePanel flavor="register" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col justify-center px-6 sm:px-12 py-10"
      >
        <motion.div variants={fadeUp} className="mb-8">
          <Logo size="lg" />
        </motion.div>

        <motion.div variants={fadeUp} className="max-w-md w-full mx-auto lg:mx-0">
          <h1 className="font-serif text-4xl sm:text-5xl font-black mb-2">Join the crew.</h1>
          <p className="text-text-secondary mb-6">
            Already in?{' '}
            <Link to="/login" className="text-primary-dark font-semibold hover:underline">
              Log in →
            </Link>
          </p>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <motion.div variants={fadeUp}>
              <Input label="Full name" value={form.full_name} onChange={update('full_name')} required />
            </motion.div>
            <motion.div variants={fadeUp}>
              <Input label="Email" type="email" value={form.email} onChange={update('email')} required autoComplete="email" />
            </motion.div>
            <motion.div variants={fadeUp}>
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={update('password')}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
              <Input label="Phone" type="tel" value={form.phone} onChange={update('phone')} />
              <Input label="City / Area" value={form.location} onChange={update('location')} />
            </motion.div>

            <motion.div variants={fadeUp}>
              <p className="text-xs uppercase tracking-wider text-text-muted mb-2 font-semibold mt-1">
                I want to be a…
              </p>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(({ value, label, helper, icon: Icon }) => {
                  const active = form.role === value;
                  return (
                    <motion.button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, role: value })}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className={[
                        'flex flex-col items-center gap-1 p-3 rounded-2xl border-2 text-left transition-colors',
                        active
                          ? 'border-primary bg-primary-light text-primary-dark'
                          : 'border-border hover:border-border-strong text-text-secondary',
                      ].join(' ')}
                    >
                      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                      <span className="text-sm font-semibold">{label}</span>
                      <span className="text-[11px] text-text-muted leading-tight text-center">{helper}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="pt-2">
              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                Create my account
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
