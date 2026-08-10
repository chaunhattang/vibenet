import { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloseIcon, ImageIcon } from '../../assets/Icon';
import { PLACEHOLDER } from '../../theme/colors';
import GradientButton from '../ui/GradientButton';

type CreateWhisperModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (content: string, durationMinutes: number) => void;
};

const DURATIONS = [
  { label: '1H', minutes: 60 },
  { label: '6H', minutes: 360 },
  { label: '12H', minutes: 720 },
  { label: '24H', minutes: 1440 },
];

export default function CreateWhisperModal({
  visible,
  onClose,
  onSubmit,
}: CreateWhisperModalProps) {
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState('');
  const [duration, setDuration] = useState(DURATIONS[1].minutes);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content.trim(), duration);
    setContent('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
        <View
          style={{ paddingBottom: insets.bottom + 16 }}
          className="bg-paper-base dark:bg-ink-overlay rounded-t-hero p-5"
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-headline text-content-strong dark:text-content-strong-dark">
              Create Whisper
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <CloseIcon />
            </Pressable>
          </View>

          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Share a thought or a moment before it fades..."
            placeholderTextColor={PLACEHOLDER}
            multiline
            numberOfLines={4}
            autoFocus
            textBreakStrategy="simple"
            className="min-h-[100px] text-base text-content-strong dark:text-content-strong-dark bg-paper-raised dark:bg-ink-input rounded-card p-4"
          />

          <Pressable className="flex-row items-center gap-2 mt-3 p-3 rounded-card border border-dashed border-hairline-light dark:border-hairline-dark">
            <ImageIcon size={18} />
            <Text className="text-sm text-content-muted dark:text-content-muted-dark">
              Add photo or video
            </Text>
          </Pressable>

          <Text className="text-xs font-semibold text-content-faint dark:text-content-faint-dark tracking-wider mt-5 mb-2">
            VANISH AFTER
          </Text>
          <View className="flex-row gap-2">
            {DURATIONS.map(d => (
              <Pressable
                key={d.minutes}
                onPress={() => setDuration(d.minutes)}
                className={`px-4 py-2 rounded-full border ${
                  duration === d.minutes
                    ? 'bg-brand border-brand'
                    : 'bg-transparent border-hairline-light dark:border-hairline-dark'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    duration === d.minutes
                      ? 'text-white'
                      : 'text-content-muted dark:text-content-muted-dark'
                  }`}
                >
                  {d.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <GradientButton
            onPress={handleSubmit}
            disabled={!content.trim()}
            label="Whisper it"
            className="mt-6"
          />
        </View>
      </View>
    </Modal>
  );
}
