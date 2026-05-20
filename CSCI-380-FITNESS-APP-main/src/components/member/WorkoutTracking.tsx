import { useEffect, useMemo, useState } from 'react';
import { LayoutAnimation, Platform, Pressable, Text, UIManager, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';
import { CardioForm, CustomForm, FormCard, StrengthForm, YogaForm } from './WorkoutForms';

type Props = {
  onClose: () => void;
  embedded?: boolean;
  onLogWorkout?: (workout: {
    id: string;
    type: 'strength' | 'cardio' | 'yoga' | 'custom';
    date: string;
    duration: number;
    details: Record<string, any>;
    summary: string;
  }) => void;
};

const types = [
  { key: 'strength', name: 'Strength Training', icon: 'barbell' as const, tone: '#7c3aed' },
  { key: 'cardio', name: 'Cardio', icon: 'timer' as const, tone: '#2563eb' },
  { key: 'yoga', name: 'Yoga', icon: 'leaf' as const, tone: '#059669' },
  { key: 'custom', name: 'Custom', icon: 'flash' as const, tone: '#ea580c' },
] as const;

export function WorkoutTracking({ onClose, embedded, onLogWorkout }: Props) {
  type WorkoutKey = (typeof types)[number]['key'];

  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutKey | null>(embedded ? 'strength' : null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
  }, []);

  const selectedMeta = useMemo(
    () => (selectedWorkout ? types.find(t => t.key === selectedWorkout) ?? null : null),
    [selectedWorkout],
  );

  const select = (key: WorkoutKey) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedWorkout(key);
  };

  const reset = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedWorkout(null);
  };

  const submit = (payload: Record<string, any>) => {
    const type = String(payload?.type ?? selectedWorkout ?? 'custom') as
      | 'strength'
      | 'cardio'
      | 'yoga'
      | 'custom';

    const duration = Number(payload?.durationMinutes ?? payload?.duration ?? 0);
    const date = new Date().toISOString();

    const summary =
      type === 'strength'
        ? `${payload.exerciseName || 'Strength'} - ${Number(payload.sets ?? 0)} sets`
        : type === 'cardio'
          ? `${payload.activityType || 'Cardio'} - ${Number(payload.distance ?? 0)} mi`
          : type === 'yoga'
            ? `${payload.sessionType || 'Yoga'} - ${duration} min`
            : `${payload.workoutName || 'Custom'} - ${duration} min`;

    const workout = {
      id: `${Date.now()}`,
      type,
      date,
      duration,
      details: payload,
      summary,
    };

    console.log('workout:submit', workout);
    onLogWorkout?.(workout);
    onClose();
  };

  return (
    <View style={{ gap: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Log Workout</Text>
        {!embedded && (
          <Pressable onPress={onClose} style={{ padding: 8 }}>
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      <View>
        <Text style={{ marginBottom: 12, fontWeight: '600', color: colors.text }}>
          Select Workout Type
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {types.map(t => {
            const selected = selectedWorkout === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => select(t.key)}
                style={({ pressed }) => ({
                  width: '47%',
                  borderRadius: 14,
                  padding: 16,
                  borderWidth: 2,
                  borderColor: selected ? t.tone : colors.border,
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: selected ? t.tone + '18' : colors.card,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: selected ? t.tone + '33' : t.tone + '22',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={t.icon} size={26} color={t.tone} />
                </View>
                <Text style={{ textAlign: 'center', color: colors.text, fontWeight: '700' }}>{t.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {selectedWorkout ? (
        <View style={{ gap: 12 }}>
          <FormCard title={selectedMeta?.name ?? 'Workout'} subtitle="Fill out the form below (MVP)">
            {selectedWorkout === 'strength' ? (
              <StrengthForm onSubmit={submit} />
            ) : selectedWorkout === 'cardio' ? (
              <CardioForm onSubmit={submit} />
            ) : selectedWorkout === 'yoga' ? (
              <YogaForm onSubmit={submit} />
            ) : (
              <CustomForm onSubmit={submit} />
            )}
          </FormCard>

          <Pressable onPress={reset} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
            <Text style={{ textAlign: 'center', color: colors.textMuted }}>Change Workout Type</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
