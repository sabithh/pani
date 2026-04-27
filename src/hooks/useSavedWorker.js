import { useEffect, useState } from 'react';
import { isSaved, toggleSaved } from '../lib/api/saved';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export function useSavedWorker(workerUserId) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id || !workerUserId || !isSupabaseConfigured) return;
    isSaved(user.id, workerUserId).then(setSaved).catch(() => {});
  }, [user?.id, workerUserId]);

  const toggle = async () => {
    if (!user?.id || !workerUserId || !isSupabaseConfigured) return;
    setLoading(true);
    try {
      const next = await toggleSaved(user.id, workerUserId);
      setSaved(next);
    } catch {
      // swallow
    } finally {
      setLoading(false);
    }
  };

  return { saved, loading, toggle };
}
