import { createContext, useContext } from 'react';
import type { DailyActivity, DailyTracker, Workout } from '../components/member/Dashboard';

export type UserProfile = {
  name: string;
  email: string;
  avatarUri: string | null;
  age: number;
  // Legacy fields used by older AI logic (kept for backwards compatibility)
  weight?: number | null;
  height?: number | null;
  goal: 'lose fat' | 'build muscle' | 'maintain';

  // Onboarding + metrics
  hasCompletedOnboarding: boolean;
  heightCm: number | null;
  weightKg: number | null;
  bmi: number | null;
  fitnessGoal:
    | 'build_muscle'
    | 'lose_weight'
    | 'improve_flexibility'
    | 'boost_endurance'
    | 'maintain_fitness'
    | 'general_fitness'
    | null;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'athlete' | null;

  // Challenges / community
  points: number;
  challengesCompleted: number;
  memberSince: string | null; // YYYY-MM-DD

  totalWorkouts: number;
  totalSteps: number;
  streakDays: number;
  notificationsEnabled: boolean;
  lastActiveDate: string | null;
};

export type DailyHistoryEntry = {
  date: string; // YYYY-MM-DD
  caloriesConsumed: number;
  steps: number;
  workouts: number;
  caloriesBurned: number;
  duration: number;
};

export type MemberDataContextValue = {
  workouts: Workout[];
  dailyTracker: DailyTracker;
  dailyActivity: DailyActivity;
  dailyHistory: Record<string, DailyHistoryEntry>;
  userProfile: UserProfile;
  updateUserProfile: (
    patch: Partial<
      Pick<
        UserProfile,
        | 'name'
        | 'email'
        | 'avatarUri'
        | 'age'
        | 'weight'
        | 'height'
        | 'goal'
        | 'notificationsEnabled'
        | 'hasCompletedOnboarding'
        | 'heightCm'
        | 'weightKg'
        | 'bmi'
        | 'fitnessGoal'
        | 'activityLevel'
        | 'points'
        | 'challengesCompleted'
        | 'memberSince'
      >
    >,
  ) => void;
  updateDailyTracker: (patch: Partial<Pick<DailyTracker, 'caloriesConsumed' | 'steps'>>) => void;
  logWorkout: (workout: Workout) => void;
  selectWorkout: (id: string | null) => void;
};

const MemberDataContext = createContext<MemberDataContextValue | undefined>(undefined);

export function MemberDataProvider({
  value,
  children,
}: {
  value: MemberDataContextValue;
  children: React.ReactNode;
}) {
  return <MemberDataContext.Provider value={value}>{children}</MemberDataContext.Provider>;
}

export function useMemberData() {
  const ctx = useContext(MemberDataContext);
  if (!ctx) throw new Error('useMemberData must be used within MemberDataProvider');
  return ctx;
}

