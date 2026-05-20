import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Suspense, lazy } from 'react';

import { useAuth } from '../context/AuthContext';
import { SuspenseFallback } from '../components/SuspenseFallback';

const AuthNavigator = lazy(() => import('./AuthNavigator').then(m => ({ default: m.AuthNavigator })));
const AdminNavigator = lazy(() => import('./AdminNavigator').then(m => ({ default: m.AdminNavigator })));
const MemberNavigator = lazy(() => import('./MemberNavigator').then(m => ({ default: m.MemberNavigator })));
const TrainerNavigator = lazy(() => import('./TrainerNavigator').then(m => ({ default: m.TrainerNavigator })));

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { user, profile, isHydrated, loading } = useAuth();

  if (!isHydrated || loading) {
    return <SuspenseFallback />;
  }

  const effectiveRole = profile?.role ?? user?.role ?? null;
  const stackKey = user && effectiveRole ? `app-${effectiveRole}-${user.id}` : 'auth';

  return (
    <Stack.Navigator key={stackKey} screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth">
          {(props: any) => (
            <Suspense fallback={<SuspenseFallback />}>
              <AuthNavigator {...props} />
            </Suspense>
          )}
        </Stack.Screen>
      ) : effectiveRole === 'member' ? (
        <Stack.Screen name="Member">
          {(props: any) => (
            <Suspense fallback={<SuspenseFallback />}>
              <MemberNavigator {...props} />
            </Suspense>
          )}
        </Stack.Screen>
      ) : effectiveRole === 'trainer' ? (
        <Stack.Screen name="Trainer">
          {(props: any) => (
            <Suspense fallback={<SuspenseFallback />}>
              <TrainerNavigator {...props} />
            </Suspense>
          )}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Admin">
          {(props: any) => (
            <Suspense fallback={<SuspenseFallback />}>
              <AdminNavigator {...props} />
            </Suspense>
          )}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}
