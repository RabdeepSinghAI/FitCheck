export type MembershipStatus = 'active' | 'trial' | 'paused';

export type MemberDirectoryRow = {
  id: string;
  name: string;
  email: string;
  avatarUri?: string | null;
  membershipStatus: MembershipStatus;
  lastSessionDate: string | null; // ISO or null
  assignedPlan: string | null;
  assignedTrainerId: string | null;
  age: number | null;
  goal: 'lose fat' | 'build muscle' | 'maintain';
  lastActiveDate: string | null; // YYYY-MM-DD or ISO
  currentStreakDays: number;
  longestStreakDays: number;
};

export type TrainerDirectoryRow = {
  id: string;
  name: string;
  email: string;
  avatarUri?: string | null;
  bio: string;
  specializations: string[];
  certifications: string[];
  yearsExperience: number;
  totalClientsCoached: number;
  sessionsCompleted: number;
  contactPhone?: string | null;
  contactWebsite?: string | null;
  availabilityNotes: string;
};

// Demo directory that’s intentionally easy to swap for a backend.
export const trainersDirectory: TrainerDirectoryRow[] = [
  {
    id: 'trainer-1',
    name: 'Mike Johnson',
    email: 'mike@fitcheck.com',
    avatarUri: null,
    bio: 'Strength & mobility coach focused on sustainable routines.',
    specializations: ['Strength', 'Mobility', 'Body recomposition'],
    certifications: ['NASM-CPT', 'CPR/AED'],
    yearsExperience: 6,
    totalClientsCoached: 24,
    sessionsCompleted: 187,
    contactPhone: null,
    contactWebsite: null,
    availabilityNotes: 'Weekdays 7am–6pm, Sat mornings',
  },
  {
    id: 'trainer-2',
    name: 'Alex Rodriguez',
    email: 'alex@fitcheck.com',
    avatarUri: null,
    bio: 'Cardio & HIIT coach. I help busy people train efficiently.',
    specializations: ['HIIT', 'Conditioning'],
    certifications: ['ACE-CPT'],
    yearsExperience: 4,
    totalClientsCoached: 18,
    sessionsCompleted: 142,
    contactPhone: null,
    contactWebsite: null,
    availabilityNotes: 'Weeknights 4pm–9pm',
  },
];

export const membersDirectory: MemberDirectoryRow[] = [
  {
    id: 'member-1',
    name: 'Emma Wilson',
    email: 'emma@email.com',
    avatarUri: null,
    membershipStatus: 'active',
    lastSessionDate: '2026-04-27T14:00:00.000Z',
    assignedPlan: '12-Week Weight Loss Program',
    assignedTrainerId: 'trainer-1',
    age: 24,
    goal: 'lose fat',
    lastActiveDate: '2026-04-29',
    currentStreakDays: 7,
    longestStreakDays: 14,
  },
  {
    id: 'member-2',
    name: 'Sarah Miller',
    email: 'sarah@email.com',
    avatarUri: null,
    membershipStatus: 'active',
    lastSessionDate: '2026-04-26T16:30:00.000Z',
    assignedPlan: 'Strength + Cardio Split',
    assignedTrainerId: 'trainer-1',
    age: 28,
    goal: 'build muscle',
    lastActiveDate: '2026-04-28',
    currentStreakDays: 4,
    longestStreakDays: 9,
  },
  {
    id: 'member-3',
    name: 'Michael Brown',
    email: 'michael@email.com',
    avatarUri: null,
    membershipStatus: 'paused',
    lastSessionDate: '2026-04-18T18:00:00.000Z',
    assignedPlan: null,
    assignedTrainerId: null,
    age: 31,
    goal: 'maintain',
    lastActiveDate: '2026-04-18',
    currentStreakDays: 0,
    longestStreakDays: 5,
  },
];

export function getTrainerById(id: string | null | undefined) {
  if (!id) return null;
  return trainersDirectory.find(t => t.id === id) ?? null;
}

export function getMemberById(id: string | null | undefined) {
  if (!id) return null;
  return membersDirectory.find(m => m.id === id) ?? null;
}

