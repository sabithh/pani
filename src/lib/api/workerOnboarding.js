import { supabase } from '../supabase';

export async function upsertWorkerProfile(payload) {
  const { data, error } = await supabase
    .from('worker_profiles')
    .upsert(payload, { onConflict: 'user_id,category' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop();
  const path = `${userId}/avatar.${ext}`;
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadPortfolioImage(userId, file, index) {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${Date.now()}-${index}.${ext}`;
  const { error } = await supabase.storage
    .from('portfolios')
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('portfolios').getPublicUrl(path);
  return data.publicUrl;
}

export async function updateUserProfile(userId, patch) {
  const { error } = await supabase
    .from('users')
    .update(patch)
    .eq('id', userId);
  if (error) throw error;
}
