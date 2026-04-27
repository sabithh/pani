import { supabase } from '../supabase';
import { haversineKm } from '../geo';

const WORKER_SELECT = `
  id, user_id, category, skills, hourly_rate, daily_rate,
  experience_years, availability, portfolio_urls, rating_avg,
  total_jobs_done, is_available,
  user:users(id, full_name, avatar_url, location, bio, is_verified, lat, lng)
`;

export async function listWorkers({
  category,
  location,
  minRate,
  maxRate,
  minRating,
  availableOnly,
  search,
  nearLat,
  nearLng,
  radiusKm = 25,
  limit = 60,
} = {}) {
  let q = supabase.from('worker_profiles').select(WORKER_SELECT).limit(limit);

  if (category) q = q.eq('category', category);
  if (availableOnly) q = q.eq('is_available', true);
  if (minRating) q = q.gte('rating_avg', Number(minRating));
  if (minRate) q = q.gte('hourly_rate', Number(minRate));
  if (maxRate) q = q.lte('hourly_rate', Number(maxRate));

  q = q.order('rating_avg', { ascending: false, nullsFirst: false });

  const { data, error } = await q;
  if (error) throw error;

  let list = data ?? [];
  if (location) {
    const needle = location.toLowerCase();
    list = list.filter((w) => w.user?.location?.toLowerCase().includes(needle));
  }
  if (search) {
    const needle = search.toLowerCase();
    list = list.filter(
      (w) =>
        w.user?.full_name?.toLowerCase().includes(needle) ||
        w.category?.toLowerCase().includes(needle) ||
        (w.skills ?? []).some((s) => s.toLowerCase().includes(needle))
    );
  }
  if (nearLat != null && nearLng != null) {
    list = list
      .filter((w) => w.user?.lat != null && w.user?.lng != null)
      .filter((w) => haversineKm(nearLat, nearLng, w.user.lat, w.user.lng) <= radiusKm)
      .sort((a, b) =>
        haversineKm(nearLat, nearLng, a.user.lat, a.user.lng) -
        haversineKm(nearLat, nearLng, b.user.lat, b.user.lng)
      )
      .map((w) => ({
        ...w,
        _distKm: Math.round(haversineKm(nearLat, nearLng, w.user.lat, w.user.lng) * 10) / 10,
      }));
  }
  return list;
}

export async function getWorker(id) {
  const { data, error } = await supabase
    .from('worker_profiles')
    .select(WORKER_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listFeaturedWorkers(limit = 8) {
  return listWorkers({ availableOnly: true, limit });
}
