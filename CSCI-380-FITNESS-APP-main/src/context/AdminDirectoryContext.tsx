import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  membersDirectory as seedMembers,
  trainersDirectory as seedTrainers,
  type MemberDirectoryRow,
  type TrainerDirectoryRow,
} from '../lib/mockDirectory';
import type { UserRole } from './AuthContext';

export type AdminPersonBase = {
  id: string;
  name: string;
  email: string;
  avatarUri?: string | null;
  role: UserRole;
  active: boolean;
};

export type AdminMemberRow = MemberDirectoryRow &
  AdminPersonBase & {
    role: 'member';
  };

export type AdminTrainerRow = TrainerDirectoryRow &
  AdminPersonBase & {
    role: 'trainer';
  };

export type AdminAdminRow = AdminPersonBase & {
  role: 'admin';
};

type AdminDirectoryContextValue = {
  people: AdminPersonBase[];
  members: AdminMemberRow[];
  trainers: AdminTrainerRow[];
  admins: AdminAdminRow[];
  getPerson: (id: string) => AdminPersonBase | null;
  getTrainer: (trainerId: string) => AdminTrainerRow | null;
  addPerson: (args: { id: string; name: string; email: string; role: UserRole }) => { ok: true } | { ok: false; reason: string };
  setPersonActive: (args: { personId: string; active: boolean }) => void;
  deletePerson: (personId: string) => void;
  changeRole: (args: { personId: string; nextRole: UserRole }) => { ok: true } | { ok: false; reason: string };
};

const STORAGE_KEY = 'adminDirectory:v1';

type Stored = {
  people: Record<
    string,
    {
      active?: boolean;
      role?: UserRole;
      trainerProfile?: Partial<
        Pick<
          TrainerDirectoryRow,
          | 'bio'
          | 'specializations'
          | 'certifications'
          | 'yearsExperience'
          | 'totalClientsCoached'
          | 'sessionsCompleted'
          | 'contactPhone'
          | 'contactWebsite'
          | 'availabilityNotes'
        >
      >;
    }
  >;
  deletedIds?: string[];
  customPeople?: AdminPersonBase[];
};

const AdminDirectoryContext = createContext<AdminDirectoryContextValue | undefined>(undefined);

export function AdminDirectoryProvider({ children }: { children: React.ReactNode }) {
  const [activeById, setActiveById] = useState<Record<string, boolean>>({});
  const [roleById, setRoleById] = useState<Record<string, UserRole>>({});
  const [trainerProfileById, setTrainerProfileById] = useState<Record<string, Partial<TrainerDirectoryRow>>>({});
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [customPeople, setCustomPeople] = useState<AdminPersonBase[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as Stored) : null;
        if (!mounted || !parsed) return;
        const nextActive: Record<string, boolean> = {};
        const nextRole: Record<string, UserRole> = {};
        const nextTrainerProfile: Record<string, Partial<TrainerDirectoryRow>> = {};
        for (const [id, v] of Object.entries(parsed.people ?? {})) {
          if (typeof v.active === 'boolean') nextActive[id] = v.active;
          if (v.role) nextRole[id] = v.role;
          if (v.trainerProfile) nextTrainerProfile[id] = v.trainerProfile;
        }
        setActiveById(nextActive);
        setRoleById(nextRole);
        setTrainerProfileById(nextTrainerProfile);
        if (parsed.deletedIds?.length) setDeletedIds(new Set(parsed.deletedIds));
        if (Array.isArray(parsed.customPeople)) {
          const cleaned = parsed.customPeople
            .map(p => ({
              id: String((p as any).id ?? ''),
              name: String((p as any).name ?? ''),
              email: String((p as any).email ?? '').trim().toLowerCase(),
              avatarUri: (p as any).avatarUri ?? null,
              role: String((p as any).role ?? 'member') as UserRole,
              active: typeof (p as any).active === 'boolean' ? ((p as any).active as boolean) : true,
            }))
            .filter(p => p.id && p.email && p.name);
          setCustomPeople(cleaned);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const payload: Stored = {
      people: Object.fromEntries(
        Array.from(
          new Set([...Object.keys(activeById), ...Object.keys(roleById), ...Object.keys(trainerProfileById)]),
        ).map(id => [
          id,
          {
            active: activeById[id],
            role: roleById[id],
            trainerProfile: trainerProfileById[id],
          },
        ]),
      ),
      deletedIds: Array.from(deletedIds),
      customPeople,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  }, [activeById, customPeople, deletedIds, roleById, trainerProfileById]);

  const seedPeople = useMemo(() => {
    const members = seedMembers.map(m => ({ ...m, role: 'member' as const }));
    const trainers = seedTrainers.map(t => ({ ...t, role: 'trainer' as const }));
    const devAdmin: AdminAdminRow = {
      id: 'dev-admin',
      name: 'Dev Admin',
      email: 'admin@demo.local',
      avatarUri: null,
      role: 'admin',
      active: true,
    };
    return [...members, ...trainers, devAdmin];
  }, []);

  const people = useMemo<AdminPersonBase[]>(() => {
    const merged = [...seedPeople, ...customPeople];
    const map = new Map<string, AdminPersonBase>();
    for (const p of merged) {
      const id = (p as any).id;
      if (!id) continue;
      if (deletedIds.has(id)) continue;
      const active = activeById[id] ?? (p as any).active ?? true;
      const role = roleById[id] ?? (p as any).role ?? 'member';
      map.set(id, {
        id,
        name: String((p as any).name ?? ''),
        email: String((p as any).email ?? ''),
        avatarUri: (p as any).avatarUri ?? null,
        role: role as UserRole,
        active: !!active,
      });
    }
    return Array.from(map.values());
  }, [activeById, customPeople, deletedIds, roleById, seedPeople]);

  const members = useMemo<AdminMemberRow[]>(() => {
    return seedMembers
      .filter(m => !deletedIds.has(m.id))
      .map(m => ({
        ...m,
        role: (roleById[m.id] ?? 'member') === 'member' ? 'member' : ('member' as const),
        active: activeById[m.id] ?? true,
      }))
      .filter(m => (roleById[m.id] ?? 'member') === 'member');
  }, [activeById, deletedIds, roleById]);

  const trainers = useMemo<AdminTrainerRow[]>(() => {
    // Trainers are either seeded trainers, or promoted members (role override).
    const promoted = seedMembers
      .filter(m => (roleById[m.id] ?? 'member') === 'trainer')
      .map(m => {
        const extra = trainerProfileById[m.id] ?? {};
        const base: TrainerDirectoryRow = {
          id: m.id,
          name: m.name,
          email: m.email,
          avatarUri: m.avatarUri ?? null,
          bio: String(extra.bio ?? ''),
          specializations: Array.isArray(extra.specializations) ? (extra.specializations as any) : [],
          certifications: Array.isArray(extra.certifications) ? (extra.certifications as any) : [],
          yearsExperience: Number(extra.yearsExperience ?? 0),
          totalClientsCoached: Number(extra.totalClientsCoached ?? 0),
          sessionsCompleted: Number(extra.sessionsCompleted ?? 0),
          contactPhone: (extra as any).contactPhone ?? null,
          contactWebsite: (extra as any).contactWebsite ?? null,
          availabilityNotes: String(extra.availabilityNotes ?? ''),
        };
        return {
          ...base,
          role: 'trainer' as const,
          active: activeById[m.id] ?? true,
        };
      });

    const seeded = seedTrainers
      .filter(t => !deletedIds.has(t.id))
      .map(t => {
        const extra = trainerProfileById[t.id] ?? {};
        return {
          ...t,
          ...(extra as any),
          role: (roleById[t.id] ?? 'trainer') === 'trainer' ? ('trainer' as const) : ('trainer' as const),
          active: activeById[t.id] ?? true,
        };
      })
      .filter(t => (roleById[t.id] ?? 'trainer') === 'trainer');

    const mapById = new Map<string, AdminTrainerRow>();
    for (const t of [...seeded, ...promoted]) mapById.set(t.id, t as AdminTrainerRow);
    return Array.from(mapById.values());
  }, [activeById, deletedIds, roleById, trainerProfileById]);

  const admins = useMemo<AdminAdminRow[]>(
    () =>
      people
        .filter(p => p.role === 'admin')
        .map(p => ({ ...p, role: 'admin' as const })),
    [people],
  );

  const setPersonActive = useCallback(({ personId, active }: { personId: string; active: boolean }) => {
    setActiveById(prev => ({ ...prev, [personId]: active }));
  }, []);

  const deletePerson = useCallback((personId: string) => {
    setDeletedIds(prev => new Set([...prev, personId]));
  }, []);

  const addPerson = useCallback(
    ({ id, name, email, role }: { id: string; name: string; email: string; role: UserRole }) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!id || !name.trim() || !cleanEmail) return { ok: false as const, reason: 'Missing required fields.' };
      const exists = people.some(p => p.id === id || p.email.trim().toLowerCase() === cleanEmail);
      if (exists) return { ok: false as const, reason: 'A user with this email already exists.' };
      setCustomPeople(prev => [
        { id, name: name.trim(), email: cleanEmail, role, active: true, avatarUri: null },
        ...prev,
      ]);
      return { ok: true as const };
    },
    [people],
  );

  const getPerson = useCallback((id: string) => people.find(p => p.id === id) ?? null, [people]);
  const getTrainer = useCallback((trainerId: string) => trainers.find(t => t.id === trainerId) ?? null, [trainers]);

  const changeRole = useCallback(
    ({ personId, nextRole }: { personId: string; nextRole: UserRole }) => {
      // guard: keep at least one admin
      const current = roleById[personId] ?? (people.find(p => p.id === personId)?.role ?? 'member');
      const adminCount = people.filter(p => (roleById[p.id] ?? p.role) === 'admin').length;
      if (current === 'admin' && nextRole !== 'admin' && adminCount <= 1) {
        return { ok: false as const, reason: 'There must be at least one admin on the platform. Add another admin before removing this role.' };
      }

      setRoleById(prev => ({ ...prev, [personId]: nextRole }));

      if (nextRole === 'trainer') {
        // initialize trainer fields if missing
        setTrainerProfileById(prev => {
          if (prev[personId]) return prev;
          return {
            ...prev,
            [personId]: {
              bio: '',
              specializations: [],
              certifications: [],
              yearsExperience: 0,
              totalClientsCoached: 0,
              sessionsCompleted: 0,
              contactPhone: null,
              contactWebsite: null,
              availabilityNotes: '',
            },
          };
        });
      }

      return { ok: true as const };
    },
    [people, roleById],
  );

  const value = useMemo<AdminDirectoryContextValue>(
    () => ({
      people,
      members,
      trainers,
      admins,
      getPerson,
      getTrainer,
      addPerson,
      setPersonActive,
      deletePerson,
      changeRole,
    }),
    [addPerson, admins, changeRole, getPerson, getTrainer, members, people, setPersonActive, trainers, deletePerson],
  );

  return <AdminDirectoryContext.Provider value={value}>{children}</AdminDirectoryContext.Provider>;
}

export function useAdminDirectory() {
  const ctx = useContext(AdminDirectoryContext);
  if (!ctx) throw new Error('useAdminDirectory must be used within AdminDirectoryProvider');
  return ctx;
}

