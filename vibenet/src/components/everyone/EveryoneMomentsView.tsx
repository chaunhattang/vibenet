import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ViewToken,
  ActivityIndicator,
  Alert,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as locketApi from '../../services/api/locket';
import type { PublicMomentResponse } from '../../services/api/locket';
import { useAuth } from '../../contexts/AuthContext';
import { resolveMediaUrl } from '../../services/config';
import { Colors, Radii, Spacing, Typography, BottomTabInset } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MomentPageProps {
  moment: PublicMomentResponse;
  pageHeight: number;
  isActive: boolean;
  isOwn: boolean;
  onDelete: (momentId: string) => void;
}

const MomentPage: React.FC<MomentPageProps> = ({ moment, pageHeight, isActive, isOwn, onDelete }) => {
  const isVideo = moment.mediaType === 'VIDEO';
  const videoUrl = isVideo ? resolveMediaUrl(moment.mediaUrl) : undefined;
  const player = useVideoPlayer(videoUrl ?? null, (p) => {
    p.loop = true;
  });

  useEffect(() => {
    if (!player) return;
    if (isActive) player.play();
    else player.pause();
  }, [isActive, player]);

  const handleDelete = () => {
    Alert.alert('Delete moment?', 'This will remove it for everyone who can see it.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(moment.momentId) },
    ]);
  };

  return (
    <View style={[styles.page, { height: pageHeight }]}>
      <View style={styles.viewfinderCard}>
        {isVideo && videoUrl && Platform.OS !== 'web' ? (
          <VideoView
            player={player}
            style={styles.momentMedia}
            contentFit="cover"
            nativeControls={false}
            allowsPictureInPicture={false}
          />
        ) : (
          <Image
            source={{ uri: resolveMediaUrl(moment.mediaUrl) }}
            style={styles.momentMedia}
            contentFit="cover"
          />
        )}

        <View style={styles.authorBadge}>
          <Image source={{ uri: resolveMediaUrl(moment.senderAvatarUrl) }} style={styles.authorAvatar} />
          <View>
            <Text style={styles.authorName}>{moment.senderName}</Text>
            <Text style={styles.momentTime}>{new Date(moment.createdAt).toLocaleString()}</Text>
          </View>
        </View>

        {isOwn && (
          <TouchableOpacity activeOpacity={0.7} onPress={handleDelete} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {moment.caption ? (
          <View style={styles.captionOverlay}>
            <Text style={styles.captionText}>{moment.caption}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export const EveryoneMomentsView: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [moments, setMoments] = useState<PublicMomentResponse[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerHeight(e.nativeEvent.layout.height);
  }, []);

  const load = useCallback(async () => {
    try {
      const page = await locketApi.getPublicMoments(0, 30);
      setMoments(page.data);
    } catch (err) {
      console.warn('Failed to load public moments', err);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    load().finally(() => setIsLoading(false));
  }, [load]);

  const handleDelete = useCallback((momentId: string) => {
    setMoments((prev) => prev.filter((m) => m.momentId !== momentId));
    locketApi.deleteMoment(momentId).catch((err) => {
      console.warn('Failed to delete moment', err);
      Alert.alert('Error', 'Failed to delete moment');
      load();
    });
  }, [load]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  if (moments.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="planet-outline" size={36} color="rgba(255,255,255,0.6)" />
        <Text style={styles.emptyText}>No moments from friends yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      {containerHeight > 0 && (
        <FlatList
          data={moments}
          keyExtractor={(item) => item.momentId}
          pagingEnabled
          snapToInterval={containerHeight}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({ length: containerHeight, offset: containerHeight * index, index })}
          renderItem={({ item, index }) => (
            <MomentPage
              moment={item}
              pageHeight={containerHeight}
              isActive={index === activeIndex}
              isOwn={item.senderId === user?.id}
              onDelete={handleDelete}
            />
          )}
        />
      )}

      <View style={styles.momentSwitcher} pointerEvents="none">
        {moments.map((_, idx) => (
          <View key={idx} style={[styles.momentDot, idx === activeIndex && styles.momentDotActive]} />
        ))}
      </View>
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
    gap: Spacing.three,
  },
  emptyText: {
    ...Typography.bodyMedium,
    color: 'rgba(255,255,255,0.7)',
  },
  page: {
    width: SCREEN_WIDTH,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
  },
  viewfinderCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#111113',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  momentMedia: {
    width: '100%',
    height: '100%',
  },
  authorBadge: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radii.pill,
  },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    backgroundColor: Colors.surfaceMuted,
  },
  authorName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  momentTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
  },
  deleteBtn: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionOverlay: {
    position: 'absolute',
    bottom: Spacing.three,
    left: Spacing.three,
    right: Spacing.three,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two + 2,
    borderRadius: Radii.lg,
  },
  captionText: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  momentSwitcher: {
    position: 'absolute',
    bottom: BottomTabInset + Spacing.four,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  momentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  momentDotActive: {
    width: 18,
    backgroundColor: '#FFFFFF',
  },
});
