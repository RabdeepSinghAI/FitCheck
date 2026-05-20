import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

export function UnauthorizedScreen() {
  const { logout } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
        <View
          style={{
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 18,
            alignItems: 'center',
            gap: 10,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#fee2e2',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="warning" size={26} color={colors.danger} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text }}>Unauthorized</Text>
          <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
            Your account does not have access to this area.
          </Text>
          <Pressable
            onPress={logout}
            style={{
              marginTop: 6,
              borderRadius: 14,
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: colors.primary,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '800' }}>Sign out</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

