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
import { StoryUserGroupResponse } from '../../services/api/types';
import { resolveMediaUrl } from '../../services/config';
import { Colors, Spacing, Typography, Radii } from '../../constants/theme';

interface StoryHighlightBarProps {
  stories: StoryUserGroupResponse[];
  onSelectStory: (group: StoryUserGroupResponse, index: number) => void;
}

export const StoryHighlightBar: React.FC<StoryHighlightBarProps> = ({
  stories,
  onSelectStory,
}) => {
  if (stories.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {stories.map((group, index) => {
          const isViewed = !group.hasUnseenStories;
          const ringGradient = isViewed
            ? null
            : (Colors.storyGradient as [string, string, ...string[]]);

          const displayName = group.fullName?.split(' ')[0] || group.username;

          return (
            <View key={group.userId}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onSelectStory(group, index)}
                style={styles.storyBubbleItem}>
                <View style={styles.avatarWrapper}>
                  {isViewed ? (
                    <View style={styles.viewedBorder}>
                      <Image
                        source={{ uri: resolveMediaUrl(group.avatarUrl) }}
                        style={styles.avatarImage}
                      />
                    </View>
                  ) : (
                    <LinearGradient
                      colors={ringGradient!}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gradientRing}>
                      <View style={styles.avatarInner}>
                        <Image
                          source={{ uri: resolveMediaUrl(group.avatarUrl) }}
                          style={styles.avatarImage}
                        />
                      </View>
                    </LinearGradient>
                  )}
                </View>

                <Text numberOfLines={1} style={styles.storyName}>
                  {displayName}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.three,
    backgroundColor: Colors.bgMain,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.four + 2,
    alignItems: 'center',
  },
  storyBubbleItem: {
    alignItems: 'center',
    width: 76,
  },
  avatarWrapper: {
    position: 'relative',
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    padding: 2.5,
  },
  viewedBorder: {
    width: 74,
    height: 74,
    borderRadius: 37,
    padding: 2.5,
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
  storyName: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 6,
    textAlign: 'center',
    width: '100%',
  },
});
