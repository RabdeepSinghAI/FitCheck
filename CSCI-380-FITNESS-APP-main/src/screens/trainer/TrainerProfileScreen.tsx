import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { getTrainerById } from '../../lib/mockDirectory';
import { colors } from '../../theme/colors';

type EditableTrainerProfile = {
  name: string;
  email: string;
  avatarUri: string | null;
  bio: string;
  specializations: string; // comma-separated
  certifications: string; // comma-separated
  availabilityNotes: string;
  contactPhone: string;
  contactWebsite: string;
};

export function TrainerProfileScreen() {
  const { user } = useAuth();
  const trainerId = useMemo(() => {
    if (!user?.id) return 'trainer-1';
    if (user.id === 'dev-trainer') return 'trainer-1';
    return user.id;
  }, [user?.id]);

  const base = useMemo(() => getTrainerById(trainerId), [trainerId]);
  const storageKey = `trainer:profile:${trainerId}`;

  const [profile, setProfile] = useState<EditableTrainerProfile>(() => ({
    name: base?.name ?? user?.name ?? 'Trainer',
    email: base?.email ?? user?.email ?? '',
    avatarUri: base?.avatarUri ?? null,
    bio: base?.bio ?? '',
    specializations: (base?.specializations ?? []).join(', '),
    certifications: (base?.certifications ?? []).join(', '),
    availabilityNotes: base?.availabilityNotes ?? '',
    contactPhone: base?.contactPhone ?? '',
    contactWebsite: base?.contactWebsite ?? '',
  }));

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        const parsed = raw ? (JSON.parse(raw) as Partial<EditableTrainerProfile>) : null;
        if (!mounted || !parsed) return;
        setProfile(prev => ({ ...prev, ...parsed }));
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [storageKey]);

  useEffect(() => {
    AsyncStorage.setItem(storageKey, JSON.stringify(profile)).catch(() => {});
  }, [profile, storageKey]);

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (res.canceled) return;
    const uri = res.assets?.[0]?.uri;
    if (uri) setProfile(p => ({ ...p, avatarUri: uri }));
  };

  const stats = [
    { label: 'Total clients', value: '24', icon: 'people' as const, tint: '#2563eb' },
    { label: 'Sessions completed', value: '187', icon: 'checkmark-done' as const, tint: '#059669' },
    { label: 'Avg rating', value: '4.8', icon: 'star' as const, tint: '#ca8a04' },
  ];

  const inputStyle = {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.card,
    color: colors.text,
  } as const;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text }}>My Profile</Text>
        <Text style={{ color: colors.textMuted, marginTop: 4 }}>Update your public trainer profile (demo).</Text>

        <View
          style={{
            marginTop: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 14,
            flexDirection: 'row',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <Pressable onPress={pickAvatar} style={{ borderRadius: 32, overflow: 'hidden' }}>
            {profile.avatarUri ? (
              <Image source={{ uri: profile.avatarUri }} style={{ width: 64, height: 64 }} />
            ) : (
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
                  {profile.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '900', fontSize: 16, color: colors.text }}>{profile.name}</Text>
            <Text style={{ color: colors.textMuted }}>{profile.email}</Text>
            <Pressable
              onPress={pickAvatar}
              style={({ pressed }) => ({
                alignSelf: 'flex-start',
                marginTop: 10,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: '#eff6ff',
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text style={{ color: colors.primary, fontWeight: '900' }}>Change photo</Text>
            </Pressable>
          </View>
        </View>

        <Text style={{ fontWeight: '900', marginTop: 16, marginBottom: 10, color: colors.text }}>Stats</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {stats.map(s => (
            <View
              key={s.label}
              style={{
                flexGrow: 1,
                flexBasis: '30%',
                minWidth: 110,
                borderRadius: 14,
                padding: 14,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: s.tint + '22',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <Ionicons name={s.icon} size={22} color={s.tint} />
              </View>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>{s.label}</Text>
              <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text, marginTop: 4 }}>{s.value}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontWeight: '900', marginTop: 16, marginBottom: 10, color: colors.text }}>Profile details</Text>

        <View style={card}>
          <Text style={label}>Name</Text>
          <TextInput value={profile.name} onChangeText={t => setProfile(p => ({ ...p, name: t }))} style={inputStyle} />

          <Text style={[label, { marginTop: 12 }]}>Bio</Text>
          <TextInput
            value={profile.bio}
            onChangeText={t => setProfile(p => ({ ...p, bio: t }))}
            multiline
            style={[inputStyle, { minHeight: 90, textAlignVertical: 'top' }]}
          />

          <Text style={[label, { marginTop: 12 }]}>Specializations (comma-separated)</Text>
          <TextInput
            value={profile.specializations}
            onChangeText={t => setProfile(p => ({ ...p, specializations: t }))}
            style={inputStyle}
          />

          <Text style={[label, { marginTop: 12 }]}>Certifications (comma-separated)</Text>
          <TextInput
            value={profile.certifications}
            onChangeText={t => setProfile(p => ({ ...p, certifications: t }))}
            style={inputStyle}
          />
        </View>

        <View style={[card, { marginTop: 12 }]}>
          <Text style={label}>Availability</Text>
          <TextInput
            value={profile.availabilityNotes}
            onChangeText={t => setProfile(p => ({ ...p, availabilityNotes: t }))}
            multiline
            style={[inputStyle, { minHeight: 70, textAlignVertical: 'top' }]}
          />

          <Text style={[label, { marginTop: 12 }]}>Contact phone</Text>
          <TextInput
            value={profile.contactPhone}
            onChangeText={t => setProfile(p => ({ ...p, contactPhone: t }))}
            style={inputStyle}
          />

          <Text style={[label, { marginTop: 12 }]}>Website</Text>
          <TextInput
            value={profile.contactWebsite}
            onChangeText={t => setProfile(p => ({ ...p, contactWebsite: t }))}
            autoCapitalize="none"
            style={inputStyle}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const card = {
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.card,
  padding: 14,
} as const;

const label = { fontSize: 12, fontWeight: '900' as const, color: colors.text };

