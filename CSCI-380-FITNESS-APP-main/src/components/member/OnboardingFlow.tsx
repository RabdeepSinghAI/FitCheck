import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { UserProfile } from '../../context/MemberDataContext';
import { useTheme } from '../../context/ThemeContext';

type FitnessGoal = NonNullable<UserProfile['fitnessGoal']>;
type ActivityLevel = NonNullable<UserProfile['activityLevel']>;

function bmiCategory(bmi: number) {
  if (bmi < 18.5) return { label: 'Underweight', color: '#1d4ed8' };
  if (bmi < 25) return { label: 'Normal', color: '#16a34a' };
  if (bmi < 30) return { label: 'Overweight', color: '#ca8a04' };
  return { label: 'Obese', color: '#dc2626' };
}

function computeBmiKgCm(weightKg: number, heightCm: number) {
  const m = heightCm / 100;
  if (!weightKg || !heightCm || m <= 0) return null;
  const bmi = weightKg / (m * m);
  return Math.round(bmi * 10) / 10;
}

export function OnboardingFlow({
  initial,
  onComplete,
  onSkip,
}: {
  initial: Pick<UserProfile, 'name' | 'heightCm' | 'weightKg' | 'fitnessGoal' | 'activityLevel'>;
  onComplete: (patch: Partial<UserProfile>) => void;
  onSkip: () => void;
}) {
  const { colors } = useTheme();
  const [step, setStep] = useState(1);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');

  const [usernameText, setUsernameText] = useState(() => (initial.name && initial.name !== 'Member' ? initial.name : ''));
  const [heightCmText, setHeightCmText] = useState(initial.heightCm ? String(initial.heightCm) : '');
  const [heightFtText, setHeightFtText] = useState('');
  const [heightInText, setHeightInText] = useState('');
  const [weightText, setWeightText] = useState(initial.weightKg ? String(initial.weightKg) : '');

  const [fitnessGoal, setFitnessGoal] = useState<UserProfile['fitnessGoal']>(initial.fitnessGoal ?? null);
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>(initial.activityLevel ?? null);

  const anim = useRef(new Animated.Value(1)).current;
  const usernameRef = useRef<TextInput>(null);
  const heightCmRef = useRef<TextInput>(null);
  const heightFtRef = useRef<TextInput>(null);
  const heightInRef = useRef<TextInput>(null);
  const weightRef = useRef<TextInput>(null);

  const heightCm = useMemo(() => {
    if (heightUnit === 'cm') return Number(heightCmText) || null;
    const ft = Number(heightFtText) || 0;
    const inches = Number(heightInText) || 0;
    const totalIn = ft * 12 + inches;
    if (!totalIn) return null;
    return Math.round(totalIn * 2.54);
  }, [heightCmText, heightFtText, heightInText, heightUnit]);

  const weightKg = useMemo(() => {
    const n = Number(weightText) || 0;
    if (!n) return null;
    return weightUnit === 'kg' ? n : Math.round((n / 2.20462) * 10) / 10;
  }, [weightText, weightUnit]);

  const bmi = useMemo(() => {
    if (!weightKg || !heightCm) return null;
    return computeBmiKgCm(weightKg, heightCm);
  }, [heightCm, weightKg]);

  const bmiInfo = bmi ? bmiCategory(bmi) : null;

  const canNext = useMemo(() => {
    if (step === 1) return true;
    if (step === 2) return usernameText.trim().length > 0 && !!heightCm && !!weightKg;
    if (step === 3) return !!fitnessGoal;
    if (step === 4) return !!activityLevel;
    return true;
  }, [activityLevel, fitnessGoal, heightCm, step, usernameText, weightKg]);

  const goalMessage = useMemo(() => {
    switch (fitnessGoal) {
      case 'build_muscle':
        return "We'll recommend strength training and hypertrophy workouts for you.";
      case 'lose_weight':
        return "We'll focus on cardio, HIIT, and calorie-burning sessions.";
      case 'improve_flexibility':
        return "We'll recommend yoga, mobility, and stretching routines.";
      case 'boost_endurance':
        return "We'll prioritize cardio intervals and endurance plans.";
      case 'maintain_fitness':
        return "We'll keep a balanced mix to maintain your fitness.";
      case 'general_fitness':
        return "We'll recommend a well-rounded mix for overall wellness.";
      default:
        return '';
    }
  }, [fitnessGoal]);

  const go = (next: number) => {
    Animated.timing(anim, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      setStep(next);
      anim.setValue(0);
      Animated.timing(anim, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    });
  };

  const onBack = () => go(Math.max(1, step - 1));
  const onNext = () => {
    if (!canNext) return;
    if (step >= 5) return;
    go(step + 1);
  };

  const onFinish = () => {
    onComplete({
      hasCompletedOnboarding: true,
      name: usernameText.trim(),
      heightCm,
      weightKg,
      bmi,
      fitnessGoal,
      activityLevel,
    } as any);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, justifyContent: 'center', flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: '900', color: colors.text }}>
                Step {step} of 5
              </Text>
              {step >= 2 ? (
                <Pressable onPress={onSkip} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
                  <Text style={{ fontWeight: '900', color: colors.textMuted }}>Skip for now</Text>
                </Pressable>
              ) : null}
            </View>
            <View style={{ height: 8, borderRadius: 999, backgroundColor: '#e2e8f0', marginTop: 10, overflow: 'hidden' }}>
              <View style={{ width: `${(step / 5) * 100}%`, height: 8, backgroundColor: colors.primary }} />
            </View>
          </View>

          <View
            style={{
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              padding: 16,
            }}
          >
            <Pressable
              onPress={step > 1 ? onBack : onSkip}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 6, opacity: pressed ? 0.85 : 1 })}
            >
              <Ionicons name="arrow-back" size={18} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontWeight: '800' }}>Back</Text>
            </Pressable>

            <Animated.View style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
          {step === 1 ? (
            <View style={{ paddingTop: 10 }}>
              <View style={{ alignItems: 'center', marginTop: 4 }}>
                <View style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="sparkles" size={26} color={colors.primary} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, marginTop: 12 }}>
                  Let&apos;s set up your profile
                </Text>
                <Text style={{ color: colors.textMuted, marginTop: 8, textAlign: 'center' }}>
                  This takes less than a minute and helps us personalize your experience
                </Text>
              </View>
              <Pressable
                onPress={onNext}
                style={({ pressed }) => ({
                  marginTop: 16,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text style={{ color: '#fff', fontWeight: '900' }}>Get Started</Text>
              </Pressable>
            </View>
          ) : null}

          {step === 2 ? (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>Body Metrics</Text>
              <Text style={{ color: colors.textMuted, marginTop: 6 }}>We&apos;ll use this to calculate your BMI and personalize workouts.</Text>

              <TextInput
                ref={usernameRef}
                value={usernameText}
                onChangeText={setUsernameText}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Username"
                placeholderTextColor={colors.textMuted}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  if (heightUnit === 'cm') heightCmRef.current?.focus();
                  else heightFtRef.current?.focus();
                }}
                style={{ marginTop: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.text }}
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <Pressable
                  onPress={() => setHeightUnit('cm')}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 999,
                    backgroundColor: heightUnit === 'cm' ? colors.primary : '#f1f5f9',
                    alignItems: 'center',
                    opacity: pressed ? 0.9 : 1,
                  })}
                >
                  <Text style={{ fontWeight: '900', color: heightUnit === 'cm' ? '#fff' : colors.text }}>cm</Text>
                </Pressable>
                <Pressable
                  onPress={() => setHeightUnit('ft')}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 999,
                    backgroundColor: heightUnit === 'ft' ? colors.primary : '#f1f5f9',
                    alignItems: 'center',
                    opacity: pressed ? 0.9 : 1,
                  })}
                >
                  <Text style={{ fontWeight: '900', color: heightUnit === 'ft' ? '#fff' : colors.text }}>ft/in</Text>
                </Pressable>
              </View>

              {heightUnit === 'cm' ? (
                <TextInput
                  ref={heightCmRef}
                  value={heightCmText}
                  onChangeText={setHeightCmText}
                  keyboardType="number-pad"
                  placeholder="Height (cm)"
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => weightRef.current?.focus()}
                  style={{ marginTop: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.text }}
                />
              ) : (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <TextInput
                    ref={heightFtRef}
                    value={heightFtText}
                    onChangeText={setHeightFtText}
                    keyboardType="number-pad"
                    placeholder="ft"
                    placeholderTextColor={colors.textMuted}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => heightInRef.current?.focus()}
                    style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.text }}
                  />
                  <TextInput
                    ref={heightInRef}
                    value={heightInText}
                    onChangeText={setHeightInText}
                    keyboardType="number-pad"
                    placeholder="in"
                    placeholderTextColor={colors.textMuted}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => weightRef.current?.focus()}
                    style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.text }}
                  />
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <Pressable
                  onPress={() => setWeightUnit('kg')}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 999,
                    backgroundColor: weightUnit === 'kg' ? colors.primary : '#f1f5f9',
                    alignItems: 'center',
                    opacity: pressed ? 0.9 : 1,
                  })}
                >
                  <Text style={{ fontWeight: '900', color: weightUnit === 'kg' ? '#fff' : colors.text }}>kg</Text>
                </Pressable>
                <Pressable
                  onPress={() => setWeightUnit('lb')}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 999,
                    backgroundColor: weightUnit === 'lb' ? colors.primary : '#f1f5f9',
                    alignItems: 'center',
                    opacity: pressed ? 0.9 : 1,
                  })}
                >
                  <Text style={{ fontWeight: '900', color: weightUnit === 'lb' ? '#fff' : colors.text }}>lbs</Text>
                </Pressable>
              </View>

              <TextInput
                ref={weightRef}
                value={weightText}
                onChangeText={setWeightText}
                keyboardType="number-pad"
                placeholder={`Weight (${weightUnit})`}
                placeholderTextColor={colors.textMuted}
                returnKeyType="done"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                  if (canNext) onNext();
                }}
                style={{ marginTop: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.text }}
              />

              <View style={{ marginTop: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 12, backgroundColor: colors.background }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontWeight: '900', color: colors.text }}>BMI</Text>
                  <Text style={{ fontWeight: '900', color: bmiInfo?.color ?? colors.textMuted }}>{bmi ?? '—'}</Text>
                </View>
                <View style={{ height: 10, borderRadius: 999, backgroundColor: '#e2e8f0', marginTop: 10, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.min(100, Math.max(0, ((bmi ?? 0) / 40) * 100))}%`, height: 10, backgroundColor: bmiInfo?.color ?? '#94a3b8' }} />
                </View>
                <Text style={{ marginTop: 10, color: colors.textMuted }}>
                  {bmi ? `Your BMI is ${bmi} — ${bmiInfo?.label}` : 'Enter height and weight to see your BMI.'}
                </Text>
              </View>

              <Pressable
                onPress={onNext}
                disabled={!canNext}
                style={({ pressed }) => ({
                  marginTop: 16,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: canNext ? colors.primary : '#e2e8f0',
                  alignItems: 'center',
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text style={{ color: canNext ? '#fff' : colors.textMuted, fontWeight: '900' }}>Next</Text>
              </Pressable>
            </View>
          ) : null}

          {step === 3 ? (
            <SelectCards<FitnessGoal>
              title="What is your main fitness goal?"
              value={fitnessGoal as any}
              onChange={v => setFitnessGoal(v as any)}
              items={[
                { id: 'build_muscle', icon: 'barbell', label: 'Build Muscle', sub: 'Gain strength and increase muscle mass' },
                { id: 'lose_weight', icon: 'flame', label: 'Lose Weight', sub: 'Burn fat and reduce body weight' },
                { id: 'improve_flexibility', icon: 'leaf', label: 'Improve Flexibility', sub: 'Enhance mobility and reduce stiffness' },
                { id: 'boost_endurance', icon: 'walk', label: 'Boost Endurance', sub: 'Improve cardio and stamina' },
                { id: 'maintain_fitness', icon: 'scale', label: 'Maintain Fitness', sub: 'Stay active and keep current fitness level' },
                { id: 'general_fitness', icon: 'heart', label: 'General Fitness', sub: 'Overall health and wellness improvement' },
              ]}
              onNext={onNext}
              canNext={canNext}
            />
          ) : null}

          {step === 4 ? (
            <SelectCards<ActivityLevel>
              title="How active are you currently?"
              value={activityLevel as any}
              onChange={v => setActivityLevel(v as any)}
              items={[
                { id: 'sedentary', icon: 'bed', label: 'Sedentary', sub: 'Little to no exercise' },
                { id: 'light', icon: 'walk', label: 'Lightly Active', sub: '1–3 days/week' },
                { id: 'moderate', icon: 'bicycle', label: 'Moderately Active', sub: '3–5 days/week' },
                { id: 'very_active', icon: 'flash', label: 'Very Active', sub: '6–7 days/week' },
                { id: 'athlete', icon: 'trophy', label: 'Athlete', sub: 'Intense training daily' },
              ]}
              onNext={onNext}
              canNext={canNext}
            />
          ) : null}

          {step === 5 ? (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>All set!</Text>
              <Text style={{ color: colors.textMuted, marginTop: 6 }}>Here&apos;s what we&apos;ll use to personalize your experience.</Text>

              <View style={{ marginTop: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 12, backgroundColor: colors.background }}>
                <Text style={{ fontWeight: '900', color: colors.text }}>Summary</Text>
                <Text style={{ marginTop: 8, color: colors.textMuted }}>Username: {usernameText.trim() || '—'}</Text>
                <Text style={{ marginTop: 8, color: colors.textMuted }}>BMI: {bmi ? `${bmi} (${bmiInfo?.label})` : '—'}</Text>
                <Text style={{ marginTop: 6, color: colors.textMuted }}>Goal: {fitnessGoal ? fitnessGoal.replace(/_/g, ' ') : '—'}</Text>
                <Text style={{ marginTop: 6, color: colors.textMuted }}>Activity: {activityLevel ? activityLevel.replace(/_/g, ' ') : '—'}</Text>
              </View>

              {goalMessage ? (
                <View style={{ marginTop: 12, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}>
                  <Text style={{ fontWeight: '900', color: colors.primary }}>{goalMessage}</Text>
                </View>
              ) : null}

              <Pressable
                onPress={onFinish}
                style={({ pressed }) => ({
                  marginTop: 16,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text style={{ color: '#fff', fontWeight: '900' }}>Go to Dashboard</Text>
              </Pressable>
            </View>
          ) : null}
        </Animated.View>
          </View>
        </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

function SelectCards<T extends string>({
  title,
  value,
  onChange,
  items,
  onNext,
  canNext,
}: {
  title: string;
  value: T | null;
  onChange: (id: T) => void;
  items: Array<{ id: T; icon: keyof typeof Ionicons.glyphMap; label: string; sub: string }>;
  onNext: () => void;
  canNext: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>{title}</Text>
      <View style={{ marginTop: 12, gap: 10 }}>
        {items.map(i => {
          const selected = value === i.id;
          return (
            <Pressable
              key={i.id}
              onPress={() => onChange(i.id)}
              style={({ pressed }) => ({
                borderRadius: 14,
                borderWidth: 1,
                borderColor: selected ? colors.primary : colors.border,
                backgroundColor: selected ? '#eff6ff' : colors.card,
                padding: 12,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={i.icon} size={18} color={colors.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '900', color: colors.text }}>{i.label}</Text>
                  <Text style={{ color: colors.textMuted, marginTop: 2 }}>{i.sub}</Text>
                </View>
                {selected ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={onNext}
        disabled={!canNext}
        style={({ pressed }) => ({
          marginTop: 16,
          paddingVertical: 12,
          borderRadius: 14,
          backgroundColor: canNext ? colors.primary : '#e2e8f0',
          alignItems: 'center',
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <Text style={{ color: canNext ? '#fff' : colors.textMuted, fontWeight: '900' }}>Next</Text>
      </Pressable>
    </View>
  );
}

