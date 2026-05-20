import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useFeatureFlag } from '../../context/FeatureFlagsContext';
import { useTheme } from '../../context/ThemeContext';

export type MemberTabId = 'home' | 'workouts' | 'messages' | 'challenges' | 'leaderboard' | 'progress' | 'profile';

type Props = {
  active: MemberTabId;
  onChange: (tab: MemberTabId) => void;
  showChallengesDot?: boolean;
};

const tabs: { id: MemberTabId; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'workouts', label: 'Workouts', icon: 'barbell' },
  { id: 'messages', label: 'Messages', icon: 'chatbubbles' },
  { id: 'progress', label: 'Progress', icon: 'trending-up' },
  { id: 'profile', label: 'Profile', icon: 'person' },
];

// Extended tabs are appended when enabled.
const extraTabs: { id: MemberTabId; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'challenges', label: 'Challenges', icon: 'trophy' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'podium' },
];

export function MemberBottomNav({ active, onChange, showChallengesDot }: Props) {
  const { colors } = useTheme();
  const enableMemberMessaging = useFeatureFlag('enable_member_messaging');
  const enableProgress = useFeatureFlag('enable_progress_tracking');
  const enableChallenges = useFeatureFlag('enable_challenges');
  const enableLeaderboard = useFeatureFlag('enable_leaderboard');

  const visibleTabs = [...tabs, ...(enableChallenges ? [extraTabs[0]] : []), ...(enableLeaderboard ? [extraTabs[1]] : [])].filter(t => {
    if (t.id === 'messages' && !enableMemberMessaging) return false;
    if (t.id === 'progress' && !enableProgress) return false;
    return true;
  });

  return (
    <View
      style={{
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.card,
        paddingBottom: 8,
        paddingTop: 8,
        justifyContent: 'space-around',
      }}
    >
      {visibleTabs.map(tab => {
        const selected = active === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={{ alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4 }}
          >
            <Ionicons
              name={tab.icon}
              size={24}
              color={selected ? colors.primary : colors.textMuted}
            />
            {tab.id === 'challenges' && showChallengesDot ? (
              <View style={{ position: 'absolute', top: 2, right: 18, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger }} />
            ) : null}
            <Text
              style={{
                fontSize: 11,
                marginTop: 4,
                color: selected ? colors.primary : colors.textMuted,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
