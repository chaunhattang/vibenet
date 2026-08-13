import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { PlusIcon, SendIcon, SmileIcon } from '../../assets/Icon';
import { C, PLACEHOLDER } from '../../theme/colors';
import { PressableScale } from '../../theme/motion';

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
    <View className="p-4 bg-paper-raised dark:bg-ink-base border-t border-hairline-light dark:border-hairline-dark">
      <View className="flex-row items-center bg-paper-base dark:bg-ink-input rounded-full pl-1 pr-2 py-1 border border-hairline-light dark:border-hairline-dark">
        <PressableScale className="p-2 rounded-full active:bg-paper-raised dark:active:bg-white/5">
          <PlusIcon size={20} color={C.contentFaint} />
        </PressableScale>

        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Whisper something..."
          placeholderTextColor={PLACEHOLDER}
          textBreakStrategy="simple"
          className="flex-1 text-sm text-content-strong dark:text-content-strong-dark px-2"
        />

        <PressableScale className="p-2 rounded-full active:bg-paper-raised dark:active:bg-white/5">
          <SmileIcon size={20} />
        </PressableScale>

        <PressableScale
          onPress={handleSend}
          disabled={!message.trim()}
          className={`p-2.5 rounded-full ml-1 ${
            message.trim() ? 'bg-brand' : 'bg-brand/40'
          }`}
        >
          <SendIcon size={16} />
        </PressableScale>
      </View>
    </View>
  );
}
