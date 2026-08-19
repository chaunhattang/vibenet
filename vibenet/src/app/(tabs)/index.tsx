import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { FeedHeader } from '../../components/feed/FeedHeader';
import { StoryHighlightBar } from '../../components/feed/StoryHighlightBar';
import { PostCard } from '../../components/feed/PostCard';
import { CommentsSheetModal } from '../../components/feed/CommentsSheetModal';
import { StoryViewerModal } from '../../components/stories/StoryViewerModal';
import { CreatePostModal } from '../../components/feed/CreatePostModal';
import { PostOptionsModal } from '../../components/feed/PostOptionsModal';
import { EveryoneMomentsView } from '../../components/everyone/EveryoneMomentsView';
import { ReelsFeedView } from '../../components/reels/ReelsFeedView';
import { FeedSkeleton } from '../../components/skeletons/FeedSkeleton';
import * as postsApi from '../../services/api/posts';
import * as storiesApi from '../../services/api/stories';
import { PostResponse, StoryUserGroupResponse } from '../../services/api/types';
import { Colors, Spacing, BottomTabInset, MaxContentWidth } from '../../constants/theme';

type HomeTab = 'feed' | 'reels' | 'everyone';

const VIDEO_EXT_RE = /\.(mp4|mov|webm|m4v)$/i;

export default function FeedScreen() {
  const router = useRouter();
  const [homeTab, setHomeTab] = useState<HomeTab>('feed');
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

  // "Reels" is just the video Posts from the Feed, played back full-screen —
  // no separate reel upload flow or backend entity.
  const videoPosts = useMemo(
    () => posts.filter((p) => VIDEO_EXT_RE.test(p.mediaUrl[0] ?? '')),
    [posts]
  );

  const loadFeed = useCallback(async () => {
    const [feedPage, stories] = await Promise.all([
      postsApi.getFeed(0, 20),
      storiesApi.getStoriesFeed(),
    ]);
    setPosts(feedPage.data);
    setStoryGroups(stories);
  }, []);

  // Reload every time the Feed tab gains focus (returning from another tab/screen,
  // posting a comment, coming back from background, etc.) so reaction/comment counts
  // and content stay correct even if a live WebSocket update was missed while away.
  const hasLoadedOnceRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedOnceRef.current) {
        setIsLoading(true);
        loadFeed().finally(() => {
          setIsLoading(false);
          hasLoadedOnceRef.current = true;
        });
      } else {
        loadFeed().catch((err) => console.warn('Failed to refresh feed', err));
      }
    }, [loadFeed])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFeed().finally(() => setRefreshing(false));
  }, [loadFeed]);

  // Reels has no live update mechanism of its own — it just re-reads whatever the
  // Feed already has, so re-fetch every time the tab is switched to, to pick up
  // likes/comments made elsewhere while this screen was open.
  useEffect(() => {
    if (homeTab !== 'reels') return;
    loadFeed().catch((err) => console.warn('Failed to refresh reels', err));
  }, [homeTab, loadFeed]);

  const handleSelectStory = (group: StoryUserGroupResponse, index: number) => {
    setSelectedStoryGroupIndex(index);
    setIsStoryViewerVisible(true);
  };

  const handleOpenComments = (post: PostResponse) => {
    setSelectedPostForComments(post);
    setIsCommentsVisible(true);
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
      <StatusBar
        barStyle={homeTab === 'reels' ? 'light-content' : 'dark-content'}
        translucent={true}
        backgroundColor="transparent"
      />

      {homeTab === 'reels' ? (
        /* 3. REELS — vertical snapping full-screen video feed (edge-to-edge) */
        <View style={styles.reelsFullContainer}>
          <ReelsFeedView
            posts={videoPosts}
            onOpenComments={handleOpenComments}
            onPressAuthor={handlePressAuthor}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
          {/* Floating Header on top of Reels */}
          <FeedHeader
            activeTab={homeTab}
            onChangeTab={setHomeTab}
            onPressAdd={() => setIsCreateModalVisible(true)}
          />
        </View>
      ) : (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.contentWrapper}>
              <FeedHeader
                activeTab={homeTab}
                onChangeTab={setHomeTab}
                onPressAdd={() => setIsCreateModalVisible(true)}
              />

              {homeTab === 'feed' ? (
                /* 1. PHOTO FEED */
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
              ) : (
                /* 2. EVERYONE — swipe through friends' moments sent via "Send a Moment" */
                <EveryoneMomentsView />
              )}
            </View>
          </View>
        </SafeAreaView>
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
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.bgMain,
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
