import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FeedHeader } from '../../components/feed/FeedHeader';
import { StoryHighlightBar } from '../../components/feed/StoryHighlightBar';
import { PostCard } from '../../components/feed/PostCard';
import { CommentsSheetModal } from '../../components/feed/CommentsSheetModal';
import { StoryViewerModal } from '../../components/stories/StoryViewerModal';
import { MOCK_POSTS, MOCK_STORIES, PostItem, StoryItem } from '../../data/mockData';
import { Colors, Spacing, BottomTabInset, MaxContentWidth } from '../../constants/theme';

export default function FeedScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostItem[]>(MOCK_POSTS);
  const [stories, setStories] = useState<StoryItem[]>(MOCK_STORIES);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [selectedPostForComments, setSelectedPostForComments] = useState<PostItem | null>(null);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number>(0);
  const [isStoryViewerVisible, setIsStoryViewerVisible] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleSelectStory = (story: StoryItem, index: number) => {
    setSelectedStoryIndex(index);
    setIsStoryViewerVisible(true);

    // Mark as viewed
    setStories((prev) =>
      prev.map((s) => (s.id === story.id ? { ...s, isViewed: true } : s))
    );
  };

  const handleOpenComments = (post: PostItem) => {
    setSelectedPostForComments(post);
    setIsCommentsVisible(true);
  };

  const handlePressAuthor = (_authorId: string) => {
    router.push('/(tabs)/profile');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          {/* Top Sticky/Header */}
          <FeedHeader />

          {/* Main Feed Scroll */}
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
            {/* Story Bar */}
            <StoryHighlightBar
              stories={stories}
              onSelectStory={handleSelectStory}
              onAddStory={() => router.push('/(tabs)/locket')}
            />

            {/* Posts List */}
            <View style={styles.postsList}>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onOpenComments={handleOpenComments}
                  onPressAuthor={handlePressAuthor}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Story Viewer Modal */}
        <StoryViewerModal
          visible={isStoryViewerVisible}
          stories={stories}
          initialStoryIndex={selectedStoryIndex}
          onClose={() => setIsStoryViewerVisible(false)}
        />

        {/* Comments Sheet Modal */}
        <CommentsSheetModal
          visible={isCommentsVisible}
          post={selectedPostForComments}
          onClose={() => setIsCommentsVisible(false)}
        />
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
  scrollContent: {
    paddingBottom: BottomTabInset + Spacing.six,
  },
  postsList: {
    marginTop: Spacing.two,
  },
});
