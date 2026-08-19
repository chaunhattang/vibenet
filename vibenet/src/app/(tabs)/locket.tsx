import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
  ViewToken,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Radii, Spacing, MaxContentWidth, BottomTabInset } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { CameraCaptureModal } from '../../components/locket/CameraCaptureModal';
import { MyMomentsModal } from '../../components/locket/MyMomentsModal';
import {
  createMoment,
  getPublicMoments,
  deleteMoment,
  type PublicMomentResponse,
  type MomentCreationResponse,
} from '../../services/api/locket';
import { resolveMediaUrl } from '../../services/config';

const CARD_WIDTH = Math.min(Dimensions.get('window').width, MaxContentWidth) - Spacing.four * 2;
const CARD_HEIGHT = CARD_WIDTH * 1.2;

async function toFormFile(asset: { uri: string; fileName?: string | null; mimeType?: string | null }): Promise<any> {
  if (Platform.OS === 'web') {
    try {
      const res = await fetch(asset.uri);
      return await res.blob();
    } catch {
      // fallback below
    }
  }
  return {
    uri: asset.uri,
    name: asset.fileName || 'moment.jpg',
    type: asset.mimeType || 'image/jpeg',
  } as unknown as Blob;
}

interface MomentPageProps {
  moment: PublicMomentResponse;
  isOwn: boolean;
  onDelete: (momentId: string) => void;
}

const MomentPage: React.FC<MomentPageProps> = ({ moment, isOwn, onDelete }) => {
  const handleDelete = () => {
    Alert.alert('Delete moment?', 'This will remove it for everyone who can see it.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(moment.momentId) },
    ]);
  };

  return (
    <View style={[styles.page, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
      <Image source={{ uri: resolveMediaUrl(moment.mediaUrl) }} style={styles.momentMedia} contentFit="cover" />

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
  );
};

export default function LocketScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [moments, setMoments] = useState<PublicMomentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isMyMomentsVisible, setIsMyMomentsVisible] = useState(false);
  const [isPickingFromGallery, setIsPickingFromGallery] = useState(false);
  const flatListRef = useRef<FlatList<PublicMomentResponse>>(null);

  const load = useCallback(async () => {
    try {
      const page = await getPublicMoments(0, 30);
      setMoments(page.data);
    } catch (err) {
      console.warn('Failed to load moments', err);
    }
  }, []);

  const hasLoadedOnceRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedOnceRef.current) {
        setIsLoading(true);
        load().finally(() => {
          setIsLoading(false);
          hasLoadedOnceRef.current = true;
        });
      } else {
        load().catch(() => {});
      }
    }, [load])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  const handleCreateMoment = useCallback((created: MomentCreationResponse) => {
    if (!user) return;
    setMoments((prev) => [
      {
        momentId: created.momentId,
        senderId: user.id,
        senderName: user.profileResponse?.fullName || user.username,
        senderAvatarUrl: user.profileResponse?.avatarUrl ?? null,
        mediaUrl: created.mediaUrl,
        mediaType: created.mediaType,
        caption: created.caption,
        createdAt: created.createdAt,
      },
      ...prev,
    ]);
    setActiveIndex(0);
    // Jump back to the newly posted moment regardless of which one was being viewed.
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  }, [user]);

  const handlePickFromGallery = useCallback(async () => {
    if (isPickingFromGallery) return;
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow gallery access to pick a photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;

      setIsPickingFromGallery(true);
      const asset = result.assets[0];
      const form = new FormData();
      form.append('media', await toFormFile(asset));
      const created = await createMoment(form);
      handleCreateMoment(created);
    } catch (err) {
      console.warn('Failed to post moment from gallery', err);
      Alert.alert('Could not post moment', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setIsPickingFromGallery(false);
    }
  }, [isPickingFromGallery, handleCreateMoment]);

  const handleDelete = useCallback((momentId: string) => {
    setMoments((prev) => prev.filter((m) => m.momentId !== momentId));
    deleteMoment(momentId).catch((err) => {
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

  const avatarUrl = resolveMediaUrl(user?.profileResponse?.avatarUrl);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/notifications' as any)}
              style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.audiencePill}>
              <Ionicons name="earth" size={13} color="#FFFFFF" />
              <Text style={styles.audienceText}>Everyone</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => user && router.push(`/profile/${user.id}` as any)}
              style={styles.avatarBtn}>
              <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
            </TouchableOpacity>
          </View>

          {/* Framed Viewfinder Card */}
          <View style={styles.cardWrap}>
            {isLoading ? (
              <View style={[styles.cardFrame, styles.centered]}>
                <ActivityIndicator color="#FFFFFF" />
              </View>
            ) : moments.length === 0 ? (
              <View style={[styles.cardFrame, styles.centered]}>
                <Ionicons name="camera-outline" size={36} color="rgba(255,255,255,0.5)" />
                <Text style={styles.emptyText}>No moments yet</Text>
                <Text style={styles.emptySubtext}>Capture one to share with everyone.</Text>
              </View>
            ) : (
              <View style={styles.cardFrame}>
                <FlatList
                  ref={flatListRef}
                  data={moments}
                  keyExtractor={(item) => item.momentId}
                  pagingEnabled
                  snapToInterval={CARD_HEIGHT}
                  decelerationRate="fast"
                  showsVerticalScrollIndicator={false}
                  onViewableItemsChanged={onViewableItemsChanged}
                  viewabilityConfig={viewabilityConfig}
                  refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />
                  }
                  getItemLayout={(_, index) => ({ length: CARD_HEIGHT, offset: CARD_HEIGHT * index, index })}
                  renderItem={({ item }) => (
                    <MomentPage moment={item} isOwn={item.senderId === user?.id} onDelete={handleDelete} />
                  )}
                />
              </View>
            )}
          </View>

          {moments.length > 1 && (
            <View style={styles.dotsRow}>
              {moments.map((m, idx) => (
                <View key={m.momentId} style={[styles.dot, idx === activeIndex && styles.dotActive]} />
              ))}
            </View>
          )}

          <View style={styles.spacer} />

          {/* Bottom Capture Bar */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsMyMomentsVisible(true)}
              style={styles.sideIconBtn}>
              <Ionicons name="grid-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsCameraVisible(true)}
              style={styles.shutterOuter}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              disabled={isPickingFromGallery}
              onPress={handlePickFromGallery}
              style={styles.sideIconBtn}>
              {isPickingFromGallery ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Ionicons name="images-outline" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <CameraCaptureModal
        visible={isCameraVisible}
        onClose={() => setIsCameraVisible(false)}
        onCreateMoment={handleCreateMoment}
      />

      <MyMomentsModal
        visible={isMyMomentsVisible}
        onClose={() => setIsMyMomentsVisible(false)}
        onSendNew={() => {
          setIsMyMomentsVisible(false);
          setIsCameraVisible(true);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: Spacing.six,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    textAlign: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    height: 56,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audiencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: Spacing.four,
    paddingVertical: 8,
    borderRadius: Radii.pill,
  },
  audienceText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  headerAvatar: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceMuted,
  },
  cardWrap: {
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.two,
  },
  cardFrame: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#111113',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  page: {
    height: CARD_WIDTH,
    position: 'relative',
    backgroundColor: '#111113',
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionOverlay: {
    position: 'absolute',
    bottom: Spacing.three,
    left: Spacing.three,
    right: Spacing.three,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.three,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#FFFFFF',
  },
  spacer: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.eight,
    marginBottom: BottomTabInset + Spacing.two,
  },
  sideIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
  },
});
