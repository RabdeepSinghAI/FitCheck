import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader } from '../../components/ScreenHeader';
import { colors } from '../../theme/colors';

const cardStyle = {
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.card,
  padding: 14,
} as const;

const cardTitleStyle = {
  fontWeight: '900' as const,
  color: colors.text,
  marginBottom: 10,
};

function MiniBars({
  data,
  aKey,
  bKey,
  colorA,
  colorB,
}: {
  data: Array<Record<string, string | number>>;
  aKey: string;
  bKey: string;
  colorA: string;
  colorB: string;
}) {
  const max = Math.max(
    ...data.flatMap(d => [Number(d[aKey]), Number(d[bKey])]),
    1,
  );
  const labelKey = Object.keys(data[0] ?? {}).find(k => k !== aKey && k !== bKey) ?? 'date';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 160 }}>
      {data.map((row, idx) => (
        <View key={idx} style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'flex-end', height: 140 }}>
            <View
              style={{
                width: 8,
                height: (Number(row[aKey]) / max) * 130,
                borderRadius: 4,
                backgroundColor: colorA,
              }}
            />
            <View
              style={{
                width: 8,
                height: (Number(row[bKey]) / max) * 130,
                borderRadius: 4,
                backgroundColor: colorB,
              }}
            />
          </View>
          <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 6 }} numberOfLines={1}>
            {String(row[labelKey])}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function AnalyticsScreen() {
  const signups = useMemo(
    () => [
      { month: 'Jan', signups: 145 },
      { month: 'Feb', signups: 178 },
      { month: 'Mar', signups: 234 },
      { month: 'Apr', signups: 156 },
    ],
    [],
  );

  const sessionsPerWeek = useMemo(
    () => [
      { week: 'W1', sessions: 82, completed: 76 },
      { week: 'W2', sessions: 95, completed: 88 },
      { week: 'W3', sessions: 101, completed: 94 },
      { week: 'W4', sessions: 112, completed: 103 },
      { week: 'W5', sessions: 118, completed: 109 },
    ],
    [],
  );

  const topTrainers = useMemo(
    () => [
      { name: 'Mike Johnson', sessions: 187 },
      { name: 'Alex Rodriguez', sessions: 142 },
      { name: 'Tom Wilson', sessions: 45 },
    ],
    [],
  );

  const retention30d = 0.72;
  const avgStreakDays = 6.8;
  const latestWeek = useMemo(() => sessionsPerWeek[sessionsPerWeek.length - 1], [sessionsPerWeek]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <ScreenHeader title="Reports" subtitle="Clean summary + detailed charts (demo data)" />

        <Text style={{ fontWeight: '900', color: colors.text, marginBottom: 10 }}>Summary</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {[
            {
              label: 'Sessions (week)',
              value: String(latestWeek?.sessions ?? 0),
              icon: 'calendar' as const,
              tint: '#2563eb',
            },
            {
              label: 'Member retention (30d)',
              value: `${Math.round(retention30d * 100)}%`,
              icon: 'shield-checkmark' as const,
              tint: '#059669',
            },
            {
              label: 'Average streak',
              value: `${avgStreakDays} days`,
              icon: 'flame' as const,
              tint: '#ea580c',
            },
            {
              label: 'Top trainer',
              value: topTrainers[0]?.name ?? '—',
              icon: 'trophy' as const,
              tint: '#7c3aed',
            },
          ].map(s => (
            <View
              key={s.label}
              style={{
                width: '48%',
                flexGrow: 1,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 14,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: s.tint + '22',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={s.icon} size={22} color={s.tint} />
                </View>
              </View>
              <Text style={{ color: colors.textMuted, marginTop: 10, fontSize: 12 }}>{s.label}</Text>
              <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, marginTop: 4 }} numberOfLines={1}>
                {s.value}
              </Text>
            </View>
          ))}
        </View>

        <Text style={{ fontWeight: '900', color: colors.text, marginTop: 18, marginBottom: 10 }}>Sessions</Text>
        <View style={cardStyle}>
          <Text style={cardTitleStyle}>Sessions per week</Text>
          <MiniBars data={sessionsPerWeek} aKey="sessions" bKey="completed" colorA="#2563eb" colorB="#10b981" />
          <Text style={{ marginTop: 8, fontSize: 12, color: colors.textMuted }}>Blue: scheduled • Green: completed</Text>
        </View>

        <Text style={{ fontWeight: '900', color: colors.text, marginTop: 18, marginBottom: 10 }}>Growth</Text>
        <View style={[cardStyle, { marginTop: 12 }]}>
          <Text style={cardTitleStyle}>New Signups</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 150 }}>
            {signups.map((row, idx) => {
              const max = Math.max(...signups.map(s => s.signups), 1);
              return (
                <View key={idx} style={{ flex: 1, alignItems: 'center' }}>
                  <View
                    style={{
                      width: '100%',
                      height: (row.signups / max) * 120,
                      borderRadius: 8,
                      backgroundColor: '#10b981',
                    }}
                  />
                  <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 6 }}>{row.month}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={{ fontWeight: '900', color: colors.text, marginTop: 18, marginBottom: 10 }}>Top trainers</Text>
        <View style={[cardStyle, { marginTop: 12 }]}>
          <Text style={cardTitleStyle}>Top trainers by sessions</Text>
          {topTrainers.map((t, idx) => (
            <View
              key={t.name}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 10,
                borderBottomWidth: idx === topTrainers.length - 1 ? 0 : 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ fontWeight: '900', color: colors.text }}>
                {idx + 1}. {t.name}
              </Text>
              <Text style={{ color: colors.textMuted, fontWeight: '900' }}>{t.sessions}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
