import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader } from '../../components/ScreenHeader';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { type FeatureFlagKey, useFeatureFlags } from '../../context/FeatureFlagsContext';
import { useToast } from '../../context/ToastContext';

export function SystemSettingsScreen() {
  const [maintenance, setMaintenance] = useState(false);
  const { user } = useAuth();
  const { meta, snapshot, setFlag } = useFeatureFlags();
  const { showToast } = useToast();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredMeta = useMemo(() => {
    const query = q.trim().toLowerCase();
    return meta.filter(m => {
      const st = snapshot[m.key]?.enabled ?? false;
      const match = !query || m.name.toLowerCase().includes(query) || m.key.toLowerCase().includes(query);
      const filterMatch = tab === 'all' ? true : tab === 'active' ? st : !st;
      return match && filterMatch;
    });
  }, [meta, q, snapshot, tab]);

  const enabledCount = useMemo(() => meta.filter(m => snapshot[m.key]?.enabled).length, [meta, snapshot]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filteredMeta> = {
      'Member Features': [],
      'Trainer Features': [],
      'Platform Features': [],
    };
    for (const m of filteredMeta) groups[m.category].push(m);
    return groups;
  }, [filteredMeta]);

  const onToggle = (key: FeatureFlagKey) => {
    const next = !(snapshot[key]?.enabled ?? false);
    setFlag({ key, enabled: next, modifiedBy: user?.email ?? user?.name ?? 'admin' });
    showToast(next ? 'Feature enabled' : 'Feature disabled');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <ScreenHeader title="Feature Flags" subtitle="Control feature access across the app" />

        <View style={section}>
          <View style={sectionTitleRow}>
            <View style={iconBubble('#ffedd5', '#c2410c')}>
              <Ionicons name="warning" size={18} color="#c2410c" />
            </View>
            <Text style={sectionTitle}>Maintenance Mode</Text>
          </View>
          <View style={rowBetween}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ fontWeight: '800', color: colors.text }}>Enable Maintenance Mode</Text>
              <Text style={{ color: colors.textMuted, marginTop: 4, fontSize: 12 }}>
                Users will see a maintenance screen and cannot access the app.
              </Text>
            </View>
            <Pressable
              onPress={() => setMaintenance(m => !m)}
              style={{
                width: 52,
                height: 32,
                borderRadius: 16,
                backgroundColor: maintenance ? '#ea580c' : '#e2e8f0',
                padding: 3,
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: '#fff',
                  alignSelf: maintenance ? 'flex-end' : 'flex-start',
                }}
              />
            </Pressable>
          </View>
          {maintenance ? (
            <View style={{ marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: '#ffedd5' }}>
              <Text style={{ color: '#9a3412', fontWeight: '700' }}>
                Maintenance is ACTIVE (demo toggle only).
              </Text>
            </View>
          ) : null}
        </View>

        <View style={[section, { marginTop: 12 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text style={sectionTitle}>Features</Text>
            <Text style={{ color: colors.textMuted, fontWeight: '800' }}>
              {enabledCount} of {meta.length} enabled
            </Text>
          </View>

          <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search features..."
              placeholderTextColor={colors.textMuted}
              style={{ flex: 1, paddingVertical: 8, color: colors.text }}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            {(['all', 'active', 'inactive'] as const).map(t => (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: tab === t ? colors.accentPurple : '#f1f5f9',
                }}
              >
                <Text style={{ fontWeight: '900', color: tab === t ? '#fff' : colors.text }}>
                  {t === 'all' ? 'All' : t === 'active' ? 'Active' : 'Inactive'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {(['Member Features', 'Trainer Features', 'Platform Features'] as const).map(cat => {
          const list = grouped[cat];
          if (!list.length) return null;
          return (
            <View key={cat} style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: '900', color: colors.text, marginBottom: 10 }}>{cat}</Text>
              <View style={{ gap: 10 }}>
                {list.map(m => {
                  const st = snapshot[m.key];
                  const on = !!st?.enabled;
                  return (
                    <View
                      key={m.key}
                      style={{
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: colors.card,
                        padding: 14,
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: '900', color: colors.text }}>{m.name}</Text>
                          <Text style={{ color: colors.textMuted, marginTop: 6 }}>{m.description}</Text>

                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#eff6ff' }}>
                              <Text style={{ fontWeight: '900', color: colors.primary, fontSize: 11 }}>{m.scope}</Text>
                            </View>
                            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: on ? '#dcfce7' : '#f1f5f9' }}>
                              <Text style={{ fontWeight: '900', color: on ? '#166534' : colors.textMuted, fontSize: 11 }}>
                                {on ? 'ON' : 'OFF'}
                              </Text>
                            </View>
                          </View>

                          <Text style={{ marginTop: 10, fontSize: 12, color: colors.textMuted }}>
                            Last modified:{' '}
                            <Text style={{ fontWeight: '900', color: colors.text }}>
                              {st?.lastModifiedAt ? new Date(st.lastModifiedAt).toLocaleString() : '—'}
                            </Text>
                            {st?.lastModifiedBy ? (
                              <Text style={{ color: colors.textMuted }}>
                                {' '}
                                by <Text style={{ fontWeight: '900', color: colors.text }}>{st.lastModifiedBy}</Text>
                              </Text>
                            ) : null}
                          </Text>
                        </View>

                        <Pressable
                          onPress={() => onToggle(m.key)}
                          style={{
                            width: 64,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: on ? '#16a34a' : '#e2e8f0',
                            padding: 4,
                            justifyContent: 'center',
                            alignSelf: 'flex-start',
                          }}
                          accessibilityLabel={`Toggle ${m.name}`}
                        >
                          <View
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 14,
                              backgroundColor: '#fff',
                              alignSelf: on ? 'flex-end' : 'flex-start',
                            }}
                          />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const section = {
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.card,
  padding: 14,
} as const;

const sectionTitleRow = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, marginBottom: 10 };

const sectionTitle = { fontSize: 16, fontWeight: '900' as const, color: colors.text };

const rowBetween = { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const };

function iconBubble(bg: string, fg: string) {
  return {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: bg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
}
