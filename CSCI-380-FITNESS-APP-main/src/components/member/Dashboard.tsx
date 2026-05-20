import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useFeatureFlag } from '../../context/FeatureFlagsContext';
import { useTheme } from '../../context/ThemeContext';
import { CircularProgressRing } from './CircularProgressRing';

export type WorkoutType = 'strength' | 'cardio' | 'yoga' | 'custom';

export type Workout = {
  id: string;
  type: WorkoutType;
  date: string;
  duration: number;
  details: Record<string, any>;
  summary: string;
};

export type DailyActivity = {
  date: string;
  totalWorkouts: number;
  totalDuration: number;
  caloriesBurned: number;
};

export type DailyTracker = {
  date: string;
  caloriesConsumed: number;
  steps: number;
};

export type FoodLogListItem = {
  id: number;
  foodName: string;
  calories: number;
  loggedAt: string;
};

export type ProposedWorkoutCard = {
  id: string;
  trainerId: string;
  workoutName: string;
  trainerName: string;
  scheduledAt: string; // ISO
  exercises: string[];
  durationMinutes: number;
  status: 'pending' | 'confirmed' | 'declined';
};

export type AIRecommendationCard = {
  id: string;
  title: string;
  category: 'Strength' | 'Cardio' | 'Flexibility' | 'Endurance' | 'Mixed';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  muscleGroups: string[];
  saved?: boolean;
  why: string;
};

type Props = {
  onQuickLog: () => void;
  onOpenDailyTracker: () => void;
  userName?: string;
  caloriesToday?: number;
  caloriesGoal?: number;
  recentFood?: FoodLogListItem[];
  loading?: boolean;
  error?: string | null;
  workouts: Workout[];
  onSelectWorkout: (id: string) => void;
  dailyActivity: DailyActivity;
  dailyTracker: DailyTracker;
  onUpdateDailyTracker: (patch: Partial<Pick<DailyTracker, 'caloriesConsumed' | 'steps'>>) => void;
  proposedWorkouts: ProposedWorkoutCard[];
  onConfirmProposedWorkout: (id: string) => void;
  onDeclineProposedWorkout: (id: string) => void;
  aiRecommendations: AIRecommendationCard[];
  onStartRecommendation: (id: string) => void;
  onToggleSaveRecommendation: (id: string) => void;
  onRefreshRecommendations: () => void;
  onPromptSetGoal: () => void;
  onOpenTrainerProfile: (trainerId: string) => void;
};

export function Dashboard({
  onQuickLog,
  onOpenDailyTracker,
  userName,
  caloriesToday = 0,
  caloriesGoal = 2000,
  recentFood = [],
  loading = false,
  error = null,
  workouts,
  onSelectWorkout,
  dailyActivity,
  dailyTracker,
  onUpdateDailyTracker,
  proposedWorkouts,
  onConfirmProposedWorkout,
  onDeclineProposedWorkout,
  aiRecommendations,
  onStartRecommendation,
  onToggleSaveRecommendation,
  onRefreshRecommendations,
  onPromptSetGoal,
  onOpenTrainerProfile,
}: Props) {
  const { colors } = useTheme();
  const enableAI = useFeatureFlag('enable_ai_recommendations');
  const enableConfirm = useFeatureFlag('enable_workout_confirmation');
  const stats = {
    steps: dailyTracker.steps,
    stepsGoal: 10000,
    calories: caloriesToday,
    caloriesGoal,
    activeMinutes: dailyActivity.totalDuration,
    activeGoal: 60,
  };
  const recentWorkouts = workouts.slice(0, 8);

  return (
    <View style={{ gap: 24 }}>
      <View>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>
          {userName ? `Welcome back, ${userName}!` : 'Welcome back!'}
        </Text>
        <Text style={{ color: colors.textMuted, marginTop: 4 }}>
          Calories today: <Text style={{ fontWeight: '800', color: colors.text }}>{caloriesToday}</Text> /{' '}
          <Text style={{ fontWeight: '800', color: colors.text }}>{caloriesGoal}</Text>
        </Text>
      </View>

      <View
        style={{
          borderRadius: 16,
          padding: 20,
          backgroundColor: '#ecfdf5',
          borderWidth: 1,
          borderColor: '#d1fae5',
        }}
      >
        <Text style={{ marginBottom: 16, fontWeight: '600', color: colors.text }}>
          Today&apos;s Activity
        </Text>
        <Text style={{ color: colors.textMuted, marginBottom: 12 }}>
          Workouts: <Text style={{ fontWeight: '900', color: colors.text }}>{dailyActivity.totalWorkouts}</Text>
          {'  '}•{'  '}Duration:{' '}
          <Text style={{ fontWeight: '900', color: colors.text }}>{dailyActivity.totalDuration} min</Text>
        </Text>
        {error ? (
          <View
            style={{
              marginBottom: 12,
              padding: 12,
              borderRadius: 12,
              backgroundColor: '#fef2f2',
              borderWidth: 1,
              borderColor: '#fecaca',
            }}
          >
            <Text style={{ color: colors.danger }}>{error}</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <CircularProgressRing
            value={stats.steps}
            max={stats.stepsGoal}
            label="Steps"
            accent="#0ea5e9"
            icon={<Ionicons name="walk" size={18} color={colors.primary} />}
          />
          <CircularProgressRing
            value={stats.calories}
            max={stats.caloriesGoal}
            label="Calories"
            accent="#f97316"
            icon={<Ionicons name="flame" size={18} color="#ea580c" />}
          />
          <CircularProgressRing
            value={stats.activeMinutes}
            max={stats.activeGoal}
            label="Active Min"
            accent="#10b981"
            icon={<Ionicons name="trending-up" size={18} color="#059669" />}
          />
        </View>
        {loading ? (
          <View style={{ marginTop: 12, alignItems: 'center' }}>
            <ActivityIndicator />
          </View>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable
          onPress={onQuickLog}
          style={{
            flex: 1,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: colors.primary,
          }}
        >
          <Ionicons name="barbell" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '600' }}>Log Workout</Text>
        </Pressable>
        <Pressable
          onPress={onOpenDailyTracker}
          style={{
            flex: 1,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          <Ionicons name="checkbox" size={20} color={colors.text} />
          <Text style={{ fontWeight: '600', color: colors.text }}>Daily Tracker</Text>
        </Pressable>
      </View>

      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={{ fontWeight: '600', marginBottom: 12, color: colors.text }}>My Workouts</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            Proposed: {proposedWorkouts.filter(p => p.status === 'pending').length}
          </Text>
        </View>

        {proposedWorkouts.length === 0 ? (
          <View
            style={{
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
            }}
          >
            <Text style={{ color: colors.textMuted }}>
              No proposed sessions yet. When your trainer schedules something, it will appear here.
            </Text>
          </View>
        ) : (
          proposedWorkouts.slice(0, 6).map(p => {
            const when = new Date(p.scheduledAt).toLocaleString();
            const statusPalette =
              p.status === 'confirmed'
                ? { bg: '#dcfce7', fg: '#166534', label: 'Confirmed', icon: 'checkmark-circle' as const }
                : p.status === 'declined'
                  ? { bg: '#fee2e2', fg: '#b91c1c', label: 'Declined', icon: 'close-circle' as const }
                  : { bg: '#fef9c3', fg: '#854d0e', label: 'Pending', icon: 'time' as const };

            return (
              <View
                key={p.id}
                style={{
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  padding: 14,
                  marginBottom: 10,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '900', color: colors.text }} numberOfLines={1}>
                      {p.workoutName}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                      <Text style={{ color: colors.textMuted }}>Trainer:</Text>
                      <Pressable onPress={() => onOpenTrainerProfile(p.trainerId)} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
                        <Text style={{ fontWeight: '800', color: colors.text }} numberOfLines={1}>
                          {p.trainerName}
                        </Text>
                      </Pressable>
                    </View>
                    <Text style={{ color: colors.textMuted, marginTop: 2 }} numberOfLines={1}>
                      {when} • {p.durationMinutes} min
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 999,
                        backgroundColor: statusPalette.bg,
                      }}
                    >
                      <Ionicons name={statusPalette.icon} size={14} color={statusPalette.fg} />
                      <Text style={{ color: statusPalette.fg, fontWeight: '900', fontSize: 11 }}>
                        {statusPalette.label}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={{ marginTop: 10, color: colors.textMuted, fontSize: 12, fontWeight: '800' }}>
                  Exercises
                </Text>
                <Text style={{ color: colors.textMuted, marginTop: 4 }} numberOfLines={2}>
                  {p.exercises.length ? p.exercises.join(' • ') : '—'}
                </Text>

                {p.status === 'pending' && enableConfirm ? (
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                    <Pressable
                      onPress={() => onConfirmProposedWorkout(p.id)}
                      style={({ pressed }) => ({
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 12,
                        backgroundColor: '#dcfce7',
                        borderWidth: 1,
                        borderColor: '#bbf7d0',
                        alignItems: 'center',
                        opacity: pressed ? 0.9 : 1,
                      })}
                    >
                      <Text style={{ fontWeight: '900', color: '#166534' }}>Confirm</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => onDeclineProposedWorkout(p.id)}
                      style={({ pressed }) => ({
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 12,
                        backgroundColor: '#fee2e2',
                        borderWidth: 1,
                        borderColor: '#fecaca',
                        alignItems: 'center',
                        opacity: pressed ? 0.9 : 1,
                      })}
                    >
                      <Text style={{ fontWeight: '900', color: colors.danger }}>Decline</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </View>

      {enableAI ? (
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontWeight: '900', marginBottom: 2, color: colors.text }}>✨ Recommended For You</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>Personalized suggestions</Text>
            </View>
            <Pressable
              onPress={onRefreshRecommendations}
              style={({ pressed }) => ({
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ fontWeight: '900', color: colors.text }}>Refresh</Text>
            </Pressable>
          </View>

          {aiRecommendations.length === 0 ? (
            <View
              style={{
                marginTop: 12,
                padding: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <Text style={{ fontWeight: '900', color: colors.text }}>Set your fitness goal</Text>
              <Text style={{ color: colors.textMuted, marginTop: 6 }}>
                Set your fitness goal to get personalized recommendations.
              </Text>
              <Pressable
                onPress={onPromptSetGoal}
                style={({ pressed }) => ({
                  marginTop: 12,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text style={{ color: '#fff', fontWeight: '900' }}>Go to Profile</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              <View style={{ flexDirection: 'row', gap: 10, paddingRight: 8 }}>
                {aiRecommendations.slice(0, 6).map(r => {
                  const icon =
                    r.category === 'Strength'
                      ? ('barbell' as const)
                      : r.category === 'Cardio'
                        ? ('walk' as const)
                        : r.category === 'Flexibility'
                          ? ('leaf' as const)
                          : r.category === 'Endurance'
                            ? ('bicycle' as const)
                            : ('sparkles' as const);
                  return (
                    <View
                      key={r.id}
                      style={{
                        width: 260,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: colors.card,
                        padding: 14,
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 12,
                                backgroundColor: '#eff6ff',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Ionicons name={icon} size={18} color={colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontWeight: '900', color: colors.text }} numberOfLines={1}>
                                {r.title}
                              </Text>
                              <Text style={{ color: colors.textMuted, marginTop: 2, fontSize: 12 }}>
                                {r.durationMinutes} min • {r.category}
                              </Text>
                            </View>
                          </View>

                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#f1f5f9' }}>
                              <Text style={{ fontWeight: '900', color: colors.textMuted, fontSize: 11 }}>{r.difficulty}</Text>
                            </View>
                            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#eff6ff' }}>
                              <Text style={{ fontWeight: '900', color: colors.primary, fontSize: 11 }} numberOfLines={1}>
                                {r.why}
                              </Text>
                            </View>
                          </View>

                          <Text style={{ color: colors.textMuted, marginTop: 10 }} numberOfLines={2}>
                            Focus: {r.muscleGroups.join(', ')}
                          </Text>
                        </View>

                        <Pressable
                          onPress={() => onToggleSaveRecommendation(r.id)}
                          style={({ pressed }) => ({
                            alignSelf: 'flex-start',
                            padding: 10,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: colors.border,
                            backgroundColor: r.saved ? '#fef9c3' : colors.card,
                            opacity: pressed ? 0.9 : 1,
                          })}
                        >
                          <Ionicons name={r.saved ? 'bookmark' : 'bookmark-outline'} size={18} color={colors.text} />
                        </Pressable>
                      </View>

                      <Pressable
                        onPress={() => onStartRecommendation(r.id)}
                        style={({ pressed }) => ({
                          marginTop: 12,
                          paddingVertical: 12,
                          borderRadius: 12,
                          backgroundColor: colors.primary,
                          alignItems: 'center',
                          opacity: pressed ? 0.9 : 1,
                        })}
                      >
                        <Text style={{ fontWeight: '900', color: '#fff' }}>Start Workout</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>
      ) : null}

      <View>
        <Text style={{ fontWeight: '600', marginBottom: 12, color: colors.text }}>
          Recent Food Logs
        </Text>
        {recentFood.length === 0 ? (
          <View
            style={{
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
            }}
          >
            <Text style={{ color: colors.textMuted }}>
              No food logs yet. Add a row in Supabase `food_logs` to see it here.
            </Text>
          </View>
        ) : (
          recentFood.map(item => (
            <View
              key={item.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 8,
                backgroundColor: colors.card,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#ffedd5',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="restaurant" size={20} color="#ea580c" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: colors.text }} numberOfLines={1}>
                    {item.foodName}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted }} numberOfLines={1}>
                    {new Date(item.loggedAt).toLocaleString()}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontWeight: '700', color: colors.text }}>{item.calories} cal</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View>
        <Text style={{ fontWeight: '600', marginBottom: 12, color: colors.text }}>
          Recent Workouts
        </Text>
        {recentWorkouts.length === 0 ? (
          <View
            style={{
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
            }}
          >
            <Text style={{ color: colors.textMuted }}>No workouts logged yet.</Text>
          </View>
        ) : (
          recentWorkouts.map((w, idx) => {
            const isMostRecent = idx === 0;
            const when = new Date(w.date).toLocaleString();
            const icon =
              w.type === 'strength'
                ? ('barbell' as const)
                : w.type === 'cardio'
                  ? ('timer' as const)
                  : w.type === 'yoga'
                    ? ('leaf' as const)
                    : ('flash' as const);
            const tint =
              w.type === 'strength'
                ? '#7c3aed'
                : w.type === 'cardio'
                  ? '#2563eb'
                  : w.type === 'yoga'
                    ? '#059669'
                    : '#ea580c';

            return (
              <Pressable
                key={w.id}
                onPress={() => onSelectWorkout(w.id)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: isMostRecent ? tint : colors.border,
                  marginBottom: 8,
                  backgroundColor: isMostRecent ? tint + '12' : colors.card,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: tint + '22',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name={icon} size={20} color={tint} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '800', color: colors.text }} numberOfLines={1}>
                      {w.type.toUpperCase()}
                      {isMostRecent ? ' • Latest' : ''}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted }} numberOfLines={1}>
                      {w.summary}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }} numberOfLines={1}>
                      {when}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontWeight: '800', color: colors.text }}>{w.duration} min</Text>
                </View>
              </Pressable>
            );
          })
        )}
      </View>
    </View>
  );
}
