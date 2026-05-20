import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type FeatureFlagKey =
  | 'enable_ai_recommendations'
  | 'enable_member_messaging'
  | 'enable_workout_confirmation'
  | 'enable_progress_tracking'
  | 'enable_streak_tracking'
  | 'enable_challenges'
  | 'enable_leaderboard'
  | 'enable_trainer_availability'
  | 'enable_session_proposals'
  | 'enable_video_sessions'
  | 'enable_nutrition_plans'
  | 'enable_push_notifications';

export type FeatureFlagScope = 'Members' | 'Trainers' | 'Admin' | 'All Users';
export type FeatureFlagCategory = 'Member Features' | 'Trainer Features' | 'Platform Features';

export type FeatureFlagMeta = {
  key: FeatureFlagKey;
  name: string;
  description: string;
  scope: FeatureFlagScope;
  category: FeatureFlagCategory;
};

export type FeatureFlagState = {
  enabled: boolean;
  lastModifiedAt: string | null;
  lastModifiedBy: string | null;
};

export type FeatureFlagsSnapshot = Record<FeatureFlagKey, FeatureFlagState>;

const STORAGE_KEY = 'featureFlags:v1';

const meta: FeatureFlagMeta[] = [
  {
    key: 'enable_ai_recommendations',
    name: 'AI workout recommendations',
    description: 'Show goal-based AI recommendations on the member dashboard.',
    scope: 'Members',
    category: 'Member Features',
  },
  {
    key: 'enable_member_messaging',
    name: 'Trainer messaging',
    description: 'Enable chat between members and trainers (both sides).',
    scope: 'All Users',
    category: 'Member Features',
  },
  {
    key: 'enable_workout_confirmation',
    name: 'Workout confirmations',
    description: 'Allow members to confirm or decline proposed sessions.',
    scope: 'Members',
    category: 'Member Features',
  },
  {
    key: 'enable_progress_tracking',
    name: 'Progress tracking',
    description: 'Show progress charts and metrics in member views.',
    scope: 'Members',
    category: 'Member Features',
  },
  {
    key: 'enable_streak_tracking',
    name: 'Streak tracking',
    description: 'Calculate and display workout/activity streaks.',
    scope: 'All Users',
    category: 'Member Features',
  },
  {
    key: 'enable_challenges',
    name: 'Challenges',
    description: 'Enable member challenges and points rewards.',
    scope: 'Members',
    category: 'Member Features',
  },
  {
    key: 'enable_leaderboard',
    name: 'Community leaderboard',
    description: 'Enable the community points leaderboard and public profiles.',
    scope: 'Members',
    category: 'Member Features',
  },
  {
    key: 'enable_trainer_availability',
    name: 'Trainer availability',
    description: 'Show trainer availability schedule to members on trainer profile.',
    scope: 'Members',
    category: 'Trainer Features',
  },
  {
    key: 'enable_session_proposals',
    name: 'Session proposals',
    description: 'Allow trainers to propose workout sessions to members.',
    scope: 'Trainers',
    category: 'Trainer Features',
  },
  {
    key: 'enable_video_sessions',
    name: 'Video sessions (placeholder)',
    description: 'Show a Video Session badge/button placeholder on session cards.',
    scope: 'All Users',
    category: 'Platform Features',
  },
  {
    key: 'enable_nutrition_plans',
    name: 'Nutrition module (placeholder)',
    description: 'Show a Nutrition tab/section placeholder in member views.',
    scope: 'Members',
    category: 'Platform Features',
  },
  {
    key: 'enable_push_notifications',
    name: 'Push notifications UI',
    description: 'Show notification bell and alert banners across the app.',
    scope: 'All Users',
    category: 'Platform Features',
  },
];

const defaultSnapshot: FeatureFlagsSnapshot = {
  enable_ai_recommendations: { enabled: true, lastModifiedAt: null, lastModifiedBy: null },
  enable_member_messaging: { enabled: true, lastModifiedAt: null, lastModifiedBy: null },
  enable_workout_confirmation: { enabled: true, lastModifiedAt: null, lastModifiedBy: null },
  enable_progress_tracking: { enabled: true, lastModifiedAt: null, lastModifiedBy: null },
  enable_streak_tracking: { enabled: true, lastModifiedAt: null, lastModifiedBy: null },
  enable_challenges: { enabled: true, lastModifiedAt: null, lastModifiedBy: null },
  enable_leaderboard: { enabled: true, lastModifiedAt: null, lastModifiedBy: null },
  enable_trainer_availability: { enabled: true, lastModifiedAt: null, lastModifiedBy: null },
  enable_session_proposals: { enabled: true, lastModifiedAt: null, lastModifiedBy: null },
  enable_video_sessions: { enabled: false, lastModifiedAt: null, lastModifiedBy: null },
  enable_nutrition_plans: { enabled: false, lastModifiedAt: null, lastModifiedBy: null },
  enable_push_notifications: { enabled: true, lastModifiedAt: null, lastModifiedBy: null },
};

type FeatureFlagsContextValue = {
  meta: FeatureFlagMeta[];
  snapshot: FeatureFlagsSnapshot;
  setFlag: (args: { key: FeatureFlagKey; enabled: boolean; modifiedBy?: string | null }) => void;
  isEnabled: (key: FeatureFlagKey) => boolean;
};

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | undefined>(undefined);

export function FeatureFlagsProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<FeatureFlagsSnapshot>(defaultSnapshot);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as Partial<FeatureFlagsSnapshot>) : null;
        if (!mounted || !parsed) return;
        setSnapshot(prev => ({ ...prev, ...(parsed as any) }));
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)).catch(() => {});
  }, [snapshot]);

  const setFlag = useCallback(
    ({ key, enabled, modifiedBy }: { key: FeatureFlagKey; enabled: boolean; modifiedBy?: string | null }) => {
      const now = new Date().toISOString();
      setSnapshot(prev => ({
        ...prev,
        [key]: {
          enabled,
          lastModifiedAt: now,
          lastModifiedBy: modifiedBy ?? prev[key]?.lastModifiedBy ?? null,
        },
      }));
    },
    [],
  );

  const isEnabled = useCallback((key: FeatureFlagKey) => snapshot[key]?.enabled ?? false, [snapshot]);

  const value = useMemo<FeatureFlagsContextValue>(() => ({ meta, snapshot, setFlag, isEnabled }), [snapshot, setFlag, isEnabled]);

  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>;
}

export function useFeatureFlags() {
  const ctx = useContext(FeatureFlagsContext);
  if (!ctx) throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  return ctx;
}

export function useFeatureFlag(key: FeatureFlagKey) {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(key);
}

