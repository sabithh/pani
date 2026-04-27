import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Shield, Trash2, Save, LocateFixed } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGeolocation } from '../hooks/useGeolocation';
import { updateUserProfile, uploadAvatar } from '../lib/api/workerOnboarding';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { PageTransition } from '../components/layout/PageTransition';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { fadeUp, staggerContainer } from '../lib/motion';

export default function Settings() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [saving, setSaving] = useState(false);
  const { getPosition, loading: geoLoading } = useGeolocation();

  const pinMyLocation = async () => {
    if (!isSupabaseConfigured || !user?.id) return;
    try {
      const pos = await getPosition();
      await supabase.from('users').update({ lat: pos.lat, lng: pos.lng }).eq('id', user.id);
      toast.success('Location pinned. You\'ll now show up in nearby searches.');
    } catch {
      toast.error('Could not get your location. Please allow location access.');
    }
  };
  const [changingPw, setChangingPw] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url ?? '');
  const avatarRef = useRef(null);
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    location: profile?.location ?? '',
    bio: profile?.bio ?? '',
  });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !user?.id) {
      toast.success('(Demo) Profile saved locally.');
      return;
    }
    setSaving(true);
    try {
      let avatarUrl = profile?.avatar_url ?? '';
      if (avatarFile) avatarUrl = await uploadAvatar(user.id, avatarFile);
      await updateUserProfile(user.id, { ...form, avatar_url: avatarUrl || undefined });
      refreshProfile();
      toast.success('Profile updated. Looking fresh.');
    } catch (err) {
      toast.error(err.message || 'Save failed. Try again?');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) { toast.error('Passwords don\'t match.'); return; }
    if (pw.next.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    setChangingPw(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw.next });
      if (error) throw error;
      toast.success('Password changed. Keep it somewhere safe.');
      setPw({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(err.message || 'Password change failed.');
    } finally {
      setChangingPw(false);
    }
  };

  const deleteAccount = async () => {
    toast.error('Account deletion requires a server function. Contact support for now.');
    setDeleteOpen(false);
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
          <motion.div variants={fadeUp}>
            <h1 className="font-serif text-4xl font-black m-0 mb-1">Settings.</h1>
            <p className="text-text-secondary m-0">Your profile, your rules.</p>
          </motion.div>

          {/* Profile section */}
          <motion.form variants={fadeUp} onSubmit={saveProfile} className="bg-bg border border-border rounded-2xl p-6 shadow-soft space-y-5">
            <h2 className="font-serif text-xl font-bold m-0">Profile</h2>

            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar src={avatarPreview} name={form.full_name || profile?.full_name} size="2xl" />
                <button
                  type="button"
                  onClick={() => avatarRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary-dark transition-colors"
                >
                  <Upload size={14} />
                </button>
                <input ref={avatarRef} type="file" accept="image/*" className="sr-only" onChange={onAvatarChange} />
              </div>
              <div>
                <div className="font-semibold">{profile?.full_name ?? user?.email}</div>
                <div className="text-xs text-text-muted mt-0.5">{user?.email}</div>
                <Button type="button" variant="ghost" size="sm" className="mt-1 -ml-2" onClick={() => avatarRef.current?.click()}>
                  Change photo
                </Button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              <Input label="Phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <div>
                <Input label="City / Area" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                <button
                  type="button"
                  onClick={pinMyLocation}
                  disabled={geoLoading}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary-dark hover:underline disabled:opacity-50"
                >
                  <LocateFixed size={12} />
                  {geoLoading ? 'Getting location…' : profile?.lat ? 'Update pinned location' : 'Pin my exact location'}
                </button>
                {profile?.lat && (
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Pinned · {profile.lat.toFixed(4)}, {profile.lng.toFixed(4)}
                  </p>
                )}
              </div>
            </div>
            <Textarea label="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />

            <Button type="submit" variant="primary" loading={saving} leftIcon={<Save size={15} />}>
              Save profile
            </Button>
          </motion.form>

          {/* Change password */}
          <motion.form variants={fadeUp} onSubmit={changePassword} className="bg-bg border border-border rounded-2xl p-6 shadow-soft space-y-4">
            <h2 className="font-serif text-xl font-bold m-0">Change password</h2>
            <Input label="New password" type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} minLength={6} required />
            <Input label="Confirm new password" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required />
            <Button type="submit" variant="secondary" loading={changingPw} leftIcon={<Shield size={15} />}>
              Update password
            </Button>
          </motion.form>

          {/* Danger zone */}
          <motion.div variants={fadeUp} className="bg-urgent-bg border border-urgent/20 rounded-2xl p-6 space-y-3">
            <h2 className="font-serif text-xl font-bold m-0 text-urgent">Danger zone</h2>
            <p className="text-sm text-text-secondary m-0">Once you delete your account, there's no coming back. All your pani will disappear.</p>
            <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => setDeleteOpen(true)}>
              Delete my account
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete account?">
        <p className="text-text-secondary mb-5">
          This will permanently delete your account, all your jobs, applications, and messages.
          There is no undo. The pani is gone forever.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={deleteAccount}>Yes, delete</Button>
        </div>
      </Modal>
    </PageTransition>
  );
}
