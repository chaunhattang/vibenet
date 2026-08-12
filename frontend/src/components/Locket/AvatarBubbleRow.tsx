import { ScrollView, Text, View } from 'react-native';
import { PressableScale } from '../../theme/motion';
import { MomentFeedItem } from '../../types';
import Avatar from '../ui/Avatar';

type AvatarBubbleRowProps = {
  moments: MomentFeedItem[];
  selectedId: string | null;
  onSelect: (index: number) => void;
};

// Locket's friend-switcher strip — a row of circular widgets, unread ones lit up with a
// bright ring, read ones dimmed. Tapping swaps the big featured widget above, it never
// navigates anywhere on its own.
export default function AvatarBubbleRow({ moments, selectedId, onSelect }: AvatarBubbleRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
    >
      {moments.map((moment, index) => {
        const unseen = moment.viewedAt === null;
        const selected = moment.momentId === selectedId;
        return (
          <PressableScale
            key={moment.momentId}
            onPress={() => onSelect(index)}
            style={{ alignItems: 'center', width: 60 }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: selected ? 3 : unseen ? 2.5 : 0,
                borderColor: selected ? '#FFC542' : unseen ? '#FFFFFF' : 'transparent',
                opacity: unseen || selected ? 1 : 0.45,
              }}
            >
              <Avatar uri={moment.senderAvatarUrl} size={selected ? 50 : 48} />
            </View>
            <Text
              numberOfLines={1}
              style={{
                color: '#FFFFFF',
                fontSize: 11,
                fontWeight: selected ? '700' : '500',
                marginTop: 6,
                opacity: unseen || selected ? 0.95 : 0.5,
                maxWidth: 60,
              }}
            >
              {moment.senderName.split(' ')[0]}
            </Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}
