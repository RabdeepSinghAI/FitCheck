import { Text, View } from 'react-native';
import type { UserRole } from '../../context/AuthContext';

export function RoleBadge({ role }: { role: UserRole }) {
  const palette =
    role === 'admin'
      ? { bg: '#f3e8ff', fg: '#7c3aed', label: 'Admin' }
      : role === 'trainer'
        ? { bg: '#dcfce7', fg: '#166534', label: 'Trainer' }
        : { bg: '#dbeafe', fg: '#1d4ed8', label: 'Member' };

  return (
    <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: palette.bg }}>
      <Text style={{ fontWeight: '900', color: palette.fg, fontSize: 11 }}>{palette.label}</Text>
    </View>
  );
}

