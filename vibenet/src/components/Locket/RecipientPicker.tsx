import { ScrollView, Text, View } from 'react-native';
import { CheckIcon } from '../../assets/Icon';
import { PressableScale } from '../../theme/motion';
import { CloseFriend } from '../../types';
import Avatar from '../ui/Avatar';

type RecipientPickerProps = {
  closeFriends: CloseFriend[];
  selectedIds: Set<string>;
  onToggle: (userId: string) => void;
};

// Locket sends to your close-friends circle by default — this is a row of avatar bubbles
// you tap to drop someone from the send list, not a checklist of rows.
export default function RecipientPicker({ closeFriends, selectedIds, onToggle }: RecipientPickerProps) {
  if (closeFriends.length === 0) {
    return (
      <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, paddingHorizontal: 20 }}>
        You don't have any close friends yet — add some to send them moments.
      </Text>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
    >
      {closeFriends.map(friend => {
        const selected = selectedIds.has(friend.userId);
        return (
          <PressableScale
            key={friend.userId}
            onPress={() => onToggle(friend.userId)}
            style={{ alignItems: 'center', width: 60 }}
          >
            <View style={{ width: 56, height: 56, borderRadius: 28 }}>
              <Avatar uri={friend.avatarUrl} size={56} />
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 28,
                  borderWidth: 2.5,
                  borderColor: selected ? '#FFC542' : 'transparent',
                }}
              />
              {selected && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#FFC542',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: '#000000',
                  }}
                >
                  <CheckIcon size={11} color="#000000" />
                </View>
              )}
              {!selected && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 28,
                    backgroundColor: 'rgba(0,0,0,0.45)',
                  }}
                />
              )}
            </View>
            <Text
              numberOfLines={1}
              style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 6, opacity: selected ? 1 : 0.5 }}
            >
              {friend.fullName.split(' ')[0]}
            </Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}
