export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type WeightGoal = 'lose' | 'maintain' | 'gain';

export function activityMultiplier(level: ActivityLevel): number {
  switch (level) {
    case 'sedentary':
      return 1.2;
    case 'light':
      return 1.375;
    case 'moderate':
      return 1.55;
    case 'active':
      return 1.725;
    case 'very_active':
      return 1.9;
  }
}

// Mifflin–St Jeor (sex not captured in current profile model; this uses the midpoint constant)
export function estimateBmrKcalPerDay(args: { age: number; weightKg: number; heightCm: number }): number {
  const { age, weightKg, heightCm } = args;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const midpointSexConstant = (-161 + 5) / 2; // average of female(-161) and male(+5)
  return base + midpointSexConstant;
}

export function estimateTdeeKcalPerDay(args: {
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
}): number {
  return estimateBmrKcalPerDay(args) * activityMultiplier(args.activityLevel);
}

export function suggestDailyCalories(args: {
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: WeightGoal;
}): number {
  const tdee = estimateTdeeKcalPerDay(args);
  const delta = args.goal === 'lose' ? -500 : args.goal === 'gain' ? 400 : 0;
  return Math.max(1200, Math.round(tdee + delta));
}

export function startOfLocalDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

