import { supabase } from '../supabase';

export async function getOrCreateConversation(userId, otherUserId) {
  // Check if conversation already exists between these two users
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .contains('participant_ids', [userId, otherUserId])
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('conversations')
    .insert({ participant_ids: [userId, otherUserId] })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listConversations(userId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .contains('participant_ids', [userId])
    .order('last_message_at', { ascending: false });
  if (error) throw error;

  if (!data?.length) return [];

  // Enrich with other participant's profile
  const enriched = await Promise.all(
    data.map(async (conv) => {
      const otherId = conv.participant_ids.find((id) => id !== userId);
      if (!otherId) return { ...conv, other: null };
      const { data: other } = await supabase
        .from('users')
        .select('id, full_name, avatar_url, location')
        .eq('id', otherId)
        .maybeSingle();
      return { ...conv, other };
    })
  );
  return enriched;
}

export async function getMessages(conversationId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:users!messages_sender_id_fkey(id, full_name, avatar_url)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function sendMessage(conversationId, senderId, content) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select('*, sender:users!messages_sender_id_fkey(id, full_name, avatar_url)')
    .single();
  if (error) throw error;

  // Update conversation last_message
  await supabase
    .from('conversations')
    .update({ last_message: content, last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
}

export async function markRead(conversationId, userId) {
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .is('read_at', null);
}
