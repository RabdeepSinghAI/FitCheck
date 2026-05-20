import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ navigation }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reqs = useMemo(
    () => [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'Contains a number', met: /\d/.test(password) },
      { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    ],
    [password],
  );

  const valid = reqs.every(r => r.met) && password === confirm && confirm.length > 0;

  const submit = async () => {
    if (!valid) return;
    setLoading(true);
    setError(null);
    try {
      await new Promise<void>(r => setTimeout(r, 800));
      navigation.navigate('Login');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f9ff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Ionicons name="lock-closed" size={32} color="#fff" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>
              Reset your password
            </Text>
            <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 8 }}>
              Choose a strong password for your account
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: '#bfdbfe',
            }}
          >
            <Text style={{ fontWeight: '600', marginBottom: 8, color: colors.text }}>New password</Text>
            <View style={{ marginBottom: 12 }}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!show1}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 14,
                  paddingRight: 44,
                  color: colors.text,
                }}
              />
              <Pressable onPress={() => setShow1(s => !s)} style={{ position: 'absolute', right: 12, top: 14 }}>
                <Ionicons name={show1 ? 'eye-off' : 'eye'} size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            {reqs.map((r, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Ionicons
                  name={r.met ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={r.met ? '#16a34a' : colors.textMuted}
                />
                <Text style={{ color: r.met ? '#166534' : colors.textMuted }}>{r.label}</Text>
              </View>
            ))}

            <Text style={{ fontWeight: '600', marginTop: 12, marginBottom: 8, color: colors.text }}>
              Confirm password
            </Text>
            <View style={{ marginBottom: 8 }}>
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!show2}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 14,
                  paddingRight: 44,
                  color: colors.text,
                }}
              />
              <Pressable onPress={() => setShow2(s => !s)} style={{ position: 'absolute', right: 12, top: 14 }}>
                <Ionicons name={show2 ? 'eye-off' : 'eye'} size={22} color={colors.textMuted} />
              </Pressable>
            </View>
            {confirm.length > 0 && password !== confirm ? (
              <Text style={{ color: colors.danger, marginBottom: 8 }}>Passwords do not match</Text>
            ) : null}
            {error ? (
              <View
                style={{
                  marginTop: 8,
                  marginBottom: 8,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: '#fef2f2',
                  borderWidth: 1,
                  borderColor: '#fecaca',
                }}
              >
                <Text style={{ color: colors.danger }}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={submit}
              disabled={loading || !valid}
              style={{
                marginTop: 8,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                backgroundColor: colors.primary,
                opacity: loading || !valid ? 0.5 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '700' }}>Reset password</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
