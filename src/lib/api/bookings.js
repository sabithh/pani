import { supabase } from '../supabase';

const BOOKING_SELECT = `
  id, client_id, worker_id, job_request_id, scheduled_date, scheduled_time,
  status, agreed_rate, notes, created_at,
  client:users!bookings_client_id_fkey(id, full_name, avatar_url, location),
  worker:users!bookings_worker_id_fkey(id, full_name, avatar_url, location,
    worker_profiles(category, hourly_rate, rating_avg)
  )
`;

export async function listBookingsForUser(userId) {
  const { data, error } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .or(`client_id.eq.${userId},worker_id.eq.${userId}`)
    .order('scheduled_date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createBooking(payload) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(payload)
    .select(BOOKING_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function updateBookingStatus(bookingId, status) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
