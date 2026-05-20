import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import type { ClientsStackParamList } from '../../navigation/ClientsStack';
import { useAuth } from '../../context/AuthContext';
import { getTrainerById, membersDirectory } from '../../lib/mockDirectory';
import { colors } from '../../theme/colors';

export function ClientRosterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ClientsStackParamList>>();
  const { user } = useAuth();
  const [q, setQ] = useState('');

  const trainerId = useMemo(() => {
    if (!user?.id) return 'trainer-1';
    if (user.id === 'dev-trainer') return 'trainer-1';
    return user.id;
  }, [user?.id]);
  const trainerName = useMemo(() => getTrainerById(trainerId)?.name ?? user?.name ?? 'Trainer', [trainerId, user?.name]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return membersDirectory
      .filter(m => {
        const match = !query || m.name.toLowerCase().includes(query);
        return match;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [q]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>Members</Text>
            <Text style={{ color: colors.textMuted, marginTop: 4 }}>Your roster • {trainerName}</Text>
          </View>
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: colors.primary,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 12,
            }}
          >
            <Ionicons name="person-add" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '800' }}>Add</Text>
          </Pressable>
        </View>

        <View
          style={{
            marginTop: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search by name..."
              placeholderTextColor={colors.textMuted}
              style={{ flex: 1, paddingVertical: 8, color: colors.text }}
            />
          </View>
        </View>

        <View style={{ marginTop: 14, gap: 12 }}>
          {filtered.length === 0 ? (
            <View style={{ padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}>
              <Text style={{ color: colors.textMuted }}>No members found.</Text>
            </View>
          ) : (
            filtered.map(m => (
              <Pressable
                key={m.id}
                onPress={() => navigation.navigate('ClientDetail', { id: m.id })}
                style={{
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  padding: 14,
                }}
              >
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
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
                    <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }} numberOfLines={1}>
                      {m.name}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
