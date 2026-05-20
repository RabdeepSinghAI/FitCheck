import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';

import { useChallenges } from '../../context/ChallengesContext';
import { useMemberData } from '../../context/MemberDataContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { motionDuration, usePrefersReducedMotion } from '../../lib/motion';

type Filter = 'All' | 'Strength' | 'Cardio' | 'Flexibility' | 'Daily' | 'Completed';

export function ChallengesTab({ userId }: { userId: string }) {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { challenges, joinChallenge, completeChallenge, isCompleted, isJoined, isActive, getCompletedAt } = useChallenges();
  const { userProfile, updateUserProfile } = useMemberData();
  const reducedMotion = usePrefersReducedMotion();

  const [filter, setFilter] = useState<Filter>('All');
  const [confirmFor, setConfirmFor] = useState<string | null>(null);
  const [pulseFor, setPulseFor] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const active = challenges.filter(c => isActive(c.id));
    return active.filter(c => {
      if (filter === 'All') return true;
      if (filter === 'Daily') return false;
      if (filter === 'Completed') return isCompleted(c.id, userId);
      return c.category === filter;
    });
  }, [challenges, filter, isActive, isCompleted, userId]);

  const onJoin = (id: string) => {
    const res = joinChallenge({ challengeId: id, userId });
    if (!res.ok) {
      showToast(res.reason);
      return;
    }
    showToast('Joined challenge');
  };

  const onComplete = (id: string) => {
    const res = completeChallenge({ challengeId: id, userId });
    if (!res.ok) {
      showToast(res.reason);
      return;
    }
    setPulseFor(id);
    setTimeout(() => setPulseFor(null), 700);
    updateUserProfile({
      points: (userProfile.points ?? 0) + res.pointsAwarded,
      challengesCompleted: (userProfile.challengesCompleted ?? 0) + 1,
    });
    showToast(`+${res.pointsAwarded} pts`);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text }}>Challenges</Text>
        <Text style={{ color: colors.textMuted, marginTop: 4 }}>Complete challenges to earn points and climb the leaderboard</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8, paddingRight: 10 }}>
          {(['All', 'Strength', 'Cardio', 'Flexibility', 'Daily', 'Completed'] as Filter[]).map(t => (
            <Pressable
              key={t}
              onPress={() => setFilter(t)}
              style={({ pressed }) => ({
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: filter === t ? colors.primary : '#f1f5f9',
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text style={{ fontWeight: '900', color: filter === t ? '#fff' : colors.text }}>{t}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}>
        {filtered.length === 0 ? (
          <View style={{ padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}>
            <Text style={{ color: colors.textMuted }}>No challenges found.</Text>
          </View>
        ) : (
          filtered.map((c, idx) => {
            const done = isCompleted(c.id, userId);
            const completedAt = done ? getCompletedAt(c.id, userId) : null;
            const icon =
              c.category === 'Strength'
                ? ('barbell' as const)
                : c.category === 'Cardio'
                  ? ('walk' as const)
                  : c.category === 'Flexibility'
                    ? ('leaf' as const)
                    : c.category === 'Core'
                      ? ('body' as const)
                      : ('flash' as const);
            return (
              <MotiView
                key={c.id}
                from={{ opacity: 0, translateY: 15, scale: 0.98 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                transition={{
                  type: 'timing',
                  duration: motionDuration(280, reducedMotion),
                  delay: reducedMotion ? 0 : Math.min(idx, 10) * 70,
                }}
                style={{
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  padding: 14,
                  marginBottom: 10,
                  transform: [{ scale: pulseFor === c.id ? 1.02 : 1 }],
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name={icon} size={18} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '900', color: colors.text }}>{c.title}</Text>
                        <Text style={{ color: colors.textMuted, marginTop: 2 }}>{c.description}</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                      <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#f1f5f9' }}>
                        <Text style={{ fontWeight: '900', color: colors.textMuted, fontSize: 11 }}>{c.difficulty}</Text>
                      </View>
                      <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#fef9c3' }}>
                        <Text style={{ fontWeight: '900', color: '#854d0e', fontSize: 11 }}>🏆 {c.pointsReward} pts</Text>
                      </View>
                      {c.endsAt ? (
                        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#dcfce7' }}>
                          <Text style={{ fontWeight: '900', color: '#166534', fontSize: 11 }}>
                            Ends {new Date(c.endsAt).toLocaleDateString()}
                          </Text>
                        </View>
                      ) : (
                        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#dcfce7' }}>
                          <Text style={{ fontWeight: '900', color: '#166534', fontSize: 11 }}>No deadline</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {done ? (
                  <View style={{ marginTop: 12, paddingVertical: 12, borderRadius: 12, backgroundColor: '#dcfce7', alignItems: 'center' }}>
                    <Text style={{ fontWeight: '900', color: '#166534' }}>
                      ✅ Completed{completedAt ? ` · ${new Date(completedAt).toLocaleString()}` : ''}
                    </Text>
                  </View>
                ) : !isJoined(c.id, userId) ? (
                  <Pressable
                    onPress={() => onJoin(c.id)}
                    style={({ pressed }) => ({
                      marginTop: 12,
                      paddingVertical: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                      alignItems: 'center',
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text style={{ fontWeight: '900', color: colors.text }}>Join Challenge</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => setConfirmFor(c.id)}
                    style={({ pressed }) => ({
                      marginTop: 12,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: colors.primary,
                      alignItems: 'center',
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text style={{ fontWeight: '900', color: '#fff' }}>Mark as Complete</Text>
                  </Pressable>
                )}
              </MotiView>
            );
          })
        )}
      </ScrollView>

      <Modal visible={!!confirmFor} transparent animationType="fade" onRequestClose={() => setConfirmFor(null)}>
        <Pressable onPress={() => setConfirmFor(null)} style={{ flex: 1, backgroundColor: colors.overlay, padding: 16, justifyContent: 'center' }}>
          <Pressable onPress={() => {}} style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
            {confirmFor ? (
              <>
                <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }}>Confirm</Text>
                <Text style={{ color: colors.textMuted, marginTop: 8 }}>
                  Did you complete{' '}
                  <Text style={{ fontWeight: '900', color: colors.text }}>
                    {challenges.find(c => c.id === confirmFor)?.title ?? 'this challenge'}
                  </Text>
                  ?
                </Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                  <Pressable
                    onPress={() => setConfirmFor(null)}
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
                      const id = confirmFor;
                      setConfirmFor(null);
                      onComplete(id);
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
                    <Text style={{ fontWeight: '900', color: '#fff' }}>Yes, completed</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

