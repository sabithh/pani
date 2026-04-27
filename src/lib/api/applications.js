import { supabase } from '../supabase';

export async function createApplication({ job_id, worker_id, message, proposed_rate }) {
  const { data, error } = await supabase
    .from('applications')
    .insert({ job_id, worker_id, message, proposed_rate })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listApplicationsForWorker(workerId) {
  const { data, error } = await supabase
    .from('applications')
    .select('*, job:job_requests(*)')
    .eq('worker_id', workerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
