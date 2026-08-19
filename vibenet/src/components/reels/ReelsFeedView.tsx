import React, { useRef, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, Dimensions, ViewToken } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeedVideoCard } from './FeedVideoCard';
import type { PostResponse } from '../../services/api/types';

interface ReelsFeedViewProps {
  posts: PostResponse[];
  onOpenComments: (post: PostResponse) => void;
  onPressAuthor?: (authorId: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// The Reels tab is just a full-screen vertical player over video Posts from the
// regular Feed — there's no separate reel upload flow or backend entity involved.
export const ReelsFeedView: React.FC<ReelsFeedViewProps> = ({
  posts,
  onOpenComments,
  onPressAuthor,
  refreshing,
  onRefresh,
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
      <FlatList
        data={[]}
        keyExtractor={() => 'empty'}
        renderItem={null}
        style={styles.container}
        contentContainerStyle={[styles.container, styles.centered]}
        refreshControl={
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            colors={['#FFFFFF']}
          />
        }
        ListEmptyComponent={
          <>
            <Ionicons name="film-outline" size={40} color="rgba(255,255,255,0.5)" />
            <Text style={styles.emptyTitle}>No videos yet</Text>
            <Text style={styles.emptySubtitle}>
              Videos posted to the Feed show up here automatically. Pull down to refresh.
            </Text>
          </>
        }
      />
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
        refreshControl={
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            colors={['#FFFFFF']}
          />
        }
        // Keep every card mounted for as long as the Reels tab is open. Virtualization
        // would unmount off-screen cards and drop their WebSocket like/comment
        // subscription — the update never arrives, and it only reappears once the
        // card remounts with a fresh `post` prop (e.g. after leaving and returning).
        removeClippedSubviews={false}
        initialNumToRender={posts.length}
        windowSize={posts.length * 2 + 1}
        maxToRenderPerBatch={posts.length}
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
