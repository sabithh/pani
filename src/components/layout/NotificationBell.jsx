import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { popIn } from '../../lib/motion';

export function NotificationBell() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [ringing, setRinging] = useState(false);

  const ring = () => {
    setRinging(true);
    setTimeout(() => setRinging(false), 900);
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) return;

    // Count unread messages
    const fetchUnread = async () => {
      // Get all conversations the user participates in
      const { data: convs } = await supabase
        .from('conversations')
        .select('id')
        .contains('participant_ids', [user.id]);

      if (!convs?.length) { setCount(0); return; }

      const convIds = convs.map((c) => c.id);
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', convIds)
        .neq('sender_id', user.id)
        .is('read_at', null);

      setCount(unreadCount ?? 0);
    };

    fetchUnread();

    // Realtime subscription for new messages
    const channel = supabase
      .channel('notif-bell')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.new.sender_id !== user.id) {
            setCount((c) => c + 1);
            ring();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        () => { fetchUnread(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  return (
    <motion.div
      animate={ringing ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      <Bell size={20} className="text-text-secondary" />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            variants={popIn}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none"
          >
            {count > 99 ? '99+' : count}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
