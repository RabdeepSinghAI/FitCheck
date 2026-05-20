import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context/AuthContext';
import { AdminDirectoryProvider } from './src/context/AdminDirectoryContext';
import { ChallengesProvider } from './src/context/ChallengesContext';
import { FeatureFlagsProvider } from './src/context/FeatureFlagsContext';
import { MessagingProvider } from './src/context/MessagingContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { ToastProvider } from './src/context/ToastContext';
import { WorkoutProposalsProvider } from './src/context/WorkoutProposalsContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/navigationRef';

function AppShell() {
  const { mode } = useTheme();
  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ToastProvider>
            <FeatureFlagsProvider>
              <AdminDirectoryProvider>
              <ChallengesProvider>
              <AuthProvider>
                <WorkoutProposalsProvider>
                  <MessagingProvider>
                    <AppShell />
                  </MessagingProvider>
                </WorkoutProposalsProvider>
              </AuthProvider>
              </ChallengesProvider>
              </AdminDirectoryProvider>
            </FeatureFlagsProvider>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
