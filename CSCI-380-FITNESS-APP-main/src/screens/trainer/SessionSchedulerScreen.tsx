import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';

type Session = {
  id: string;
  clientName: string;
  letter: string;
  time: string;
  type: string;
  status: 'confirmed' | 'pending';
  date: string;
};

const sessions: Session[] = [
  { id: '1', clientName: 'Emma Wilson', letter: 'E', time: '9:00 AM', type: 'Strength Training', status: 'confirmed', date: '2026-04-12' },
  { id: '2', clientName: 'Sarah Miller', letter: 'S', time: '10:30 AM', type: 'Cardio & HIIT', status: 'confirmed', date: '2026-04-12' },
  { id: '3', clientName: 'Lisa Anderson', letter: 'L', time: '2:00 PM', type: 'Flexibility & Core', status: 'pending', date: '2026-04-12' },
  { id: '4', clientName: 'Michael Brown', letter: 'M', time: '11:00 AM', type: 'Weight Loss Program', status: 'confirmed', date: '2026-04-14' },
];

export function SessionSchedulerScreen() {
  const [cursor, setCursor] = useState(() => new Date(2026, 3, 12));
  const [mode, setMode] = useState<'week' | 'month'>('week');

  const label = useMemo(
    () => cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    [cursor],
  );

  const weekDates = useMemo(() => {
    const start = new Date(cursor);
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const sessionsFor = (d: Date) => {
    const key = d.toISOString().split('T')[0];
    return sessions.filter(s => s.date === key);
  };

  const shiftWeek = (dir: -1 | 1) => {
    const n = new Date(cursor);
    n.setDate(n.getDate() + dir * 7);
    setCursor(n);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>Session Scheduler</Text>
            <Text style={{ color: colors.textMuted, marginTop: 4 }}>Manage Availability And Bookings</Text>
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
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '900' }}>Book</Text>
          </Pressable>
        </View>

        <View
          style={{
            marginTop: 8,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Pressable onPress={() => shiftWeek(-1)} style={{ padding: 8 }}>
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </Pressable>
            <Text style={{ fontWeight: '900', color: colors.text }}>{label}</Text>
            <Pressable onPress={() => shiftWeek(1)} style={{ padding: 8 }}>
              <Ionicons name="chevron-forward" size={22} color={colors.text} />
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <Pressable
              onPress={() => setMode('week')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: mode === 'week' ? colors.primary : '#f1f5f9',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: '900', color: mode === 'week' ? '#fff' : colors.text }}>Week</Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('month')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: mode === 'month' ? colors.primary : '#f1f5f9',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: '900', color: mode === 'month' ? '#fff' : colors.text }}>Month</Text>
            </Pressable>
          </View>

          {mode === 'week' ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {weekDates.map((d, idx) => {
                  const daySessions = sessionsFor(d);
                  const isToday = d.toDateString() === new Date(2026, 3, 12).toDateString();
                  return (
                    <View
                      key={idx}
                      style={{
                        width: 120,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: isToday ? colors.primary : colors.border,
                        backgroundColor: isToday ? '#eff6ff' : '#f8fafc',
                        padding: 10,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center' }}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx] ?? ''}
                      </Text>
                      <Text style={{ textAlign: 'center', fontWeight: '900', color: colors.text, marginTop: 4 }}>
                        {d.getDate()}
                      </Text>
                      <View style={{ marginTop: 8, gap: 8 }}>
                        {daySessions.length ? (
                          daySessions.map(s => (
                            <View
                              key={s.id}
                              style={{
                                borderRadius: 10,
                                padding: 8,
                                backgroundColor: s.status === 'confirmed' ? '#dcfce7' : '#fef9c3',
                              }}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Ionicons name="time-outline" size={14} color={colors.text} />
                                <Text style={{ fontWeight: '900', fontSize: 12 }}>{s.time}</Text>
                              </View>
                              <Text style={{ fontWeight: '800', marginTop: 4 }} numberOfLines={1}>
                                {s.clientName}
                              </Text>
                              <Text style={{ fontSize: 11, color: colors.textMuted }} numberOfLines={2}>
                                {s.type}
                              </Text>
                            </View>
                          ))
                        ) : (
            <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>No Sessions</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <Text style={{ marginTop: 12, color: colors.textMuted }}>
              Month view placeholder — swipe week view for now.
            </Text>
          )}
        </View>

        <Text style={{ fontWeight: '900', marginTop: 18, marginBottom: 10, color: colors.text }}>
          Upcoming Sessions
        </Text>
        {sessions.map(s => (
          <View
            key={s.id}
            style={{
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              padding: 12,
              marginBottom: 10,
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
              <Text style={{ color: '#fff', fontWeight: '900' }}>{s.letter}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontWeight: '900', color: colors.text }}>{s.clientName}</Text>
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 999,
                    backgroundColor: s.status === 'confirmed' ? '#dcfce7' : '#fef9c3',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '900' }}>{s.status}</Text>
                </View>
              </View>
              <Text style={{ color: colors.textMuted }}>{s.type}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontWeight: '900', color: colors.primary }}>{s.time}</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>{s.date}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
