import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader } from '../../components/ScreenHeader';
import { colors } from '../../theme/colors';

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
};

const templates = [
  { name: 'Upper Body Strength', exercises: 6, duration: '45 min' },
  { name: 'Lower Body Power', exercises: 5, duration: '50 min' },
  { name: 'Full Body HIIT', exercises: 8, duration: '35 min' },
];

export function WorkoutBuilderScreen() {
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([
    { id: '1', name: 'Barbell Squat', sets: 4, reps: '8-10', rest: '90s', notes: 'Focus on depth' },
    { id: '2', name: 'Romanian Deadlift', sets: 3, reps: '10-12', rest: '60s' },
    { id: '3', name: 'Leg Press', sets: 3, reps: '12-15', rest: '60s' },
  ]);

  const update = (id: string, patch: Partial<Exercise>) =>
    setExercises(prev => prev.map(e => (e.id === id ? { ...e, ...patch } : e)));

  const add = () =>
    setExercises(prev => [
      ...prev,
      { id: String(Date.now()), name: 'New Exercise', sets: 3, reps: '10', rest: '60s' },
    ]);

  const remove = (id: string) => setExercises(prev => prev.filter(e => e.id !== id));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <ScreenHeader title="Workout Plan Builder" subtitle="Create plans for your clients" />

        <Text style={{ fontWeight: '800', marginBottom: 8, color: colors.text }}>Workout Name</Text>
        <TextInput
          value={workoutName}
          onChangeText={setWorkoutName}
          placeholder="e.g. Lower Body Strength"
          placeholderTextColor={colors.textMuted}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
            backgroundColor: colors.card,
            color: colors.text,
          }}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontWeight: '900', color: colors.text }}>Exercises</Text>
          <Pressable
            onPress={add}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 }}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '900' }}>Add</Text>
          </Pressable>
        </View>

        {exercises.map((ex, idx) => (
          <View
            key={ex.id}
            style={{
              marginTop: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              padding: 12,
            }}
          >
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Text style={{ fontWeight: '900', color: colors.primary }}>{idx + 1}</Text>
              <View style={{ flex: 1 }}>
                <TextInput
                  value={ex.name}
                  onChangeText={t => update(ex.id, { name: t })}
                  style={{ fontWeight: '800', color: colors.text, marginBottom: 10 }}
                />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Sets</Text>
                    <TextInput
                      keyboardType="number-pad"
                      value={String(ex.sets)}
                      onChangeText={t => update(ex.id, { sets: parseInt(t || '0', 10) })}
                      style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 8, marginTop: 4, color: colors.text }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Reps</Text>
                    <TextInput
                      value={ex.reps}
                      onChangeText={t => update(ex.id, { reps: t })}
                      style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 8, marginTop: 4, color: colors.text }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Rest</Text>
                    <TextInput
                      value={ex.rest}
                      onChangeText={t => update(ex.id, { rest: t })}
                      style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 8, marginTop: 4, color: colors.text }}
                    />
                  </View>
                </View>
                <TextInput
                  value={ex.notes ?? ''}
                  onChangeText={t => update(ex.id, { notes: t })}
                  placeholder="Notes (optional)"
                  placeholderTextColor={colors.textMuted}
                  style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 8, marginTop: 10, color: colors.text }}
                />
              </View>
              <Pressable onPress={() => remove(ex.id)} style={{ alignSelf: 'flex-start', padding: 6 }}>
                <Ionicons name="trash" size={20} color={colors.danger} />
              </Pressable>
            </View>
          </View>
        ))}

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <Pressable
            style={{
              flex: 1,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
              backgroundColor: colors.primary,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '900' }}>Save Template</Text>
          </Pressable>
          <Pressable
            style={{
              flex: 1,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
              backgroundColor: colors.accent,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '900' }}>Assign</Text>
          </Pressable>
        </View>

        <Text style={{ fontWeight: '900', marginTop: 22, marginBottom: 10, color: colors.text }}>
          Saved Templates
        </Text>
        {templates.map(t => (
          <View
            key={t.name}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 14,
              padding: 12,
              marginBottom: 10,
              backgroundColor: colors.card,
            }}
          >
            <Text style={{ fontWeight: '900', color: colors.text }}>{t.name}</Text>
            <Text style={{ color: colors.textMuted, marginTop: 4 }}>
              {t.exercises} exercises • {t.duration}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Pressable style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#eff6ff', alignItems: 'center' }}>
                <Text style={{ color: colors.primary, fontWeight: '900' }}>Load</Text>
              </Pressable>
              <Pressable style={{ paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="copy" size={18} color={colors.text} />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
