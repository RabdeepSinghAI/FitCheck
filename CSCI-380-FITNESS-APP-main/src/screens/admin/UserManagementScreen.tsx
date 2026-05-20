import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ChangeRoleModal } from '../../components/admin/ChangeRoleModal';
import { RoleBadge } from '../../components/admin/RoleBadge';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useAdminDirectory, type AdminPersonBase } from '../../context/AdminDirectoryContext';
import { useAuth, type UserRole } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { colors } from '../../theme/colors';

const LOCAL_ACCOUNTS_KEY = 'auth:localAccounts:v1';

type StoredLocalAccount = {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  active: boolean;
  createdAt: string;
};

export function UserManagementScreen() {
  const { people, addPerson, changeRole, deletePerson, setPersonActive } = useAdminDirectory();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [selected, setSelected] = useState<AdminPersonBase | null>(null);
  const [menuFor, setMenuFor] = useState<AdminPersonBase | null>(null);
  const [roleFor, setRoleFor] = useState<AdminPersonBase | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('member');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const filtered = useMemo(() => {
    return people.filter(u => {
      const query = q.trim().toLowerCase();
      const qOk = !query || u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
      const rOk = roleFilter === 'all' || u.role === roleFilter;
      return qOk && rOk;
    });
  }, [people, q, roleFilter]);

  const createLocalAccount = async (acct: StoredLocalAccount) => {
    const raw = await AsyncStorage.getItem(LOCAL_ACCOUNTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as any) : null;
    const list: StoredLocalAccount[] = Array.isArray(parsed) ? (parsed as any[]) : [];
    const email = acct.email.trim().toLowerCase();
    if (list.some(a => String((a as any).email ?? '').trim().toLowerCase() === email)) {
      throw new Error('A local account with this email already exists.');
    }
    const next = [acct, ...list];
    await AsyncStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(next));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <ScreenHeader title="Users" subtitle="Manage members, trainers, and admins (demo)" />
          </View>
          <Pressable
            onPress={() => setAddOpen(true)}
            style={{
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              backgroundColor: colors.accentPurple,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '900' }}>Add New</Text>
          </Pressable>
        </View>

        <View
          style={{
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 12,
            gap: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search by name..."
              placeholderTextColor={colors.textMuted}
              style={{ flex: 1, paddingVertical: 8, color: colors.text }}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['all', 'member', 'trainer', 'admin'] as const).map(r => (
                <Pressable
                  key={r}
                  onPress={() => setRoleFilter(r)}
                  style={({ pressed }) => ({
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: roleFilter === r ? colors.primary : '#f1f5f9',
                    opacity: pressed ? 0.9 : 1,
                  })}
                >
                  <Text style={{ fontWeight: '900', color: roleFilter === r ? '#fff' : colors.text }}>
                    {r === 'all' ? 'All roles' : r}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <Text style={{ color: colors.textMuted }}>
            Showing {filtered.length} of {people.length} users
          </Text>
        </View>

        {filtered.map(u => (
          <View
            key={u.id}
            style={{
              marginTop: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              padding: 14,
            }}
          >
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '900' }}>{u.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '900', color: colors.text }}>{u.name}</Text>
                <Text style={{ color: colors.textMuted, marginTop: 2 }} numberOfLines={1}>
                  {u.email}
                </Text>
              </View>
              <RoleBadge role={u.role} />
              <Pressable
                onPress={() => setMenuFor(u)}
                style={({ pressed }) => ({ padding: 10, borderRadius: 12, opacity: pressed ? 0.85 : 1 })}
                accessibilityLabel={`Open actions for ${u.name}`}
              >
                <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={!!menuFor} transparent animationType="fade" onRequestClose={() => setMenuFor(null)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={() => setMenuFor(null)} />
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }}>Actions</Text>
              <Pressable onPress={() => setMenuFor(null)} style={{ padding: 6 }}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>
            {menuFor ? (
              <View style={{ marginTop: 10, gap: 10 }}>
                <Pressable
                  onPress={() => {
                    setSelected(menuFor);
                    setMenuFor(null);
                  }}
                  style={({ pressed }) => ({
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ fontWeight: '900', color: colors.text }}>View Profile</Text>
                </Pressable>

                {menuFor.id === user?.id ? (
                  <View style={{ paddingVertical: 12, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: '#f8fafc' }}>
                    <Text style={{ fontWeight: '900', color: colors.textMuted }}>Change Role</Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => {
                      setRoleFor(menuFor);
                      setMenuFor(null);
                    }}
                    style={({ pressed }) => ({
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text style={{ fontWeight: '900', color: colors.text }}>Change Role</Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={() => {
                    setPersonActive({ personId: menuFor.id, active: !menuFor.active });
                    showToast(menuFor.active ? 'User deactivated' : 'User activated');
                    setMenuFor(null);
                  }}
                  style={({ pressed }) => ({
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: menuFor.active ? '#fef9c3' : '#dcfce7',
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ fontWeight: '900', color: menuFor.active ? '#854d0e' : '#166534' }}>
                    {menuFor.active ? 'Deactivate' : 'Activate'}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={() => setSelected(null)} />
          <View
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              padding: 16,
              maxHeight: '85%',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>User Details</Text>
              <Pressable onPress={() => setSelected(null)} style={{ padding: 6 }}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>
            {selected ? (
              <ScrollView style={{ marginTop: 12 }}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>
                      {selected.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>{selected.name}</Text>
                    <Text style={{ color: colors.textMuted }}>{selected.email}</Text>
                  </View>
                </View>
                <View style={{ marginTop: 10, alignSelf: 'flex-start' }}>
                  <RoleBadge role={selected.role} />
                </View>
                <Text style={{ marginTop: 8, color: colors.textMuted }}>Role: {selected.role}</Text>
                <Text style={{ marginTop: 8, color: colors.textMuted }}>Status: {selected.active ? 'Active' : 'Inactive'}</Text>

                <Pressable
                  style={{
                    marginTop: 16,
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: '#f3e8ff',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: colors.accentPurple, fontWeight: '900' }}>Edit Profile</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setPersonActive({ personId: selected.id, active: !selected.active });
                    showToast(selected.active ? 'User deactivated' : 'User activated');
                    setSelected(null);
                  }}
                  style={({ pressed }) => ({
                    marginTop: 10,
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: selected.active ? '#fef9c3' : '#dcfce7',
                    alignItems: 'center',
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ color: selected.active ? '#854d0e' : '#166534', fontWeight: '900' }}>
                    {selected.active ? 'Deactivate' : 'Activate'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    deletePerson(selected.id);
                    setSelected(null);
                  }}
                  style={{ marginTop: 10, padding: 14, borderRadius: 14, backgroundColor: '#fee2e2', alignItems: 'center' }}
                >
                  <Text style={{ color: colors.danger, fontWeight: '900' }}>Delete Account</Text>
                </Pressable>

                {selected.id === user?.id ? null : (
                  <Pressable
                    onPress={() => setRoleFor(selected)}
                    style={({ pressed }) => ({
                      marginTop: 10,
                      padding: 14,
                      borderRadius: 14,
                      backgroundColor: '#f3e8ff',
                      alignItems: 'center',
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text style={{ color: colors.accentPurple, fontWeight: '900' }}>Change Role</Text>
                  </Pressable>
                )}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={addOpen} transparent animationType="slide" onRequestClose={() => setAddOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={() => setAddOpen(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, maxHeight: '90%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>Add new user</Text>
                <Pressable onPress={() => setAddOpen(false)} style={{ padding: 6 }}>
                  <Ionicons name="close" size={22} color={colors.text} />
                </Pressable>
              </View>

              <ScrollView style={{ marginTop: 12 }} keyboardShouldPersistTaps="handled">
                <Text style={{ fontSize: 12, fontWeight: '900', color: colors.text }}>Name</Text>
                <TextInput value={newName} onChangeText={setNewName} placeholder="Full name" placeholderTextColor={colors.textMuted} style={input} />

                <Text style={{ fontSize: 12, fontWeight: '900', color: colors.text, marginTop: 12 }}>Email</Text>
                <TextInput
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={input}
                />

                <Text style={{ fontSize: 12, fontWeight: '900', color: colors.text, marginTop: 12 }}>Role</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  {(['member', 'trainer'] as const).map(r => (
                    <Pressable
                      key={r}
                      onPress={() => setNewRole(r)}
                      style={({ pressed }) => ({
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 999,
                        backgroundColor: newRole === r ? colors.primary : '#f1f5f9',
                        opacity: pressed ? 0.9 : 1,
                      })}
                    >
                      <Text style={{ fontWeight: '900', color: newRole === r ? '#fff' : colors.text }}>{r}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={{ fontSize: 12, fontWeight: '900', color: colors.text, marginTop: 12 }}>Password</Text>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPassword}
                    style={[input, { paddingRight: 48 }]}
                  />
                  <Pressable onPress={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 12, top: 14 }}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                  </Pressable>
                </View>

                <Pressable
                  onPress={async () => {
                    try {
                      const name = newName.trim();
                      const email = newEmail.trim().toLowerCase();
                      const password = newPassword;
                      if (!name) throw new Error('Name is required');
                      if (!email.includes('@')) throw new Error('Enter a valid email');
                      if (password.length < 4) throw new Error('Password must be at least 4 characters');

                      const id = `local-${Math.random().toString(16).slice(2)}-${Date.now()}`;
                      await createLocalAccount({
                        id,
                        email,
                        password,
                        role: newRole,
                        name,
                        active: true,
                        createdAt: new Date().toISOString(),
                      });
                      const res = addPerson({ id, name, email, role: newRole });
                      if (!res.ok) throw new Error(res.reason);

                      setNewName('');
                      setNewEmail('');
                      setNewPassword('');
                      setNewRole('member');
                      setAddOpen(false);
                      showToast('User created');
                    } catch (e) {
                      showToast(e instanceof Error ? e.message : 'Failed to create user');
                    }
                  }}
                  style={({ pressed }) => ({
                    marginTop: 16,
                    paddingVertical: 12,
                    borderRadius: 14,
                    backgroundColor: colors.accentPurple,
                    alignItems: 'center',
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ color: '#fff', fontWeight: '900' }}>Create</Text>
                </Pressable>
                <View style={{ height: 10 }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <ChangeRoleModal
        visible={!!roleFor}
        onClose={() => setRoleFor(null)}
        name={roleFor?.name ?? 'User'}
        currentRole={(roleFor?.role ?? 'member') as any}
        disabledReason={roleFor?.id === user?.id ? 'You cannot change your own role.' : null}
        onConfirm={nextRole => {
          if (!roleFor) return;
          if (roleFor.id === user?.id) {
            showToast('You cannot change your own role.');
            return;
          }
          const res = changeRole({ personId: roleFor.id, nextRole });
          if (!res.ok) {
            showToast(res.reason);
            return;
          }
          showToast(`${roleFor.name}'s role has been updated to ${nextRole === 'member' ? 'Member' : nextRole === 'trainer' ? 'Trainer' : 'Admin'}`);
          setRoleFor(null);
          setSelected(null);
          setMenuFor(null);
        }}
      />
    </SafeAreaView>
  );
}

const input = {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 12,
  padding: 12,
  backgroundColor: colors.background,
  color: colors.text,
} as const;
