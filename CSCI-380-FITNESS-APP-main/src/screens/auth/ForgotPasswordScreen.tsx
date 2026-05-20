import { useState } from 'react';
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

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise<void>(r => setTimeout(r, 800));
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f9ff', padding: 20 }}>
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Ionicons name="mail" size={32} color="#fff" />
          </View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>Check your email</Text>
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 8 }}>
            We&apos;ve sent password reset instructions to
          </Text>
          <Text style={{ fontWeight: '700', marginTop: 8, color: colors.text }}>{email}</Text>
        </View>

        <View
          style={{
            marginTop: 24,
            padding: 16,
            borderRadius: 14,
            backgroundColor: '#eff6ff',
            borderWidth: 1,
            borderColor: '#bfdbfe',
          }}
        >
          <Text style={{ color: '#1e40af' }}>
            Open the link in the email to reset your password. The link expires in 1 hour.
          </Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate('Login')}
          style={{
            marginTop: 20,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: 'center',
            backgroundColor: colors.primary,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Back to login</Text>
        </Pressable>

        <Pressable onPress={() => setSent(false)} style={{ marginTop: 16 }}>
          <Text style={{ textAlign: 'center', color: colors.primary, fontWeight: '600' }}>Resend</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

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
              <Ionicons name="mail" size={32} color="#fff" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>
              Forgot your password?
            </Text>
            <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 8 }}>
              Enter your email and we&apos;ll send reset instructions
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
            <Text style={{ fontWeight: '600', marginBottom: 8, color: colors.text }}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                color: colors.text,
              }}
            />
            {error ? (
              <View
                style={{
                  marginBottom: 12,
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
              disabled={loading}
              style={{
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                backgroundColor: colors.primary,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '700' }}>Send reset link</Text>
              )}
            </Pressable>
          </View>

          <Pressable
            onPress={() => navigation.navigate('Login')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20 }}
          >
            <Ionicons name="arrow-back" size={18} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted }}>Back to login</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
