import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/layout/Logo';
import { AuthSidePanel } from './auth/AuthSidePanel';
import { fadeUp, staggerContainer } from '../lib/motion';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(form);
      toast.success('Welcome back. Time to do some pani.');
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Could not log in. Try again?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <AuthSidePanel flavor="login" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col justify-center px-6 sm:px-12 py-10"
      >
        <motion.div variants={fadeUp} className="mb-10">
          <Logo size="lg" />
        </motion.div>

        <motion.div variants={fadeUp} className="max-w-md w-full mx-auto lg:mx-0">
          <h1 className="font-serif text-4xl sm:text-5xl font-black mb-2">Log in.</h1>
          <p className="text-text-secondary mb-8">
            New around here?{' '}
            <Link to="/register" className="text-primary-dark font-semibold hover:underline">
              Join the crew →
            </Link>
          </p>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <motion.div variants={fadeUp}>
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
            </motion.div>

            <motion.div variants={fadeUp} className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Log in
              </Button>
            </motion.div>
          </form>

          <motion.p variants={fadeUp} className="mt-6 text-xs text-text-muted">
            By continuing you agree to our pinky promise to never spam you. 🤝
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
