import 'dotenv/config';

export default ({ config }: { config: any }) => {
  const extra = {
    ...(config.extra ?? {}),
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  };

  return {
    ...config,
    plugins: Array.from(new Set([...(config.plugins ?? []), 'expo-font'])),
    extra,
  };
};

