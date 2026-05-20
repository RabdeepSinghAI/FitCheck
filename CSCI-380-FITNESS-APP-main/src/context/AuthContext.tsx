import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CommonActions } from '@react-navigation/native';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from '../navigation/navigationRef';
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabase } from '../lib/supabase';

export type UserRole = 'admin' | 'trainer' | 'member';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string | null;
};

const STORAGE_KEY = 'auth:user';
const ADMIN_DIRECTORY_KEY = 'adminDirectory:v1';
const LOCAL_ACCOUNTS_KEY = 'auth:localAccounts:v1';
const DEV_MEMBER_KEYS_TO_CLEAR = [
  'member:userProfile',
  'member:workouts',
  'member:dailyTracker',
  'member:dailyHistory',
  // legacy key from removed AI recs
  'member:savedRecommendations',
  // challenges + messaging are local demo stores
  'challenges:v1',
  'chat:v1',
] as const;
type LocalAccount = {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  active: boolean;
  createdAt: string;
};

const SEED_ACCOUNTS: LocalAccount[] = [
  {
    id: 'dev-member',
    email: 'member@demo.com',
    password: 'password123',
    role: 'member',
    name: 'Demo Member',
    active: true,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: 'dev-trainer',
    email: 'trainer@demo.com',
    password: 'password123',
    role: 'trainer',
    name: 'Demo Trainer',
    active: true,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: 'dev-admin',
    email: 'admin@demo.com',
    password: 'password123',
    role: 'admin',
    name: 'Demo Admin',
    active: true,
    createdAt: new Date(0).toISOString(),
  },
];

const LOCAL_USER_IDS = new Set(SEED_ACCOUNTS.map(a => a.id));

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (args: { fullName: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function withTimeout<T>(p: PromiseLike<T>, ms: number, label: string): Promise<T> {
  let id: any;
  const timeout = new Promise<T>((_resolve, reject) => {
    id = setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms);
  });
  return Promise.race([Promise.resolve(p), timeout]).finally(() => clearTimeout(id));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasSupabase = !!SUPABASE_URL && !!SUPABASE_ANON_KEY;

  const isLocalUser = useCallback((u: User | null) => (u ? LOCAL_USER_IDS.has(u.id) : false), []);

  const readLocalAccounts = useCallback(async (): Promise<LocalAccount[]> => {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_ACCOUNTS_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : null;
      const arr = Array.isArray(parsed) ? (parsed as any[]) : [];
      return arr
        .map(x => ({
          id: String(x?.id ?? ''),
          email: String(x?.email ?? '').trim().toLowerCase(),
          password: String(x?.password ?? ''),
          role: String(x?.role ?? 'member') as UserRole,
          name: String(x?.name ?? ''),
          active: typeof x?.active === 'boolean' ? (x.active as boolean) : true,
          createdAt: String(x?.createdAt ?? new Date().toISOString()),
        }))
        .filter(a => a.id && a.email && a.password);
    } catch {
      return [];
    }
  }, []);

  const writeLocalAccounts = useCallback(async (accounts: LocalAccount[]) => {
    await AsyncStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  }, []);

  const ensureSeedAccounts = useCallback(async () => {
    const existing = await readLocalAccounts();
    const byEmail = new Map(existing.map(a => [a.email, a]));
    let mutated = false;
    for (const seed of SEED_ACCOUNTS) {
      if (!byEmail.has(seed.email)) {
        byEmail.set(seed.email, seed);
        mutated = true;
      }
    }
    const merged = Array.from(byEmail.values());
    if (mutated) await writeLocalAccounts(merged);
    // Keep LOCAL_USER_IDS stable: only seed ids are considered "local demo"
    // (admin-created accounts are not treated specially).
  }, [readLocalAccounts, writeLocalAccounts]);

  const loadSupabaseUserAndProfile = useCallback(async () => {
    // `getSession()` can be stale right after sign-in; `getUser()` is authoritative.
    const { data, error } = await withTimeout(supabase.auth.getUser(), 10000, 'User fetch');
    if (error) throw error;
    const u = data.user ?? null;
    if (!u?.id || !u.email) {
      setProfile(null);
      return null;
    }

    const fetchById = () =>
      supabase
        .from('profiles')
        .select('id,email,full_name,role,created_at')
        .eq('id', u.id)
        .maybeSingle();

    const fetchByEmail = () =>
      supabase
        .from('profiles')
        .select('id,email,full_name,role,created_at')
        .eq('email', u.email)
        .maybeSingle();

    let { data: p, error: pErr } = await withTimeout(fetchById(), 10000, 'Profile fetch');

    // If the row exists but ids don't match for some reason, retry by email.
    if (!p && !pErr) {
      ({ data: p, error: pErr } = await withTimeout(fetchByEmail(), 10000, 'Profile fetch'));
    }

    if (pErr) {
      // Allow login even if profiles/RLS isn't set up yet.
      setProfile(null);
      const role = String((u.user_metadata as any)?.role ?? 'member') as UserRole;
      const name = String((u.user_metadata as any)?.full_name ?? u.email.split('@')[0] ?? 'User');
      return { id: u.id, email: u.email, name, role } satisfies User;
    }

    const role = (String((p as any)?.role ?? (u.user_metadata as any)?.role ?? 'member') as UserRole) ?? 'member';
    const name = String(
      (p as any)?.full_name ?? (u.user_metadata as any)?.full_name ?? u.email.split('@')[0] ?? 'User',
    );

    setProfile(
      p
        ? ({
            id: String((p as any).id),
            email: String((p as any).email),
            full_name: (p as any).full_name ?? null,
            role,
            created_at: (p as any).created_at ?? null,
          } satisfies Profile)
        : null,
    );

    return { id: u.id, email: u.email, name, role } satisfies User;
  }, []);

  const refreshProfile = useCallback(async () => {
    // Local demo session is stored locally; don't let Supabase overwrite it.
    if (isLocalUser(user)) return;
    try {
      setLoading(true);
      const u = await loadSupabaseUserAndProfile();
      setUser(u);
      if (u) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [isLocalUser, loadSupabaseUserAndProfile, user]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        await ensureSeedAccounts();

        // Dev convenience: when scanning the Expo QR code, always start at Login
        // (prevents a previously persisted session from immediately skipping Login).
        if (__DEV__) {
          try {
            await AsyncStorage.removeItem(STORAGE_KEY);
          } catch {
            // ignore
          }
          if (mounted) {
            setUser(null);
            setProfile(null);
          }
          try {
            if (hasSupabase) await withTimeout(supabase.auth.signOut(), 5000, 'Sign out');
          } catch {
            // ignore
          }
          return;
        }

        // Prefer a persisted local session (demo/offline) if present.
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const stored = raw ? (JSON.parse(raw) as any) : null;
        if (stored?.id && stored?.email && stored?.role) {
          const restored: User = {
            id: String(stored.id),
            email: String(stored.email),
            role: String(stored.role) as UserRole,
            name: String(stored.name ?? stored.email?.split?.('@')?.[0] ?? 'User'),
          };
          if (mounted) {
            setUser(restored);
            setProfile({
              id: restored.id,
              email: restored.email,
              full_name: restored.name,
              role: restored.role,
              created_at: null,
            });
          }
          return;
        }

        // Otherwise hydrate from Supabase if configured.
        if (hasSupabase) {
          const u = await loadSupabaseUserAndProfile();
          if (!mounted) return;
          setUser(u);
          if (u) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
          else await AsyncStorage.removeItem(STORAGE_KEY);
        } else {
          if (mounted) {
            setProfile(null);
            setUser(null);
          }
        }
      } finally {
        if (mounted) setLoading(false);
        if (mounted) setIsHydrated(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [loadSupabaseUserAndProfile]);

  useEffect(() => {
    // If an admin changes a user's role server-side, Supabase won't emit an auth event.
    // Refresh on app foreground so role changes take effect without reinstalling.
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') refreshProfile();
    });
    return () => sub.remove();
  }, [refreshProfile]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      try {
        // Local demo session is local; ignore Supabase auth events.
        if (isLocalUser(user)) return;
        if (!hasSupabase) return;
        setLoading(true);
        const u = await loadSupabaseUserAndProfile();
        setUser(u);
        if (u) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        else await AsyncStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [hasSupabase, isLocalUser, loadSupabaseUserAndProfile, user]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    const e = email.trim().toLowerCase();
    try {
      setLoading(true);

      // Local demo/offline logins (seed + admin-created local accounts).
      await ensureSeedAccounts();
      const local = await readLocalAccounts();
      const acct = local.find(a => a.email === e && a.password === password) ?? null;
      if (acct) {
        // For the demo member, behave like a first login each time to keep onboarding/test data consistent.
        if (acct.email === 'member@demo.com') {
          try {
            await AsyncStorage.multiRemove([...DEV_MEMBER_KEYS_TO_CLEAR]);
          } catch {
            // ignore
          }
        }

        // If account is marked inactive in admin directory overrides, block login.
        try {
          const raw = await AsyncStorage.getItem(ADMIN_DIRECTORY_KEY);
          const parsed = raw ? (JSON.parse(raw) as any) : null;
          const activeOverride = parsed?.people?.[acct.id]?.active;
          const effectiveActive = typeof activeOverride === 'boolean' ? activeOverride : acct.active;
          if (!effectiveActive) {
            setAuthError('This account is inactive.');
            return;
          }
        } catch {
          // ignore
        }

        const u: User = { id: acct.id, email: acct.email, name: acct.name, role: acct.role };
        setProfile({ id: u.id, email: u.email, full_name: u.name, role: u.role, created_at: null });
        setUser(u);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        return;
      }

      if (!hasSupabase) {
        setAuthError('Invalid email or password.');
        throw new Error('Invalid email or password.');
      }

      const { error } = await withTimeout(supabase.auth.signInWithPassword({ email: e, password }), 10000, 'Login');
      if (error) throw error;
      const u = await loadSupabaseUserAndProfile();
      setUser(u);
      if (u) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setAuthError(msg);
      throw err instanceof Error ? err : new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [ensureSeedAccounts, hasSupabase, loadSupabaseUserAndProfile, readLocalAccounts]);

  const signUp = useCallback(async (args: { fullName: string; email: string; password: string }) => {
    setAuthError(null);
    const fullName = args.fullName.trim();
    const email = args.email.trim().toLowerCase();
    if (!fullName) throw new Error('Please enter your name');
    if (args.password.length < 6) throw new Error('Password must be at least 6 characters');
    try {
      setLoading(true);
      await ensureSeedAccounts();

      // If Supabase isn't configured, create a local demo account instead.
      if (!hasSupabase) {
        const existing = await readLocalAccounts();
        if (existing.some(a => a.email === email)) throw new Error('An account with this email already exists');
        const next: LocalAccount = {
          id: `local-${Math.random().toString(16).slice(2)}-${Date.now()}`,
          email,
          password: args.password,
          role: 'member',
          name: fullName,
          active: true,
          createdAt: new Date().toISOString(),
        };
        await writeLocalAccounts([next, ...existing]);
        const u: User = { id: next.id, email: next.email, name: next.name, role: next.role };
        setProfile({ id: u.id, email: u.email, full_name: u.name, role: u.role, created_at: null });
        setUser(u);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        return;
      }

      const { data, error } = await withTimeout(
        supabase.auth.signUp({ email, password: args.password, options: { data: { full_name: fullName, role: 'member' } } }),
        10000,
        'Sign up',
      );
      if (error) throw error;
      if (data.session) {
        const u = await loadSupabaseUserAndProfile();
        setUser(u);
        if (u) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign up failed';
      setAuthError(msg);
      throw err instanceof Error ? err : new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [ensureSeedAccounts, hasSupabase, loadSupabaseUserAndProfile, readLocalAccounts, writeLocalAccounts]);

  const logout = useCallback(async () => {
    setUser(null);
    setProfile(null);
    try {
      if (hasSupabase) await supabase.auth.signOut();
    } catch {
      // ignore
    }
    await AsyncStorage.removeItem(STORAGE_KEY);
    if (navigationRef.isReady()) {
      navigationRef.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Auth' }] }),
      );
    }
  }, [hasSupabase]);

  const value = useMemo(
    () => ({
      user,
      profile,
      isAuthenticated: !!user,
      isHydrated,
      loading,
      login,
      signUp,
      logout,
      refreshProfile,
      authError,
    }),
    [user, profile, isHydrated, loading, login, signUp, logout, refreshProfile, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
