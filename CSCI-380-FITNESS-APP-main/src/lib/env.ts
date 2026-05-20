import Constants from 'expo-constants';

type Extra = {
  MOCK_BACKEND?: boolean;
};

function extra(): Extra {
  const cfg = Constants.expoConfig ?? Constants.manifest;
  return (cfg as any)?.extra ?? {};
}

export const ENV = {
  MOCK_BACKEND: !!extra().MOCK_BACKEND,
} as const;

