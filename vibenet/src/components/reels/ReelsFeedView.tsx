import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  ViewToken,
  ActivityIndicator,
} from 'react-native';
import { ReelCard } from './ReelCard';
import * as reelsApi from '../../services/api/reels';
import type { ReelResponse } from '../../services/api/types';

interface ReelsFeedViewProps {
  onOpenComments: (reel: ReelResponse) => void;
  onPressAuthor?: (authorId: string) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ReelsFeedView: React.FC<ReelsFeedViewProps> = ({
  onOpenComments,
  onPressAuthor,
}) => {
  const [reels, setReels] = useState<ReelResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const viewedReelIds = useRef(new Set<string>());

  useEffect(() => {
    reelsApi
      .getReelsFeed(0, 10)
      .then((page) => setReels(page.data))
      .catch((err) => console.warn('Failed to load reels feed', err))
      .finally(() => setIsLoading(false));
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const index = viewableItems[0].index;
        setActiveReelIndex(index);
        const reel = reels[index];
        if (reel && !viewedReelIds.current.has(reel.id)) {
          viewedReelIds.current.add(reel.id);
          reelsApi.incrementReelView(reel.id).catch(() => {});
        }
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 70,
  }).current;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reels}
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
          <ReelCard
            reel={item}
            isActive={index === activeReelIndex}
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
  },
});
