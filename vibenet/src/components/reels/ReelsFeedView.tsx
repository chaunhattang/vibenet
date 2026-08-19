import React, { useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, ViewToken } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeedVideoCard } from './FeedVideoCard';
import type { PostResponse } from '../../services/api/types';

interface ReelsFeedViewProps {
  posts: PostResponse[];
  onOpenComments: (post: PostResponse) => void;
  onPressAuthor?: (authorId: string) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// The Reels tab is just a full-screen vertical player over video Posts from the
// regular Feed — there's no separate reel upload flow or backend entity involved.
export const ReelsFeedView: React.FC<ReelsFeedViewProps> = ({
  posts,
  onOpenComments,
  onPressAuthor,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 70,
  }).current;

  if (posts.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="film-outline" size={40} color="rgba(255,255,255,0.5)" />
        <Text style={styles.emptyTitle}>No videos yet</Text>
        <Text style={styles.emptySubtitle}>
          Videos posted to the Feed show up here automatically.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        pagingEnabled
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        renderItem={({ item, index }) => (
          <FeedVideoCard
            post={item}
            isActive={index === activeIndex}
            onOpenComments={onOpenComments}
            onPressAuthor={onPressAuthor}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    textAlign: 'center',
  },
});
