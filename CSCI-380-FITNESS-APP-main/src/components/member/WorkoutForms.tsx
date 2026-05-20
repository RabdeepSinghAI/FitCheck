import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

type SharedProps<T> = {
  onSubmit: (payload: T) => void;
};

function FieldLabel({ children }: { children: string }) {
  return <Text style={{ fontWeight: '700', marginBottom: 6, color: colors.text }}>{children}</Text>;
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.textMuted}
      style={[
        {
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          padding: 12,
          backgroundColor: colors.card,
          color: colors.text,
        },
        props.style,
      ]}
    />
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        marginTop: 14,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: colors.primary,
        opacity: disabled ? 0.6 : pressed ? 0.85 : 1,
      })}
    >
      <Text style={{ color: '#fff', fontWeight: '800' }}>{label}</Text>
    </Pressable>
  );
}

export function StrengthForm({ onSubmit }: SharedProps<{
  type: 'strength';
  exerciseName: string;
  durationMinutes: number;
  sets: number;
  reps: number;
  weight: number;
}>) {
  const [exerciseName, setExerciseName] = useState('');
  const [durationText, setDurationText] = useState('');
  const [setsText, setSetsText] = useState('');
  const [repsText, setRepsText] = useState('');
  const [weightText, setWeightText] = useState('');

  const canSubmit = useMemo(() => exerciseName.trim().length > 0, [exerciseName]);

  return (
    <View style={{ gap: 10 }}>
      <FieldLabel>Exercise name</FieldLabel>
      <Input value={exerciseName} onChangeText={setExerciseName} placeholder="e.g. Bench Press" />

      <FieldLabel>Duration (minutes)</FieldLabel>
      <Input value={durationText} onChangeText={setDurationText} keyboardType="number-pad" placeholder="45" />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <FieldLabel>Sets</FieldLabel>
          <Input value={setsText} onChangeText={setSetsText} keyboardType="number-pad" placeholder="3" />
        </View>
        <View style={{ flex: 1 }}>
          <FieldLabel>Reps</FieldLabel>
          <Input value={repsText} onChangeText={setRepsText} keyboardType="number-pad" placeholder="10" />
        </View>
      </View>

      <FieldLabel>Weight</FieldLabel>
      <Input value={weightText} onChangeText={setWeightText} keyboardType="decimal-pad" placeholder="lbs or kg" />

      <PrimaryButton
        label="Submit Strength Workout"
        disabled={!canSubmit}
        onPress={() =>
          onSubmit({
            type: 'strength',
            exerciseName: exerciseName.trim(),
            durationMinutes: Number(durationText || 0),
            sets: Number(setsText || 0),
            reps: Number(repsText || 0),
            weight: Number(weightText || 0),
          })
        }
      />
    </View>
  );
}

export function CardioForm({ onSubmit }: SharedProps<{
  type: 'cardio';
  activityType: string;
  durationMinutes: number;
  distance: number;
}>) {
  const [activityType, setActivityType] = useState('');
  const [durationText, setDurationText] = useState('');
  const [distanceText, setDistanceText] = useState('');

  const canSubmit = useMemo(() => activityType.trim().length > 0, [activityType]);

  return (
    <View style={{ gap: 10 }}>
      <FieldLabel>Activity type</FieldLabel>
      <Input value={activityType} onChangeText={setActivityType} placeholder="e.g. Running" />

      <FieldLabel>Duration (minutes)</FieldLabel>
      <Input value={durationText} onChangeText={setDurationText} keyboardType="number-pad" placeholder="30" />

      <FieldLabel>Distance</FieldLabel>
      <Input value={distanceText} onChangeText={setDistanceText} keyboardType="decimal-pad" placeholder="miles or km" />

      <PrimaryButton
        label="Submit Cardio Workout"
        disabled={!canSubmit}
        onPress={() =>
          onSubmit({
            type: 'cardio',
            activityType: activityType.trim(),
            durationMinutes: Number(durationText || 0),
            distance: Number(distanceText || 0),
          })
        }
      />
    </View>
  );
}

export function YogaForm({ onSubmit }: SharedProps<{
  type: 'yoga';
  sessionType: string;
  durationMinutes: number;
}>) {
  const [sessionType, setSessionType] = useState('');
  const [durationText, setDurationText] = useState('');

  const canSubmit = useMemo(() => sessionType.trim().length > 0, [sessionType]);

  return (
    <View style={{ gap: 10 }}>
      <FieldLabel>Session type</FieldLabel>
      <Input value={sessionType} onChangeText={setSessionType} placeholder="e.g. Vinyasa" />

      <FieldLabel>Duration (minutes)</FieldLabel>
      <Input value={durationText} onChangeText={setDurationText} keyboardType="number-pad" placeholder="45" />

      <PrimaryButton
        label="Submit Yoga Session"
        disabled={!canSubmit}
        onPress={() =>
          onSubmit({
            type: 'yoga',
            sessionType: sessionType.trim(),
            durationMinutes: Number(durationText || 0),
          })
        }
      />
    </View>
  );
}

export function CustomForm({ onSubmit }: SharedProps<{
  type: 'custom';
  workoutName: string;
  durationMinutes: number;
}>) {
  const [workoutName, setWorkoutName] = useState('');
  const [durationText, setDurationText] = useState('');

  const canSubmit = useMemo(() => workoutName.trim().length > 0, [workoutName]);

  return (
    <View style={{ gap: 10 }}>
      <FieldLabel>Workout name</FieldLabel>
      <Input value={workoutName} onChangeText={setWorkoutName} placeholder="e.g. Basketball pickup" />

      <FieldLabel>Duration (minutes)</FieldLabel>
      <Input value={durationText} onChangeText={setDurationText} keyboardType="number-pad" placeholder="60" />

      <PrimaryButton
        label="Submit Custom Workout"
        disabled={!canSubmit}
        onPress={() =>
          onSubmit({
            type: 'custom',
            workoutName: workoutName.trim(),
            durationMinutes: Number(durationText || 0),
          })
        }
      />
    </View>
  );
}

export function FormCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        borderRadius: 18,
        padding: 16,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: '#eff6ff',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="create" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }}>{title}</Text>
          <Text style={{ color: colors.textMuted, marginTop: 2 }}>{subtitle}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}
