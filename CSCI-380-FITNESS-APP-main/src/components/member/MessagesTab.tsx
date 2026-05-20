import { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useMessaging } from '../../context/MessagingContext';
import { useAdminDirectory } from '../../context/AdminDirectoryContext';
import { useFeatureFlag } from '../../context/FeatureFlagsContext';
import { useTheme } from '../../context/ThemeContext';
import { getMemberById } from '../../lib/mockDirectory';

export function MessagesTab({
  memberId,
  trainerId,
  onOpenTrainerProfile,
}: {
  memberId: string;
  trainerId: string | null;
  onOpenTrainerProfile?: (trainerId: string) => void;
}) {
  const { colors } = useTheme();
  const { threads, ensureThread, ensureCommunityThread, getThreadMessages, sendMessage, sendCommunityMessage } = useMessaging();
  const enableMessaging = useFeatureFlag('enable_member_messaging');
  const { getTrainer } = useAdminDirectory();
  const [text, setText] = useState('');
  const [threadKey, setThreadKey] = useState<string | null>(null);
  const [communityPeerId, setCommunityPeerId] = useState<string | null>(null);
  const [communityText, setCommunityText] = useState('');

  const trainer = useMemo(() => (trainerId ? getTrainer(trainerId) : null), [getTrainer, trainerId]);
  const messages = threadKey ? getThreadMessages(threadKey) : [];

  const communityThreads = useMemo(() => threads.filter(t => t.kind === 'community' && t.threadKey.includes(memberId)), [memberId, threads]);

  useEffect(() => {
    if (!trainerId) {
      setThreadKey(null);
      return;
    }
    // Ensure thread outside render to avoid setState-in-render warnings.
    setThreadKey(ensureThread({ trainerId, memberId }));
  }, [ensureThread, memberId, trainerId]);

  if (!enableMessaging) {
    return (
      <View
        style={{
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          padding: 14,
        }}
      >
        <Text style={{ fontWeight: '900', color: colors.text }}>Messages</Text>
        <Text style={{ color: colors.textMuted, marginTop: 6 }}>Messaging is currently disabled.</Text>
      </View>
    );
  }

  if (!trainerId || !trainer || !trainer.active) {
    return (
      <View
        style={{
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          padding: 14,
        }}
      >
        <Text style={{ fontWeight: '900', color: colors.text }}>Messages</Text>
        <Text style={{ color: colors.textMuted, marginTop: 6 }}>
          You don&apos;t have an available assigned trainer yet.
        </Text>
      </View>
    );
  }

  const onSend = () => {
    sendMessage({
      trainerId,
      memberId,
      fromRole: 'member',
      fromId: memberId,
      text,
    });
    setText('');
  };

  return (
    <View style={{ flex: 1 }}>
      {communityThreads.length ? (
        <>
          <View
            style={{
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              padding: 14,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontWeight: '900', color: colors.text }}>Community</Text>
            <Text style={{ color: colors.textMuted, marginTop: 4, fontSize: 12 }}>Member-to-member chats</Text>
            <View style={{ marginTop: 10, gap: 8 }}>
              {communityThreads.slice(0, 5).map(t => {
                const parts = t.threadKey.split('::');
                const peerId = parts.find(p => p !== 'm2m' && p !== memberId && !p.startsWith('m2m')) ?? '';
                const peer = getMemberById(peerId);
                const last = getThreadMessages(t.threadKey).slice(-1)[0]?.text ?? 'Tap to chat';
                return (
                  <Pressable
                    key={t.threadKey}
                    onPress={() => setCommunityPeerId(peerId)}
                    style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, opacity: pressed ? 0.85 : 1 })}
                  >
                    <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#fff', fontWeight: '900' }}>{(peer?.name ?? 'M').charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '900', color: colors.text }}>{peer?.name ?? 'Member'}</Text>
                      <Text style={{ fontSize: 12, color: colors.textMuted }} numberOfLines={1}>
                        {last}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        </>
      ) : null}

      <View
        style={{
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          padding: 14,
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
          <Text style={{ color: '#fff', fontWeight: '900' }}>{trainer.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Pressable onPress={() => onOpenTrainerProfile?.(trainerId)} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
            <Text style={{ fontWeight: '900', color: colors.text }}>{trainer.name}</Text>
          </Pressable>
          <Text style={{ fontSize: 12, color: colors.textMuted }}>Assigned trainer</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="chatbubbles" size={18} color={colors.textMuted} />
          <Text style={{ fontSize: 12, color: colors.textMuted }}>Thread</Text>
        </View>
      </View>

      <View style={{ height: 12 }} />

      <View
        style={{
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          overflow: 'hidden',
          flex: 1,
          minHeight: 340,
        }}
      >
        <FlatList
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={{ padding: 14, paddingBottom: 110 }}
          renderItem={({ item }) => {
            const mine = item.fromRole === 'member' && item.fromId === memberId;
            return (
              <View
                style={{
                  alignSelf: mine ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    backgroundColor: mine ? colors.primary : '#f1f5f9',
                  }}
                >
                  <Text style={{ color: mine ? '#fff' : colors.text }}>{item.text}</Text>
                </View>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4, paddingHorizontal: 6 }}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ padding: 14 }}>
              <Text style={{ color: colors.textMuted }}>No messages yet. Say hi to your trainer.</Text>
            </View>
          }
        />

        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.card,
            flexDirection: 'row',
            gap: 8,
            alignItems: 'flex-end',
          }}
        >
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
              backgroundColor: colors.background,
            }}
            multiline
          />
          <Pressable
            onPress={onSend}
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

      <Modal visible={!!communityPeerId} transparent animationType="slide" onRequestClose={() => setCommunityPeerId(null)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={() => setCommunityPeerId(null)} />
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, maxHeight: '85%' }}>
            {(() => {
              const peerRow = communityPeerId ? getMemberById(communityPeerId) : null;
              const key = communityPeerId ? ensureCommunityThread({ memberAId: memberId, memberBId: communityPeerId }) : null;
              const list = key ? getThreadMessages(key) : [];
              return (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>{peerRow?.name ?? 'Chat'}</Text>
                    <Pressable onPress={() => setCommunityPeerId(null)} style={{ padding: 6 }}>
                      <Ionicons name="close" size={22} color={colors.text} />
                    </Pressable>
                  </View>

                  <View style={{ marginTop: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, padding: 12, minHeight: 240 }}>
                    {list.length === 0 ? <Text style={{ color: colors.textMuted }}>No messages yet.</Text> : null}
                    {list.slice(-12).map(m => {
                      const mine = m.fromId === memberId;
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
                      value={communityText}
                      onChangeText={setCommunityText}
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
                        backgroundColor: colors.card,
                      }}
                      multiline
                    />
                    <Pressable
                      onPress={() => {
                        if (!communityPeerId) return;
                        sendCommunityMessage({ memberAId: memberId, memberBId: communityPeerId, fromId: memberId, text: communityText });
                        setCommunityText('');
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
                </>
              );
            })()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

