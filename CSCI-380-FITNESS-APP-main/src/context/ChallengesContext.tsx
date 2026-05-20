import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ChallengeDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type ChallengeCategory = 'Strength' | 'Cardio' | 'Flexibility' | 'Endurance' | 'Core';
export type ChallengeType = 'reps' | 'time' | 'distance';

export type Challenge = {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  target: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  pointsReward: number;
  createdByTrainerId?: string | null;
  createdAt: string; // ISO
  endsAt: string | null; // ISO
  joinedBy: string[];
  joinedAtByUserId?: Record<string, string>; // ISO
  completedBy: string[];
  completedAtByUserId?: Record<string, string>; // ISO
};

type ChallengesContextValue = {
  challenges: Challenge[];
  createChallenge: (args: {
    trainerId: string;
    title: string;
    description: string;
    pointsReward: number;
    durationDays: number | null;
    category?: ChallengeCategory;
    difficulty?: ChallengeDifficulty;
    type?: ChallengeType;
    target?: string;
  }) => Challenge;
  joinChallenge: (args: { challengeId: string; userId: string }) => { ok: true } | { ok: false; reason: string };
  completeChallenge: (args: { challengeId: string; userId: string }) => { ok: true; pointsAwarded: number } | { ok: false; reason: string };
  isCompleted: (challengeId: string, userId: string) => boolean;
  isJoined: (challengeId: string, userId: string) => boolean;
  isActive: (challengeId: string) => boolean;
  getCompletedAt: (challengeId: string, userId: string) => string | null;
  hasIncompleteDaily: (userId: string) => boolean;
};

const STORAGE_KEY = 'challenges:v1';

const nowISO = () => new Date().toISOString();

function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + Math.max(0, days));
  return d.toISOString();
}

function isFutureOrNow(iso: string) {
  return new Date(iso).getTime() >= Date.now();
}

const seed: Challenge[] = [
  {
    id: 'c1',
    title: '20 Push-Ups',
    description: 'Complete 20 push-ups in one set.',
    type: 'reps',
    target: '20 reps',
    category: 'Strength',
    difficulty: 'Beginner',
    pointsReward: 50,
    createdByTrainerId: null,
    createdAt: new Date(0).toISOString(),
    endsAt: null,
    joinedBy: [],
    completedBy: [],
  },
  {
    id: 'c2',
    title: '60-Second Plank',
    description: 'Hold a plank for 60 seconds.',
    type: 'time',
    target: '60 sec',
    category: 'Core',
    difficulty: 'Intermediate',
    pointsReward: 75,
    createdByTrainerId: null,
    createdAt: new Date(0).toISOString(),
    endsAt: null,
    joinedBy: [],
    completedBy: [],
  },
  {
    id: 'c3',
    title: '10 Pull-Ups',
    description: 'Complete 10 pull-ups.',
    type: 'reps',
    target: '10 reps',
    category: 'Strength',
    difficulty: 'Advanced',
    pointsReward: 100,
    createdByTrainerId: null,
    createdAt: new Date(0).toISOString(),
    endsAt: null,
    joinedBy: [],
    completedBy: [],
  },
  {
    id: 'c4',
    title: '1 Mile Run',
    description: 'Run 1 mile (outdoor or treadmill).',
    type: 'distance',
    target: '1 mile',
    category: 'Cardio',
    difficulty: 'Intermediate',
    pointsReward: 80,
    createdByTrainerId: null,
    createdAt: new Date(0).toISOString(),
    endsAt: null,
    joinedBy: [],
    completedBy: [],
  },
  {
    id: 'c5',
    title: '50 Squats',
    description: 'Complete 50 bodyweight squats.',
    type: 'reps',
    target: '50 reps',
    category: 'Strength',
    difficulty: 'Beginner',
    pointsReward: 50,
    createdByTrainerId: null,
    createdAt: new Date(0).toISOString(),
    endsAt: null,
    joinedBy: [],
    completedBy: [],
  },
  {
    id: 'c6',
    title: '5-Minute Jump Rope',
    description: 'Jump rope for 5 minutes total.',
    type: 'time',
    target: '5 min',
    category: 'Cardio',
    difficulty: 'Beginner',
    pointsReward: 60,
    createdByTrainerId: null,
    createdAt: new Date(0).toISOString(),
    endsAt: null,
    joinedBy: [],
    completedBy: [],
  },
  {
    id: 'c7',
    title: '30 Burpees',
    description: 'Complete 30 burpees.',
    type: 'reps',
    target: '30 reps',
    category: 'Cardio',
    difficulty: 'Advanced',
    pointsReward: 120,
    createdByTrainerId: null,
    createdAt: new Date(0).toISOString(),
    endsAt: null,
    joinedBy: [],
    completedBy: [],
  },
  {
    id: 'c8',
    title: '2-Minute Wall Sit',
    description: 'Hold a wall sit for 2 minutes.',
    type: 'time',
    target: '120 sec',
    category: 'Endurance',
    difficulty: 'Intermediate',
    pointsReward: 70,
    createdByTrainerId: null,
    createdAt: new Date(0).toISOString(),
    endsAt: null,
    joinedBy: [],
    completedBy: [],
  },
];

const ChallengesContext = createContext<ChallengesContextValue | undefined>(undefined);

export function ChallengesProvider({ children }: { children: React.ReactNode }) {
  const [challenges, setChallenges] = useState<Challenge[]>(seed);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as Challenge[]) : null;
        if (!mounted || !parsed) return;
        setChallenges(Array.isArray(parsed) ? parsed.filter(Boolean) : seed);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(challenges)).catch(() => {});
  }, [challenges]);

  const isCompleted = useCallback(
    (challengeId: string, userId: string) => {
      const c = challenges.find(x => x.id === challengeId);
      return !!c?.completedBy?.includes(userId);
    },
    [challenges],
  );

  const isJoined = useCallback(
    (challengeId: string, userId: string) => {
      const c = challenges.find(x => x.id === challengeId);
      return !!c?.joinedBy?.includes(userId);
    },
    [challenges],
  );

  const isActive = useCallback(
    (challengeId: string) => {
      const c = challenges.find(x => x.id === challengeId);
      if (!c) return false;
      if (!c.endsAt) return true;
      return isFutureOrNow(c.endsAt);
    },
    [challenges],
  );

  const getCompletedAt = useCallback(
    (challengeId: string, userId: string) => {
      const c = challenges.find(x => x.id === challengeId);
      return c?.completedAtByUserId?.[userId] ?? null;
    },
    [challenges],
  );

  const hasIncompleteDaily = useCallback(
    (userId: string) => {
      // Legacy name used by the member bottom-nav dot.
      // In the new model, show a dot when the member has any active joined challenge not completed.
      return challenges.some(c => {
        const active = !c.endsAt || isFutureOrNow(c.endsAt);
        if (!active) return false;
        const joined = c.joinedBy.includes(userId);
        const done = c.completedBy.includes(userId);
        return joined && !done;
      });
    },
    [challenges],
  );

  const createChallenge = useCallback(
    (args: {
      trainerId: string;
      title: string;
      description: string;
      pointsReward: number;
      durationDays: number | null;
      category?: ChallengeCategory;
      difficulty?: ChallengeDifficulty;
      type?: ChallengeType;
      target?: string;
    }) => {
      const id = `tc-${Math.random().toString(16).slice(2)}-${Date.now()}`;
      const createdAt = nowISO();
      const endsAt = args.durationDays && args.durationDays > 0 ? addDaysISO(createdAt, args.durationDays) : null;
      const next: Challenge = {
        id,
        title: args.title.trim(),
        description: args.description.trim(),
        type: args.type ?? 'reps',
        target: (args.target ?? '').trim() || (args.type === 'time' ? '60 sec' : args.type === 'distance' ? '1 mile' : '20 reps'),
        category: args.category ?? 'Strength',
        difficulty: args.difficulty ?? 'Beginner',
        pointsReward: Number(args.pointsReward || 0),
        createdByTrainerId: args.trainerId,
        createdAt,
        endsAt,
        joinedBy: [],
        completedBy: [],
      };
      setChallenges(prev => [next, ...prev]);
      return next;
    },
    [],
  );

  const joinChallenge = useCallback(
    ({ challengeId, userId }: { challengeId: string; userId: string }) => {
      const c = challenges.find(x => x.id === challengeId);
      if (!c) return { ok: false as const, reason: 'Challenge not found.' };
      if (c.endsAt && !isFutureOrNow(c.endsAt)) return { ok: false as const, reason: 'Challenge has ended.' };
      if (c.joinedBy.includes(userId)) return { ok: false as const, reason: 'Already joined.' };
      const now = nowISO();
      setChallenges(prev =>
        prev.map(x =>
          x.id !== challengeId
            ? x
            : { ...x, joinedBy: [...x.joinedBy, userId], joinedAtByUserId: { ...(x.joinedAtByUserId ?? {}), [userId]: now } },
        ),
      );
      return { ok: true as const };
    },
    [challenges],
  );

  const completeChallenge = useCallback(
    ({ challengeId, userId }: { challengeId: string; userId: string }) => {
      const c = challenges.find(x => x.id === challengeId);
      if (!c) return { ok: false as const, reason: 'Challenge not found.' };
      if (c.endsAt && !isFutureOrNow(c.endsAt)) return { ok: false as const, reason: 'Challenge has ended.' };
      if (!c.joinedBy.includes(userId)) return { ok: false as const, reason: 'Join the challenge first.' };
      if (c.completedBy.includes(userId)) return { ok: false as const, reason: 'Already completed.' };
      const now = nowISO();
      setChallenges(prev =>
        prev.map(x =>
          x.id !== challengeId
            ? x
            : { ...x, completedBy: [...x.completedBy, userId], completedAtByUserId: { ...(x.completedAtByUserId ?? {}), [userId]: now } },
        ),
      );
      return { ok: true as const, pointsAwarded: c.pointsReward };
    },
    [challenges],
  );

  const value = useMemo<ChallengesContextValue>(
    () => ({
      challenges,
      createChallenge,
      joinChallenge,
      completeChallenge,
      isCompleted,
      isJoined,
      isActive,
      getCompletedAt,
      hasIncompleteDaily,
    }),
    [challenges, completeChallenge, createChallenge, getCompletedAt, hasIncompleteDaily, isActive, isCompleted, isJoined, joinChallenge],
  );

  return <ChallengesContext.Provider value={value}>{children}</ChallengesContext.Provider>;
}

export function useChallenges() {
  const ctx = useContext(ChallengesContext);
  if (!ctx) throw new Error('useChallenges must be used within ChallengesProvider');
  return ctx;
}

