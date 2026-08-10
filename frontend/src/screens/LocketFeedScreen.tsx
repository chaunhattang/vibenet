import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View,
  ViewToken,
} from 'react-native';
import { CameraIcon, SendIcon } from '../assets/Icon';
import MomentCard from '../components/Locket/MomentCard';
import EmptyState from '../components/ui/EmptyState';
import GradientButton from '../components/ui/GradientButton';
import ScreenHeader from '../components/ui/ScreenHeader';
import { useLocket } from '../contexts/LocketContext';
import { RootStackParamList } from '../navigation/types';
import { C } from '../theme/colors';
import { MomentFeedItem } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'LocketFeed'>;

export default function LocketFeedScreen() {
  const navigation = useNavigation<Nav>();
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
      <MomentCard
        moment={item}
        onReact={emoji => react(item.momentId, emoji)}
        onReply={() => navigation.navigate('LocketCapture', { replyToMomentId: item.momentId })}
      />
    ),
    [react, navigation],
  );

  return (
    <View className="flex-1 bg-paper-base dark:bg-ink-base">
      <ScreenHeader
        title="Locket"
        right={
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => navigation.navigate('SentMoments')}
              hitSlop={8}
              className="w-9 h-9 rounded-full bg-paper-raised dark:bg-white/5 items-center justify-center"
            >
              <SendIcon size={16} color={C.brand} />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('LocketCapture')}
              hitSlop={8}
              className="w-9 h-9 rounded-full bg-brand items-center justify-center"
            >
              <CameraIcon size={16} color={C.white} />
            </Pressable>
          </View>
        }
      />

      {feedError && feed.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <EmptyState icon={<CameraIcon size={26} color={C.danger} />} title={feedError} />
          <GradientButton onPress={() => loadFeed()} label="Try Again" className="mt-4" />
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
              tintColor={C.brand}
            />
          }
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasMoreFeed) loadMoreFeed();
          }}
          ListEmptyComponent={
            !feedLoading ? (
              <EmptyState
                icon={<CameraIcon size={26} color={C.brand} />}
                title="No moments yet"
                subtitle="When your friends share a Locket moment, it'll show up here."
              />
            ) : null
          }
          ListFooterComponent={
            feedLoading && feed.length > 0 ? (
              <ActivityIndicator size="small" color={C.brand} style={{ marginTop: 8 }} />
            ) : null
          }
        />
      )}
    </View>
  );
}
