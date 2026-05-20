import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ChatParticipantRole = 'member' | 'trainer';

export type Message = {
  id: string;
  threadKey: string; // stable key: `${trainerId}::${memberId}`
  fromRole: ChatParticipantRole;
  fromId: string;
  text: string;
  createdAt: string; // ISO
};

export type ThreadMeta = {
  threadKey: string;
  kind: 'trainer' | 'community';
  trainerId?: string;
  memberId?: string;
  memberAId?: string;
  memberBId?: string;
  lastMessageAt: string | null;
};

export type MessagingContextValue = {
  threads: ThreadMeta[];
  messagesByThread: Record<string, Message[]>;
  ensureThread: (args: { trainerId: string; memberId: string }) => string;
  ensureCommunityThread: (args: { memberAId: string; memberBId: string }) => string;
  sendMessage: (args: {
    trainerId: string;
    memberId: string;
    fromRole: ChatParticipantRole;
    fromId: string;
    text: string;
  }) => void;
  sendCommunityMessage: (args: { memberAId: string; memberBId: string; fromId: string; text: string }) => void;
  getThreadMessages: (threadKey: string) => Message[];
};

const STORAGE_KEY = 'chat:v1';

type Stored = {
  threads: ThreadMeta[];
  messagesByThread: Record<string, Message[]>;
};

const MessagingContext = createContext<MessagingContextValue | undefined>(undefined);

function threadKeyOf(trainerId: string, memberId: string) {
  return `${trainerId}::${memberId}`;
}

function communityKeyOf(a: string, b: string) {
  const [x, y] = [a, b].sort();
  return `m2m::${x}::${y}`;
}

function sortThreads(a: ThreadMeta, b: ThreadMeta) {
  return (b.lastMessageAt ?? '').localeCompare(a.lastMessageAt ?? '');
}

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const [threads, setThreads] = useState<ThreadMeta[]>([]);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, Message[]>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as Stored) : null;
        if (!mounted || !parsed) return;
        const hydratedThreads = Array.isArray(parsed.threads)
          ? parsed.threads
              .filter(Boolean)
              .map(t => {
                if ((t as any).kind) return t as ThreadMeta;
                // Back-compat with older stored shape
                return {
                  threadKey: (t as any).threadKey,
                  kind: 'trainer' as const,
                  trainerId: (t as any).trainerId,
                  memberId: (t as any).memberId,
                  lastMessageAt: (t as any).lastMessageAt ?? null,
                } satisfies ThreadMeta;
              })
              .sort(sortThreads)
          : [];
        setThreads(hydratedThreads);
        setMessagesByThread(parsed.messagesByThread ?? {});
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const payload: Stored = { threads, messagesByThread };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  }, [threads, messagesByThread]);

  const ensureThread = ({ trainerId, memberId }: { trainerId: string; memberId: string }) => {
    const key = threadKeyOf(trainerId, memberId);
    setThreads(prev => {
      if (prev.some(t => t.threadKey === key)) return prev;
      return [{ threadKey: key, kind: 'trainer' as const, trainerId, memberId, lastMessageAt: null }, ...prev].sort(sortThreads);
    });
    setMessagesByThread(prev => (prev[key] ? prev : { ...prev, [key]: [] }));
    return key;
  };

  const ensureCommunityThread = ({ memberAId, memberBId }: { memberAId: string; memberBId: string }) => {
    const key = communityKeyOf(memberAId, memberBId);
    setThreads(prev => {
      if (prev.some(t => t.threadKey === key)) return prev;
      return [{ threadKey: key, kind: 'community' as const, memberAId, memberBId, lastMessageAt: null }, ...prev].sort(sortThreads);
    });
    setMessagesByThread(prev => (prev[key] ? prev : { ...prev, [key]: [] }));
    return key;
  };

  const sendMessage = ({
    trainerId,
    memberId,
    fromRole,
    fromId,
    text,
  }: {
    trainerId: string;
    memberId: string;
    fromRole: ChatParticipantRole;
    fromId: string;
    text: string;
  }) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const key = ensureThread({ trainerId, memberId });
    const now = new Date().toISOString();
    const msg: Message = {
      id: `msg-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      threadKey: key,
      fromRole,
      fromId,
      text: trimmed,
      createdAt: now,
    };

    setMessagesByThread(prev => {
      const next = { ...(prev ?? {}) };
      next[key] = [...(next[key] ?? []), msg];
      return next;
    });
    setThreads(prev =>
      prev
        .map(t => (t.threadKey === key ? { ...t, lastMessageAt: now } : t))
        .sort(sortThreads),
    );
  };

  const sendCommunityMessage = ({ memberAId, memberBId, fromId, text }: { memberAId: string; memberBId: string; fromId: string; text: string }) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const key = ensureCommunityThread({ memberAId, memberBId });
    const now = new Date().toISOString();
    const msg: Message = {
      id: `msg-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      threadKey: key,
      fromRole: 'member',
      fromId,
      text: trimmed,
      createdAt: now,
    };
    setMessagesByThread(prev => {
      const next = { ...(prev ?? {}) };
      next[key] = [...(next[key] ?? []), msg];
      return next;
    });
    setThreads(prev =>
      prev
        .map(t => (t.threadKey === key ? { ...t, lastMessageAt: now } : t))
        .sort(sortThreads),
    );
  };

  const api = useMemo<MessagingContextValue>(
    () => ({
      threads,
      messagesByThread,
      ensureThread,
      ensureCommunityThread,
      sendMessage,
      sendCommunityMessage,
      getThreadMessages: (key: string) => messagesByThread[key] ?? [],
    }),
    [threads, messagesByThread],
  );

  return <MessagingContext.Provider value={api}>{children}</MessagingContext.Provider>;
}

export function useMessaging() {
  const ctx = useContext(MessagingContext);
  if (!ctx) throw new Error('useMessaging must be used within MessagingProvider');
  return ctx;
}

