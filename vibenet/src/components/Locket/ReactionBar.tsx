import { Animated, Pressable, Text, View } from 'react-native';
import { usePop } from '../../theme/motion';

// Fixed set — backend upserts whatever emoji string is sent, no server-side allow-list,
// but the UI keeps it to a small fixed row (matches real Locket's reaction picker).
const REACTION_EMOJIS = ['❤️', '🔥', '😂', '😮', '👍'];

type ReactionBarProps = {
  myReaction: string | null;
  onReact: (emoji: string) => void;
  // bg-black/40 only reads correctly over media; on a solid card footer it looks muddy,
  // so callers off-media should pass false.
  onMedia?: boolean;
};

function ReactionButton({
  emoji,
  active,
  onPress,
}: {
  emoji: string;
  active: boolean;
  onPress: () => void;
}) {
  const { scale, pop } = usePop();
  return (
    <Pressable
      onPress={() => {
        pop();
        onPress();
      }}
      hitSlop={6}
      className={`w-8 h-8 rounded-full items-center justify-center ${active ? 'bg-brand/30' : ''}`}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Text className="text-lg">{emoji}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function ReactionBar({ myReaction, onReact, onMedia = true }: ReactionBarProps) {
  return (
    <View
      className={`flex-row items-center gap-2 rounded-full px-3 py-2 self-start ${
        onMedia ? 'bg-black/40' : 'bg-paper-overlay dark:bg-ink-overlay'
      }`}
    >
      {REACTION_EMOJIS.map(emoji => (
        <ReactionButton
          key={emoji}
          emoji={emoji}
          active={myReaction === emoji}
          onPress={() => onReact(emoji)}
        />
      ))}
    </View>
  );
}
