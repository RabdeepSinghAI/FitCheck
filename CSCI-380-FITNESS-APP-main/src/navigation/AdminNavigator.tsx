import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Suspense, lazy } from 'react';

import { SuspenseFallback } from '../components/SuspenseFallback';
const AdminHomeScreen = lazy(() => import('../screens/admin/AdminHomeScreen').then(m => ({ default: m.AdminHomeScreen })));
const AnalyticsScreen = lazy(() => import('../screens/admin/AnalyticsScreen').then(m => ({ default: m.AnalyticsScreen })));
const SystemSettingsScreen = lazy(() =>
  import('../screens/admin/SystemSettingsScreen').then(m => ({ default: m.SystemSettingsScreen })),
);
const TrainerManagementScreen = lazy(() =>
  import('../screens/admin/TrainerManagementScreen').then(m => ({ default: m.TrainerManagementScreen })),
);
const UserManagementScreen = lazy(() =>
  import('../screens/admin/UserManagementScreen').then(m => ({ default: m.UserManagementScreen })),
);
import { RequireRole } from '../components/RequireRole';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export function AdminNavigator() {
  return (
    <RequireRole allow={['admin']}>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          tabBarActiveTintColor: colors.accentPurple,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            borderTopColor: colors.border,
            backgroundColor: colors.card,
          },
        }}
      >
        <Tab.Screen
          name="AdminHome"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => <Ionicons name="grid" color={color} size={size} />,
          }}
        >
          {(props: any) => (
            <Suspense fallback={<SuspenseFallback />}>
              <AdminHomeScreen {...props} />
            </Suspense>
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Users"
          options={{
            title: 'Users',
            tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />,
          }}
        >
          {(props: any) => (
            <Suspense fallback={<SuspenseFallback />}>
              <UserManagementScreen {...props} />
            </Suspense>
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Trainers"
          options={{
            title: 'Trainers',
            tabBarIcon: ({ color, size }) => <Ionicons name="barbell" color={color} size={size} />,
          }}
        >
          {(props: any) => (
            <Suspense fallback={<SuspenseFallback />}>
              <TrainerManagementScreen {...props} />
            </Suspense>
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Analytics"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" color={color} size={size} />,
          }}
        >
          {(props: any) => (
            <Suspense fallback={<SuspenseFallback />}>
              <AnalyticsScreen {...props} />
            </Suspense>
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} />,
          }}
        >
          {(props: any) => (
            <Suspense fallback={<SuspenseFallback />}>
              <SystemSettingsScreen {...props} />
            </Suspense>
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </RequireRole>
  );
}
