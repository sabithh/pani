import { supabase } from '../supabase';
import { haversineKm } from '../geo';

const JOB_SELECT = `
  id, client_id, title, description, category, budget_min, budget_max,
  location, urgency, status, lat, lng, created_at,
  client:users!job_requests_client_id_fkey(id, full_name, avatar_url, location)
`;

export async function listJobs({
  status = 'open',
  category,
  urgency,
  nearLat,
  nearLng,
  radiusKm = 25,
  limit = 60,
} = {}) {
  let q = supabase
    .from('job_requests')
    .select(JOB_SELECT)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) q = q.eq('status', status);
  if (category) q = q.eq('category', category);
  if (urgency) q = q.eq('urgency', urgency);

  const { data, error } = await q;
  if (error) throw error;

  let list = data ?? [];
  if (nearLat != null && nearLng != null) {
    list = list
      .filter((j) => j.lat != null && j.lng != null)
      .filter((j) => haversineKm(nearLat, nearLng, j.lat, j.lng) <= radiusKm)
      .sort((a, b) =>
        haversineKm(nearLat, nearLng, a.lat, a.lng) -
        haversineKm(nearLat, nearLng, b.lat, b.lng)
      )
      .map((j) => ({
        ...j,
        _distKm: Math.round(haversineKm(nearLat, nearLng, j.lat, j.lng) * 10) / 10,
      }));
  }
  return list;
}

export async function getJob(id) {
  const { data, error } = await supabase
    .from('job_requests')
    .select(JOB_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createJob(payload) {
  const { data, error } = await supabase
    .from('job_requests')
    .insert(payload)
    .select(JOB_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function listJobsByClient(clientId) {
  const { data, error } = await supabase
    .from('job_requests')
    .select(JOB_SELECT)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
