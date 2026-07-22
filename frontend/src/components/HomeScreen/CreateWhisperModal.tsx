import { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloseIcon, ImageIcon } from '../../assets/Icon';

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
          className="bg-white dark:bg-[#181825] rounded-t-3xl p-5"
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
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
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            autoFocus
            textBreakStrategy="simple"
            className="min-h-[100px] text-base text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-black/20 rounded-2xl p-4"
          />

          <Pressable className="flex-row items-center gap-2 mt-3 p-3 rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
            <ImageIcon size={18} />
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Add photo or video
            </Text>
          </Pressable>

          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider mt-5 mb-2">
            VANISH AFTER
          </Text>
          <View className="flex-row gap-2">
            {DURATIONS.map(d => (
              <Pressable
                key={d.minutes}
                onPress={() => setDuration(d.minutes)}
                className={`px-4 py-2 rounded-full border ${
                  duration === d.minutes
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'bg-transparent border-gray-200 dark:border-white/10'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    duration === d.minutes
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {d.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={!content.trim()}
            className="mt-6 bg-indigo-600 rounded-full py-3.5 items-center disabled:opacity-50"
          >
            <Text className="text-white font-semibold text-base">
              Whisper it
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
