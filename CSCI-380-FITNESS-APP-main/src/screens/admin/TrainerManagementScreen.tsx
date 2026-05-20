import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader } from '../../components/ScreenHeader';
import { useAdminDirectory } from '../../context/AdminDirectoryContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { colors } from '../../theme/colors';
import { ChangeRoleModal } from '../../components/admin/ChangeRoleModal';
import { RoleBadge } from '../../components/admin/RoleBadge';

export function TrainerManagementScreen() {
  const { trainers, setPersonActive, deletePerson, changeRole } = useAdminDirectory();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<(typeof trainers)[number] | null>(null);
  const [menuFor, setMenuFor] = useState<(typeof trainers)[number] | null>(null);
  const [confirmDeactivateFor, setConfirmDeactivateFor] = useState<(typeof trainers)[number] | null>(null);
  const [confirmDeleteFor, setConfirmDeleteFor] = useState<(typeof trainers)[number] | null>(null);
  const [deleteText, setDeleteText] = useState('');
  const [roleFor, setRoleFor] = useState<(typeof trainers)[number] | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return trainers.filter(t => !query || t.name.toLowerCase().includes(query));
  }, [q, trainers]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <ScreenHeader title="Trainers" subtitle="Accounts, approvals, and status" />
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
            marginTop: 12,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 12,
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
        </View>

        {filtered.map(t => (
          <View
            key={t.id}
            style={{
              marginTop: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              padding: 14,
              opacity: t.active ? 1 : 0.55,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <Pressable
                onPress={() => setSelected(t)}
                style={({ pressed }) => ({
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <View
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 27,
                    backgroundColor: colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '900' }}>{t.name.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={{ fontWeight: '900', color: colors.text, textAlign: 'center' }}>{t.name}</Text>
                <RoleBadge role="trainer" />
                {!t.active ? (
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#fee2e2' }}>
                    <Text style={{ fontWeight: '900', color: colors.danger, fontSize: 11 }}>Inactive</Text>
                  </View>
                ) : null}
              </Pressable>

              <Pressable
                onPress={() => setMenuFor(t)}
                style={({ pressed }) => ({ padding: 10, borderRadius: 12, opacity: pressed ? 0.85 : 1 })}
                accessibilityLabel={`Open actions for ${t.name}`}
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

                <Pressable
                  onPress={() => {
                    if (menuFor.id === user?.id) {
                      showToast('You cannot change your own role.');
                      setMenuFor(null);
                      return;
                    }
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

                <Pressable
                  onPress={() => {
                    setConfirmDeactivateFor(menuFor);
                    setMenuFor(null);
                  }}
                  style={({ pressed }) => ({
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: '#fed7aa',
                    backgroundColor: '#fff7ed',
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ fontWeight: '900', color: '#9a3412' }}>{menuFor.active ? 'Deactivate Account' : 'Reactivate Account'}</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setConfirmDeleteFor(menuFor);
                    setDeleteText('');
                    setMenuFor(null);
                  }}
                  style={({ pressed }) => ({
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: '#fecaca',
                    backgroundColor: '#fef2f2',
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ fontWeight: '900', color: colors.danger }}>Delete Account</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={() => setSelected(null)} />
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>Trainer</Text>
              <Pressable onPress={() => setSelected(null)} style={{ padding: 6 }}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>
            {selected ? (
              <View style={{ marginTop: 12, gap: 10 }}>
                <Text style={{ fontWeight: '900', color: colors.text }}>{selected.name}</Text>
                <Text style={{ color: colors.textMuted }}>{selected.email ?? '—'}</Text>
                <View style={{ alignSelf: 'flex-start' }}>
                  <RoleBadge role="trainer" />
                </View>
                <Text style={{ color: colors.textMuted }}>Specializations: {selected.specializations?.join(', ') || '—'}</Text>
                <Text style={{ color: colors.textMuted }}>Certifications: {selected.certifications?.join(', ') || '—'}</Text>
                <Text style={{ color: colors.textMuted }}>Sessions completed: {selected.sessionsCompleted ?? 0}</Text>
                <Text style={{ color: colors.textMuted }}>Total clients coached: {selected.totalClientsCoached ?? 0}</Text>
                <Text style={{ color: colors.textMuted }}>Contact: {selected.email ?? '—'}</Text>
                <Text style={{ color: colors.textMuted }}>
                  Account status:{' '}
                  <Text style={{ fontWeight: '900', color: selected.active ? '#16a34a' : colors.danger }}>
                    {selected.active ? 'Active' : 'Inactive'}
                  </Text>
                </Text>

                {selected.id === user?.id ? null : (
                  <Pressable
                    onPress={() => setRoleFor(selected)}
                    style={({ pressed }) => ({
                      marginTop: 6,
                      paddingVertical: 12,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: '#f3e8ff',
                      alignItems: 'center',
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text style={{ fontWeight: '900', color: colors.accentPurple }}>Change Role</Text>
                  </Pressable>
                )}
              </View>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={!!confirmDeactivateFor} transparent animationType="fade" onRequestClose={() => setConfirmDeactivateFor(null)}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
          <Pressable style={{ ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay }} onPress={() => setConfirmDeactivateFor(null)} />
          <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}>
            {confirmDeactivateFor ? (
              <>
                <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }}>
                  {confirmDeactivateFor.active ? 'Deactivate account' : 'Reactivate account'}
                </Text>
                <Text style={{ color: colors.textMuted, marginTop: 8 }}>
                  Are you sure you want to {confirmDeactivateFor.active ? 'deactivate' : 'reactivate'} {confirmDeactivateFor.name}
                  {confirmDeactivateFor.active ? '? They will lose access to the platform.' : '? They will regain access to the platform.'}
                </Text>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                  <Pressable
                    onPress={() => setConfirmDeactivateFor(null)}
                    style={({ pressed }) => ({
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      alignItems: 'center',
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text style={{ fontWeight: '900', color: colors.text }}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      const next = !confirmDeactivateFor.active;
                      setPersonActive({ personId: confirmDeactivateFor.id, active: next });
                      showToast(next ? 'Trainer reactivated' : 'Trainer deactivated');
                      setConfirmDeactivateFor(null);
                    }}
                    style={({ pressed }) => ({
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: confirmDeactivateFor.active ? '#f97316' : '#16a34a',
                      alignItems: 'center',
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text style={{ fontWeight: '900', color: '#fff' }}>
                      {confirmDeactivateFor.active ? 'Deactivate' : 'Reactivate'}
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={!!confirmDeleteFor} transparent animationType="fade" onRequestClose={() => setConfirmDeleteFor(null)}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
          <Pressable style={{ ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay }} onPress={() => setConfirmDeleteFor(null)} />
          <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#fecaca', backgroundColor: '#fff1f2', padding: 16 }}>
            {confirmDeleteFor ? (
              <>
                <Text style={{ fontSize: 16, fontWeight: '900', color: colors.danger }}>Delete account</Text>
                <Text style={{ color: '#7f1d1d', marginTop: 8, fontWeight: '800' }}>
                  This action is permanent. Deleting {confirmDeleteFor.name} will remove all their data, sessions, and client assignments.
                  This cannot be undone.
                </Text>
                <Text style={{ color: '#7f1d1d', marginTop: 10 }}>
                  Type <Text style={{ fontWeight: '900' }}>{confirmDeleteFor.name}</Text> or <Text style={{ fontWeight: '900' }}>DELETE</Text> to confirm.
                </Text>
                <TextInput
                  value={deleteText}
                  onChangeText={setDeleteText}
                  placeholder="Type to confirm..."
                  placeholderTextColor="#9f1239"
                  autoCapitalize="characters"
                  style={{
                    marginTop: 12,
                    borderWidth: 1,
                    borderColor: '#fecaca',
                    borderRadius: 12,
                    padding: 12,
                    backgroundColor: '#fff',
                    color: '#7f1d1d',
                    fontWeight: '900',
                  }}
                />
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                  <Pressable
                    onPress={() => setConfirmDeleteFor(null)}
                    style={({ pressed }) => ({
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#fecaca',
                      alignItems: 'center',
                      opacity: pressed ? 0.85 : 1,
                      backgroundColor: '#fff',
                    })}
                  >
                    <Text style={{ fontWeight: '900', color: '#7f1d1d' }}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      const typed = deleteText.trim();
                      const ok = typed.toUpperCase() === 'DELETE' || typed.toLowerCase() === confirmDeleteFor.name.toLowerCase();
                      if (!ok) return;
                      deletePerson(confirmDeleteFor.id);
                      showToast('Trainer deleted');
                      setConfirmDeleteFor(null);
                    }}
                    style={({ pressed }) => ({
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: '#dc2626',
                      alignItems: 'center',
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text style={{ fontWeight: '900', color: '#fff' }}>Delete</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={addOpen} transparent animationType="slide" onRequestClose={() => setAddOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={() => setAddOpen(false)} />
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>Add new trainer</Text>
              <Pressable onPress={() => setAddOpen(false)} style={{ padding: 6 }}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>

            <View style={{ marginTop: 12, gap: 10 }}>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="Full name"
                placeholderTextColor={colors.textMuted}
                style={input}
              />
              <TextInput
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="email@example.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                style={input}
              />

              <Pressable
                onPress={() => {
                  const name = newName.trim();
                  const email = newEmail.trim();
                  if (!name || !email) return;
                  setNewName('');
                  setNewEmail('');
                  setAddOpen(false);
                  showToast('Trainer created (demo)');
                }}
                style={({ pressed }) => ({
                  marginTop: 6,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: colors.accentPurple,
                  alignItems: 'center',
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text style={{ color: '#fff', fontWeight: '900' }}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ChangeRoleModal
        visible={!!roleFor}
        onClose={() => setRoleFor(null)}
        name={roleFor?.name ?? 'User'}
        currentRole="trainer"
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
          showToast(`${roleFor.name}'s role has been updated to ${roleLabel(nextRole)}`);
          setRoleFor(null);
          setSelected(null);
          setMenuFor(null);
        }}
      />
    </SafeAreaView>
  );
}

function roleLabel(r: 'member' | 'trainer' | 'admin') {
  return r === 'member' ? 'Member' : r === 'trainer' ? 'Trainer' : 'Admin';
}

const input = {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 12,
  padding: 12,
  backgroundColor: colors.background,
  color: colors.text,
} as const;
