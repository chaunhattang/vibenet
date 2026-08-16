import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FeedHeader } from '../../components/feed/FeedHeader';
import { StoryHighlightBar } from '../../components/feed/StoryHighlightBar';
import { PostCard } from '../../components/feed/PostCard';
import { CommentsSheetModal } from '../../components/feed/CommentsSheetModal';
import { StoryViewerModal } from '../../components/stories/StoryViewerModal';
import { CreatePostModal } from '../../components/feed/CreatePostModal';
import { PostOptionsModal } from '../../components/feed/PostOptionsModal';
import { ReelsFeedView } from '../../components/reels/ReelsFeedView';
import { ReelCommentsSheetModal } from '../../components/reels/ReelCommentsSheetModal';
import { FeedSkeleton } from '../../components/skeletons/FeedSkeleton';
import * as postsApi from '../../services/api/posts';
import * as storiesApi from '../../services/api/stories';
import { PostResponse, ReelResponse, StoryUserGroupResponse } from '../../services/api/types';
import { Colors, Spacing, BottomTabInset, MaxContentWidth } from '../../constants/theme';

export default function FeedScreen() {
  const router = useRouter();
  const [homeTab, setHomeTab] = useState<'feed' | 'reels'>('feed');
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [storyGroups, setStoryGroups] = useState<StoryUserGroupResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [selectedPostForComments, setSelectedPostForComments] = useState<PostResponse | null>(null);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [selectedPostForOptions, setSelectedPostForOptions] = useState<PostResponse | null>(null);
  const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
  const [selectedStoryGroupIndex, setSelectedStoryGroupIndex] = useState<number>(0);
  const [isStoryViewerVisible, setIsStoryViewerVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedReelForComments, setSelectedReelForComments] = useState<ReelResponse | null>(null);
  const [isReelCommentsVisible, setIsReelCommentsVisible] = useState(false);

  const loadFeed = useCallback(async () => {
    const [feedPage, stories] = await Promise.all([
      postsApi.getFeed(0, 20),
      storiesApi.getStoriesFeed(),
    ]);
    setPosts(feedPage.data);
    setStoryGroups(stories);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    loadFeed().finally(() => setIsLoading(false));
  }, [loadFeed]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFeed().finally(() => setRefreshing(false));
  }, [loadFeed]);

  const handleSelectStory = (group: StoryUserGroupResponse, index: number) => {
    setSelectedStoryGroupIndex(index);
    setIsStoryViewerVisible(true);
  };

  const handleOpenComments = (post: PostResponse) => {
    setSelectedPostForComments(post);
    setIsCommentsVisible(true);
  };

  const handleOpenReelComments = (reel: ReelResponse) => {
    setSelectedReelForComments(reel);
    setIsReelCommentsVisible(true);
  };

  const handlePressAuthor = (authorId: string) => {
    router.push(`/profile/${authorId}` as any);
  };

  const handleCreatePost = (newPost: PostResponse) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleCreateStory = () => {
    // Refresh story groups so the new story appears grouped under the current user.
    storiesApi.getStoriesFeed().then(setStoryGroups).catch(() => {});
  };

  const handleOpenOptions = (post: PostResponse) => {
    setSelectedPostForOptions(post);
    setIsOptionsModalVisible(true);
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleToggleSave = (postId: string, isSaved: boolean) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, saved: isSaved } : p)));
  };

  return (
    <View style={styles.rootContainer}>
      {/* Dynamic Status Bar */}
      <StatusBar
        barStyle={homeTab === 'reels' ? 'light-content' : 'dark-content'}
        translucent={true}
        backgroundColor="transparent"
      />

      {homeTab === 'feed' ? (
        /* 1. PHOTO FEED (Inside SafeAreaView) */
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.contentWrapper}>
              <FeedHeader
                activeTab={homeTab}
                onChangeTab={setHomeTab}
                onPressAdd={() => setIsCreateModalVisible(true)}
              />

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={Colors.textPrimary}
                  />
                }>
                {isLoading ? (
                  <FeedSkeleton />
                ) : (
                  <>
                    {/* Story Bar */}
                    <StoryHighlightBar
                      stories={storyGroups}
                      onSelectStory={handleSelectStory}
                    />

                    {/* Posts List */}
                    <View style={styles.postsList}>
                      {posts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onOpenComments={handleOpenComments}
                          onPressAuthor={handlePressAuthor}
                          onPressOptions={handleOpenOptions}
                        />
                      ))}
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      ) : (
        /* 2. REELS VERTICAL SNAPPING FULL-SCREEN (Edge-to-Edge) */
        <View style={styles.reelsFullContainer}>
          <ReelsFeedView
            onOpenComments={handleOpenReelComments}
            onPressAuthor={handlePressAuthor}
          />
          {/* Floating Header on top of Reels */}
          <FeedHeader
            activeTab={homeTab}
            onChangeTab={setHomeTab}
            onPressAdd={() => setIsCreateModalVisible(true)}
          />
        </View>
      )}

      {/* Create Post / Add Story Modal */}
      <CreatePostModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onCreatePost={handleCreatePost}
        onCreateStory={handleCreateStory}
      />

      {/* Story Viewer Modal */}
      <StoryViewerModal
        visible={isStoryViewerVisible}
        stories={storyGroups}
        initialStoryIndex={selectedStoryGroupIndex}
        onClose={() => setIsStoryViewerVisible(false)}
      />

      {/* Comments Sheet Modal */}
      <CommentsSheetModal
        visible={isCommentsVisible}
        post={selectedPostForComments}
        onClose={() => setIsCommentsVisible(false)}
      />

      {/* Post Options & Deletion Modal */}
      <PostOptionsModal
        visible={isOptionsModalVisible}
        post={selectedPostForOptions}
        onClose={() => setIsOptionsModalVisible(false)}
        onDeletePost={handleDeletePost}
        onToggleSave={handleToggleSave}
      />

      {/* Reel Comments Sheet Modal */}
      <ReelCommentsSheetModal
        visible={isReelCommentsVisible}
        reel={selectedReelForComments}
        onClose={() => setIsReelCommentsVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
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
  scrollContent: {
    paddingBottom: BottomTabInset + Spacing.six,
  },
  postsList: {
    marginTop: Spacing.two,
  },
  reelsFullContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    position: 'relative',
  },
});
