import { supabase } from '../supabase';

export async function getSavedWorkers(clientId) {
  const { data, error } = await supabase
    .from('saved_workers')
    .select(`
      id, worker_id, created_at,
      worker:users!saved_workers_worker_id_fkey(
        id, full_name, avatar_url, location,
        worker_profiles(id, category, hourly_rate, rating_avg, is_available)
      )
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function toggleSaved(clientId, workerId) {
  const { data: existing } = await supabase
    .from('saved_workers')
    .select('id')
    .eq('client_id', clientId)
    .eq('worker_id', workerId)
    .maybeSingle();

  if (existing) {
    await supabase.from('saved_workers').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('saved_workers').insert({ client_id: clientId, worker_id: workerId });
    return true;
  }
}

export async function isSaved(clientId, workerId) {
  const { data } = await supabase
    .from('saved_workers')
    .select('id')
    .eq('client_id', clientId)
    .eq('worker_id', workerId)
    .maybeSingle();
  return Boolean(data);
}
