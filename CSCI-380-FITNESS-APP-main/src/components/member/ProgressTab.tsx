import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useMemberData } from '../../context/MemberDataContext';
import { useTheme } from '../../context/ThemeContext';

export function ProgressTab() {
  const { colors } = useTheme();
  const { dailyActivity, dailyTracker, workouts, dailyHistory, selectWorkout } = useMemberData();

  const today = dailyActivity;

  const last7 = (() => {
    const keys = Object.keys(dailyHistory).sort().slice(-7);
    const entries = keys.map(k => dailyHistory[k]).filter(Boolean);
    const totalWorkouts = entries.reduce((s, e) => s + (e.workouts || 0), 0);
    const avgSteps = entries.length ? Math.round(entries.reduce((s, e) => s + (e.steps || 0), 0) / entries.length) : 0;
    const avgCaloriesBurned = entries.length
      ? Math.round(entries.reduce((s, e) => s + (e.caloriesBurned || 0), 0) / entries.length)
      : 0;
    return { totalWorkouts, avgSteps, avgCaloriesBurned, days: entries.length };
  })();

  const recent3 = workouts.slice(0, 3);

  const MetricCard = ({
    icon,
    label,
    value,
    tint,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    tint: string;
  }) => (
    <View
      style={{
        flex: 1,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: tint + '22',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>{value}</Text>
      <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>{label}</Text>
    </View>
  );

  return (
    <View style={{ gap: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>Progress</Text>

      <View>
        <Text style={{ fontWeight: '800', marginBottom: 10, color: colors.text }}>Today overview</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <MetricCard icon="barbell" label="Workouts" value={String(today.totalWorkouts)} tint={colors.accent} />
          <MetricCard icon="time" label="Duration (min)" value={String(today.totalDuration)} tint="#10b981" />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <MetricCard icon="flame" label="Calories burned" value={String(today.caloriesBurned)} tint="#f97316" />
          <MetricCard icon="walk" label="Steps" value={String(dailyTracker.steps)} tint={colors.primary} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <MetricCard icon="restaurant" label="Calories consumed" value={String(dailyTracker.caloriesConsumed)} tint="#ea580c" />
          <View style={{ flex: 1 }} />
        </View>
      </View>

      <View>
        <Text style={{ fontWeight: '800', marginBottom: 10, color: colors.text }}>
          Weekly progress {last7.days ? `(last ${last7.days} days)` : ''}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <MetricCard icon="trending-up" label="Workouts (week)" value={String(last7.totalWorkouts)} tint="#059669" />
          <MetricCard icon="walk" label="Avg daily steps" value={String(last7.avgSteps)} tint={colors.primary} />
          <MetricCard icon="flame" label="Avg calories burned" value={String(last7.avgCaloriesBurned)} tint="#f97316" />
        </View>
      </View>

      <View>
        <Text style={{ fontWeight: '800', marginBottom: 10, color: colors.text }}>Recent activity</Text>
        {recent3.length === 0 ? (
          <View
            style={{
              padding: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
            }}
          >
            <Text style={{ color: colors.textMuted }}>Log a workout to see activity here.</Text>
          </View>
        ) : (
          recent3.map(w => (
            <Pressable
              key={w.id}
              onPress={() => selectWorkout(w.id)}
              style={({ pressed }) => ({
                padding: 14,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                marginBottom: 10,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '900', color: colors.text }} numberOfLines={1}>
                    {w.type.toUpperCase()}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted }} numberOfLines={1}>
                    {w.summary}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                    {new Date(w.date).toLocaleString()}
                  </Text>
                </View>
                <Text style={{ fontWeight: '900', color: colors.text }}>{w.duration} min</Text>
              </View>
            </Pressable>
          ))
        )}
      </View>
    </View>
  );
}
