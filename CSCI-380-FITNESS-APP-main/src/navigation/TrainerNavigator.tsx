import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Suspense, lazy } from 'react';

import { ClientsStack } from './ClientsStack';
import { SuspenseFallback } from '../components/SuspenseFallback';
import { useFeatureFlag } from '../context/FeatureFlagsContext';
const SessionSchedulerScreen = lazy(() =>
  import('../screens/trainer/SessionSchedulerScreen').then(m => ({ default: m.SessionSchedulerScreen })),
);
const TrainerHomeScreen = lazy(() =>
  import('../screens/trainer/TrainerHomeScreen').then(m => ({ default: m.TrainerHomeScreen })),
);
const TrainerMessagingScreen = lazy(() =>
  import('../screens/trainer/TrainerMessagingScreen').then(m => ({ default: m.TrainerMessagingScreen })),
);
const TrainerProfileScreen = lazy(() =>
  import('../screens/trainer/TrainerProfileScreen').then(m => ({ default: m.TrainerProfileScreen })),
);
const WorkoutBuilderScreen = lazy(() =>
  import('../screens/trainer/WorkoutBuilderScreen').then(m => ({ default: m.WorkoutBuilderScreen })),
);
import { RequireRole } from '../components/RequireRole';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export function TrainerNavigator() {
  const enableMessaging = useFeatureFlag('enable_member_messaging');
  return (
    <RequireRole allow={['trainer', 'admin']}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            borderTopColor: colors.border,
            backgroundColor: colors.card,
          },
        }}
      >
        <Tab.Screen
          name="TrainerHome"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
          }}
        >
          {(props: any) => (
            <Suspense fallback={<SuspenseFallback />}>
              <TrainerHomeScreen {...props} />
            </Suspense>
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Members"
          component={ClientsStack}
          options={{
            title: 'Members',
            headerShown: false,
            tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Workouts"
          options={{
            title: 'Workouts',
            tabBarIcon: ({ color, size }) => <Ionicons name="barbell" color={color} size={size} />,
          }}
        >
          {(props: any) => (
            <Suspense fallback={<SuspenseFallback />}>
              <WorkoutBuilderScreen {...props} />
            </Suspense>
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Schedule"
          options={{
            title: 'Schedule',
            tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} />,
          }}
        >
          {(props: any) => (
            <Suspense fallback={<SuspenseFallback />}>
              <SessionSchedulerScreen {...props} />
            </Suspense>
          )}
        </Tab.Screen>
        {enableMessaging ? (
          <Tab.Screen
            name="Messages"
            options={{
              title: 'Messages',
              tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" color={color} size={size} />,
              tabBarBadge: 3,
            }}
          >
            {(props: any) => (
              <Suspense fallback={<SuspenseFallback />}>
                <TrainerMessagingScreen {...props} />
              </Suspense>
            )}
          </Tab.Screen>
        ) : null}
        <Tab.Screen
          name="MyProfile"
          options={{
            title: 'My Profile',
            tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" color={color} size={size} />,
          }}
        >
          {(props: any) => (
            <Suspense fallback={<SuspenseFallback />}>
              <TrainerProfileScreen {...props} />
            </Suspense>
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </RequireRole>
  );
}
