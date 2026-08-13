/**
 * StoryHighlightBar — Horizontal scrolling story strip.
 * Styled to match docs/mockDashboard&Profile.txt's story-bar spec precisely
 * (60px avatars, accent-blue ring, dark-glass LIVE badge).
 */
import { useRef } from 'react';
import { FlatList, Image, Pressable, Text, View, useColorScheme } from 'react-native';
import { BlurTargetView, BlurView } from 'expo-blur';
import { StoryItem } from '../../data/mockStories';

type Props = {
  stories: StoryItem[];
  onPressStory?: (story: StoryItem) => void;
  /** id các user đã xem hết story → ring chuyển xám */
  viewedIds?: Set<string>;
};

// mock .avatar-img: 60px, 2px border. .story-item.has-story: 2px accent-blue border.
const AVATAR_SIZE = 60;

function StoryAvatar({
  item,
  viewed,
  ringDefault,
  ringViewed,
  avatarBg,
  isDark,
}: {
  item: StoryItem;
  viewed: boolean;
  ringDefault: string;
  ringViewed: string;
  avatarBg: string;
  isDark: boolean;
}) {
  const blurTargetRef = useRef<View>(null);
  const ringColor = item.hasStory ? (viewed ? ringViewed : '#0084FF') : ringDefault;

  return (
    <View style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, position: 'relative' }}>
      <BlurTargetView
        ref={blurTargetRef}
        style={{
          width: AVATAR_SIZE,
          height: AVATAR_SIZE,
          borderRadius: 9999,
          borderWidth: 2,
          borderColor: ringColor,
          padding: item.hasStory ? 2 : 0,
          backgroundColor: avatarBg,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.4 : 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <Image
          source={item.avatarSource as any}
          style={{ width: '100%', height: '100%', borderRadius: 9999 }}
          resizeMode="cover"
        />
      </BlurTargetView>

      {/* mock .live-badge: surface-dark-glass + glass-blur-medium, bottom -3px, pill radius */}
      {item.isLive && (
        <View style={{ position: 'absolute', bottom: -3, left: 0, right: 0, alignItems: 'center' }}>
          <View
            style={{
              overflow: 'hidden',
              borderRadius: 9999,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <BlurView
              tint="dark"
              intensity={40}
              blurMethod="dimezisBlurView"
              blurTarget={blurTargetRef}
              style={{
                paddingHorizontal: 6,
                paddingVertical: 2,
                backgroundColor: 'rgba(20, 20, 22, 0.65)',
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 9,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                }}
              >
                Live
              </Text>
            </BlurView>
          </View>
        </View>
      )}
    </View>
  );
}

export default function StoryHighlightBar({ stories, onPressStory, viewedIds }: Props) {
  const isDark = useColorScheme() === 'dark';

  const nameColor = isDark ? '#9CA3AF' : '#6C727F';
  const ringDefault = isDark ? 'rgba(255,255,255,0.12)' : '#FFFFFF';
  const ringViewed = isDark ? 'rgba(255,255,255,0.22)' : '#D1D5DB';
  const avatarBg = isDark ? '#1E1730' : '#FFFFFF';

  return (
    <FlatList<StoryItem>
      data={stories}
      horizontal
      keyExtractor={item => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, gap: 16 }}
      renderItem={({ item }) => {
        const viewed = viewedIds?.has(item.id) ?? false;
        return (
          <Pressable
            onPress={() => onPressStory?.(item)}
            style={({ pressed }) => ({ alignItems: 'center', gap: 6, opacity: pressed ? 0.75 : 1 })}
          >
            <StoryAvatar
              item={item}
              viewed={viewed}
              ringDefault={ringDefault}
              ringViewed={ringViewed}
              avatarBg={avatarBg}
              isDark={isDark}
            />

            {/* mock .story-name: 12px/500/text-secondary, 64px max-width */}
            <Text
              numberOfLines={1}
              style={{ fontSize: 12, fontWeight: '500', color: nameColor, maxWidth: 64 }}
            >
              {item.name}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}
