import { useMemo, useState } from 'react';
import { Image, Modal, Pressable, Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '../../context/AuthContext';
import { useFeatureFlag } from '../../context/FeatureFlagsContext';
import { useMemberData } from '../../context/MemberDataContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';

export function ProfileTab() {
  const { user, logout } = useAuth();
  const { userProfile, dailyHistory, updateUserProfile } = useMemberData();
  const { colors, mode } = useTheme();
  const enableMetrics = useFeatureFlag('enable_progress_tracking');
  const enableStreaks = useFeatureFlag('enable_streak_tracking');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [metricsEditOpen, setMetricsEditOpen] = useState(false);
  const [heightCmText, setHeightCmText] = useState(userProfile.heightCm ? String(userProfile.heightCm) : '');
  const [weightKgText, setWeightKgText] = useState(userProfile.weightKg ? String(userProfile.weightKg) : '');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  const daysActive = useMemo(() => Object.keys(dailyHistory).length, [dailyHistory]);

  const achievements = [
    { name: 'First Workout', earned: true, icon: 'flash' as const },
    { name: '7 Day Streak', earned: (userProfile.streakDays ?? 0) >= 7, icon: 'trophy' as const },
    { name: '100K Steps', earned: true, icon: 'medal' as const },
    { name: '50 Workouts', earned: false, icon: 'ribbon' as const },
    { name: '30 Day Streak', earned: false, icon: 'flag' as const },
    { name: 'Marathon', earned: false, icon: 'walk' as const },
  ];

  const stats = useMemo(() => {
    const base = [
      { label: 'Total Workouts', value: String(userProfile.totalWorkouts) },
      { label: 'Total Steps', value: String(userProfile.totalSteps) },
      { label: 'Days Active', value: String(daysActive) },
    ];
    return enableStreaks ? [{ label: 'Streak', value: `${userProfile.streakDays} days` }, ...base] : base;
  }, [daysActive, enableStreaks, userProfile.streakDays, userProfile.totalSteps, userProfile.totalWorkouts]);

  const goalPill = useMemo(() => goalBadge(userProfile.fitnessGoal), [userProfile.fitnessGoal]);
  const bmi = useMemo(() => {
    const h = userProfile.heightCm ?? null;
    const w = userProfile.weightKg ?? null;
    if (!h || !w) return null;
    const m = h / 100;
    const v = w / (m * m);
    return Math.round(v * 10) / 10;
  }, [userProfile.heightCm, userProfile.weightKg]);
  const bmiInfo = bmi ? bmiCategory(bmi) : null;

  const initial = (userProfile.name || user?.name || '?').charAt(0).toUpperCase();

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (res.canceled) return;
    const uri = res.assets?.[0]?.uri;
    if (uri) updateUserProfile({ avatarUri: uri });
  };

  const savePassword = async () => {
    setPwError(null);
    if (!password1 || password1.length < 6) {
      setPwError('Password must be at least 6 characters.');
      return;
    }
    if (password1 !== password2) {
      setPwError('Passwords do not match.');
      return;
    }
    try {
      setPwSaving(true);
      const { error } = await supabase.auth.updateUser({ password: password1 });
      if (error) throw error;
      setPassword1('');
      setPassword2('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not update password';
      setPwError(msg);
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <View style={{ gap: 20 }}>
      <View
        style={{
          borderRadius: 16,
          padding: 20,
          alignItems: 'center',
          backgroundColor: mode === 'dark' ? colors.card : '#eff6ff',
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Pressable onPress={pickAvatar} style={{ borderRadius: 44, overflow: 'hidden' }}>
          {userProfile.avatarUri ? (
            <Image
              source={{ uri: userProfile.avatarUri }}
              style={{ width: 88, height: 88, borderRadius: 44 }}
            />
          ) : (
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 32, color: '#fff', fontWeight: '700' }}>{initial}</Text>
            </View>
          )}
        </Pressable>
        <Text style={{ marginTop: 12, fontSize: 20, fontWeight: '700', color: colors.text }}>
          {userProfile.name ?? 'Member'}
        </Text>
        <Text style={{ color: colors.textMuted, marginTop: 6 }}>{userProfile.email || user?.email || ''}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 }}>
          {goalPill ? (
            <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: goalPill.bg }}>
              <Text style={{ fontWeight: '900', color: goalPill.fg }}>
                {goalPill.icon} {goalPill.label}
              </Text>
            </View>
          ) : (
            <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#f1f5f9' }}>
              <Text style={{ fontWeight: '900', color: colors.textMuted }}>Set goal to personalize</Text>
            </View>
          )}
          <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#fef9c3' }}>
            <Text style={{ fontWeight: '900', color: '#854d0e' }}>🏆 {userProfile.points ?? 0} pts</Text>
          </View>
          {enableMetrics ? (
            <Pressable
              onPress={() => setMetricsOpen(true)}
              style={({ pressed }) => ({
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ fontWeight: '900', color: colors.text }}>My Metrics</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {stats.map(s => (
          <View
            key={s.label}
            style={{
              width: '48%',
              borderRadius: 12,
              padding: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{s.value}</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 4 }}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      <View>
        <Text style={{ fontWeight: '600', marginBottom: 10, color: colors.text }}>Achievements</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {achievements.map(a => (
            <View
              key={a.name}
              style={{
                width: '31%',
                borderRadius: 12,
                padding: 10,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: a.earned ? 1 : 0.45,
                alignItems: 'center',
                backgroundColor: colors.card,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: a.earned ? '#facc15' : '#e2e8f0',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 6,
                }}
              >
                <Ionicons name={a.icon} size={20} color={a.earned ? '#fff' : colors.textMuted} />
              </View>
              <Text style={{ fontSize: 11, textAlign: 'center', color: colors.text }}>{a.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: '600', marginBottom: 4, color: colors.text }}>Settings</Text>
        <Pressable
          onPress={() => setSettingsOpen(true)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="settings" size={20} color={colors.textMuted} />
            <Text style={{ color: colors.text, fontWeight: '600' }}>Profile Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <Modal visible={settingsOpen} animationType="slide" onRequestClose={() => setSettingsOpen(false)}>
        <View style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text }}>Profile Settings</Text>
            <Pressable onPress={() => setSettingsOpen(false)} style={{ padding: 8 }}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={{ gap: 14, marginTop: 18 }}>
            <View
              style={{
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Ionicons name="person" size={20} color={colors.textMuted} />
                <Text style={{ fontWeight: '900', color: colors.text }}>Personal info</Text>
              </View>

              <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text }}>Name</Text>
              <TextInput
                value={userProfile.name}
                onChangeText={t => updateUserProfile({ name: t })}
                placeholder="Your name"
                placeholderTextColor={colors.textMuted}
                style={{
                  marginTop: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: colors.card,
                  color: colors.text,
                }}
              />

              <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text, marginTop: 12 }}>Email</Text>
              <TextInput
                value={userProfile.email}
                onChangeText={t => updateUserProfile({ email: t })}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                style={{
                  marginTop: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: colors.card,
                  color: colors.text,
                }}
              />

              <Pressable
                onPress={pickAvatar}
                style={({ pressed }) => ({
                  marginTop: 12,
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: 'center',
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text style={{ color: '#fff', fontWeight: '900' }}>Change profile picture</Text>
              </Pressable>
            </View>

            <View
              style={{
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Ionicons name="lock-closed" size={20} color={colors.textMuted} />
                <Text style={{ fontWeight: '900', color: colors.text }}>Update password</Text>
              </View>

              {pwError ? (
                <View style={{ padding: 10, borderRadius: 12, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' }}>
                  <Text style={{ color: colors.danger }}>{pwError}</Text>
                </View>
              ) : null}

              <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text, marginTop: 10 }}>New password</Text>
              <TextInput
                value={password1}
                onChangeText={setPassword1}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                style={{
                  marginTop: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: colors.card,
                  color: colors.text,
                }}
              />
              <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text, marginTop: 10 }}>Confirm password</Text>
              <TextInput
                value={password2}
                onChangeText={setPassword2}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                style={{
                  marginTop: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: colors.card,
                  color: colors.text,
                }}
              />

              <Pressable
                onPress={savePassword}
                disabled={pwSaving}
                style={({ pressed }) => ({
                  marginTop: 12,
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: 'center',
                  backgroundColor: colors.accent,
                  opacity: pwSaving ? 0.6 : pressed ? 0.85 : 1,
                })}
              >
                <Text style={{ color: '#fff', fontWeight: '900' }}>Save password</Text>
              </Pressable>
            </View>

            <View
              style={{
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Ionicons name="options" size={20} color={colors.textMuted} />
                <Text style={{ fontWeight: '900', color: colors.text }}>Preferences</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Ionicons name="notifications" size={18} color={colors.textMuted} />
                  <Text style={{ color: colors.text, fontWeight: '700' }}>Notifications</Text>
                </View>
                <Switch
                  value={userProfile.notificationsEnabled}
                  onValueChange={v => updateUserProfile({ notificationsEnabled: v })}
                />
              </View>
            </View>

            <Pressable
              onPress={() => setSettingsOpen(false)}
              style={({ pressed }) => ({
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: 'center',
                backgroundColor: colors.textMuted,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ color: '#fff', fontWeight: '900' }}>Exit</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {enableMetrics ? (
        <Modal visible={metricsOpen} animationType="slide" onRequestClose={() => setMetricsOpen(false)}>
          <View style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text }}>My Metrics</Text>
              <Pressable onPress={() => setMetricsOpen(false)} style={{ padding: 8 }}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            <View style={{ marginTop: 14, gap: 10 }}>
              <View style={metricCard(colors)}>
                <Text style={metricTitle(colors)}>Height</Text>
                <Text style={metricValue(colors)}>{userProfile.heightCm ? `${userProfile.heightCm} cm` : '—'}</Text>
              </View>
              <View style={metricCard(colors)}>
                <Text style={metricTitle(colors)}>Weight</Text>
                <Text style={metricValue(colors)}>{userProfile.weightKg ? `${userProfile.weightKg} kg` : '—'}</Text>
              </View>
              <View style={metricCard(colors)}>
                <Text style={metricTitle(colors)}>BMI</Text>
                <Text style={[metricValue(colors), { color: bmiInfo?.color ?? colors.text }]}>{bmi ?? '—'}</Text>
                <View style={{ height: 10, borderRadius: 999, backgroundColor: '#e2e8f0', marginTop: 10, overflow: 'hidden' }}>
                  <View
                    style={{
                      width: `${Math.min(100, Math.max(0, ((bmi ?? 0) / 40) * 100))}%`,
                      height: 10,
                      backgroundColor: bmiInfo?.color ?? '#94a3b8',
                    }}
                  />
                </View>
                <Text style={{ marginTop: 8, color: colors.textMuted }}>
                  {bmi ? `Your BMI is ${bmi} — ${bmiInfo?.label}` : 'Add height and weight to calculate BMI.'}
                </Text>
              </View>

              <View style={metricCard(colors)}>
                <Text style={metricTitle(colors)}>Activity Level</Text>
                <Text style={metricValue(colors)}>{userProfile.activityLevel ? prettyActivity(userProfile.activityLevel) : '—'}</Text>
              </View>
              <View style={metricCard(colors)}>
                <Text style={metricTitle(colors)}>Fitness Goal</Text>
                <Text style={metricValue(colors)}>{goalPill ? `${goalPill.icon} ${goalPill.label}` : '—'}</Text>
              </View>
              {enableStreaks ? (
                <View style={metricCard(colors)}>
                  <Text style={metricTitle(colors)}>Current Streak 🔥</Text>
                  <Text style={metricValue(colors)}>{userProfile.streakDays ?? 0} days</Text>
                </View>
              ) : null}
              <View style={metricCard(colors)}>
                <Text style={metricTitle(colors)}>Total Sessions Completed</Text>
                <Text style={metricValue(colors)}>{userProfile.totalWorkouts ?? 0}</Text>
              </View>
              <View style={metricCard(colors)}>
                <Text style={metricTitle(colors)}>Member Since</Text>
                <Text style={metricValue(colors)}>{userProfile.memberSince ?? '—'}</Text>
              </View>

              <Pressable
                onPress={() => {
                  setHeightCmText(userProfile.heightCm ? String(userProfile.heightCm) : '');
                  setWeightKgText(userProfile.weightKg ? String(userProfile.weightKg) : '');
                  setMetricsEditOpen(true);
                }}
                style={({ pressed }) => ({
                  marginTop: 6,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text style={{ color: '#fff', fontWeight: '900' }}>Update Metrics</Text>
              </Pressable>
            </View>

            <Modal visible={metricsEditOpen} transparent animationType="fade" onRequestClose={() => setMetricsEditOpen(false)}>
              <Pressable onPress={() => setMetricsEditOpen(false)} style={{ flex: 1, backgroundColor: colors.overlay, padding: 20, justifyContent: 'center' }}>
                <Pressable
                  onPress={() => {}}
                  style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }}>Update Metrics</Text>
                  <Text style={{ color: colors.textMuted, marginTop: 6 }}>Height (cm)</Text>
                  <TextInput
                    value={heightCmText}
                    onChangeText={setHeightCmText}
                    keyboardType="number-pad"
                    placeholder="e.g., 175"
                    placeholderTextColor={colors.textMuted}
                    style={metricInput(colors)}
                  />
                  <Text style={{ color: colors.textMuted, marginTop: 10 }}>Weight (kg)</Text>
                  <TextInput
                    value={weightKgText}
                    onChangeText={setWeightKgText}
                    keyboardType="number-pad"
                    placeholder="e.g., 72"
                    placeholderTextColor={colors.textMuted}
                    style={metricInput(colors)}
                  />

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                    <Pressable
                      onPress={() => setMetricsEditOpen(false)}
                      style={({ pressed }) => ({
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border,
                        alignItems: 'center',
                        opacity: pressed ? 0.85 : 1,
                      })}
                    >
                      <Text style={{ fontWeight: '900', color: colors.text }}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        const h = Number(heightCmText) || null;
                        const w = Number(weightKgText) || null;
                        const bmiNext = h && w ? Math.round((w / ((h / 100) * (h / 100))) * 10) / 10 : null;
                        updateUserProfile({ heightCm: h, weightKg: w, bmi: bmiNext });
                        setMetricsEditOpen(false);
                      }}
                      style={({ pressed }) => ({
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 12,
                        backgroundColor: colors.primary,
                        alignItems: 'center',
                        opacity: pressed ? 0.85 : 1,
                      })}
                    >
                      <Text style={{ fontWeight: '900', color: '#fff' }}>Save</Text>
                    </Pressable>
                  </View>
                </Pressable>
              </Pressable>
            </Modal>
          </View>
        </Modal>
      ) : null}

      <Pressable
        onPress={logout}
        style={{
          borderRadius: 14,
          paddingVertical: 14,
          alignItems: 'center',
          backgroundColor: '#fef2f2',
          borderWidth: 1,
          borderColor: '#fecaca',
        }}
      >
        <Text style={{ color: colors.danger, fontWeight: '700' }}>Log out</Text>
      </Pressable>
    </View>
  );
}

function bmiCategory(bmi: number) {
  if (bmi < 18.5) return { label: 'Underweight', color: '#1d4ed8' };
  if (bmi < 25) return { label: 'Normal', color: '#16a34a' };
  if (bmi < 30) return { label: 'Overweight', color: '#ca8a04' };
  return { label: 'Obese', color: '#dc2626' };
}

function prettyActivity(a: NonNullable<import('../../context/MemberDataContext').UserProfile['activityLevel']>) {
  if (a === 'sedentary') return 'Sedentary';
  if (a === 'light') return 'Lightly active';
  if (a === 'moderate') return 'Moderately active';
  if (a === 'very_active') return 'Very active';
  return 'Athlete';
}

function goalBadge(goal: import('../../context/MemberDataContext').UserProfile['fitnessGoal']): null | {
  icon: string;
  label: string;
  bg: string;
  fg: string;
} {
  if (!goal) return null;
  switch (goal) {
    case 'build_muscle':
      return { icon: '🏋️', label: 'Build Muscle', bg: '#eff6ff', fg: '#1d4ed8' };
    case 'lose_weight':
      return { icon: '🔥', label: 'Lose Weight', bg: '#ffedd5', fg: '#9a3412' };
    case 'improve_flexibility':
      return { icon: '🧘', label: 'Flexibility', bg: '#dcfce7', fg: '#166534' };
    case 'boost_endurance':
      return { icon: '🏃', label: 'Endurance', bg: '#fef9c3', fg: '#854d0e' };
    case 'maintain_fitness':
      return { icon: '⚖️', label: 'Maintain', bg: '#f1f5f9', fg: '#0f172a' };
    case 'general_fitness':
      return { icon: '💪', label: 'General', bg: '#f3e8ff', fg: '#7c3aed' };
    default:
      return null;
  }
}

function metricCard(colors: any) {
  return { borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 14 } as const;
}
function metricTitle(colors: any) {
  return { fontWeight: '900' as const, color: colors.text } as const;
}
function metricValue(colors: any) {
  return { marginTop: 6, fontWeight: '900' as const, color: colors.text, fontSize: 18 } as const;
}
function metricInput(colors: any) {
  return { marginTop: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.text } as const;
}
