import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Suspense, lazy } from 'react';

import { SuspenseFallback } from '../components/SuspenseFallback';
const MemberHomeScreen = lazy(() => import('../screens/member/MemberHomeScreen').then(m => ({ default: m.MemberHomeScreen })));
const TrainerProfileScreen = lazy(() =>
  import('../screens/member/TrainerProfileScreen').then(m => ({ default: m.TrainerProfileScreen })),
);

export type MemberStackParamList = {
  MemberHome: { initialTab?: 'home' | 'workouts' | 'messages' | 'progress' | 'profile'; trainerId?: string } | undefined;
  TrainerProfile: { trainerId: string; memberId: string };
};

const Stack = createNativeStackNavigator<MemberStackParamList>();

export function MemberNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MemberHome">
        {(props: any) => (
          <Suspense fallback={<SuspenseFallback />}>
            <MemberHomeScreen {...props} />
          </Suspense>
        )}
      </Stack.Screen>
      <Stack.Screen name="TrainerProfile">
        {(props: any) => (
          <Suspense fallback={<SuspenseFallback />}>
            <TrainerProfileScreen {...props} />
          </Suspense>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
