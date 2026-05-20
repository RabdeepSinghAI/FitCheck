import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { useMessaging } from '../../context/MessagingContext';
import { getMemberById, membersDirectory } from '../../lib/mockDirectory';
import { colors } from '../../theme/colors';

export function TrainerMessagingScreen() {
  const { user } = useAuth();
  const { threads, ensureThread, getThreadMessages, sendMessage } = useMessaging();
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [text, setText] = useState('');

  const trainerId = useMemo(() => {
    if (!user?.id) return 'trainer-1';
    if (user.id === 'dev-trainer') return 'trainer-1';
    return user.id;
  }, [user?.id]);

  const trainerThreads = useMemo(
    () => threads.filter(t => t.kind === 'trainer' && t.trainerId === trainerId && !!t.memberId),
    [threads, trainerId],
  );

  const activeMeta = useMemo(
    () => (activeThread ? trainerThreads.find(t => t.threadKey === activeThread) ?? null : null),
    [activeThread, trainerThreads],
  );
  const activeMember = useMemo(
    () => (activeMeta?.memberId ? getMemberById(activeMeta.memberId) : null),
    [activeMeta],
  );
  const messages = useMemo(() => (activeThread ? getThreadMessages(activeThread) : []), [activeThread, getThreadMessages]);

  if (!activeThread) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>Messages</Text>
          <Text style={{ color: colors.textMuted, marginTop: 4 }}>Chat with your members</Text>
        </View>
        <FlatList
          data={trainerThreads}
          keyExtractor={t => t.threadKey}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          ListEmptyComponent={
            <View style={{ padding: 16 }}>
              <Text style={{ color: colors.textMuted }}>No conversations yet.</Text>
              <Text style={{ color: colors.textMuted, marginTop: 6 }}>
                Tip: open a member profile and send a proposal or message to start a thread.
              </Text>
              <View style={{ height: 12 }} />
              <Text style={{ fontWeight: '900', color: colors.text }}>Quick start (demo)</Text>
              <Text style={{ color: colors.textMuted, marginTop: 6 }}>Tap a member to start a chat.</Text>
              <View style={{ marginTop: 10, gap: 10 }}>
                {membersDirectory.slice(0, 3).map(m => (
                  <Pressable
                    key={m.id}
                    onPress={() => setActiveThread(ensureThread({ trainerId, memberId: m.id }))}
                    style={{
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                      padding: 14,
                      flexDirection: 'row',
                      gap: 12,
                      alignItems: 'center',
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
                      <Text style={{ color: '#fff', fontWeight: '900' }}>{m.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '900', color: colors.text }}>{m.name}</Text>
                      <Text style={{ color: colors.textMuted }} numberOfLines={1}>
                        {m.email}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const member = getMemberById(item.memberId);
            const msgs = getThreadMessages(item.threadKey);
            const last = msgs.length ? msgs[msgs.length - 1] : null;
            return (
              <Pressable
                onPress={() => setActiveThread(item.threadKey)}
                style={{
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  padding: 14,
                  marginBottom: 10,
                  flexDirection: 'row',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>
                    {(member?.name ?? 'M').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontWeight: '900', color: colors.text }}>{member?.name ?? 'Member'}</Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted }}>
                      {item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleDateString() : ''}
                    </Text>
                  </View>
                  <Text style={{ color: colors.textMuted, marginTop: 4 }} numberOfLines={1}>
                    {last?.text ?? 'No messages yet'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.card,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Pressable onPress={() => setActiveThread(null)} style={{ padding: 6 }}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
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
          <Text style={{ color: '#fff', fontWeight: '900' }}>
            {(activeMember?.name ?? 'M').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '900', color: colors.text }}>{activeMember?.name ?? 'Member'}</Text>
          <Text style={{ fontSize: 12, color: '#16a34a', fontWeight: '700' }}>● Online</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View
            style={{
              alignSelf: item.fromRole === 'trainer' ? 'flex-end' : 'flex-start',
              maxWidth: '88%',
              marginBottom: 10,
            }}
          >
            <View
              style={{
                padding: 12,
                borderRadius: 14,
                backgroundColor: item.fromRole === 'trainer' ? colors.primary : '#f1f5f9',
              }}
            >
              <Text style={{ color: item.fromRole === 'trainer' ? '#fff' : colors.text }}>{item.text}</Text>
            </View>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4, paddingHorizontal: 6 }}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        )}
      />

      <View
        style={{
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
          }}
          multiline
        />
        <Pressable
          onPress={() => {
            if (!activeMeta) return;
            sendMessage({
              trainerId,
              memberId: activeMeta.memberId!,
              fromRole: 'trainer',
              fromId: trainerId,
              text,
            });
            setText('');
          }}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
