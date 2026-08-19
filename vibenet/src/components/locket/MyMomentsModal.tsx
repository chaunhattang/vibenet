import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  type ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Spacing, Typography } from '../../constants/theme';
import {
  getSentMoments,
  getMomentViewers,
  type SentMomentResponse,
  type MomentViewerResponse,
} from '../../services/api/locket';
import { resolveMediaUrl } from '../../services/config';

interface MyMomentsModalProps {
  visible: boolean;
  onClose: () => void;
  onSendNew: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export const MyMomentsModal: React.FC<MyMomentsModalProps> = ({ visible, onClose, onSendNew }) => {
  const [moments, setMoments] = useState<SentMomentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [viewersByMomentId, setViewersByMomentId] = useState<Record<string, MomentViewerResponse[]>>({});
  const [loadingViewersFor, setLoadingViewersFor] = useState<string | null>(null);
  const detailListRef = useRef<FlatList<SentMomentResponse>>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await getSentMoments(0, 20);
      setMoments(page.data);
    } catch (err) {
      console.warn('Failed to load sent moments', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchViewersFor = useCallback(async (momentId: string) => {
    setLoadingViewersFor(momentId);
    try {
      const res = await getMomentViewers(momentId);
      setViewersByMomentId((prev) => ({ ...prev, [momentId]: res.viewers }));
    } catch (err) {
      console.warn('Failed to load moment viewers', err);
    } finally {
      setLoadingViewersFor((current) => (current === momentId ? null : current));
    }
  }, []);

  const openDetail = (index: number) => {
    setDetailIndex(index);
    const moment = moments[index];
    if (moment && !viewersByMomentId[moment.momentId]) {
      fetchViewersFor(moment.momentId);
    }
  };

  const closeDetail = () => {
    setDetailIndex(null);
  };

  const handleClose = () => {
    closeDetail();
    onClose();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const first = viewableItems[0];
    if (!first || first.index == null) return;
    setDetailIndex(first.index);
    const moment = first.item as SentMomentResponse;
    setViewersByMomentId((prev) => {
      if (prev[moment.momentId]) return prev;
      fetchViewersFor(moment.momentId);
      return prev;
    });
  }).current;

  const viewabilityConfig = useMemo(() => ({ itemVisiblePercentThreshold: 60 }), []);

  if (detailIndex !== null) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeDetail}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity activeOpacity={0.7} onPress={closeDetail} style={styles.headerBtn}>
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              Moment {detailIndex + 1} of {moments.length}
            </Text>
            <View style={styles.headerBtn} />
          </View>

          <FlatList
            key="detail-list"
            ref={detailListRef}
            data={moments}
            keyExtractor={(item) => item.momentId}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={detailIndex}
            getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            renderItem={({ item }) => {
              const viewers = viewersByMomentId[item.momentId];
              const isLoadingViewers = loadingViewersFor === item.momentId;
              return (
                <ScrollView
                  style={{ width: SCREEN_WIDTH }}
                  contentContainerStyle={styles.detailScrollContent}
                  showsVerticalScrollIndicator={false}>
                  <View style={styles.viewfinderCard}>
                    <Image
                      source={{ uri: resolveMediaUrl(item.mediaUrl) }}
                      style={styles.momentImage}
                      contentFit="cover"
                    />
                    {item.caption ? (
                      <View style={styles.captionOverlay}>
                        <Text style={styles.captionText}>{item.caption}</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.detailTimestamp}>{new Date(item.createdAt).toLocaleString()}</Text>

                  <View style={styles.statsRow}>
                    <Ionicons name="people" size={14} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.statsText}>{item.recipientCount} sent</Text>
                    <Ionicons name="eye" size={14} color="rgba(255,255,255,0.6)" style={styles.statsIconSpacer} />
                    <Text style={styles.statsText}>{item.viewedCount} viewed</Text>
                  </View>

                  <Text style={styles.sectionLabel}>Viewed by</Text>
                  {isLoadingViewers && !viewers ? (
                    <ActivityIndicator color="#FFFFFF" size="small" style={styles.viewersLoading} />
                  ) : !viewers || viewers.length === 0 ? (
                    <Text style={styles.noViewersText}>No one has viewed this yet.</Text>
                  ) : (
                    [...viewers]
                      .sort((a, b) => {
                        if (!a.viewedAt && !b.viewedAt) return 0;
                        if (!a.viewedAt) return 1;
                        if (!b.viewedAt) return -1;
                        return new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime();
                      })
                      .map((v) => (
                        <View key={v.userId} style={styles.viewerRow}>
                          <Image source={{ uri: resolveMediaUrl(v.avatarUrl) }} style={styles.viewerAvatar} />
                          <Text style={styles.viewerName}>{v.userName}</Text>
                          {v.viewedAt ? (
                            <View style={styles.viewerSeenBadge}>
                              <Ionicons name="checkmark-done" size={13} color={Colors.statusCloseFriend} />
                              <Text style={styles.viewerSeenTime}>{new Date(v.viewedAt).toLocaleString()}</Text>
                            </View>
                          ) : (
                            <Text style={styles.viewerStatus}>Not viewed</Text>
                          )}
                        </View>
                      ))
                  )}
                </ScrollView>
              );
            }}
          />

          <View style={styles.dotsRow}>
            {moments.map((m, idx) => (
              <View key={m.momentId} style={[styles.dot, idx === detailIndex && styles.dotActive]} />
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onShow={load}
      onRequestClose={handleClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.7} onPress={handleClose} style={styles.headerBtn}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Moments</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={onSendNew} style={styles.headerBtn}>
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#FFFFFF" />
          </View>
        ) : moments.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="camera-outline" size={32} color="rgba(255,255,255,0.4)" />
            <Text style={styles.emptyText}>You haven't sent a moment yet.</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={onSendNew} style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>Send a moment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            key="moments-list"
            data={moments}
            keyExtractor={(item) => item.momentId}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity activeOpacity={0.85} onPress={() => openDetail(index)} style={styles.cardRow}>
                <Image source={{ uri: resolveMediaUrl(item.mediaUrl) }} style={styles.thumb} />
                <View style={styles.cardText}>
                  {item.caption ? <Text style={styles.caption} numberOfLines={1}>{item.caption}</Text> : null}
                  <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleString()}</Text>
                  <View style={styles.statsRow}>
                    <Ionicons name="people" size={13} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.statsText}>{item.recipientCount} sent</Text>
                    <Ionicons name="eye" size={13} color="rgba(255,255,255,0.6)" style={styles.statsIconSpacer} />
                    <Text style={styles.statsText}>{item.viewedCount} viewed</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D0E11',
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerBtn: {
    minWidth: 44,
    padding: Spacing.one,
  },
  headerTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  doneText: {
    ...Typography.bodyMedium,
    color: Colors.statusCloseFriend,
    fontWeight: '600',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.six,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    textAlign: 'center',
  },
  emptyBtn: {
    backgroundColor: Colors.statusCloseFriend,
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.three,
    borderRadius: Radii.pill,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: Radii.lg,
    backgroundColor: '#1E1E22',
  },
  cardText: {
    flex: 1,
    gap: 3,
  },
  caption: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  timestamp: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statsText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginLeft: 4,
  },
  statsIconSpacer: {
    marginLeft: 10,
  },
  // ── Detail screen ──────────────────────────────────────
  detailScrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
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
  momentImage: {
    width: '100%',
    height: '100%',
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
  detailTimestamp: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: Spacing.three,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '700',
    marginTop: Spacing.five,
    marginBottom: Spacing.three,
  },
  viewersLoading: {
    marginTop: Spacing.two,
    alignSelf: 'flex-start',
  },
  noViewersText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
  },
  viewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  viewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1E22',
  },
  viewerName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  viewerStatus: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  viewerSeenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewerSeenTime: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.three,
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
});
