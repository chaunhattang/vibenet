import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors, Radii, Spacing, Typography, BottomTabInset, MaxContentWidth } from '../../constants/theme';
import { ExploreSkeleton } from '../../components/skeletons/ExploreSkeleton';
import { PostGridThumbnail } from '../../components/common/PostGridThumbnail';
import * as exploreApi from '../../services/api/explore';
import * as usersApi from '../../services/api/users';
import type { ExploreItemResponse, UserResponse } from '../../services/api/types';
import { resolveMediaUrl } from '../../services/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (Math.min(SCREEN_WIDTH, MaxContentWidth) - 32 - 10) / 2;
const VIDEO_EXT_RE = /\.(mp4|mov|webm|m4v)$/i;

const CATEGORIES = ['All', 'Photography', 'Architecture', 'Nature', 'Art'];

function formatCount(count: number) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

interface ExploreGridCardProps {
  item: ExploreItemResponse;
  onPress: (item: ExploreItemResponse) => void;
}

const ExploreGridCard: React.FC<ExploreGridCardProps> = ({ item, onPress }) => {
  const isVideo = item.type === 'REEL' || VIDEO_EXT_RE.test(item.mediaUrl ?? '');

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(item)}
      style={[styles.gridCard, { height: GRID_ITEM_WIDTH * 1.1 }]}>
      <PostGridThumbnail
        mediaUrl={item.thumbnailUrl || item.mediaUrl}
        textContent={item.textContent}
        textGradient={item.textGradient}
        style={styles.gridImage}
      />
      {isVideo && (
        <View style={styles.reelBadge}>
          <Ionicons name="play" size={10} color="#FFFFFF" />
        </View>
      )}
      <View style={styles.gridOverlay}>
        <View style={styles.likesBadge}>
          <Ionicons name="heart" size={12} color="#FFFFFF" />
          <Text style={styles.likesText}>{formatCount(item.likesCount)}</Text>
        </View>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>@{item.author.username}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ExploreScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<ExploreItemResponse[]>([]);
  const [userResults, setUserResults] = useState<UserResponse[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (category: string) => {
    setIsLoading(true);
    try {
      const page = await exploreApi.getExploreGrid(category === 'All' ? 'all' : category.toLowerCase(), 0, 30);
      setItems(page.data);
    } catch (err) {
      console.warn('Failed to load explore grid', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load(activeCategory);
  }, [activeCategory, load]);

  const trimmedQuery = searchQuery.trim();

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!trimmedQuery) {
      setUserResults([]);
      setIsSearchingUsers(false);
      return;
    }

    setIsSearchingUsers(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const results = await usersApi.searchUsers(trimmedQuery);
        setUserResults(results);
      } catch (err) {
        console.warn('User search failed', err);
        setUserResults([]);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 300);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [trimmedQuery]);

  const handlePressItem = (item: ExploreItemResponse) => {
    router.push(`/profile/${item.author.id}` as any);
  };

  const handlePressUser = (userId: string) => {
    router.push(`/profile/${userId}` as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          {/* Search Header */}
          <View style={styles.header}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={Colors.textTertiary} />
              <TextInput
                placeholder="Search users..."
                placeholderTextColor={Colors.textPlaceholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {trimmedQuery ? (
            // Search mode: real backend user search, replaces the explore grid.
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.userResultsContent}>
              {isSearchingUsers ? (
                <View style={styles.searchLoadingWrap}>
                  <ActivityIndicator color={Colors.textPrimary} />
                </View>
              ) : userResults.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="person-outline" size={36} color={Colors.textTertiary} />
                  <Text style={styles.emptyStateText}>No users found for "{trimmedQuery}"</Text>
                </View>
              ) : (
                userResults.map((u) => (
                  <TouchableOpacity
                    key={u.id}
                    activeOpacity={0.7}
                    onPress={() => handlePressUser(u.id)}
                    style={styles.userRow}>
                    <Image
                      source={{ uri: resolveMediaUrl(u.profileResponse?.avatarUrl ?? null) }}
                      style={styles.userAvatar}
                    />
                    <View style={styles.userText}>
                      <Text style={styles.userFullName}>{u.profileResponse?.fullName || u.username}</Text>
                      <Text style={styles.userUsername}>@{u.username}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          ) : (
            <>
              {/* Categories Pill Bar */}
              <View style={styles.categoriesSection}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesScroll}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      activeOpacity={0.7}
                      onPress={() => setActiveCategory(cat)}
                      style={[
                        styles.categoryPill,
                        activeCategory === cat && styles.activeCategoryPill,
                      ]}>
                      <Text
                        style={[
                          styles.categoryText,
                          activeCategory === cat && styles.activeCategoryText,
                        ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Masonry Grid or Skeleton */}
              {isLoading ? (
                <ExploreSkeleton />
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}>
                  <View style={styles.gridRow}>
                    {/* Column 1 */}
                    <View style={styles.gridColumn}>
                      {items
                        .filter((_, i) => i % 2 === 0)
                        .map((item) => (
                          <ExploreGridCard key={item.id} item={item} onPress={handlePressItem} />
                        ))}
                    </View>

                    {/* Column 2 */}
                    <View style={styles.gridColumn}>
                      {items
                        .filter((_, i) => i % 2 === 1)
                        .map((item) => (
                          <ExploreGridCard key={item.id} item={item} onPress={handlePressItem} />
                        ))}
                    </View>
                  </View>

                  {items.length === 0 && (
                    <View style={styles.emptyState}>
                      <Ionicons name="compass-outline" size={36} color={Colors.textTertiary} />
                      <Text style={styles.emptyStateText}>Nothing to explore yet</Text>
                    </View>
                  )}
                </ScrollView>
              )}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgMain,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.bgMain,
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: Radii.pill,
    backgroundColor: '#EBECEF',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  categoriesSection: {
    marginBottom: Spacing.two,
  },
  categoriesScroll: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  categoryPill: {
    paddingHorizontal: Spacing.four,
    paddingVertical: 7,
    borderRadius: Radii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  activeCategoryPill: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  categoryText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
    paddingTop: Spacing.one,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  gridColumn: {
    flex: 1,
    gap: 10,
  },
  gridCard: {
    width: '100%',
    borderRadius: Radii.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.surfaceMuted,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  reelBadge: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: Spacing.two,
    left: Spacing.two,
    right: Spacing.two,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  likesText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  tagText: {
    color: Colors.textPrimary,
    fontSize: 9,
    fontWeight: '700',
  },
  emptyState: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.eight,
    gap: Spacing.two,
  },
  emptyStateText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  userResultsContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  searchLoadingWrap: {
    paddingVertical: Spacing.eight,
    alignItems: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceMuted,
  },
  userText: {
    flex: 1,
  },
  userFullName: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  userUsername: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
