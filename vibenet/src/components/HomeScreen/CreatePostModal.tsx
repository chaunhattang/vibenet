import { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { CloseIcon, ImageIcon } from '../../assets/Icon';
import { usePosts } from '../../contexts/PostsContext';
import { PLACEHOLDER } from '../../theme/colors';
import { CreatePostInput } from '../../types';
import GradientButton from '../ui/GradientButton';

type CreatePostModalProps = {
  visible: boolean;
  onClose: () => void;
};

type PickedMedia = { uri: string; mimeType: string; fileName: string };

export default function CreatePostModal({ visible, onClose }: CreatePostModalProps) {
  const insets = useSafeAreaInsets();
  const { createPost } = usePosts();
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<PickedMedia[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setCaption('');
    setMedia([]);
  };

  const handlePickMedia = async () => {
    const result = await launchImageLibrary({ mediaType: 'mixed', selectionLimit: 0 });
    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert('Could not open gallery', result.errorMessage ?? 'Please try again.');
      return;
    }
    const picked = (result.assets ?? [])
      .filter(a => !!a.uri)
      .map(a => {
        const mimeType = a.type ?? 'image/jpeg';
        return {
          uri: a.uri as string,
          mimeType,
          fileName: a.fileName ?? `post.${mimeType.startsWith('video') ? 'mp4' : 'jpg'}`,
        };
      });
    setMedia(prev => [...prev, ...picked]);
  };

  const handleSubmit = async () => {
    const text = caption.trim();
    if (!text && media.length === 0) return;
    setSubmitting(true);
    try {
      const input: CreatePostInput = { textContent: text || undefined, media };
      await createPost(input);
      reset();
      onClose();
    } catch (err) {
      Alert.alert('Could not post', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const canSubmit = (!!caption.trim() || media.length > 0) && !submitting;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" onPress={handleClose} />
        <View
          style={{ paddingBottom: insets.bottom + 16 }}
          className="bg-paper-base dark:bg-ink-overlay rounded-t-hero p-5"
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-headline text-content-strong dark:text-content-strong-dark">
              Create Post
            </Text>
            <Pressable onPress={handleClose} hitSlop={8}>
              <CloseIcon />
            </Pressable>
          </View>

          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Write a caption..."
            placeholderTextColor={PLACEHOLDER}
            multiline
            numberOfLines={4}
            autoFocus
            textBreakStrategy="simple"
            className="min-h-[80px] text-base text-content-strong dark:text-content-strong-dark bg-paper-raised dark:bg-ink-input rounded-card p-4"
          />

          {media.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
              <View className="flex-row gap-2">
                {media.map((m, i) => (
                  <View key={i} className="relative">
                    <Image
                      source={{ uri: m.uri }}
                      style={{ width: 84, height: 84, borderRadius: 12 }}
                    />
                    <Pressable
                      onPress={() => setMedia(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5"
                      hitSlop={6}
                    >
                      <CloseIcon size={12} color="#fff" />
                    </Pressable>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          <Pressable
            onPress={handlePickMedia}
            className="flex-row items-center gap-2 mt-3 p-3 rounded-card border border-dashed border-hairline-light dark:border-hairline-dark"
          >
            <ImageIcon size={18} />
            <Text className="text-sm text-content-muted dark:text-content-muted-dark">
              Add photos or videos
            </Text>
          </Pressable>

          <GradientButton
            onPress={handleSubmit}
            disabled={!canSubmit}
            loading={submitting}
            label={submitting ? 'Posting...' : 'Post'}
            className="mt-6"
          />
        </View>
      </View>
    </Modal>
  );
}
