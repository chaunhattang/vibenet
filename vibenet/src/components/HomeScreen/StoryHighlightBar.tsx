/**
 * StoryHighlightBar — Horizontal scrolling story strip.
 * Phase G: dark-mode aware + Pressable touch feedback on each story bubble.
 */
import { FlatList, Image, Pressable, Text, View, useColorScheme } from 'react-native';
import { StoryItem } from '../../data/mockStories';

type Props = {
  stories: StoryItem[];
  onPressStory?: (story: StoryItem) => void;
  /** id các user đã xem hết story → ring chuyển xám */
  viewedIds?: Set<string>;
};

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
        const ringColor = item.hasStory
          ? viewed
            ? ringViewed
            : '#0084FF'
          : ringDefault;
        return (
        <Pressable
          onPress={() => onPressStory?.(item)}
          style={({ pressed }) => ({ alignItems: 'center', gap: 6, opacity: pressed ? 0.75 : 1 })}
        >
          {/* Avatar wrapper */}
          <View style={{ width: 64, height: 64, position: 'relative' }}>
            {/* Story ring */}
            <View
              style={{
                width: 64,
                height: 64,
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
            </View>

            {/* LIVE glass badge */}
            {item.isLive && (
              <View
                style={{
                  position: 'absolute',
                  bottom: -3,
                  left: 0,
                  right: 0,
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    backgroundColor: 'rgba(20, 20, 22, 0.82)',
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                    borderRadius: 9999,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.22)',
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 9,
                      fontWeight: '700',
                      letterSpacing: 0.5,
                    }}
                  >
                    LIVE
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Name label */}
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
