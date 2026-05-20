import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ProposalStatus = 'pending' | 'confirmed' | 'declined';

export type ProposedWorkout = {
  id: string;
  memberId: string;
  trainerId: string;
  workoutName: string;
  scheduledAt: string; // ISO
  exercises: string[];
  durationMinutes: number;
  status: ProposalStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

type CreateProposalInput = Omit<ProposedWorkout, 'id' | 'status' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

export type WorkoutProposalsContextValue = {
  proposals: ProposedWorkout[];
  proposeWorkout: (input: CreateProposalInput) => ProposedWorkout;
  setProposalStatus: (args: { id: string; status: ProposalStatus }) => void;
  getProposalsForMember: (memberId: string) => ProposedWorkout[];
  getProposalsForTrainer: (trainerId: string) => ProposedWorkout[];
};

const STORAGE_KEY = 'workouts:proposals';

const WorkoutProposalsContext = createContext<WorkoutProposalsContextValue | undefined>(undefined);

function sortNewestFirst(a: ProposedWorkout, b: ProposedWorkout) {
  return b.scheduledAt.localeCompare(a.scheduledAt);
}

export function WorkoutProposalsProvider({ children }: { children: React.ReactNode }) {
  const [proposals, setProposals] = useState<ProposedWorkout[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as ProposedWorkout[]) : [];
        if (!mounted) return;
        setProposals(Array.isArray(parsed) ? parsed.filter(Boolean).sort(sortNewestFirst) : []);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(proposals)).catch(() => {});
  }, [proposals]);

  const proposeWorkout = (input: CreateProposalInput) => {
    const now = new Date().toISOString();
    const proposal: ProposedWorkout = {
      id: input.id ?? `proposal-${Date.now()}`,
      memberId: input.memberId,
      trainerId: input.trainerId,
      workoutName: input.workoutName,
      scheduledAt: input.scheduledAt,
      exercises: input.exercises ?? [],
      durationMinutes: input.durationMinutes ?? 0,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    setProposals(prev => [proposal, ...prev].sort(sortNewestFirst));
    return proposal;
  };

  const setProposalStatus = ({ id, status }: { id: string; status: ProposalStatus }) => {
    const now = new Date().toISOString();
    setProposals(prev =>
      prev
        .map(p => (p.id === id ? { ...p, status, updatedAt: now } : p))
        .sort(sortNewestFirst),
    );
  };

  const api = useMemo<WorkoutProposalsContextValue>(
    () => ({
      proposals,
      proposeWorkout,
      setProposalStatus,
      getProposalsForMember: (memberId: string) => proposals.filter(p => p.memberId === memberId).sort(sortNewestFirst),
      getProposalsForTrainer: (trainerId: string) => proposals.filter(p => p.trainerId === trainerId).sort(sortNewestFirst),
    }),
    [proposals],
  );

  return <WorkoutProposalsContext.Provider value={api}>{children}</WorkoutProposalsContext.Provider>;
}

export function useWorkoutProposals() {
  const ctx = useContext(WorkoutProposalsContext);
  if (!ctx) throw new Error('useWorkoutProposals must be used within WorkoutProposalsProvider');
  return ctx;
}

