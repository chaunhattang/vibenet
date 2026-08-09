import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon } from '../assets/Icon';
import MomentCard from '../components/Locket/MomentCard';
import MomentFeedEmptyState from '../components/Locket/MomentFeedEmptyState';
import { useLocket } from '../contexts/LocketContext';
import { RootStackParamList } from '../navigation/types';
import { MomentFeedItem } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'LocketFeed'>;

export default function LocketFeedScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { feed, feedLoading, feedError, hasMoreFeed, loadFeed, loadMoreFeed, markViewed, react } =
    useLocket();

  useEffect(() => {
    loadFeed();
    // Only on mount — loadFeed/loadMoreFeed identities are stable via useCallback deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      viewableItems.forEach(({ item, isViewable }) => {
        if (isViewable) markViewed((item as MomentFeedItem).momentId);
      });
    },
  ).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const renderItem = useCallback(
    ({ item }: { item: MomentFeedItem }) => (
      <MomentCard moment={item} onReact={emoji => react(item.momentId, emoji)} />
    ),
    [react],
  );

  return (
    <View className="flex-1 bg-white dark:bg-[#0a0a0a]">
      <View
        style={{ paddingTop: insets.top + 10 }}
        className="flex-row items-center gap-3 px-4 pb-3 border-b border-gray-200 dark:border-white/5"
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <ChevronLeftIcon />
        </Pressable>
        <Text className="text-base font-bold text-gray-900 dark:text-white flex-1">Locket</Text>
      </View>

      {feedError && feed.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-gray-600 dark:text-gray-400 text-center">{feedError}</Text>
          <Pressable
            onPress={() => loadFeed()}
            className="mt-4 bg-indigo-600 rounded-xl px-5 py-2.5"
          >
            <Text className="text-white font-medium">Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={feed}
          keyExtractor={item => item.momentId}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 16, paddingBottom: 40, gap: 16 }}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          refreshControl={
            <RefreshControl
              refreshing={feedLoading && feed.length === 0}
              onRefresh={() => loadFeed({ refresh: true })}
              tintColor="#6366F1"
            />
          }
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasMoreFeed) loadMoreFeed();
          }}
          ListEmptyComponent={!feedLoading ? <MomentFeedEmptyState /> : null}
          ListFooterComponent={
            feedLoading && feed.length > 0 ? (
              <ActivityIndicator size="small" color="#6366F1" style={{ marginTop: 8 }} />
            ) : null
          }
        />
      )}
    </View>
  );
}
