import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Suspense, lazy } from 'react';

import { SuspenseFallback } from '../components/SuspenseFallback';
const ForgotPasswordScreen = lazy(() =>
  import('../screens/auth/ForgotPasswordScreen').then(m => ({ default: m.ForgotPasswordScreen })),
);
const LoginScreen = lazy(() => import('../screens/auth/LoginScreen').then(m => ({ default: m.LoginScreen })));
const ResetPasswordScreen = lazy(() =>
  import('../screens/auth/ResetPasswordScreen').then(m => ({ default: m.ResetPasswordScreen })),
);
const SignUpScreen = lazy(() => import('../screens/auth/SignUpScreen').then(m => ({ default: m.SignUpScreen })));

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Login"
      >
        {(props: any) => (
          <Suspense fallback={<SuspenseFallback />}>
            <LoginScreen {...props} />
          </Suspense>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="SignUp"
      >
        {(props: any) => (
          <Suspense fallback={<SuspenseFallback />}>
            <SignUpScreen {...props} />
          </Suspense>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="ForgotPassword"
      >
        {(props: any) => (
          <Suspense fallback={<SuspenseFallback />}>
            <ForgotPasswordScreen {...props} />
          </Suspense>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="ResetPassword"
      >
        {(props: any) => (
          <Suspense fallback={<SuspenseFallback />}>
            <ResetPasswordScreen {...props} />
          </Suspense>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
