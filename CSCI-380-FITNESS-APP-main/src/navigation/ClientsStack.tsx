import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Suspense, lazy } from 'react';

import { SuspenseFallback } from '../components/SuspenseFallback';
import { colors } from '../theme/colors';

const ClientRosterScreen = lazy(() =>
  import('../screens/trainer/ClientRosterScreen').then(m => ({ default: m.ClientRosterScreen })),
);
const ClientDetailScreen = lazy(() =>
  import('../screens/trainer/ClientDetailScreen').then(m => ({ default: m.ClientDetailScreen })),
);

export type ClientsStackParamList = {
  ClientRoster: undefined;
  ClientDetail: { id: string };
};

const Stack = createNativeStackNavigator<ClientsStackParamList>();

export function ClientsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="ClientRoster"
        options={{ title: 'Members' }}
      >
        {(props: any) => (
          <Suspense fallback={<SuspenseFallback />}>
            <ClientRosterScreen {...props} />
          </Suspense>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="ClientDetail"
        options={{ title: 'Member' }}
      >
        {(props: any) => (
          <Suspense fallback={<SuspenseFallback />}>
            <ClientDetailScreen {...props} />
          </Suspense>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
