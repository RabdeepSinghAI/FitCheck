import { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';

import { useChallenges } from '../../context/ChallengesContext';
import { useMemberData } from '../../context/MemberDataContext';
import { useMessaging } from '../../context/MessagingContext';
import { useTheme } from '../../context/ThemeContext';
import { motionDuration, usePrefersReducedMotion } from '../../lib/motion';
import { membersDirectory } from '../../lib/mockDirectory';

type PublicMember = {
  id: string;
  name: string;
  points: number;
  challengesCompleted: number;
};

export function LeaderboardTab({ meId }: { meId: string }) {
  const { colors } = useTheme();
  const { userProfile } = useMemberData();
  const { challenges } = useChallenges();
  const { ensureCommunityThread, getThreadMessages, sendCommunityMessage } = useMessaging();
  const reducedMotion = usePrefersReducedMotion();
  const [selected, setSelected] = useState<PublicMember | null>(null);
  const [chatFor, setChatFor] = useState<PublicMember | null>(null);
  const [text, setText] = useState('');
  const [threadKey, setThreadKey] = useState<string | null>(null);

  const community = useMemo<PublicMember[]>(() => {
    const baseMembers = membersDirectory.map(m => ({ id: m.id, name: m.name }));

    const pointsById: Record<string, number> = {};
    const completedCountById: Record<string, number> = {};
    for (const c of challenges) {
      for (const uid of c.completedBy ?? []) {
        pointsById[uid] = (pointsById[uid] ?? 0) + (Number(c.pointsReward || 0) || 0);
        completedCountById[uid] = (completedCountById[uid] ?? 0) + 1;
      }
    }

    const challengePointsMe = pointsById[meId] ?? 0;
    const extraFromProfile = Math.max(0, (userProfile.points ?? 0) - challengePointsMe);

    return baseMembers.map(m => {
      const challengePoints = pointsById[m.id] ?? 0;
      const totalPoints = m.id === meId ? challengePoints + extraFromProfile : challengePoints;
      return {
        id: m.id,
        name: m.id === meId ? userProfile.name ?? m.name ?? 'You' : m.name,
        points: totalPoints,
        challengesCompleted: completedCountById[m.id] ?? 0,
      } satisfies PublicMember;
    });
  }, [challenges, meId, userProfile.name, userProfile.points]);

  const ranked = useMemo(() => {
    // Ranking is total points.
    const sorted = [...community].sort((a, b) => b.points - a.points);
    return sorted.map((m, idx) => ({ ...m, rank: idx + 1 }));
  }, [community]);

  const myRow = useMemo(() => ranked.find(r => r.id === meId) ?? null, [meId, ranked]);

  const openChat = (other: PublicMember) => {
    setChatFor(other);
    setText('');
  };

  useEffect(() => {
    if (!chatFor) {
      setThreadKey(null);
      return;
    }
    setThreadKey(ensureCommunityThread({ memberAId: meId, memberBId: chatFor.id }));
  }, [chatFor, ensureCommunityThread, meId]);

  const messages = threadKey ? getThreadMessages(threadKey) : [];

  return (
    <View style={{ flex: 1 }}>
      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text }}>🏆 Leaderboard</Text>
        <Text style={{ color: colors.textMuted, marginTop: 4 }}>Rankings based on total points</Text>
      </View>

      <FlatList
        data={ranked}
        keyExtractor={r => r.id}
        contentContainerStyle={{ paddingBottom: 110 }}
        renderItem={({ item, index }) => {
          const topBg = item.rank === 1 ? '#fef9c3' : item.rank === 2 ? '#f1f5f9' : item.rank === 3 ? '#ffedd5' : colors.card;
          const topBorder = item.rank === 1 ? '#fde68a' : item.rank === 2 ? colors.border : item.rank === 3 ? '#fdba74' : colors.border;
          const highlight = item.id === meId;
          return (
            <MotiView
              from={{ opacity: 0, translateY: 15 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: 'timing',
                duration: motionDuration(280, reducedMotion),
                delay: reducedMotion ? 0 : Math.min(index, 12) * 70,
              }}
            >
              <Pressable
                onPress={() => setSelected(item)}
                style={({ pressed }) => ({
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: highlight ? colors.primary : topBorder,
                  backgroundColor: topBg,
                  padding: 14,
                  marginBottom: 10,
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 36, alignItems: 'center' }}>
                    <Text style={{ fontWeight: '900', color: colors.text }}>
                      {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`}
                    </Text>
                  </View>
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
                    <Text style={{ color: '#fff', fontWeight: '900' }}>{item.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '900', color: colors.text }}>{item.name}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontWeight: '900', color: colors.text }}>{item.points} pts</Text>
                    <Text style={{ color: colors.textMuted, marginTop: 4, fontSize: 12 }}>{item.challengesCompleted} challenges</Text>
                  </View>
                </View>
              </Pressable>
            </MotiView>
          );
        }}
      />

      {myRow ? (
        <View
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 14,
          }}
        >
          <Text style={{ fontWeight: '900', color: colors.text }}>
            Your Rank: #{myRow.rank} · {myRow.points} pts
          </Text>
        </View>
      ) : null}

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={() => setSelected(null)} />
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, maxHeight: '85%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>Profile</Text>
              <Pressable onPress={() => setSelected(null)} style={{ padding: 6 }}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>
            {selected ? (
              <View style={{ marginTop: 12, gap: 10 }}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>{selected.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>{selected.name}</Text>
                  </View>
                </View>
                <Text style={{ color: colors.textMuted }}>Total points: {selected.points}</Text>
                <Text style={{ color: colors.textMuted }}>Challenges completed: {selected.challengesCompleted}</Text>

                <Pressable
                  onPress={() => {
                    setSelected(null);
                    openChat(selected);
                  }}
                  disabled={selected.id === meId}
                  style={({ pressed }) => ({
                    marginTop: 8,
                    paddingVertical: 12,
                    borderRadius: 14,
                    backgroundColor: selected.id === meId ? '#e2e8f0' : colors.primary,
                    alignItems: 'center',
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ color: selected.id === meId ? colors.textMuted : '#fff', fontWeight: '900' }}>
                    {selected.id === meId ? 'This is you' : 'Send Message'}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={!!chatFor} transparent animationType="slide" onRequestClose={() => setChatFor(null)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={() => setChatFor(null)} />
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, maxHeight: '85%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>{chatFor?.name ?? 'Chat'}</Text>
              <Pressable onPress={() => setChatFor(null)} style={{ padding: 6 }}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>

            <View style={{ marginTop: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, padding: 12, minHeight: 240 }}>
              {messages.length === 0 ? <Text style={{ color: colors.textMuted }}>No messages yet. Say hi.</Text> : null}
              {messages.slice(-12).map(m => {
                const mine = m.fromId === meId;
                return (
                  <View key={m.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '86%', marginBottom: 10 }}>
                    <View style={{ padding: 12, borderRadius: 14, backgroundColor: mine ? colors.primary : '#f1f5f9' }}>
                      <Text style={{ color: mine ? '#fff' : colors.text }}>{m.text}</Text>
                    </View>
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4, paddingHorizontal: 6 }}>
                      {new Date(m.createdAt).toLocaleString()}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end', marginTop: 10 }}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Type a message..."
                placeholderTextColor={colors.textMuted}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  maxHeight: 120,
                  color: colors.text,
                }}
                multiline
              />
              <Pressable
                onPress={() => {
                  if (!chatFor) return;
                  sendCommunityMessage({ memberAId: meId, memberBId: chatFor.id, fromId: meId, text });
                  setText('');
                }}
                style={({ pressed }) => ({
                  backgroundColor: colors.primary,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: 12,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

