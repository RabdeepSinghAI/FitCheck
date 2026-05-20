import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { ScreenHeader } from '../../components/ScreenHeader';
import { useAuth } from '../../context/AuthContext';
import { useChallenges } from '../../context/ChallengesContext';
import { useWorkoutProposals } from '../../context/WorkoutProposalsContext';
import { getMemberById, membersDirectory } from '../../lib/mockDirectory';
import { colors } from '../../theme/colors';

export function TrainerHomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { getProposalsForTrainer } = useWorkoutProposals();
  const { createChallenge } = useChallenges();
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [pointsText, setPointsText] = useState('50');
  const [durationDaysText, setDurationDaysText] = useState('7');

  const trainerId = useMemo(() => {
    if (!user?.id) return 'trainer-1';
    if (user.id === 'dev-trainer') return 'trainer-1';
    return user.id;
  }, [user?.id]);

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const proposals = useMemo(() => getProposalsForTrainer(trainerId), [getProposalsForTrainer, trainerId]);

  const confirmedToday = useMemo(() => {
    return proposals
      .filter(p => p.status === 'confirmed' && p.scheduledAt.slice(0, 10) === todayKey)
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }, [proposals, todayKey]);

  const upcomingWeek = useMemo(() => {
    const start = new Date(todayKey + 'T00:00:00Z').getTime();
    const end = start + 7 * 24 * 60 * 60 * 1000;
    return proposals
      .filter(p => {
        if (p.status !== 'confirmed') return false;
        const ts = new Date(p.scheduledAt).getTime();
        return ts >= start && ts < end;
      })
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
      .slice(0, 10);
  }, [proposals, todayKey]);

  const pendingByMemberId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of proposals) {
      if (p.status !== 'pending') continue;
      map[p.memberId] = (map[p.memberId] ?? 0) + 1;
    }
    return map;
  }, [proposals]);

  const myMembers = useMemo(() => {
    return membersDirectory
      .filter(m => m.assignedTrainerId === trainerId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [trainerId]);

  const stats = useMemo(() => {
    const sessionsThisWeek = upcomingWeek.length;
    const activeClients = myMembers.filter(m => m.membershipStatus === 'active' || m.membershipStatus === 'trial').length;
    const pendingConfirmations = Object.values(pendingByMemberId).reduce((s, n) => s + n, 0);
    return [
      { label: 'Active members', value: String(activeClients), icon: 'people' as const, tint: '#2563eb' },
      { label: 'Sessions (7d)', value: String(sessionsThisWeek), icon: 'calendar' as const, tint: '#059669' },
      { label: 'Pending confirms', value: String(pendingConfirmations), icon: 'time' as const, tint: '#7c3aed' },
    ];
  }, [myMembers, pendingByMemberId, upcomingWeek.length]);

  const input = {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.background,
    color: colors.text,
  } as const;

  const onCreate = () => {
    const t = title.trim();
    if (!t) return;
    const pts = Math.max(0, Number(pointsText || 0) || 0);
    const daysRaw = Number(durationDaysText || 0) || 0;
    const durationDays = daysRaw > 0 ? Math.min(365, Math.max(1, Math.round(daysRaw))) : null;
    createChallenge({
      trainerId,
      title: t,
      description: desc.trim() || 'Trainer challenge',
      pointsReward: pts,
      durationDays,
    });
    setTitle('');
    setDesc('');
    setPointsText('50');
    setDurationDaysText('7');
    setCreateOpen(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <ScreenHeader
          title={`Welcome back, ${user?.name ?? 'Trainer'}!`}
          subtitle={
            confirmedToday.length
              ? `You have ${confirmedToday.length} confirmed session${confirmedToday.length === 1 ? '' : 's'} today`
              : 'No confirmed sessions today'
          }
        />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {stats.map(s => (
            <View
              key={s.label}
              style={{
                flexGrow: 1,
                flexBasis: '30%',
                minWidth: 100,
                borderRadius: 14,
                padding: 14,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: s.tint + '22',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <Ionicons name={s.icon} size={22} color={s.tint} />
              </View>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>{s.label}</Text>
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 4 }}>{s.value}</Text>
            </View>
          ))}
        </View>

        <View
          style={{
            marginTop: 18,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 14,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '900', color: colors.text }}>Challenges</Text>
              <Text style={{ color: colors.textMuted, marginTop: 6 }}>Create a challenge members can join and complete for points.</Text>
            </View>
            <Pressable
              onPress={() => setCreateOpen(true)}
              style={({ pressed }) => ({
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: colors.primary,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '900' }}>Create</Text>
            </Pressable>
          </View>
        </View>

        <View
          style={{
            marginTop: 18,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              padding: 14,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontWeight: '800', color: colors.text }}>Today&apos;s Sessions</Text>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Schedule</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </Pressable>
          </View>
          {confirmedToday.length === 0 ? (
            <View style={{ padding: 14 }}>
              <Text style={{ color: colors.textMuted }}>Nothing scheduled for today. Propose a session from a member profile.</Text>
            </View>
          ) : (
            confirmedToday.map((s, idx) => {
              const m = getMemberById(s.memberId);
              const time = new Date(s.scheduledAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
              return (
                <Pressable
                  key={s.id}
                  onPress={() => navigation.navigate('Members', { screen: 'ClientDetail', params: { id: s.memberId } })}
                  style={{
                    padding: 14,
                    borderBottomWidth: idx === confirmedToday.length - 1 ? 0 : 1,
                    borderBottomColor: colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '800' }}>{(m?.name ?? 'M').charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontWeight: '700', color: colors.text }}>{m?.name ?? 'Member'}</Text>
                      <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: '#dcfce7' }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#166534' }}>confirmed</Text>
                      </View>
                    </View>
                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>{s.workoutName}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="time-outline" size={16} color={colors.primary} />
                      <Text style={{ fontWeight: '800', color: colors.primary }}>{time}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>

        <View
          style={{
            marginTop: 18,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              padding: 14,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontWeight: '800', color: colors.text }}>Members</Text>
            <Pressable
              onPress={() => navigation.navigate('Members')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Text style={{ color: colors.primary, fontWeight: '700' }}>View all</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </Pressable>
          </View>
          {myMembers.length === 0 ? (
            <View style={{ padding: 14 }}>
              <Text style={{ color: colors.textMuted }}>No members assigned yet.</Text>
            </View>
          ) : (
            myMembers.slice(0, 6).map((m, i) => {
              const pending = pendingByMemberId[m.id] ?? 0;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => navigation.navigate('Members', { screen: 'ClientDetail', params: { id: m.id } })}
                  style={{
                    padding: 14,
                    borderBottomWidth: i === Math.min(myMembers.length, 6) - 1 ? 0 : 1,
                    borderBottomColor: colors.border,
                    flexDirection: 'row',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '800' }}>{m.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '900', color: colors.text }}>{m.name}</Text>
                    <Text style={{ color: colors.textMuted, marginTop: 4 }} numberOfLines={1}>
                      Plan: {m.assignedPlan ?? '—'}
                    </Text>
                    {pending ? (
                      <View style={{ alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: '#fef9c3' }}>
                        <Text style={{ fontSize: 11, fontWeight: '900', color: '#854d0e' }}>
                          {pending} pending confirmation
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal visible={createOpen} transparent animationType="slide" onRequestClose={() => setCreateOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={() => setCreateOpen(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View
              style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                padding: 16,
                maxHeight: '90%',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>Create Challenge</Text>
                <Pressable onPress={() => setCreateOpen(false)} style={{ padding: 6 }}>
                  <Ionicons name="close" size={22} color={colors.text} />
                </Pressable>
              </View>

              <ScrollView style={{ marginTop: 12 }} keyboardShouldPersistTaps="handled">
                <Text style={{ fontSize: 12, fontWeight: '900', color: colors.text }}>Title</Text>
                <TextInput value={title} onChangeText={setTitle} placeholder="e.g., 100 Jumping Jacks" placeholderTextColor={colors.textMuted} style={input} />

                <Text style={{ fontSize: 12, fontWeight: '900', color: colors.text, marginTop: 12 }}>Description</Text>
                <TextInput
                  value={desc}
                  onChangeText={setDesc}
                  placeholder="What should members do?"
                  placeholderTextColor={colors.textMuted}
                  style={[input, { minHeight: 80, textAlignVertical: 'top' }]}
                  multiline
                />

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: '900', color: colors.text }}>Points</Text>
                    <TextInput value={pointsText} onChangeText={setPointsText} keyboardType="number-pad" placeholder="50" placeholderTextColor={colors.textMuted} style={input} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: '900', color: colors.text }}>Duration (days)</Text>
                    <TextInput
                      value={durationDaysText}
                      onChangeText={setDurationDaysText}
                      keyboardType="number-pad"
                      placeholder="7"
                      placeholderTextColor={colors.textMuted}
                      style={input}
                    />
                  </View>
                </View>

                <Pressable
                  onPress={onCreate}
                  style={({ pressed }) => ({
                    marginTop: 16,
                    paddingVertical: 12,
                    borderRadius: 14,
                    backgroundColor: colors.primary,
                    alignItems: 'center',
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ color: '#fff', fontWeight: '900' }}>Create</Text>
                </Pressable>
                <View style={{ height: 10 }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
