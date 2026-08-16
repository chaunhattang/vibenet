import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StoryItem } from '../../data/mockData';
import { Colors, Spacing, Typography, Radii } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

interface StoryHighlightBarProps {
  stories: StoryItem[];
  onSelectStory: (story: StoryItem, index: number) => void;
  onAddStory?: () => void;
}

export const StoryHighlightBar: React.FC<StoryHighlightBarProps> = ({
  stories,
  onSelectStory,
  onAddStory,
}) => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* My Story Item */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onAddStory}
          style={styles.storyBubbleItem}>
          <View style={styles.myAvatarContainer}>
            <Image
              source={{
                uri:
                  user?.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
              }}
              style={styles.avatarImage}
            />
            <View style={styles.plusIconBadge}>
              <Ionicons name="add" size={14} color="#FFFFFF" />
            </View>
          </View>
          <Text numberOfLines={1} style={styles.storyName}>
            Your story
          </Text>
        </TouchableOpacity>

        {/* Other Users' Stories */}
        {stories
          .filter((s) => !s.isMyStory)
          .map((story, index) => {
            const isCloseFriend = story.isCloseFriend;
            const isViewed = story.isViewed;
            const isLive = story.isLive;

            const ringGradient = isCloseFriend
              ? (Colors.closeFriendGradient as [string, string, ...string[]])
              : (Colors.storyGradient as [string, string, ...string[]]);

            return (
              <TouchableOpacity
                key={story.id}
                activeOpacity={0.8}
                onPress={() => onSelectStory(story, index + 1)}
                style={styles.storyBubbleItem}>
                <View style={styles.avatarWrapper}>
                  {isViewed ? (
                    <View style={styles.viewedBorder}>
                      <Image
                        source={{ uri: story.user.avatarUrl }}
                        style={styles.avatarImage}
                      />
                    </View>
                  ) : (
                    <LinearGradient
                      colors={ringGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientRing}>
                      <View style={styles.avatarInner}>
                        <Image
                          source={{ uri: story.user.avatarUrl }}
                          style={styles.avatarImage}
                        />
                      </View>
                    </LinearGradient>
                  )}

                  {isLive && (
                    <View style={styles.liveBadge}>
                      <Text style={styles.liveBadgeText}>LIVE</Text>
                    </View>
                  )}
                </View>

                <Text numberOfLines={1} style={styles.storyName}>
                  {story.user.username}
                </Text>
              </TouchableOpacity>
            );
          })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.two,
    backgroundColor: Colors.bgMain,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
    alignItems: 'center',
  },
  storyBubbleItem: {
    alignItems: 'center',
    width: 68,
  },
  myAvatarContainer: {
    position: 'relative',
    width: 62,
    height: 62,
    borderRadius: 31,
    padding: 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8E8EC',
  },
  avatarWrapper: {
    position: 'relative',
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    padding: 2,
  },
  viewedBorder: {
    width: 62,
    height: 62,
    borderRadius: 31,
    padding: 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: Radii.pill,
    backgroundColor: Colors.surfaceMuted,
  },
  plusIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.accentBlue,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: Colors.statusLive,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: Radii.pill,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  storyName: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textPrimary,
    marginTop: Spacing.one,
    textAlign: 'center',
    width: '100%',
  },
});
