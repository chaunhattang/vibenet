import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { PlusIcon, SendIcon, SmileIcon } from '../../assets/Icon';

type ChatComposerProps = {
  onSend: (content: string) => void;
};

export default function ChatComposer({ onSend }: ChatComposerProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message.trim());
    setMessage('');
  };

  return (
    <View className="p-4 bg-gray-50 dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-white/5">
      <View className="flex-row items-center bg-white dark:bg-[#171717] rounded-full pl-1 pr-2 py-1 border border-gray-200 dark:border-white/5">
        <Pressable className="p-2 rounded-full active:bg-gray-100 dark:active:bg-white/5">
          <PlusIcon size={20} color="#9CA3AF" />
        </Pressable>

        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Whisper something..."
          placeholderTextColor="#9CA3AF"
          textBreakStrategy="simple"
          className="flex-1 text-sm text-gray-900 dark:text-gray-200 px-2"
        />

        <Pressable className="p-2 rounded-full active:bg-gray-100 dark:active:bg-white/5">
          <SmileIcon size={20} />
        </Pressable>

        <Pressable
          onPress={handleSend}
          disabled={!message.trim()}
          className={`p-2.5 rounded-full ml-1 ${
            message.trim() ? 'bg-indigo-600' : 'bg-indigo-600/40'
          }`}
        >
          <SendIcon size={16} />
        </Pressable>
      </View>
    </View>
  );
}
