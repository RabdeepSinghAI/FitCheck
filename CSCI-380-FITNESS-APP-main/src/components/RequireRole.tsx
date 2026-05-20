import { type ReactNode } from 'react';
import { View, ActivityIndicator } from 'react-native';

import { useAuth, type UserRole } from '../context/AuthContext';
import { UnauthorizedScreen } from '../screens/auth/UnauthorizedScreen';
import { AuthNavigator } from '../navigation/AuthNavigator';

type Props = {
  allow: UserRole[];
  children: ReactNode;
};

export function RequireRole({ allow, children }: Props) {
  const { user, profile, isHydrated, loading } = useAuth();
  const effectiveRole = profile?.role ?? user?.role ?? null;

  if (!isHydrated || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) return <AuthNavigator />;
  if (!effectiveRole || !allow.includes(effectiveRole)) return <UnauthorizedScreen />;
  return <>{children}</>;
}

