import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

function getExtra(): Record<string, any> {
  const cfg = Constants.expoConfig ?? (Constants as any).manifest;
  return (cfg as any)?.extra ?? {};
}

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  String(getExtra().SUPABASE_URL || '');

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  String(getExtra().SUPABASE_ANON_KEY || '');

// NOTE: rotate keys before production if you ever hardcode them during setup.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

