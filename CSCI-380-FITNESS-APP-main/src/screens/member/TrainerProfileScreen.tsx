import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { MemberStackParamList } from '../../navigation/MemberNavigator';
import { useAdminDirectory } from '../../context/AdminDirectoryContext';
import { useMessaging } from '../../context/MessagingContext';
import { useFeatureFlag } from '../../context/FeatureFlagsContext';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<MemberStackParamList, 'TrainerProfile'>;

export function TrainerProfileScreen({ route, navigation }: Props) {
  const { trainerId, memberId } = route.params;
  const { colors } = useTheme();
  const { ensureThread } = useMessaging();
  const enableAvailability = useFeatureFlag('enable_trainer_availability');
  const { getTrainer } = useAdminDirectory();

  const trainer = getTrainer(trainerId);

  if (!trainer || !trainer.active) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ padding: 16 }}>
          <Pressable onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="arrow-back" size={20} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontWeight: '800' }}>Back</Text>
          </Pressable>
          <Text style={{ marginTop: 12, color: colors.textMuted }}>Trainer not available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="arrow-back" size={20} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, fontWeight: '800' }}>Back</Text>
        </Pressable>

        <View
          style={{
            marginTop: 12,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 16,
          }}
        >
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
                {trainer.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text }}>{trainer.name}</Text>
              <Text style={{ color: colors.textMuted, marginTop: 2 }}>{trainer.bio}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
            <StatPill icon="briefcase" label="Experience" value={`${trainer.yearsExperience} yrs`} colors={colors} />
            <StatPill icon="people" label="Clients coached" value={String(trainer.totalClientsCoached)} colors={colors} />
            <StatPill icon="checkmark-done" label="Sessions completed" value={String(trainer.sessionsCompleted)} colors={colors} />
          </View>

          <Pressable
            onPress={() => {
              ensureThread({ trainerId, memberId });
              navigation.navigate('MemberHome', { initialTab: 'messages', trainerId });
            }}
            style={({ pressed }) => ({
              marginTop: 14,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: colors.primary,
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: '#fff', fontWeight: '900' }}>Message</Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 14, gap: 12 }}>
          <View style={card(colors)}>
            <Text style={title(colors)}>Specializations</Text>
            <Text style={{ color: colors.textMuted, marginTop: 6 }}>{trainer.specializations.join(' • ') || '—'}</Text>
          </View>

          <View style={card(colors)}>
            <Text style={title(colors)}>Certifications</Text>
            <Text style={{ color: colors.textMuted, marginTop: 6 }}>{trainer.certifications.join(' • ') || '—'}</Text>
          </View>

          {enableAvailability ? (
            <View style={card(colors)}>
              <Text style={title(colors)}>Availability</Text>
              <Text style={{ color: colors.textMuted, marginTop: 6 }}>{trainer.availabilityNotes || '—'}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatPill({
  icon,
  label,
  value,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
      }}
    >
      <Ionicons name={icon} size={16} color={colors.textMuted} />
      <Text style={{ color: colors.textMuted, fontWeight: '800' }}>{label}:</Text>
      <Text style={{ color: colors.text, fontWeight: '900' }}>{value}</Text>
    </View>
  );
}

function card(colors: any) {
  return {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 14,
  } as const;
}

function title(colors: any) {
  return { fontWeight: '900' as const, color: colors.text };
}

