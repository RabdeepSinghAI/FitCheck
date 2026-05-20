import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatePresence, MotiView } from 'moti';

import type { UserRole } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motionDuration, usePrefersReducedMotion } from '../../lib/motion';
import { RoleBadge } from './RoleBadge';

const roleCards: Array<{ role: UserRole; title: string; desc: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { role: 'member', title: 'Member', desc: 'Can view workouts, track progress, and message their trainer', icon: 'person' },
  { role: 'trainer', title: 'Trainer', desc: 'Can manage clients, propose workouts, and track member progress', icon: 'barbell' },
  { role: 'admin', title: 'Admin', desc: 'Full platform access including user management and settings', icon: 'shield-checkmark' },
];

export function ChangeRoleModal({
  visible,
  onClose,
  name,
  currentRole,
  disabledReason,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  name: string;
  currentRole: UserRole;
  disabledReason?: string | null;
  onConfirm: (nextRole: UserRole) => void;
}) {
  const { colors } = useTheme();
  const reducedMotion = usePrefersReducedMotion();
  const [nextRole, setNextRole] = useState<UserRole>(currentRole);

  useEffect(() => {
    if (visible) setNextRole(currentRole);
  }, [currentRole, visible]);

  const changed = nextRole !== currentRole;

  const warning = useMemo(() => {
    if (!changed) return null;
    if (nextRole === 'trainer') {
      return 'This user will gain access to trainer tools and be listed in the trainers directory.';
    }
    if (nextRole === 'admin') {
      return '⚠️ This will grant full admin access to the platform. Only assign this role to trusted users.';
    }
    return 'This user will lose their current elevated access immediately.';
  }, [changed, nextRole]);

  const blocked = !!disabledReason;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
        <AnimatePresence>
          {visible ? (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'timing', duration: motionDuration(200, reducedMotion) }}
              style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
            >
              <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={onClose} />
            </MotiView>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {visible ? (
            <MotiView
              from={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{
                type: reducedMotion ? 'timing' : 'spring',
                duration: motionDuration(250, reducedMotion),
              }}
              style={{ borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 16 }}
            >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }}>Change Role — {name}</Text>
            <Pressable onPress={onClose} style={{ padding: 6 }} accessibilityLabel="Close change role modal">
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>

          <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
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
                <Text style={{ color: '#fff', fontWeight: '900' }}>{name.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={{ fontWeight: '900', color: colors.text }}>{name}</Text>
                <Text style={{ color: colors.textMuted, marginTop: 2 }}>Current role</Text>
              </View>
            </View>
            <RoleBadge role={currentRole} />
          </View>

          <View style={{ marginTop: 14, gap: 10 }}>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              {roleCards.map(r => {
                const selected = nextRole === r.role;
                return (
                  <Pressable
                    key={r.role}
                    onPress={() => setNextRole(r.role)}
                    style={({ pressed }) => ({
                      flexGrow: 1,
                      flexBasis: '30%',
                      minWidth: 110,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? '#eff6ff' : colors.card,
                      padding: 12,
                      opacity: pressed ? 0.9 : 1,
                    })}
                    accessibilityLabel={`Select role ${r.title}`}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Ionicons name={r.icon} size={18} color={selected ? colors.primary : colors.textMuted} />
                      {selected ? <Ionicons name="checkmark-circle" size={18} color={colors.primary} /> : null}
                    </View>
                    <Text style={{ fontWeight: '900', color: colors.text, marginTop: 8 }}>{r.title}</Text>
                    <Text style={{ color: colors.textMuted, marginTop: 4, fontSize: 12 }} numberOfLines={3}>
                      {r.desc}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {blocked ? (
              <MotiView
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: motionDuration(250, reducedMotion) }}
                style={{ borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#fecaca', backgroundColor: '#fef2f2' }}
              >
                <Text style={{ fontWeight: '900', color: '#b91c1c' }}>{disabledReason}</Text>
              </MotiView>
            ) : warning ? (
              <MotiView
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: motionDuration(250, reducedMotion) }}
                style={{ borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#fed7aa', backgroundColor: '#fff7ed' }}
              >
                <Text style={{ fontWeight: '900', color: '#9a3412' }}>{warning}</Text>
              </MotiView>
            ) : null}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <Pressable
                onPress={onClose}
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
                onPress={() => onConfirm(nextRole)}
                disabled={!changed || blocked}
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: !changed || blocked ? '#e2e8f0' : colors.primary,
                  alignItems: 'center',
                  opacity: pressed ? 0.9 : 1,
                })}
                accessibilityLabel="Confirm role change"
              >
                <Text style={{ fontWeight: '900', color: !changed || blocked ? colors.textMuted : '#fff' }}>Confirm Change</Text>
              </Pressable>
            </View>
          </View>
            </MotiView>
          ) : null}
        </AnimatePresence>
      </View>
    </Modal>
  );
}

