import { Pressable, Text, View } from 'react-native';

// Fixed set — backend upserts whatever emoji string is sent, no server-side allow-list,
// but the UI keeps it to a small fixed row (matches real Locket's reaction picker).
const REACTION_EMOJIS = ['❤️', '🔥', '😂', '😮', '👍'];

type ReactionBarProps = {
  myReaction: string | null;
  onReact: (emoji: string) => void;
};

export default function ReactionBar({ myReaction, onReact }: ReactionBarProps) {
  return (
    <View className="flex-row items-center gap-2 bg-black/40 rounded-full px-3 py-2 self-start">
      {REACTION_EMOJIS.map(emoji => (
        <Pressable
          key={emoji}
          onPress={() => onReact(emoji)}
          hitSlop={6}
          className={`w-8 h-8 rounded-full items-center justify-center ${
            myReaction === emoji ? 'bg-white/30' : ''
          }`}
        >
          <Text className="text-lg">{emoji}</Text>
        </Pressable>
      ))}
    </View>
  );
}
