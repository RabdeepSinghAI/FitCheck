import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

type Props = {
  title: string;
  subtitle?: string;
  showLogout?: boolean;
};

export function ScreenHeader({ title, subtitle, showLogout = true }: Props) {
  const { logout, user } = useAuth();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}
    >
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>{title}</Text>
        {subtitle ? (
          <Text style={{ color: colors.textMuted, marginTop: 4 }} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {user ? (
          <Text style={{ color: colors.textMuted, marginTop: 4, fontSize: 12 }}>{user.email}</Text>
        ) : null}
      </View>
      {showLogout ? (
        <Pressable
          onPress={logout}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10,
            backgroundColor: '#fef2f2',
            borderWidth: 1,
            borderColor: '#fecaca',
          }}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={{ color: colors.danger, fontWeight: '700' }}>Logout</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
