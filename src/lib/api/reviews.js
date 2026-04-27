import { supabase } from '../supabase';

export async function getReviewsForWorker(workerId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, reviewer:users!reviews_reviewer_id_fkey(id, full_name, avatar_url)')
    .eq('reviewee_id', workerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createReview({ booking_id, reviewer_id, reviewee_id, rating, comment }) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({ booking_id, reviewer_id, reviewee_id, rating, comment })
    .select()
    .single();
  if (error) throw error;
  return data;
}
