import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ClientsStackParamList } from '../../navigation/ClientsStack';
import { useAuth } from '../../context/AuthContext';
import { useMessaging } from '../../context/MessagingContext';
import { useWorkoutProposals } from '../../context/WorkoutProposalsContext';
import { useFeatureFlag } from '../../context/FeatureFlagsContext';
import { getMemberById, getTrainerById } from '../../lib/mockDirectory';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<ClientsStackParamList, 'ClientDetail'>;
const progressData = [
  { week: 'W1', weight: 185, strength: 65 },
  { week: 'W2', weight: 183, strength: 68 },
  { week: 'W3', weight: 181, strength: 72 },
  { week: 'W4', weight: 179, strength: 75 },
  { week: 'W5', weight: 177, strength: 78 },
  { week: 'W6', weight: 175, strength: 82 },
];

const workouts = [
  { date: '2026-04-11', name: 'Upper Body Strength', duration: '45 min' },
  { date: '2026-04-09', name: 'Cardio & Core', duration: '30 min' },
  { date: '2026-04-07', name: 'Lower Body Power', duration: '50 min' },
];

const tabs = ['overview', 'workouts', 'nutrition', 'messages', 'notes'] as const;

export function ClientDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { user } = useAuth();
  const enableStreaks = useFeatureFlag('enable_streak_tracking');
  const enableProgress = useFeatureFlag('enable_progress_tracking');
  const enableSessionProposals = useFeatureFlag('enable_session_proposals');
  const enableNutrition = useFeatureFlag('enable_nutrition_plans');
  const { proposeWorkout, getProposalsForMember } = useWorkoutProposals();
  const { sendMessage, ensureThread, getThreadMessages } = useMessaging();
  const [tab, setTab] = useState<(typeof tabs)[number]>('overview');
  const [workoutName, setWorkoutName] = useState('1:1 Training Session');
  const [scheduledAtText, setScheduledAtText] = useState(() => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const iso = d.toISOString();
    return iso.slice(0, 16).replace('T', ' ');
  });
  const [durationMinutes, setDurationMinutes] = useState('45');
  const [exercisesText, setExercisesText] = useState('Goblet squat, Push-up, Row, Plank');

  const trainerId = useMemo(() => {
    if (!user?.id) return 'trainer-1';
    if (user.id === 'dev-trainer') return 'trainer-1';
    return user.id;
  }, [user?.id]);
  const trainer = useMemo(() => getTrainerById(trainerId), [trainerId]);
  const member = useMemo(() => getMemberById(id), [id]);

  const maxW = useMemo(() => Math.max(...progressData.map(d => d.weight), 1), []);
  const maxS = useMemo(() => Math.max(...progressData.map(d => d.strength), 1), []);

  const input = {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.card,
    color: colors.text,
  } as const;

  const proposals = useMemo(() => getProposalsForMember(id), [getProposalsForMember, id]);

  const [threadKey, setThreadKey] = useState<string | null>(null);
  useEffect(() => {
    setThreadKey(ensureThread({ trainerId, memberId: id }));
  }, [ensureThread, id, trainerId]);
  const messages = useMemo(() => (threadKey ? getThreadMessages(threadKey) : []), [getThreadMessages, threadKey]);

  const scheduleISO = (raw: string) => {
    const trimmed = raw.trim();
    // Accept "YYYY-MM-DD HH:mm" or ISO.
    const normalized = trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T');
    const asDate = new Date(normalized);
    if (Number.isNaN(asDate.getTime())) return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    return asDate.toISOString();
  };

  const onPropose = () => {
    const scheduledAt = scheduleISO(scheduledAtText);
    const exercises = exercisesText
      .split(/[,\n]/g)
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 20);
    const dur = Math.max(10, Number(durationMinutes || 0) || 0);
    const created = proposeWorkout({
      memberId: id,
      trainerId,
      workoutName: workoutName.trim() || 'Training Session',
      scheduledAt,
      exercises,
      durationMinutes: dur,
    });
    sendMessage({
      trainerId,
      memberId: id,
      fromRole: 'trainer',
      fromId: trainerId,
      text: `I proposed "${created.workoutName}" for ${new Date(created.scheduledAt).toLocaleString()}. Please confirm or decline in your dashboard.`,
    });
    setTab('workouts');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, fontWeight: '700' }}>Clients</Text>
        </Pressable>

        <View
          style={{
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 14,
          }}
        >
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>
                {(member?.name ?? 'M').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text }}>
                {member?.name ?? 'Member'}
              </Text>
              <Text style={{ color: colors.textMuted }}>{member?.email ?? ''}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>Member #{id}</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#eff6ff' }}>
                  <Text style={{ color: '#1d4ed8', fontWeight: '800' }}>
                    Goal: {member?.goal ?? 'maintain'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {tabs.filter(t => (t === 'nutrition' ? enableNutrition : true)).map(t => (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 999,
                  backgroundColor: tab === t ? colors.primary : '#f1f5f9',
                }}
              >
                <Text style={{ fontWeight: '800', color: tab === t ? '#fff' : colors.text, textTransform: 'capitalize' }}>
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {tab === 'overview' && (
          <View style={{ marginTop: 14, gap: 14 }}>
            {enableStreaks ? (
            <View
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#fed7aa',
                backgroundColor: '#fff7ed',
                padding: 14,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: '#ffedd5',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="flame" size={22} color="#ea580c" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '900', color: colors.text }}>Streaks</Text>
                  <Text style={{ color: colors.textMuted, marginTop: 2 }}>
                    Last active:{' '}
                    <Text style={{ fontWeight: '900', color: colors.text }}>
                      {member?.lastActiveDate ? new Date(member.lastActiveDate).toLocaleDateString() : '—'}
                    </Text>
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <View
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    backgroundColor: '#ffffff',
                    borderWidth: 1,
                    borderColor: '#fed7aa',
                    padding: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 24, fontWeight: '900', color: '#c2410c' }}>
                    {member?.currentStreakDays ?? 0}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontWeight: '800', marginTop: 4 }}>Current streak</Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    backgroundColor: '#ffffff',
                    borderWidth: 1,
                    borderColor: '#fed7aa',
                    padding: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 24, fontWeight: '900', color: '#c2410c' }}>
                    {member?.longestStreakDays ?? 0}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontWeight: '800', marginTop: 4 }}>Longest streak</Text>
                </View>
              </View>
            </View>
            ) : null}

            {enableProgress ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {[
                { label: 'Current Weight', value: '175 lbs', sub: '-10 lbs' },
                { label: 'Workouts/Week', value: '4.2', sub: '+0.8' },
                { label: 'Days Active', value: '42' },
                { label: 'Progress', value: '85%' },
              ].map(s => (
                <View
                  key={s.label}
                  style={{
                    flexGrow: 1,
                    flexBasis: '45%',
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    padding: 12,
                  }}
                >
                  <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text }}>{s.value}</Text>
                  <Text style={{ color: colors.textMuted, marginTop: 4 }}>{s.label}</Text>
                  {'sub' in s && s.sub ? <Text style={{ color: '#16a34a', marginTop: 4, fontWeight: '800' }}>{s.sub}</Text> : null}
                </View>
              ))}
            </View>
            ) : null}

            {enableProgress ? (
            <View
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 14,
              }}
            >
              <Text style={{ fontWeight: '900', marginBottom: 10, color: colors.text }}>Progress Over Time</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>Weight (Blue) Vs Strength Score (Green)</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 140 }}>
                {progressData.map(d => (
                  <View key={d.week} style={{ flex: 1, alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', gap: 4, alignItems: 'flex-end', height: 120 }}>
                      <View
                        style={{
                          width: 8,
                          height: ((maxW - d.weight + 10) / maxW) * 110,
                          borderRadius: 4,
                          backgroundColor: '#93c5fd',
                        }}
                      />
                      <View
                        style={{
                          width: 8,
                          height: (d.strength / maxS) * 110,
                          borderRadius: 4,
                          backgroundColor: '#86efac',
                        }}
                      />
                    </View>
                    <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 6 }}>{d.week}</Text>
                  </View>
                ))}
              </View>
            </View>
            ) : null}

            <View
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#bfdbfe',
                backgroundColor: '#eff6ff',
                padding: 14,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '900', color: colors.text }}>12-Week Weight Loss Program</Text>
                <Text style={{ color: colors.primary, fontWeight: '800' }}>Week 6 of 12</Text>
              </View>
              <Text style={{ color: colors.textMuted, marginTop: 8 }}>
                Strength training 3x/week, cardio 2x/week, active rest 2x/week
              </Text>
            </View>

            <Text style={{ fontWeight: '900', color: colors.text }}>Recent Workouts</Text>
            {workouts.map((w, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  gap: 12,
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: '#f8fafc',
                }}
              >
                <View style={{ padding: 10, borderRadius: 10, backgroundColor: '#dcfce7' }}>
                  <Ionicons name="barbell" size={18} color="#166534" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '800', color: colors.text }}>{w.name}</Text>
                  <Text style={{ color: colors.textMuted }}>{w.duration}</Text>
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{w.date}</Text>
              </View>
            ))}
          </View>
        )}

        {tab === 'workouts' && (
          <View style={{ marginTop: 14, gap: 14 }}>
            {enableSessionProposals ? (
              <View
                style={{
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  padding: 14,
                }}
              >
                <Text style={{ fontWeight: '900', color: colors.text }}>Propose workout session</Text>
                <Text style={{ color: colors.textMuted, marginTop: 6 }}>
                  This creates a proposal the member can confirm/decline.
                </Text>

              <Text style={{ fontSize: 12, fontWeight: '900', color: colors.text, marginTop: 12 }}>Workout name</Text>
              <TextInput
                value={workoutName}
                onChangeText={setWorkoutName}
                placeholder="e.g., Strength + Core"
                placeholderTextColor={colors.textMuted}
                style={input}
              />

              <Text style={{ fontSize: 12, fontWeight: '900', color: colors.text, marginTop: 12 }}>
                Scheduled (YYYY-MM-DD HH:mm)
              </Text>
              <TextInput
                value={scheduledAtText}
                onChangeText={setScheduledAtText}
                placeholder="2026-04-30 10:00"
                placeholderTextColor={colors.textMuted}
                style={input}
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '900', color: colors.text }}>Duration (min)</Text>
                  <TextInput
                    value={durationMinutes}
                    onChangeText={setDurationMinutes}
                    keyboardType="number-pad"
                    placeholder="45"
                    placeholderTextColor={colors.textMuted}
                    style={input}
                  />
                </View>
                <View style={{ flex: 1 }} />
              </View>

              <Text style={{ fontSize: 12, fontWeight: '900', color: colors.text, marginTop: 12 }}>
                Exercises (comma or newline separated)
              </Text>
              <TextInput
                value={exercisesText}
                onChangeText={setExercisesText}
                multiline
                placeholder="Squat, Bench, Row..."
                placeholderTextColor={colors.textMuted}
                style={[input, { minHeight: 90, textAlignVertical: 'top' }]}
              />

                <Pressable
                  onPress={onPropose}
                  style={({ pressed }) => ({
                    marginTop: 12,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: colors.primary,
                    alignItems: 'center',
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ color: '#fff', fontWeight: '900' }}>Send proposal</Text>
                </Pressable>
              </View>
            ) : null}

            <View
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 14,
              }}
            >
              <Text style={{ fontWeight: '900', color: colors.text }}>Proposals</Text>
              <Text style={{ color: colors.textMuted, marginTop: 6 }}>
                Pending confirmations and upcoming sessions.
              </Text>

              {proposals.length === 0 ? (
                <Text style={{ color: colors.textMuted, marginTop: 10 }}>No proposals yet.</Text>
              ) : (
                <View style={{ marginTop: 10, gap: 10 }}>
                  {proposals.slice(0, 8).map(p => (
                    <View
                      key={p.id}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: '#f8fafc',
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: '900', color: colors.text }} numberOfLines={1}>
                            {p.workoutName}
                          </Text>
                          <Text style={{ color: colors.textMuted, marginTop: 4 }}>
                            {new Date(p.scheduledAt).toLocaleString()} • {p.durationMinutes} min
                          </Text>
                          <Text style={{ color: colors.textMuted, marginTop: 4 }} numberOfLines={2}>
                            {p.exercises.join(' • ') || '—'}
                          </Text>
                        </View>
                        <View
                          style={{
                            alignSelf: 'flex-start',
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 999,
                            backgroundColor:
                              p.status === 'confirmed' ? '#dcfce7' : p.status === 'declined' ? '#fee2e2' : '#fef9c3',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '900',
                              color:
                                p.status === 'confirmed' ? '#166534' : p.status === 'declined' ? '#b91c1c' : '#854d0e',
                            }}
                          >
                            {p.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#bfdbfe',
                backgroundColor: '#eff6ff',
                padding: 14,
              }}
            >
              <Text style={{ fontWeight: '900', color: colors.text }}>
                Assigned plan: {member?.assignedPlan ?? '—'}
              </Text>
              <Text style={{ color: colors.textMuted, marginTop: 8 }}>
                Trainer: {trainer?.name ?? user?.name ?? 'Trainer'}
              </Text>
            </View>
          </View>
        )}

        {tab === 'nutrition' && (
          <Text style={{ marginTop: 16, color: colors.textMuted }}>Nutrition Tracking Will Appear Here.</Text>
        )}
        {tab === 'messages' && (
          <View style={{ marginTop: 14 }}>
            <View
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 14,
              }}
            >
              <Text style={{ fontWeight: '900', color: colors.text }}>Chat</Text>
              <Text style={{ color: colors.textMuted, marginTop: 6 }}>
                Messages are scoped to this trainer-member pair.
              </Text>
            </View>

            <View style={{ marginTop: 12, gap: 10 }}>
              {messages.length === 0 ? (
                <Text style={{ color: colors.textMuted }}>No messages yet.</Text>
              ) : (
                messages.slice(-12).map(m => {
                  const mine = m.fromRole === 'trainer' && m.fromId === trainerId;
                  return (
                    <View key={m.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
                      <View
                        style={{
                          padding: 12,
                          borderRadius: 14,
                          backgroundColor: mine ? colors.primary : '#f1f5f9',
                        }}
                      >
                        <Text style={{ color: mine ? '#fff' : colors.text }}>{m.text}</Text>
                      </View>
                      <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4, paddingHorizontal: 6 }}>
                        {new Date(m.createdAt).toLocaleString()}
                      </Text>
                    </View>
                  );
                })
              )}

              <View
                style={{
                  marginTop: 10,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  padding: 12,
                  flexDirection: 'row',
                  gap: 8,
                }}
              >
                <TextInput
                  placeholder="Type a message..."
                  placeholderTextColor={colors.textMuted}
                  style={{ flex: 1, color: colors.text }}
                  onSubmitEditing={e =>
                    sendMessage({
                      trainerId,
                      memberId: id,
                      fromRole: 'trainer',
                      fromId: trainerId,
                      text: e.nativeEvent.text,
                    })
                  }
                />
                <Ionicons name="send" size={18} color={colors.primary} />
              </View>
            </View>
          </View>
        )}
        {tab === 'notes' && (
          <View style={{ marginTop: 14, gap: 10 }}>
            <TextInput
              multiline
              placeholder="Add private notes about this client..."
              placeholderTextColor={colors.textMuted}
              style={{
                minHeight: 120,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 12,
                textAlignVertical: 'top',
                color: colors.text,
                backgroundColor: colors.card,
              }}
            />
            <Pressable
              style={{
                alignSelf: 'flex-start',
                backgroundColor: colors.primary,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '900' }}>Save Note</Text>
            </Pressable>
            {[
              { t: 'Great progress on form today. Increased squat weight by 5lbs.', d: 'April 11, 2026' },
              { t: 'Client mentioned shoulder discomfort. Adjusted exercise selection.', d: 'April 7, 2026' },
            ].map((n, i) => (
              <View key={i} style={{ padding: 12, borderRadius: 12, backgroundColor: '#f8fafc' }}>
                <Text style={{ color: colors.text }}>{n.t}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 6 }}>{n.d}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
