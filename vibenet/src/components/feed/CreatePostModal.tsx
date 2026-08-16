import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Radii, Spacing, Typography, MaxContentWidth } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import * as postsApi from '../../services/api/posts';
import * as storiesApi from '../../services/api/stories';
import { PostResponse, StoryItemResponse } from '../../services/api/types';
import { resolveMediaUrl } from '../../services/config';

interface PickedMedia {
  uri: string;
  fileName: string;
  mimeType: string;
  isVideo: boolean;
}

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onCreatePost: (newPost: PostResponse) => void;
  onCreateStory: (newStory: StoryItemResponse) => void;
}

type PostContentType = 'media' | 'text' | 'video';

const GRADIENT_PRESETS: { name: string; colors: [string, string, ...string[]] }[] = [
  { name: 'Sunset', colors: ['#833AB4', '#FD1D1D', '#FCAF45'] },
  { name: 'Midnight', colors: ['#0D0E11', '#1F242D', '#2C303B'] },
  { name: 'Neon Purple', colors: ['#4A00E0', '#8E2DE2'] },
  { name: 'Emerald', colors: ['#059669', '#10B981', '#34D399'] },
  { name: 'Ocean', colors: ['#0052D4', '#4364F7', '#6FB1FC'] },
];

const SUGGESTED_TAGS = ['#vibenet', '#foryourpage', '#photography', '#minimal', '#tokyo', '#vibes'];

function guessMime(uri: string, isVideo: boolean): string {
  const ext = uri.split('.').pop()?.toLowerCase();
  if (isVideo) return ext === 'mov' ? 'video/quicktime' : 'video/mp4';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}

// RN's fetch/XHR-based FormData accepts { uri, name, type } file descriptors natively.
function toFormFile(media: PickedMedia) {
  return { uri: media.uri, name: media.fileName, type: media.mimeType } as unknown as Blob;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  onCreatePost,
  onCreateStory,
}) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'post' | 'story'>('post');
  const [contentType, setContentType] = useState<PostContentType>('media');

  // Media items list (supports multiple images/videos)
  const [mediaList, setMediaList] = useState<PickedMedia[]>([]);
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);

  // Text-only state — sent to the backend as Post.textGradient for text-only posts
  const [selectedGradient, setSelectedGradient] = useState<[string, string, ...string[]]>(GRADIENT_PRESETS[0].colors);

  // Details
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatarUrl = resolveMediaUrl(user?.profileResponse?.avatarUrl);
  const displayName = user?.profileResponse?.fullName || user?.username || '';

  // Gallery Picker Function
  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow gallery access to pick your photos and videos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: mode === 'post',
        quality: 0.9,
        selectionLimit: 5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const picked: PickedMedia[] = result.assets.map((asset, idx) => {
          const isVideo = asset.type === 'video';
          return {
            uri: asset.uri,
            fileName: asset.fileName || `upload-${Date.now()}-${idx}.${isVideo ? 'mp4' : 'jpg'}`,
            mimeType: asset.mimeType || guessMime(asset.uri, isVideo),
            isVideo,
          };
        });

        setContentType(picked[0].isVideo ? 'video' : 'media');
        setMediaList(picked);
        setCurrentMediaIdx(0);
      }
    } catch (err) {
      console.warn('Gallery pick error:', err);
    }
  };

  const handleRemoveMedia = (index: number) => {
    if (mediaList.length <= 1) return;
    setMediaList((prev) => prev.filter((_, i) => i !== index));
    if (currentMediaIdx >= mediaList.length - 1) {
      setCurrentMediaIdx(Math.max(0, mediaList.length - 2));
    }
  };

  const handleAddTag = (tag: string) => {
    if (!caption.includes(tag)) {
      setCaption((prev) => (prev ? `${prev} ${tag}` : tag));
    }
  };

  const resetAndClose = () => {
    setCaption('');
    setLocation('');
    setMediaList([]);
    setCurrentMediaIdx(0);
    setContentType('media');
    setMode('post');
    onClose();
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (contentType !== 'text' && mediaList.length === 0) {
      Alert.alert('Add media', 'Pick at least one photo or video, or switch to Text Only.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'post') {
        const form = new FormData();
        form.append('textContent', caption.trim());
        if (location.trim()) form.append('location', location.trim());
        if (contentType !== 'text') {
          mediaList.forEach((media) => {
            form.append('mediaFiles', toFormFile(media));
          });
        } else {
          selectedGradient.forEach((color) => form.append('textGradient', color));
        }
        const created = await postsApi.createPost(form);
        onCreatePost(created);
      } else {
        const form = new FormData();
        form.append('mediaType', contentType === 'video' ? 'VIDEO' : 'PHOTO');
        if (caption.trim()) form.append('caption', caption.trim());
        form.append('mediaFile', toFormFile(mediaList[0]));
        const created = await storiesApi.uploadStory(form);
        onCreateStory(created);
      }
      resetAndClose();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to share');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            {/* Mode Switcher */}
            <View style={styles.modeSwitcher}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setMode('post')}
                style={[styles.modePill, mode === 'post' && styles.activeModePill]}>
                <Text style={[styles.modeText, mode === 'post' && styles.activeModeText]}>
                  New Post
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setMode('story')}
                style={[styles.modePill, mode === 'story' && styles.activeModePill]}>
                <Text style={[styles.modeText, mode === 'story' && styles.activeModeText]}>
                  Add Story
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={styles.shareBtn}>
              <Text style={styles.shareText}>
                {isSubmitting ? 'Sharing...' : 'Share'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* User Row */}
            <View style={styles.userRow}>
              <Image source={{ uri: avatarUrl }} style={styles.userAvatar} />
              <View>
                <Text style={styles.userName}>{displayName}</Text>
                <View style={styles.audienceBadge}>
                  <Feather name="globe" size={11} color={Colors.textSecondary} />
                  <Text style={styles.audienceText}>
                    {mode === 'post' ? 'Public Feed' : '24h Story'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Content Type Selector Row (Photos vs Text-Only vs Video) */}
            {mode === 'post' && (
              <View style={styles.typeSelectorContainer}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setContentType('media')}
                  style={[styles.typeBtn, contentType === 'media' && styles.activeTypeBtn]}>
                  <Ionicons
                    name="images-outline"
                    size={16}
                    color={contentType === 'media' ? '#FFFFFF' : Colors.textPrimary}
                  />
                  <Text
                    style={[
                      styles.typeBtnText,
                      contentType === 'media' && styles.activeTypeBtnText,
                    ]}>
                    Photos / Carousel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setContentType('text')}
                  style={[styles.typeBtn, contentType === 'text' && styles.activeTypeBtn]}>
                  <MaterialIcons
                    name="text-fields"
                    size={16}
                    color={contentType === 'text' ? '#FFFFFF' : Colors.textPrimary}
                  />
                  <Text
                    style={[
                      styles.typeBtnText,
                      contentType === 'text' && styles.activeTypeBtnText,
                    ]}>
                    Text Only
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setContentType('video')}
                  style={[styles.typeBtn, contentType === 'video' && styles.activeTypeBtn]}>
                  <Ionicons
                    name="videocam-outline"
                    size={16}
                    color={contentType === 'video' ? '#FFFFFF' : Colors.textPrimary}
                  />
                  <Text
                    style={[
                      styles.typeBtnText,
                      contentType === 'video' && styles.activeTypeBtnText,
                    ]}>
                    Video
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 1. MEDIA PREVIEW (FOR PHOTOS / VIDEOS / STORIES) */}
            {contentType !== 'text' ? (
              <View style={[styles.mediaPreviewContainer, mode === 'story' && styles.storyAspect]}>
                {mediaList.length > 0 ? (
                  <Image
                    source={{ uri: mediaList[currentMediaIdx]?.uri || mediaList[0].uri }}
                    style={styles.mediaImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.emptyMediaPlaceholder}>
                    <Ionicons name="image-outline" size={32} color="rgba(255,255,255,0.5)" />
                  </View>
                )}

                {/* Video Play Badge */}
                {contentType === 'video' && mediaList.length > 0 && (
                  <View style={styles.videoBadge}>
                    <Ionicons name="play" size={28} color="#FFFFFF" />
                  </View>
                )}

                {/* Multiple Images Carousel Badge */}
                {mediaList.length > 1 && (
                  <View style={styles.carouselCounterBadge}>
                    <Text style={styles.carouselCounterText}>
                      {currentMediaIdx + 1}/{mediaList.length}
                    </Text>
                  </View>
                )}

                {/* Gallery Picker Action Button Floating on Preview */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handlePickFromGallery}
                  style={styles.pickGalleryFloatingBtn}>
                  <Ionicons name="folder-open" size={16} color="#FFFFFF" />
                  <Text style={styles.pickGalleryText}>Choose from Device</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* 2. TEXT-ONLY GRADIENT PREVIEW */
              <LinearGradient
                colors={selectedGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.textOnlyPreviewCard}>
                <Text style={styles.textOnlyPreviewContent}>
                  {caption || 'Tap below to type your thoughts & quote...'}
                </Text>
              </LinearGradient>
            )}

            {/* Multiple Photos Thumbnails Row */}
            {contentType === 'media' && mediaList.length > 0 && (
              <View style={styles.multiThumbSection}>
                <View style={styles.multiThumbHeader}>
                  <Text style={styles.sectionLabel}>
                    SELECTED PHOTOS ({mediaList.length}/5)
                  </Text>
                  <TouchableOpacity onPress={handlePickFromGallery} style={styles.addMoreBtn}>
                    <Feather name="plus" size={14} color={Colors.accentBlue} />
                    <Text style={styles.addMoreText}>Add from Gallery</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.multiThumbRow}>
                  {mediaList.map((media, idx) => (
                    <TouchableOpacity
                      key={media.uri + idx}
                      activeOpacity={0.8}
                      onPress={() => setCurrentMediaIdx(idx)}
                      style={[
                        styles.multiThumbItem,
                        currentMediaIdx === idx && styles.selectedMultiThumb,
                      ]}>
                      <Image source={{ uri: media.uri }} style={styles.multiThumbImg} />
                      {mediaList.length > 1 && (
                        <TouchableOpacity
                          onPress={() => handleRemoveMedia(idx)}
                          style={styles.removeThumbBtn}>
                          <Ionicons name="close" size={10} color="#FFFFFF" />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Gradient Theme Picker (for Text-Only Posts) */}
            {contentType === 'text' && (
              <View style={styles.gradientPickerSection}>
                <Text style={styles.sectionLabel}>CHOOSE COLOR THEME</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gradientScroll}>
                  {GRADIENT_PRESETS.map((preset) => (
                    <TouchableOpacity
                      key={preset.name}
                      activeOpacity={0.8}
                      onPress={() => setSelectedGradient(preset.colors)}
                      style={[
                        styles.gradientThumbBtn,
                        selectedGradient === preset.colors && styles.selectedGradientBorder,
                      ]}>
                      <LinearGradient
                        colors={preset.colors}
                        style={styles.gradientThumbInner}
                      />
                      <Text style={styles.gradientName}>{preset.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Caption Input */}
            <View style={styles.inputSection}>
              <TextInput
                placeholder={
                  contentType === 'text'
                    ? 'Write your thoughts or message...'
                    : 'Write a caption for your post... #vibenet'
                }
                placeholderTextColor={Colors.textPlaceholder}
                value={caption}
                onChangeText={setCaption}
                multiline
                numberOfLines={3}
                style={styles.captionInput}
              />
            </View>

            {/* Location Input */}
            {mode === 'post' && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
                <TextInput
                  placeholder="Add location"
                  placeholderTextColor={Colors.textPlaceholder}
                  value={location}
                  onChangeText={setLocation}
                  style={styles.locationInput}
                />
              </View>
            )}

            {/* Suggested Hashtag Chips */}
            {mode === 'post' && (
              <View style={styles.tagsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.tagsRow}>
                    {SUGGESTED_TAGS.map((tag) => (
                      <TouchableOpacity
                        key={tag}
                        activeOpacity={0.7}
                        onPress={() => handleAddTag(tag)}
                        style={styles.tagChip}>
                        <Text style={styles.tagChipText}>{tag}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cancelBtn: {
    padding: Spacing.one,
  },
  cancelText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F3',
    borderRadius: Radii.pill,
    padding: 3,
  },
  modePill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 5,
    borderRadius: Radii.pill,
  },
  activeModePill: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  modeText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeModeText: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  shareBtn: {
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: Spacing.four,
    paddingVertical: 7,
    borderRadius: Radii.pill,
  },
  shareText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceMuted,
  },
  userName: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  audienceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  audienceText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  typeSelectorContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: Radii.pill,
    backgroundColor: '#F3F4F6',
  },
  activeTypeBtn: {
    backgroundColor: Colors.textPrimary,
  },
  typeBtnText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  activeTypeBtnText: {
    color: '#FFFFFF',
  },
  mediaPreviewContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#111113',
    marginBottom: Spacing.three,
  },
  emptyMediaPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAspect: {
    aspectRatio: 0.75,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselCounterBadge: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  carouselCounterText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  pickGalleryFloatingBtn: {
    position: 'absolute',
    bottom: Spacing.three,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: Spacing.four,
    paddingVertical: 8,
    borderRadius: Radii.pill,
    // @ts-ignore
    backdropFilter: 'blur(10px)',
  },
  pickGalleryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  textOnlyPreviewCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radii.lg,
    padding: Spacing.six,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  textOnlyPreviewContent: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
  },
  multiThumbSection: {
    marginBottom: Spacing.three,
  },
  multiThumbHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addMoreText: {
    ...Typography.caption,
    color: Colors.accentBlue,
    fontWeight: '700',
  },
  multiThumbRow: {
    gap: Spacing.two,
  },
  multiThumbItem: {
    width: 60,
    height: 60,
    borderRadius: Radii.md,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMultiThumb: {
    borderColor: Colors.textPrimary,
  },
  multiThumbImg: {
    width: '100%',
    height: '100%',
  },
  removeThumbBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientPickerSection: {
    marginBottom: Spacing.three,
  },
  gradientScroll: {
    gap: Spacing.two,
  },
  gradientThumbBtn: {
    alignItems: 'center',
    gap: 4,
    padding: 3,
    borderRadius: Radii.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedGradientBorder: {
    borderColor: Colors.textPrimary,
  },
  gradientThumbInner: {
    width: 44,
    height: 44,
    borderRadius: Radii.sm,
  },
  gradientName: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  sectionLabel: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
    marginBottom: Spacing.one,
  },
  inputSection: {
    backgroundColor: '#F7F8FA',
    borderRadius: Radii.md,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  captionInput: {
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 65,
    textAlignVertical: 'top',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F7F8FA',
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    marginBottom: Spacing.three,
  },
  locationInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  tagsContainer: {
    marginBottom: Spacing.four,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  tagChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radii.pill,
  },
  tagChipText: {
    color: Colors.accentBlue,
    fontSize: 12,
    fontWeight: '600',
  },
});
