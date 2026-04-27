import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Send, ArrowLeft, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  listConversations,
  getMessages,
  sendMessage,
  markRead,
  getOrCreateConversation,
} from '../lib/api/messages';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { PageTransition } from '../components/layout/PageTransition';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { timeAgo } from '../lib/format';

export default function Messages() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [convLoading, setConvLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showList, setShowList] = useState(true); // mobile: list vs chat
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load conversations
  useEffect(() => {
    if (!isSupabaseConfigured || !user?.id) { setConvLoading(false); return; }
    let alive = true;
    (async () => {
      try {
        const list = await listConversations(user.id);
        if (alive) setConversations(list);
      } catch { /* swallow */ }
      finally { if (alive) setConvLoading(false); }
    })();
    return () => { alive = false; };
  }, [user?.id]);

  // Handle ?with=userId param (start or open conversation from profile)
  useEffect(() => {
    const otherId = params.get('with');
    if (!otherId || !user?.id || !isSupabaseConfigured) return;
    (async () => {
      try {
        const conv = await getOrCreateConversation(user.id, otherId);
        setActiveConv(conv);
        setShowList(false);
        // refresh conversations list
        const list = await listConversations(user.id);
        setConversations(list);
      } catch (err) {
        toast.error('Could not open this conversation.');
      }
    })();
  }, [params, user?.id]);

  // Load messages when active conv changes
  useEffect(() => {
    if (!activeConv || !user?.id) return;
    let alive = true;
    setMsgLoading(true);
    (async () => {
      try {
        const msgs = await getMessages(activeConv.id);
        if (alive) { setMessages(msgs); scrollToBottom(); }
        await markRead(activeConv.id, user.id);
      } catch { /* swallow */ }
      finally { if (alive) setMsgLoading(false); }
    })();

    // Supabase Realtime subscription
    if (!isSupabaseConfigured) {
      return () => { alive = false; };
    }
    const channel = supabase
      .channel(`messages:${activeConv.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConv.id}` },
        async (payload) => {
          if (!alive) return;
          // Fetch sender info
          const { data: sender } = await supabase
            .from('users')
            .select('id, full_name, avatar_url')
            .eq('id', payload.new.sender_id)
            .maybeSingle();
          const msg = { ...payload.new, sender };
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          setTimeout(scrollToBottom, 50);
          if (payload.new.sender_id !== user.id) {
            await markRead(activeConv.id, user.id);
          }
        }
      )
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [activeConv?.id, user?.id, scrollToBottom]);

  useEffect(scrollToBottom, [messages.length, scrollToBottom]);

  const handleSend = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || !activeConv || !user?.id) return;
    setSending(true);
    setText('');
    try {
      await sendMessage(activeConv.id, user.id, content);
      // Realtime will pick this up; also update last_message locally
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConv.id ? { ...c, last_message: content, last_message_at: new Date().toISOString() } : c
        )
      );
    } catch (err) {
      toast.error('Failed to send. Try again?');
      setText(content); // restore
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <PageTransition>
        <EmptyState
          icon="💬"
          title="Connect Supabase to chat."
          description="Messaging needs a live Supabase project with Realtime enabled. Set up your .env.local and run the SQL files."
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-0 sm:px-8 py-0 sm:py-6">
        <div className="bg-bg sm:border sm:border-border sm:rounded-3xl overflow-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
          <div className="flex h-full">
            {/* Sidebar: conversation list */}
            <div className={[
              'flex-col border-r border-border',
              showList ? 'flex w-full sm:w-80 lg:w-96' : 'hidden sm:flex sm:w-80 lg:w-96',
            ].join(' ')}>
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-serif text-xl font-bold m-0">Messages</h2>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {convLoading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton circle width={44} height={44} />
                        <div className="flex-1 space-y-2">
                          <Skeleton height={12} width="60%" />
                          <Skeleton height={10} width="80%" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center text-text-secondary text-sm">
                    <MessageSquare size={28} className="mx-auto mb-2 text-text-muted" />
                    No conversations yet. Start one from a worker's profile.
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const isActive = activeConv?.id === conv.id;
                    return (
                      <motion.button
                        key={conv.id}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => { setActiveConv(conv); setShowList(false); }}
                        className={[
                          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                          isActive ? 'bg-primary-light' : 'hover:bg-surface',
                        ].join(' ')}
                      >
                        <Avatar src={conv.other?.avatar_url} name={conv.other?.full_name} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-semibold text-sm truncate">{conv.other?.full_name ?? 'Unknown'}</span>
                            <span className="text-[10px] text-text-muted shrink-0">{timeAgo(conv.last_message_at)}</span>
                          </div>
                          <div className="text-xs text-text-muted truncate mt-0.5">
                            {conv.last_message ?? 'No messages yet'}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat panel */}
            <div className={[
              'flex-col flex-1',
              !showList ? 'flex' : 'hidden sm:flex',
            ].join(' ')}>
              {!activeConv ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-text-muted">
                    <MessageSquare size={36} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm m-0">Select a conversation</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-bg">
                    <button className="sm:hidden p-1 -ml-1" onClick={() => setShowList(true)}>
                      <ArrowLeft size={20} />
                    </button>
                    <Avatar src={activeConv.other?.avatar_url} name={activeConv.other?.full_name} size="md" />
                    <div>
                      <div className="font-semibold">{activeConv.other?.full_name ?? 'Unknown'}</div>
                      <div className="text-xs text-text-muted">{activeConv.other?.location ?? ''}</div>
                    </div>
                  </div>

                  {/* Messages area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                    {msgLoading ? (
                      <div className="space-y-3 py-4">
                        {[65, 50, 75, 55].map((w, i) => (
                          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                            <Skeleton height={40} width={`${w}%`} style={{ borderRadius: 16 }} />
                          </div>
                        ))}
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-sm text-text-muted">Send the first message 👇</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMine = msg.sender_id === user?.id;
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                            className={`flex ${isMine ? 'justify-end' : 'justify-start'} gap-2`}
                          >
                            {!isMine && (
                              <Avatar src={msg.sender?.avatar_url} name={msg.sender?.full_name} size="xs" className="mt-auto" />
                            )}
                            <div className={[
                              'max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                              isMine
                                ? 'bg-primary text-white rounded-br-sm'
                                : 'bg-surface text-text-primary rounded-bl-sm',
                            ].join(' ')}>
                              {msg.content}
                              <div className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-text-muted'}`}>
                                {timeAgo(msg.created_at)}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {sending && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="px-5 pb-1"
                      >
                        <div className="inline-flex items-center gap-1 px-3 py-2 bg-surface rounded-full text-xs text-text-muted">
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Message input */}
                  <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-border bg-bg">
                    <input
                      ref={inputRef}
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Type a message…"
                      className="flex-1 bg-surface rounded-full px-4 py-2.5 text-sm outline-none border border-transparent focus:border-primary transition-colors"
                    />
                    <motion.button
                      type="submit"
                      disabled={!text.trim() || sending}
                      whileTap={{ scale: 0.92 }}
                      className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-40 transition-opacity shrink-0"
                    >
                      <Send size={16} />
                    </motion.button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
