import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { StoryUserGroupResponse } from '../../services/api/types';
import * as storiesApi from '../../services/api/stories';
import { resolveMediaUrl } from '../../services/config';
import { useAuth } from '../../contexts/AuthContext';
import { Radii, Spacing, Typography } from '../../constants/theme';

interface StoryViewerModalProps {
  visible: boolean;
  stories: StoryUserGroupResponse[];
  initialStoryIndex?: number;
  onClose: () => void;
  onDeleteStory?: (storyId: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  visible,
  stories,
  initialStoryIndex = 0,
  onClose,
  onDeleteStory,
}) => {
  const { user } = useAuth();
  const [currentGroupIdx, setCurrentGroupIdx] = useState(initialStoryIndex);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const viewedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (visible) {
      setCurrentGroupIdx(initialStoryIndex);
      setCurrentFrameIdx(0);
    }
  }, [visible, initialStoryIndex]);

  const activeGroup = stories[currentGroupIdx] || stories[0];
  const activeFrame = activeGroup?.stories[currentFrameIdx] || activeGroup?.stories[0];
  const totalFrames = activeGroup?.stories?.length || 1;

  const progressAnim = useRef(new Animated.Value(0)).current;

  // Mark the frame currently on screen as viewed (once per story id).
  useEffect(() => {
    if (!visible || !activeFrame?.id) return;
    const storyId = activeFrame.id;
    if (viewedRef.current.has(storyId)) return;
    viewedRef.current.add(storyId);
    storiesApi.markStoryViewed(storyId).catch(() => {
      viewedRef.current.delete(storyId);
    });
  }, [visible, activeFrame?.id]);

  const handleNext = useCallback(() => {
    if (currentFrameIdx < totalFrames - 1) {
      setCurrentFrameIdx((prev) => prev + 1);
    } else if (currentGroupIdx < stories.length - 1) {
      setCurrentGroupIdx((prev) => prev + 1);
      setCurrentFrameIdx(0);
    } else {
      onClose();
    }
  }, [currentFrameIdx, totalFrames, currentGroupIdx, stories.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentFrameIdx > 0) {
      setCurrentFrameIdx((prev) => prev - 1);
    } else if (currentGroupIdx > 0) {
      setCurrentGroupIdx((prev) => prev - 1);
      setCurrentFrameIdx(0);
    }
  }, [currentFrameIdx, currentGroupIdx]);

  const isOwnStory = !!user && activeGroup?.userId === user.id;

  const handleDeleteStory = () => {
    if (!activeFrame) return;
    const storyId = activeFrame.id;
    setIsPaused(true);
    Alert.alert('Delete story?', 'This story will be removed for everyone.', [
      { text: 'Cancel', style: 'cancel', onPress: () => setIsPaused(false) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await storiesApi.deleteStory(storyId);
            onDeleteStory?.(storyId);
            onClose();
          } catch {
            Alert.alert('Error', 'Failed to delete story. Please try again.');
            setIsPaused(false);
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    if (!visible || !activeGroup) return;

    progressAnim.setValue(0);
    if (!isPaused && !isDeleting) {
      const anim = Animated.timing(progressAnim, {
        toValue: 1,
        duration: (activeFrame?.durationSeconds || 5) * 1000,
        useNativeDriver: false,
      });

      anim.start(({ finished }) => {
        if (finished) {
          handleNext();
        }
      });

      return () => {
        progressAnim.stopAnimation();
      };
    }
  }, [currentGroupIdx, currentFrameIdx, isPaused, isDeleting, visible, activeGroup, activeFrame, handleNext, progressAnim]);

  const handlePressZone = (e: any) => {
    const x = e.nativeEvent.locationX;
    if (x < SCREEN_WIDTH * 0.3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  if (!visible || !activeGroup || !activeFrame) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />
        {/* Story Background Image */}
        <Image
          source={{ uri: resolveMediaUrl(activeFrame.mediaUrl) }}
          style={styles.storyImage}
          contentFit="cover"
        />

        {/* Dark subtle gradient overlays */}
        <View style={styles.topGradient} />
        <View style={styles.bottomGradient} />

        {/* Touch zones for Seek Left / Right and Hold to Pause */}
        <TouchableWithoutFeedback
          onPress={handlePressZone}
          onPressIn={() => setIsPaused(true)}
          onPressOut={() => setIsPaused(false)}>
          <View style={styles.touchArea} />
        </TouchableWithoutFeedback>

        {/* Top Header & Segmented Progress Bars */}
        <View style={styles.topOverlay}>
          {/* Segmented Progress Bars */}
          <View style={styles.progressRow}>
            {activeGroup.stories.map((_, idx) => (
              <View key={idx} style={styles.progressBarTrack}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width:
                        idx < currentFrameIdx
                          ? '100%'
                          : idx === currentFrameIdx
                          ? progressAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', '100%'],
                            })
                          : '0%',
                    },
                  ]}
                />
              </View>
            ))}
          </View>

          {/* User Info & Close Button */}
          <View style={styles.userInfoRow}>
            <View style={styles.userLeft}>
              <Image
                source={{ uri: resolveMediaUrl(activeGroup.avatarUrl) }}
                style={styles.authorAvatar}
              />
              <View>
                <Text style={styles.authorName}>
                  {activeGroup.fullName || activeGroup.username}
                </Text>
                <Text style={styles.storyTime}>
                  {new Date(activeFrame.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>

            <View style={styles.headerActionsRow}>
              {isOwnStory && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  disabled={isDeleting}
                  onPress={handleDeleteStory}
                  style={styles.closeButton}>
                  <Ionicons name="trash-outline" size={21} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onClose}
                style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Caption Overlay */}
        {activeFrame.caption ? (
          <View style={styles.captionContainer}>
            <Text style={styles.captionText}>{activeFrame.caption}</Text>
          </View>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  storyImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  touchArea: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  topOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: Spacing.four,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.three,
  },
  progressBarTrack: {
    flex: 1,
    height: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  authorName: {
    ...Typography.bodyMedium,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  storyTime: {
    ...Typography.caption,
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 10,
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionContainer: {
    position: 'absolute',
    bottom: 90,
    left: Spacing.four,
    right: Spacing.four,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two + 2,
    borderRadius: Radii.lg,
    zIndex: 10,
  },
  captionText: {
    ...Typography.bodyMedium,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
