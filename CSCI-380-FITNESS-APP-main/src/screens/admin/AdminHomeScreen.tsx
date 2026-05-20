import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { ScreenHeader } from '../../components/ScreenHeader';
import { useWorkoutProposals } from '../../context/WorkoutProposalsContext';
import { colors } from '../../theme/colors';

type Props = BottomTabScreenProps<any, 'AdminHome'>;

const actions = [
  { label: 'Add Trainer', icon: 'person-add' as const, tab: 'Trainers' as const },
  { label: 'Manage Users', icon: 'people' as const, tab: 'Users' as const },
  { label: 'View Reports', icon: 'stats-chart' as const, tab: 'Analytics' as const },
  { label: 'System Alerts', icon: 'warning' as const, tab: 'Settings' as const, badge: 3 },
];

const activity = [
  { type: 'signup', user: 'Emma Wilson', email: 'emma@email.com', time: '2m ago' },
  { type: 'trainer_request', user: 'James Chen', email: 'james@email.com', time: '15m ago' },
  { type: 'flag', user: 'Sarah Miller', email: 'sarah@email.com', time: '1h ago', reason: 'Inappropriate content' },
];

export function AdminHomeScreen({ navigation }: Props) {
  const { proposals } = useWorkoutProposals();

  const activeSessionsToday = useMemo(() => {
    const key = new Date().toISOString().slice(0, 10);
    return proposals.filter(p => p.status === 'confirmed' && p.scheduledAt.slice(0, 10) === key).length;
  }, [proposals]);

  const stats = useMemo(
    () => [
      { label: 'Total Members', value: '2,847', change: '+12%', icon: 'people' as const, tint: '#2563eb' },
      { label: 'Active Today', value: '1,234', change: '+8%', icon: 'flash' as const, tint: '#16a34a' },
      { label: 'New This Week', value: '156', change: '+24%', icon: 'trending-up' as const, tint: '#7c3aed' },
      {
        label: 'Active Sessions Today',
        value: String(activeSessionsToday),
        change: '',
        icon: 'calendar' as const,
        tint: '#059669',
      },
    ],
    [activeSessionsToday],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <ScreenHeader title="Dashboard" subtitle="Welcome back, Sarah. Here's what's happening today." />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {stats.map(s => (
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
                {s.change ? <Text style={{ color: '#16a34a', fontWeight: '900' }}>{s.change}</Text> : <View />}
              </View>
              <Text style={{ color: colors.textMuted, marginTop: 10, fontSize: 12 }}>{s.label}</Text>
              <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text, marginTop: 4 }}>{s.value}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontWeight: '900', marginTop: 18, marginBottom: 10, color: colors.text }}>
          Quick actions
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {actions.map(a => (
            <Pressable
              key={a.label}
              onPress={() => navigation.navigate(a.tab)}
              style={{
                width: '48%',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 14,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: '#f3e8ff',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={a.icon} size={22} color={colors.accentPurple} />
                </View>
                {a.badge ? (
                  <View
                    style={{
                      minWidth: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: colors.danger,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 6,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{a.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={{ marginTop: 10, fontWeight: '800', color: colors.text }}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ fontWeight: '900', marginTop: 18, marginBottom: 10, color: colors.text }}>
          Recent activity
        </Text>
        <View style={{ borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}>
          {activity.map((row, i) => (
            <View
              key={i}
              style={{
                padding: 14,
                borderBottomWidth: i === activity.length - 1 ? 0 : 1,
                borderBottomColor: colors.border,
                flexDirection: 'row',
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#f1f5f9',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name={row.type === 'signup' ? 'person-add' : row.type === 'trainer_request' ? 'briefcase' : 'warning'}
                  size={18}
                  color={row.type === 'flag' ? colors.danger : colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '900', color: colors.text }}>{row.user}</Text>
                <Text style={{ color: colors.textMuted, marginTop: 2 }}>{row.email}</Text>
                {'reason' in row && row.reason ? (
                  <Text style={{ color: colors.danger, marginTop: 6 }}>Reason: {row.reason}</Text>
                ) : null}
              </View>
              <Text style={{ fontSize: 11, color: colors.textMuted }}>{row.time}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
